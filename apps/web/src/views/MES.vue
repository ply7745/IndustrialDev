<script setup lang="ts">
import { ref } from 'vue'

const orders = ref([
  { id: 1, orderNo: 'PO-001', product: '产品A', quantity: 100, status: '生产中' },
  { id: 2, orderNo: 'PO-002', product: '产品B', quantity: 50, status: '待开始' },
  { id: 3, orderNo: 'PO-003', product: '产品C', quantity: 200, status: '已完成' }
])
</script>

<template>
  <div class="mes">
    <h2>生产管理 (MES)</h2>
    <el-table :data="orders" stripe>
      <el-table-column prop="orderNo" label="订单号" />
      <el-table-column prop="product" label="产品" />
      <el-table-column prop="quantity" label="数量" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === '已完成' ? 'success' : row.status === '生产中' ? 'warning' : 'info'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default>
          <el-button size="small">查看</el-button>
          <el-button size="small" type="primary">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.mes {
  padding: 20px;
}
</style>