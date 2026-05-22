<template>
  <div class="work-order-management">
    <el-card>
      <template #header>
        <div class="header-actions">
          <span>工单管理</span>
          <div class="actions">
            <el-button type="primary" @click="showCreateDialog = true">
              <el-icon><Plus /></el-icon>
              新建工单
            </el-button>
            <el-button @click="importWorkOrders">
              <el-icon><Upload /></el-icon>
              导入工单
            </el-button>
            <el-button type="success" @click="batchRelease">
              <el-icon><Check /></el-icon>
              批量下达
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="workOrders"
        stripe
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="orderNo" label="工单编号" width="150" />
        <el-table-column prop="sourceType" label="来源类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ getSourceTypeLabel(row.sourceType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="materialCode" label="物料编码" width="120" />
        <el-table-column prop="materialName" label="物料名称" />
        <el-table-column prop="quantity" label="数量" width="100" align="right" />
        <el-table-column prop="completedQuantity" label="完成数量" width="100" align="right">
          <template #default="{ row }">
            <el-progress
              :percentage="((row.completedQuantity / row.quantity) * 100).toFixed(1)"
              :format="() => `${row.completedQuantity}/${row.quantity}`"
            />
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">{{ row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="plannedStartDate" label="计划开始" width="120">
          <template #default="{ row }">
            {{ formatDate(row.plannedStartDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="plannedEndDate" label="计划结束" width="120">
          <template #default="{ row }">
            {{ formatDate(row.plannedEndDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'PLANNING'"
              type="primary"
              size="small"
              @click="releaseWorkOrder(row)"
            >
              下达
            </el-button>
            <el-button
              v-if="row.status === 'RELEASED'"
              type="success"
              size="small"
              @click="startWorkOrder(row)"
            >
              开始
            </el-button>
            <el-button
              v-if="row.status === 'IN_PROGRESS'"
              type="warning"
              size="small"
              @click="completeWorkOrder(row)"
            >
              完成
            </el-button>
            <el-button
              v-if="!row.isLocked"
              type="warning"
              size="small"
              @click="lockWorkOrder(row)"
            >
              锁定
            </el-button>
            <el-button
              v-if="row.isLocked"
              type="info"
              size="small"
              @click="unlockWorkOrder(row)"
            >
              解锁
            </el-button>
            <el-dropdown trigger="click">
              <el-button size="small">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="splitWorkOrder(row)">拆分</el-dropdown-item>
                  <el-dropdown-item @click="viewKits(row)">齐套检查</el-dropdown-item>
                  <el-dropdown-item divided @click="editWorkOrder(row)">编辑</el-dropdown-item>
                  <el-dropdown-item @click="deleteWorkOrder(row)">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <el-dialog v-model="showCreateDialog" title="创建工单" width="600px">
      <el-form :model="workOrderForm" label-width="100px">
        <el-form-item label="工单编号">
          <el-input v-model="workOrderForm.orderNo" placeholder="自动生成" disabled />
        </el-form-item>
        <el-form-item label="物料">
          <el-select v-model="workOrderForm.materialId" placeholder="请选择物料" filterable>
            <el-option
              v-for="material in materials"
              :key="material.id"
              :label="`${material.code} - ${material.name}`"
              :value="material.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数量">
          <el-input-number v-model="workOrderForm.quantity" :min="1" />
        </el-form-item>
        <el-form-item label="计划开始">
          <el-date-picker v-model="workOrderForm.plannedStartDate" type="date" />
        </el-form-item>
        <el-form-item label="计划结束">
          <el-date-picker v-model="workOrderForm.plannedEndDate" type="date" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-rate v-model="workOrderForm.priority" :max="10" show-text :texts="priorityTexts" />
        </el-form-item>
        <el-form-item label="工作中心">
          <el-select v-model="workOrderForm.workcenterId" placeholder="请选择工作中心">
            <el-option
              v-for="wc in workcenters"
              :key="wc.id"
              :label="wc.name"
              :value="wc.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createWorkOrder">确定</el-button>
      </template>
    </el-dialog>

    <SplitWorkOrderDialog
      v-model="showSplitDialog"
      :work-order="selectedWorkOrder"
      @confirm="handleSplitConfirm"
    />

    <KitsAnalysisDialog
      v-model="showKitsDialog"
      :work-order-id="selectedWorkOrder?.id"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Upload, Check, MoreFilled } from '@element-plus/icons-vue';
import SplitWorkOrderDialog from './components/SplitWorkOrderDialog.vue';
import KitsAnalysisDialog from './components/KitsAnalysisDialog.vue';

interface WorkOrder {
  id: string;
  orderNo: string;
  sourceType: string;
  sourceOrderId?: string;
  materialId: string;
  materialCode?: string;
  materialName?: string;
  quantity: number;
  completedQuantity: number;
  priority: number;
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  workcenterId: string;
  workcenterName?: string;
  status: string;
  isLocked: boolean;
  lockReason?: string;
}

interface Material {
  id: string;
  code: string;
  name: string;
}

interface Workcenter {
  id: string;
  code: string;
  name: string;
}

const loading = ref(false);
const showCreateDialog = ref(false);
const showSplitDialog = ref(false);
const showKitsDialog = ref(false);
const selectedWorkOrder = ref<WorkOrder | null>(null);
const selectedRows = ref<WorkOrder[]>([]);

const workOrders = ref<WorkOrder[]>([]);
const materials = ref<Material[]>([]);
const workcenters = ref<Workcenter[]>([]);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const priorityTexts = ['1-紧急', '2', '3', '4', '5-普通', '6', '7', '8', '9', '10-最低'];

const workOrderForm = ref({
  materialId: '',
  quantity: 1,
  plannedStartDate: new Date(),
  plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  priority: 5,
  workcenterId: '',
});

const getSourceTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    SALES: '销售订单',
    FORECAST: '预测订单',
    MRP: 'MRP生成',
  };
  return labels[type] || type;
};

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    PLANNING: 'info',
    RELEASED: 'warning',
    IN_PROGRESS: '',
    COMPLETED: 'success',
    CLOSED: 'info',
  };
  return types[status] || 'info';
};

const getPriorityType = (priority: number) => {
  if (priority <= 2) return 'danger';
  if (priority <= 5) return 'warning';
  return '';
};

const formatDate = (date: Date | string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

const loadWorkOrders = async () => {
  loading.value = true;
  try {
    const response = await fetch('/api/v1/work-orders');
    workOrders.value = await response.json();
    total.value = workOrders.value.length;
  } catch (error) {
    ElMessage.error('加载工单失败');
  } finally {
    loading.value = false;
  }
};

const loadMaterials = async () => {
  materials.value = [
    { id: '1', code: 'M001', name: '产品A' },
    { id: '2', code: 'M002', name: '产品B' },
  ];
};

const loadWorkcenters = async () => {
  workcenters.value = [
    { id: '1', code: 'WC001', name: '加工中心A' },
    { id: '2', code: 'WC002', name: '装配中心B' },
  ];
};

const handleSelectionChange = (selection: WorkOrder[]) => {
  selectedRows.value = selection;
};

const handleSizeChange = () => {
  loadWorkOrders();
};

const handleCurrentChange = () => {
  loadWorkOrders();
};

const createWorkOrder = async () => {
  try {
    const response = await fetch('/api/v1/work-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workOrderForm.value),
    });

    if (response.ok) {
      ElMessage.success('工单创建成功');
      showCreateDialog.value = false;
      loadWorkOrders();
    }
  } catch (error) {
    ElMessage.error('创建工单失败');
  }
};

const importWorkOrders = () => {
  ElMessage.info('工单导入功能开发中');
};

const batchRelease = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要下达的工单');
    return;
  }

  try {
    await ElMessageBox.confirm(
      `确定要下达选中的 ${selectedRows.value.length} 个工单吗？`,
      '确认',
      { type: 'warning' }
    );

    for (const row of selectedRows.value) {
      await fetch(`/api/v1/work-orders/${row.id}/release`, {
        method: 'POST',
      });
    }

    ElMessage.success('批量下达成功');
    loadWorkOrders();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('批量下达失败');
    }
  }
};

