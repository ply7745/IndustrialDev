<template>
  <div class="material-requirements">
    <el-card>
      <template #header>
        <div class="header-actions">
          <span>物料需求分析</span>
          <div class="actions">
            <el-button type="primary" @click="showMrpDialog = true">
              <el-icon><TrendCharts /></el-icon>
              执行MRP
            </el-button>
            <el-button type="success" @click="generatePurchasePlan">
              <el-icon><ShoppingCart /></el-icon>
              生成采购计划
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="净需求" name="net">
          <el-table :data="netRequirements" stripe v-loading="loading">
            <el-table-column prop="materialCode" label="物料编码" width="120" />
            <el-table-column prop="materialName" label="物料名称" />
            <el-table-column prop="grossRequirement" label="毛需求" width="100" align="right" />
            <el-table-column prop="scheduledReceipts" label="计划接收" width="100" align="right" />
            <el-table-column prop="onHandQuantity" label="库存量" width="100" align="right" />
            <el-table-column prop="safetyStock" label="安全库存" width="100" align="right" />
            <el-table-column prop="netRequirement" label="净需求" width="100" align="right">
              <template #default="{ row }">
                <span :class="{ 'text-danger': row.netRequirement > 0 }">
                  {{ row.netRequirement }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="orderSuggestion" label="建议订单量" width="120" align="right">
              <template #default="{ row }">
                <el-tag v-if="row.orderSuggestion > 0" type="warning">
                  {{ row.orderSuggestion }}
                </el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="requiredDate" label="需求日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.requiredDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="物料需求" name="requirements">
          <el-table :data="materialRequirements" stripe v-loading="loading">
            <el-table-column prop="requirementNo" label="需求编号" width="150" />
            <el-table-column prop="sourceType" label="需求来源" width="120">
              <template #default="{ row }">
                <el-tag>{{ getSourceTypeLabel(row.sourceType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="materialCode" label="物料编码" width="120" />
            <el-table-column prop="materialName" label="物料名称" />
            <el-table-column prop="requiredQuantity" label="需求数量" width="100" align="right" />
            <el-table-column prop="allocatedQuantity" label="已分配" width="100" align="right" />
            <el-table-column prop="shortageQuantity" label="短缺" width="100" align="right">
              <template #default="{ row }">
                <span v-if="row.shortageQuantity > 0" class="text-danger">
                  {{ row.shortageQuantity }}
                </span>
                <span v-else>0</span>
              </template>
            </el-table-column>
            <el-table-column prop="priority" label="优先级" width="80">
              <template #default="{ row }">
                <el-rate v-model="row.priority" disabled size="small" :max="10" />
              </template>
            </el-table-column>
            <el-table-column prop="requiredDate" label="需求日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.requiredDate) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'PENDING'"
                  type="primary"
                  size="small"
                  @click="approveRequirement(row)"
                >
                  审批
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="采购计划" name="purchase">
          <el-table :data="purchasePlans" stripe v-loading="loading">
            <el-table-column prop="planNo" label="计划编号" width="150" />
            <el-table-column prop="materialCode" label="物料编码" width="120" />
            <el-table-column prop="materialName" label="物料名称" />
            <el-table-column prop="quantity" label="数量" width="100" align="right" />
            <el-table-column prop="unitPrice" label="单价" width="100" align="right" />
            <el-table-column prop="totalAmount" label="总价" width="120" align="right" />
            <el-table-column prop="requiredDate" label="需求日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.requiredDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="plannedOrderDate" label="计划订购日" width="120">
              <template #default="{ row }">
                {{ formatDate(row.plannedOrderDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="短缺物料" name="shortage">
          <el-alert
            title="以下物料存在短缺，请及时处理"
            type="warning"
            :closable="false"
            style="margin-bottom: 20px"
          />
          <el-table :data="shortageMaterials" stripe>
            <el-table-column prop="materialCode" label="物料编码" width="120" />
            <el-table-column prop="materialName" label="物料名称" />
            <el-table-column prop="requiredQuantity" label="需求数量" width="100" align="right" />
            <el-table-column prop="availableQuantity" label="可用数量" width="100" align="right" />
            <el-table-column prop="shortageQuantity" label="短缺数量" width="100" align="right">
              <template #default="{ row }">
                <span class="text-danger">{{ row.shortageQuantity }}</span>
              </template>
            </el-table-column>
            <el-table-column label="替代物料" width="150">
              <template #default="{ row }">
                <el-select
                  v-if="row.substitutes && row.substitutes.length > 0"
                  placeholder="选择替代"
                  size="small"
                >
                  <el-option
                    v-for="sub in row.substitutes"
                    :key="sub.id"
                    :label="sub.code"
                    :value="sub.id"
                  />
                </el-select>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" size="small" @click="createPurchase(row)">
                  采购
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="showMrpDialog" title="MRP运算参数" width="500px">
      <el-form :model="mrpParams" label-width="120px">
        <el-form-item label="计划期开始">
          <el-date-picker v-model="mrpParams.horizonStart" type="date" />
        </el-form-item>
        <el-form-item label="计划期结束">
          <el-date-picker v-model="mrpParams.horizonEnd" type="date" />
        </el-form-item>
        <el-form-item label="包含销售订单">
          <el-switch v-model="mrpParams.includeSalesOrders" />
        </el-form-item>
        <el-form-item label="包含预测订单">
          <el-switch v-model="mrpParams.includeForecasts" />
        </el-form-item>
        <el-form-item label="包含工单">
          <el-switch v-model="mrpParams.includeWorkOrders" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showMrpDialog = false">取消</el-button>
        <el-button type="primary" @click="executeMrp" :loading="mrpLoading">
          执行
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { TrendCharts, ShoppingCart } from '@element-plus/icons-vue';

interface NetRequirement {
  id: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  grossRequirement: number;
  scheduledReceipts: number;
  onHandQuantity: number;
  safetyStock: number;
  netRequirement: number;
  orderSuggestion: number;
  requiredDate: Date;
  status: string;
}

interface MaterialRequirement {
  id: string;
  requirementNo: string;
  sourceType: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  requiredQuantity: number;
  allocatedQuantity: number;
  shortageQuantity: number;
  priority: number;
  requiredDate: Date;
  status: string;
}

interface PurchasePlan {
  id: string;
  planNo: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  requiredDate: Date;
  plannedOrderDate: Date;
  status: string;
}

const activeTab = ref('net');
const loading = ref(false);
const mrpLoading = ref(false);
const showMrpDialog = ref(false);

const netRequirements = ref<NetRequirement[]>([]);
const materialRequirements = ref<MaterialRequirement[]>([]);
const purchasePlans = ref<PurchasePlan[]>([]);
const shortageMaterials = ref<any[]>([]);

const mrpParams = ref({
  horizonStart: new Date(),
  horizonEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  includeSalesOrders: true,
  includeForecasts: true,
  includeWorkOrders: true,
});

const getSourceTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    PENDING_REVIEW: '待评审',
    FORECAST: '预测',
    PRE_PRODUCTION: '预生产',
    WORK_ORDER: '工单',
    SALES: '销售',
    SAFETY_STOCK: '安全库存',
    PURCHASE: '采购',
  };
  return labels[type] || type;
};

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    PENDING: 'warning',
    APPROVED: 'success',
    CALCULATED: 'info',
    DRAFT: 'info',
    COMPLETED: 'success',
  };
  return types[status] || 'info';
};

const formatDate = (date: Date | string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

const loadNetRequirements = async () => {
  loading.value = true;
  try {
    const response = await fetch('/api/v1/mrp/net-requirements');
    netRequirements.value = await response.json();
  } catch (error) {
    ElMessage.error('加载净需求失败');
  } finally {
    loading.value = false;
  }
};

const loadMaterialRequirements = async () => {
  loading.value = true;
  try {
    const response = await fetch('/api/v1/material-requirements');
    materialRequirements.value = await response.json();
  } catch (error) {
    ElMessage.error('加载物料需求失败');
  } finally {
    loading.value = false;
  }
};

const loadPurchasePlans = async () => {
  loading.value = true;
  try {
    const response = await fetch('/api/v1/purchase-plans');
    purchasePlans.value = await response.json();
  } catch (error) {
    ElMessage.error('加载采购计划失败');
  } finally {
    loading.value = false;
  }
};

const executeMrp = async () => {
  mrpLoading.value = true;
  try {
    const response = await fetch('/api/v1/mrp/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mrpParams.value),
    });

    if (response.ok) {
      ElMessage.success('MRP运算完成');
      showMrpDialog.value = false;
      loadNetRequirements();
    }
  } catch (error) {
    ElMessage.error('MRP运算失败');
  } finally {
    mrpLoading.value = false;
  }
};

const generatePurchasePlan = async () => {
  try {
    const runsResponse = await fetch('/api/v1/mrp/runs');
    const runs = await runsResponse.json();

    if (runs.length === 0) {
      ElMessage.warning('请先执行MRP运算');
      return;
    }

    const latestRun = runs[0];

    const response = await fetch('/api/v1/purchase-plans/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mrpRunId: latestRun.id }),
    });

    if (response.ok) {
      ElMessage.success('采购计划生成成功');
      loadPurchasePlans();
    }
  } catch (error) {
    ElMessage.error('生成采购计划失败');
  }
};

const approveRequirement = async (requirement: MaterialRequirement) => {
  try {
    await fetch(`/api/v1/mrp/requirements/${requirement.id}/approve`, {
      method: 'POST',
    });
    ElMessage.success('审批成功');
    loadMaterialRequirements();
  } catch (error) {
    ElMessage.error('审批失败');
  }
};

const createPurchase = (material: any) => {
  ElMessage.info('采购功能开发中');
};

onMounted(() => {
  loadNetRequirements();
  loadMaterialRequirements();
  loadPurchasePlans();
});
</script>

<style scoped>
.material-requirements {
  padding: 20px;
}

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions span {
  font-size: 18px;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 10px;
}

.text-danger {
  color: #F56C6C;
  font-weight: 600;
}
</style>
