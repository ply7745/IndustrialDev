<script setup lang="ts">
import { ref } from 'vue'

const inventory = ref([
  { id: 1, sku: 'SKU-001', name: '原材料A', quantity: 500, location: 'A区' },
  { id: 2, sku: 'SKU-002', name: '原材料B', quantity: 300, location: 'B区' },
  { id: 3, sku: 'SKU-003', name: '半成品C', quantity: 100, location: 'C区' }
])
</script>

<template>
  <div class="wms">
    <h2>仓储管理 (WMS)</h2>
    <el-table :data="inventory" stripe>
      <el-table-column prop="sku" label="SKU" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="quantity" label="数量" />
      <el-table-column prop="location" label="位置" />
      <el-table-column label="操作">
        <template #default>
          <el-button size="small">入库</el-button>
          <el-button size="small" type="warning">出库</el-button>
          <el-button size="small" type="primary">移库</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.wms {
  padding: 20px;
}
</style>