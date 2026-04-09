<script setup lang="ts">
import { ref } from 'vue'

const equipment = ref([
  { id: 1, name: '数控机床-01', code: 'CNC-001', status: '运行', location: '车间A' },
  { id: 2, name: '焊接机器人-01', code: 'WELD-001', status: '维护', location: '车间B' },
  { id: 3, name: '注塑机-01', code: 'INJ-001', status: '空闲', location: '车间C' }
])
</script>

<template>
  <div class="ems">
    <h2>设备管理 (EMS)</h2>
    <el-table :data="equipment" stripe>
      <el-table-column prop="name" label="设备名称" />
      <el-table-column prop="code" label="设备编号" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === '运行' ? 'success' : row.status === '维护' ? 'warning' : 'info'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="location" label="位置" />
      <el-table-column label="操作">
        <template #default>
          <el-button size="small">详情</el-button>
          <el-button size="small" type="warning">维护</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.ems {
  padding: 20px;
}
</style>