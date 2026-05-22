<template>
  <div class="aps-dashboard">
    <el-row :gutter="20" class="dashboard-header">
      <el-col :span="24">
        <h1>APS高级计划与排程系统</h1>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in statistics" :key="stat.key">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon :size="24">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="main-content">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>订单趋势</span>
            </div>
          </template>
          <div class="chart-placeholder">
            <el-empty description="图表区域" />
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card class="recent-card">
          <template #header>
            <div class="card-header">
              <span>待处理事项</span>
            </div>
          </template>
          <el-scrollbar height="300px">
            <div class="todo-list">
              <div
                v-for="item in todoItems"
                :key="item.id"
                class="todo-item"
                @click="handleTodoClick(item)"
              >
                <el-tag :type="item.type" size="small">{{ item.tag }}</el-tag>
                <span class="todo-text">{{ item.text }}</span>
              </div>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="modules-row">
      <el-col :xs="24" :sm="12" :md="8" v-for="module in modules" :key="module.path">
        <el-card class="module-card" shadow="hover" @click="navigateTo(module.path)">
          <div class="module-content">
            <el-icon :size="40" :color="module.color">
              <component :is="module.icon" />
            </el-icon>
            <h3>{{ module.title }}</h3>
            <p>{{ module.description }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="process-flow">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>APS核心流程</span>
            </div>
          </template>
          <el-steps :active="currentStep" align-center>
            <el-step
              v-for="(step, index) in processSteps"
              :key="index"
              :title="step.title"
              :description="step.description"
              @click="currentStep = index"
            />
          </el-steps>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Document, Goods, Calendar, List, Box, TrendCharts, Operation, Coin } from '@element-plus/icons-vue';

const router = useRouter();

const statistics = ref([
  { key: 'orders', label: '待处理订单', value: 0, icon: Document, color: '#409EFF' },
  { key: 'materials', label: '物料需求', value: 0, icon: Goods, color: '#67C23A' },
  { key: 'schedules', label: '排程任务', value: 0, icon: Calendar, color: '#E6A23C' },
  { key: 'shortages', label: '短缺物料', value: 0, icon: Box, color: '#F56C6C' },
]);

const todoItems = ref([
  { id: 1, tag: '订单', text: '5个订单待评审', type: 'warning', path: '/aps/orders' },
  { id: 2, tag: '物料', text: '3个物料需求待确认', type: 'info', path: '/aps/material-requirements' },
  { id: 3, tag: '排程', text: '2个排程任务待执行', type: '', path: '/aps/scheduling' },
  { id: 4, tag: '齐套', text: '1个工单齐套不足', type: 'danger', path: '/aps/kits' },
]);

const modules = ref([
  {
    path: '/aps/orders',
    title: '订单管理',
    description: '订单引入、拆分、评审、变更',
    icon: Document,
    color: '#409EFF',
  },
  {
    path: '/aps/materials',
    title: '基础数据',
    description: '物料、BOM、客户、资源管理',
    icon: Goods,
    color: '#67C23A',
  },
  {
    path: '/aps/mrp',
    title: 'MRP运算',
    description: '净需求计算、物料需求分析',
    icon: TrendCharts,
    color: '#E6A23C',
  },
  {
    path: '/aps/scheduling',
    title: '排程管理',
    description: '排程方案、瓶颈分析、插单管理',
    icon: Calendar,
    color: '#909399',
  },
  {
    path: '/aps/work-orders',
    title: '工单管理',
    description: '工单拆分、下达、锁定',
    icon: List,
    color: '#F56C6C',
  },
  {
    path: '/aps/kits',
    title: '齐套分析',
    description: '订单齐套、工单齐套检查',
    icon: Box,
    color: '#9C27B0',
  },
]);

const processSteps = ref([
  { title: '订单引入', description: '导入销售订单' },
  { title: '订单评审', description: '审核订单可行性' },
  { title: 'MRP运算', description: '计算物料需求' },
  { title: '排程生成', description: '生成生产计划' },
  { title: '工单下达', description: '执行生产工单' },
]);

const currentStep = ref(0);

const navigateTo = (path: string) => {
  router.push(path);
};

const handleTodoClick = (item: any) => {
  router.push(item.path);
};

onMounted(async () => {
  await loadStatistics();
});

const loadStatistics = async () => {
  // TODO: 调用API获取统计数据
  statistics.value = [
    { key: 'orders', label: '待处理订单', value: 12, icon: Document, color: '#409EFF' },
    { key: 'materials', label: '物料需求', value: 45, icon: Goods, color: '#67C23A' },
    { key: 'schedules', value: 8, label: '排程任务', icon: Calendar, color: '#E6A23C' },
    { key: 'shortages', label: '短缺物料', value: 3, icon: Box, color: '#F56C6C' },
  ];
};
</script>

<style scoped>
.aps-dashboard {
  padding: 20px;
}

.dashboard-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.main-content {
  margin-bottom: 20px;
}

.chart-card,
.recent-card {
  height: 100%;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.todo-list {
  padding: 0;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #EBEEF5;
  cursor: pointer;
  transition: background-color 0.3s;
}

.todo-item:hover {
  background-color: #F5F7FA;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-text {
  flex: 1;
  font-size: 14px;
  color: #606266;
}

.modules-row {
  margin-bottom: 20px;
}

.module-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  margin-bottom: 20px;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.module-content {
  text-align: center;
  padding: 20px;
}

.module-content h3 {
  margin: 16px 0 8px;
  font-size: 18px;
  color: #303133;
}

.module-content p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.process-flow {
  margin-bottom: 20px;
}

:deep(.el-step__title) {
  font-size: 14px;
}

:deep(.el-step__description) {
  font-size: 12px;
}
</style>