const releaseWorkOrder = async (row: WorkOrder) => {
  try {
    await fetch(`/api/v1/work-orders/${row.id}/release`, {
      method: 'POST',
    });
    ElMessage.success('工单下达成功');
    loadWorkOrders();
  } catch (error) {
    ElMessage.error('下达失败');
  }
};

const startWorkOrder = async (row: WorkOrder) => {
  try {
    await fetch(`/api/v1/work-orders/${row.id}/start`, {
      method: 'POST',
    });
    ElMessage.success('工单已开始');
    loadWorkOrders();
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

const completeWorkOrder = async (row: WorkOrder) => {
  try {
    await ElMessageBox.prompt('请输入完成数量', '完成工单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: String(row.quantity - row.completedQuantity),
    });

    await fetch(`/api/v1/work-orders/${row.id}/complete`, {
      method: 'POST',
    });
    ElMessage.success('工单已完成');
    loadWorkOrders();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败');
    }
  }
};

const lockWorkOrder = async (row: WorkOrder) => {
  try {
    await ElMessageBox.prompt('请输入锁定原因', '锁定工单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });

    await fetch(`/api/v1/work-orders/${row.id}/lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: '用户锁定' }),
    });

    ElMessage.success('工单已锁定');
    loadWorkOrders();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('锁定失败');
    }
  }
};

const unlockWorkOrder = async (row: WorkOrder) => {
  try {
    await fetch(`/api/v1/work-orders/${row.id}/unlock`, {
      method: 'POST',
    });
    ElMessage.success('工单已解锁');
    loadWorkOrders();
  } catch (error) {
    ElMessage.error('解锁失败');
  }
};

const splitWorkOrder = (row: WorkOrder) => {
  selectedWorkOrder.value = row;
  showSplitDialog.value = true;
};

const handleSplitConfirm = async (data: any) => {
  if (selectedWorkOrder.value) {
    try {
      await fetch(`/api/v1/work-orders/${selectedWorkOrder.value.id}/split`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      ElMessage.success('工单拆分成功');
      showSplitDialog.value = false;
      loadWorkOrders();
    } catch (error) {
      ElMessage.error('拆分失败');
    }
  }
};

const viewKits = (row: WorkOrder) => {
  selectedWorkOrder.value = row;
  showKitsDialog.value = true;
};

const editWorkOrder = (row: WorkOrder) => {
  ElMessage.info('编辑功能开发中');
};

const deleteWorkOrder = async (row: WorkOrder) => {
  try {
    await ElMessageBox.confirm('确定要删除此工单吗？', '确认', {
      type: 'warning',
    });

    workOrders.value = workOrders.value.filter((wo) => wo.id !== row.id);
    ElMessage.success('删除成功');
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

onMounted(() => {
  loadWorkOrders();
  loadMaterials();
  loadWorkcenters();
});
</script>

<style scoped>
.work-order-management {
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
</style>
