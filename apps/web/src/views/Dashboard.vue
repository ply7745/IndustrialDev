<script setup lang="ts">
import { ref } from 'vue'

const stats = ref({
  productionOrders: 12,
  activeWorkstations: 8,
  inventoryItems: 156,
  equipmentRunning: 15
})
</script>

<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <h3>生产订单</h3>
          <p class="stat">{{ stats.productionOrders }}</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <h3>活跃工作站</h3>
          <p class="stat">{{ stats.activeWorkstations }}</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <h3>库存物品</h3>
          <p class="stat">{{ stats.inventoryItems }}</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <h3>运行设备</h3>
          <p class="stat">{{ stats.equipmentRunning }}</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat {
  font-size: 36px;
  font-weight: bold;
  color: #409eff;
}
</style>