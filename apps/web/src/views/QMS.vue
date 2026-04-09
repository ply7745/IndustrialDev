<script setup lang="ts">
import { ref } from 'vue'

const checks = ref([
  { id: 1, orderNo: 'QC-001', type: '进货检验', status: '合格', inspector: '张工' },
  { id: 2, orderNo: 'QC-002', type: '过程检验', status: '待检', inspector: '李工' },
  { id: 3, orderNo: 'QC-003', type: '出货检验', status: '不合格', inspector: '王工' }
])
</script>

<template>
  <div class="qms">
    <h2>质量管理 (QMS)</h2>
    <el-table :data="checks" stripe>
      <el-table-column prop="orderNo" label="检验单号" />
      <el-table-column prop="type" label="检验类型" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === '合格' ? 'success' : row.status === '不合格' ? 'danger' : 'warning'">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="inspector" label="检验员" />
      <el-table-column label="操作">
        <template #default>
          <el-button size="small" type="primary">执行检验</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.qms {
  padding: 20px;
}
</style>