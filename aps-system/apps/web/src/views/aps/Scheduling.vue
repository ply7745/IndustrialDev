<template>
  <div class="scheduling-management">
    <el-card>
      <template #header>
        <div class="header-actions">
          <span>排程管理</span>
          <div class="actions">
            <el-button type="primary" @click="showCreateDialog = true">
              <el-icon><Plus /></el-icon>
              新建排程方案
            </el-button>
            <el-button @click="analyzeBottleneck">
              <el-icon><DataAnalysis /></el-icon>
              瓶颈分析
            </el-button>
            <el-button type="warning" @click="showInsertDialog = true">
              <el-icon><Sort /></el-icon>
              紧急插单
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="排程方案" name="plans">
          <el-table :data="schedulingPlans" stripe>
            <el-table-column prop="planNo" label="方案编号" width="150" />
            <el-table-column prop="name" label="方案名称" />
            <el-table-column prop="algorithm" label="算法" width="120">
              <template #default="{ row }">
                <el-tag>{{ getAlgorithmLabel(row.algorithm) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="planningHorizonStart" label="计划开始" width="120">
              <template #default="{ row }">
                {{ formatDate(row.planningHorizonStart) }}
              </template>
            </el-table-column>
            <el-table-column prop="planningHorizonEnd" label="计划结束" width="120">
              <template #default="{ row }">
                {{ formatDate(row.planningHorizonEnd) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  :disabled="row.status === 'RUNNING'"
                  @click="executePlan(row)"
                >
                  执行
                </el-button>
                <el-button size="small" @click="viewResults(row)">
                  结果
                </el-button>
                <el-button type="danger" size="small" @click="deletePlan(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="排程结果" name="results">
          <SchedulingGantt :results="schedulingResults" />
        </el-tab-pane>

        <el-tab-pane label="瓶颈分析" name="bottleneck">
          <el-table :data="bottleneckAnalysis" stripe>
            <el-table-column prop="workcenterCode" label="工作中心" />
            <el-table-column prop="workcenterName" label="名称" />
            <el-table-column prop="utilizationRate" label="利用率" width="120">
              <template #default="{ row }">
                <el-progress
                  :percentage="(row.utilizationRate * 100).toFixed(1)"
                  :color="getUtilizationColor(row.utilizationRate)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="queueLength" label="队列长度" width="100" />
            <el-table-column prop="avgWaitTime" label="平均等待(小时)" width="140" />
            <el-table-column prop="isBottleneck" label="是否瓶颈" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.isBottleneck" type="danger">是</el-tag>
                <el-tag v-else type="success">否</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="recommendations" label="建议" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="插单记录" name="insertions">
          <el-table :data="insertions" stripe>
            <el-table-column prop="orderNo" label="订单编号" />
            <el-table-column prop="insertionType" label="插单类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.insertionType === 'URGENT' ? 'danger' : 'warning'">
                  {{ row.insertionType === 'URGENT' ? '紧急' : '强制' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="originalDemandDate" label="原需求日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.originalDemandDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="newDemandDate" label="新需求日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.newDemandDate) }}
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="原因" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'PENDING'"
                  type="primary"
                  size="small"
                  @click="approveInsertion(row)"
                >
                  审批
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="showCreateDialog" title="创建排程方案" width="600px">
      <el-form :model="planForm" label-width="120px">
        <el-form-item label="方案名称">
          <el-input v-model="planForm.name" placeholder="请输入方案名称" />
        </el-form-item>
        <el-form-item label="计划期开始">
          <el-date-picker v-model="planForm.horizonStart" type="date" />
        </el-form-item>
        <el-form-item label="计划期结束">
          <el-date-picker v-model="planForm.horizonEnd" type="date" />
        </el-form-item>
        <el-form-item label="排程算法">
          <el-select v-model="planForm.algorithm">
            <el-option label="正向排程" value="FORWARD" />
            <el-option label="逆向排程" value="BACKWARD" />
            <el-option label="有限产能排程" value="FINITE_CAPACITY" />
          </el-select>
        </el-form-item>
        <el-form-item label="优化目标">
          <el-select v-model="planForm.optimizationTarget">
            <el-option label="最小化完工时间" value="MIN_MAKESPAN" />
            <el-option label="最小化延迟" value="MIN_DELAY" />
            <el-option label="负载均衡" value="BALANCE_LOAD" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createPlan">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showInsertDialog" title="紧急插单" width="500px">
      <el-form :model="insertForm" label-width="100px">
        <el-form-item label="订单">
          <el-select v-model="insertForm.orderId" placeholder="请选择订单">
            <el-option
              v-for="order in pendingOrders"
              :key="order.id"
              :label="order.orderNo"
              :value="order.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="插单原因">
          <el-input
            v-model="insertForm.reason"
            type="textarea"
            placeholder="请输入插单原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInsertDialog = false">取消</el-button>
        <el-button type="primary" @click="submitInsertion">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showResultsDialog" title="排程结果" width="90%" fullscreen>
      <SchedulingGantt :results="selectedResults" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, DataAnalysis, Sort } from '@element-plus/icons-vue';
import SchedulingGantt from './components/SchedulingGantt.vue';

interface SchedulingPlan {
  id: string;
  planNo: string;
  name: string;
  algorithm: string;
  optimizationTarget: string;
  status: string;
  planningHorizonStart: Date;
  planningHorizonEnd: Date;
}

interface SchedulingResult {
  id: string;
  orderId: string;
  orderNo?: string;
  operationId: string;
  operationName?: string;
  resourceId: string;
  resourceName?: string;
  plannedStartTime: Date;
  plannedEndTime: Date;
  quantity: number;
  priority: number;
}

interface Bottleneck {
  id: string;
  workcenterId: string;
  workcenterCode: string;
  workcenterName: string;
  utilizationRate: number;
  queueLength: number;
  avgWaitTime: number;
  isBottleneck: boolean;
  recommendations: string;
}

interface OrderInsertion {
  id: string;
  orderId: string;
  orderNo: string;
  insertionType: string;
  originalDemandDate: Date;
  newDemandDate: Date;
  reason: string;
  status: string;
}

const activeTab = ref('plans');
const showCreateDialog = ref(false);
const showInsertDialog = ref(false);
const showResultsDialog = ref(false);

const schedulingPlans = ref<SchedulingPlan[]>([]);
const schedulingResults = ref<SchedulingResult[]>([]);
const bottleneckAnalysis = ref<Bottleneck[]>([]);
const insertions = ref<OrderInsertion[]>([]);
const pendingOrders = ref<any[]>([]);
const selectedResults = ref<SchedulingResult[]>([]);

const planForm = ref({
  name: '',
  horizonStart: new Date(),
  horizonEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  algorithm: 'FINITE_CAPACITY',
  optimizationTarget: 'BALANCE_LOAD',
});

const insertForm = ref({
  orderId: '',
  reason: '',
});

const getAlgorithmLabel = (algorithm: string) => {
  const labels: Record<string, string> = {
    FORWARD: '正向排程',
    BACKWARD: '逆向排程',
    FINITE_CAPACITY: '有限产能',
  };
  return labels[algorithm] || algorithm;
};

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    DRAFT: 'info',
    RUNNING: 'warning',
    COMPLETED: 'success',
    FAILED: 'danger',
    PENDING: 'warning',
    APPROVED: 'success',
  };
  return types[status] || 'info';
};

