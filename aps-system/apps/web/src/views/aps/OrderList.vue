<template>
  <div class="order-management">
    <el-card>
      <template #header>
        <div class="header-actions">
          <span>订单管理</span>
          <div class="actions">
            <el-button type="primary" @click="showCreateDialog = true">
              <el-icon><Plus /></el-icon>
              新建订单
            </el-button>
            <el-button @click="importOrders">
              <el-icon><Upload /></el-icon>
              导入订单
            </el-button>
            <el-button type="success" @click="runMrp" :loading="mrpLoading">
              <el-icon><TrendCharts /></el-icon>
              执行MRP
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部订单" name="all">
          <OrderTable :orders="orders" @refresh="loadOrders" />
        </el-tab-pane>
        <el-tab-pane label="待评审" name="pending">
          <OrderTable :orders="pendingOrders" @refresh="loadOrders" />
        </el-tab-pane>
        <el-tab-pane label="已评审" name="approved">
          <OrderTable :orders="approvedOrders" @refresh="loadOrders" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="showCreateDialog" title="创建订单" width="600px">
      <el-form :model="orderForm" label-width="100px">
        <el-form-item label="订单编号">
          <el-input v-model="orderForm.orderNo" placeholder="自动生成" disabled />
        </el-form-item>
        <el-form-item label="客户">
          <el-select v-model="orderForm.customerId" placeholder="请选择客户" filterable>
            <el-option
              v-for="customer in customers"
              :key="customer.id"
              :label="customer.name"
              :value="customer.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="物料">
          <el-select v-model="orderForm.materialId" placeholder="请选择物料" filterable>
            <el-option
              v-for="material in materials"
              :key="material.id"
              :label="`${material.code} - ${material.name}`"
              :value="material.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="订单数量">
          <el-input-number v-model="orderForm.quantity" :min="1" />
        </el-form-item>
        <el-form-item label="订单日期">
          <el-date-picker v-model="orderForm.orderDate" type="date" />
        </el-form-item>
        <el-form-item label="需求日期">
          <el-date-picker v-model="orderForm.demandDate" type="date" />
        </el-form-item>
        <el-form-item label="订单类型">
          <el-select v-model="orderForm.orderType">
            <el-option label="销售订单" value="SALES" />
            <el-option label="预测订单" value="FORECAST" />
            <el-option label="补投订单" value="REPLENISHMENT" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-rate v-model="orderForm.priority" :max="10" show-text :texts="priorityTexts" />
        </el-form-item>
        <el-form-item label="单价">
          <el-input-number v-model="orderForm.unitPrice" :precision="2" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createOrder">确定</el-button>
      </template>
    </el-dialog>

    <SplitOrderDialog
      v-model="showSplitDialog"
      :order="selectedOrder"
      @confirm="handleSplitConfirm"
    />

    <MrpRunDialog
      v-model="showMrpDialog"
      @confirm="executeMrp"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus, Upload, TrendCharts } from '@element-plus/icons-vue';
import OrderTable from './components/OrderTable.vue';
import SplitOrderDialog from './components/SplitOrderDialog.vue';
import MrpRunDialog from './components/MrpRunDialog.vue';

interface Order {
  id: string;
  orderNo: string;
  customerId: string;
  customerName?: string;
  materialId: string;
  materialName?: string;
  orderType: string;
  quantity: number;
  orderDate: Date;
  demandDate: Date;
  priority: number;
  status: string;
  approvalStatus: string;
  unitPrice?: number;
  totalAmount?: number;
}

interface Customer {
  id: string;
  code: string;
  name: string;
}

interface Material {
  id: string;
  code: string;
  name: string;
  type: string;
}

const activeTab = ref('all');
const showCreateDialog = ref(false);
const showSplitDialog = ref(false);
const showMrpDialog = ref(false);
const selectedOrder = ref<Order | null>(null);
const mrpLoading = ref(false);

const orders = ref<Order[]>([]);
const customers = ref<Customer[]>([]);
const materials = ref<Material[]>([]);

const priorityTexts = ['1-紧急', '2', '3', '4', '5-普通', '6', '7', '8', '9', '10-最低'];

const orderForm = ref({
  orderNo: '',
  customerId: '',
  materialId: '',
  orderType: 'SALES',
  quantity: 1,
  orderDate: new Date(),
  demandDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  priority: 5,
  unitPrice: 0,
});

const pendingOrders = computed(() =>
  orders.value.filter((o) => o.approvalStatus === 'PENDING')
);

const approvedOrders = computed(() =>
  orders.value.filter((o) => o.approvalStatus === 'APPROVED')
);

const handleTabChange = () => {
  // Tab切换时的处理
};

const loadOrders = async () => {
  try {
    const response = await fetch('/api/v1/orders');
    orders.value = await response.json();
  } catch (error) {
    ElMessage.error('加载订单失败');
  }
};

const loadCustomers = async () => {
  customers.value = [
    { id: '1', code: 'C001', name: '客户A' },
    { id: '2', code: 'C002', name: '客户B' },
  ];
};

const loadMaterials = async () => {
  materials.value = [
    { id: '1', code: 'M001', name: '产品A', type: 'FINISHED' },
    { id: '2', code: 'M002', name: '产品B', type: 'FINISHED' },
  ];
};

const createOrder = async () => {
  try {
    const response = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderForm.value),
    });

    if (response.ok) {
      ElMessage.success('订单创建成功');
      showCreateDialog.value = false;
      loadOrders();
    }
  } catch (error) {
    ElMessage.error('创建订单失败');
  }
};

const importOrders = () => {
  ElMessage.info('导入功能开发中');
};

const runMrp = () => {
  showMrpDialog.value = true;
};

const executeMrp = async (params: any) => {
  mrpLoading.value = true;
  try {
    const response = await fetch('/api/v1/mrp/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (response.ok) {
      ElMessage.success('MRP运算完成');
      showMrpDialog.value = false;
    }
  } catch (error) {
    ElMessage.error('MRP运算失败');
  } finally {
    mrpLoading.value = false;
  }
};

const handleSplitConfirm = async (data: any) => {
  if (selectedOrder.value) {
    try {
      await fetch(`/api/v1/orders/${selectedOrder.value.id}/split`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      ElMessage.success('订单拆分成功');
      showSplitDialog.value = false;
      loadOrders();
    } catch (error) {
      ElMessage.error('订单拆分失败');
    }
  }
};

onMounted(() => {
  loadOrders();
  loadCustomers();
  loadMaterials();
});
</script>

<style scoped>
.order-management {
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