const getUtilizationColor = (rate: number) => {
  if (rate > 0.85) return '#F56C6C';
  if (rate > 0.7) return '#E6A23C';
  return '#67C23A';
};

const formatDate = (date: Date | string) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString();
};

const loadPlans = async () => {
  try {
    const response = await fetch('/api/v1/scheduling/plans');
    schedulingPlans.value = await response.json();
  } catch (error) {
    ElMessage.error('加载排程方案失败');
  }
};

const loadResults = async () => {
  try {
    const response = await fetch('/api/v1/scheduling/results');
    schedulingResults.value = await response.json();
  } catch (error) {
    ElMessage.error('加载排程结果失败');
  }
};

const loadBottleneckAnalysis = async () => {
  bottleneckAnalysis.value = [
    {
      id: '1',
      workcenterId: '1',
      workcenterCode: 'WC001',
      workcenterName: '加工中心A',
      utilizationRate: 0.92,
      queueLength: 15,
      avgWaitTime: 2.5,
      isBottleneck: true,
      recommendations: '建议增加产能或优化生产计划',
    },
  ];
};

const loadInsertions = async () => {
  try {
    const response = await fetch('/api/v1/scheduling/insertions');
    insertions.value = await response.json();
  } catch (error) {
    ElMessage.error('加载插单记录失败');
  }
};

const loadPendingOrders = async () => {
  pendingOrders.value = [];
};

const createPlan = async () => {
  try {
    const response = await fetch('/api/v1/scheduling/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planForm.value),
    });

    if (response.ok) {
      ElMessage.success('排程方案创建成功');
      showCreateDialog.value = false;
      loadPlans();
    }
  } catch (error) {
    ElMessage.error('创建排程方案失败');
  }
};

const executePlan = async (plan: SchedulingPlan) => {
  try {
    await ElMessageBox.confirm('确定要执行此排程方案吗？', '确认', {
      type: 'warning',
    });

    const response = await fetch(`/api/v1/scheduling/plans/${plan.id}/execute`, {
      method: 'POST',
    });

    if (response.ok) {
      ElMessage.success('排程执行完成');
      loadPlans();
      loadResults();
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('排程执行失败');
    }
  }
};

const viewResults = async (plan: SchedulingPlan) => {
  selectedResults.value = schedulingResults.value.filter(
    (r) => r.id === plan.id
  );
  showResultsDialog.value = true;
};

const deletePlan = async (plan: SchedulingPlan) => {
  try {
    await ElMessageBox.confirm('确定要删除此排程方案吗？', '确认', {
      type: 'warning',
    });

    schedulingPlans.value = schedulingPlans.value.filter(
      (p) => p.id !== plan.id
    );
    ElMessage.success('删除成功');
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

const analyzeBottleneck = async () => {
  try {
    await fetch('/api/v1/scheduling/bottleneck-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: new Date().toISOString() }),
    });
    ElMessage.success('瓶颈分析完成');
    loadBottleneckAnalysis();
  } catch (error) {
    ElMessage.error('瓶颈分析失败');
  }
};

const submitInsertion = async () => {
  try {
    const response = await fetch('/api/v1/scheduling/insertions/urgent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(insertForm.value),
    });

    if (response.ok) {
      ElMessage.success('紧急插单成功');
      showInsertDialog.value = false;
      loadInsertions();
    }
  } catch (error) {
    ElMessage.error('插单失败');
  }
};

const approveInsertion = async (insertion: OrderInsertion) => {
  try {
    await fetch(`/api/v1/scheduling/insertions/${insertion.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy: 'admin' }),
    });
    ElMessage.success('审批成功');
    loadInsertions();
  } catch (error) {
    ElMessage.error('审批失败');
  }
};

onMounted(() => {
  loadPlans();
  loadResults();
  loadBottleneckAnalysis();
  loadInsertions();
  loadPendingOrders();
});
</script>

<style scoped>
.scheduling-management {
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
