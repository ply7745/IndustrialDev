<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="logo">工业信息化管理系统</div>
      <el-menu mode="horizontal" :ellipsis="false">
        <el-menu-item index="1">生产管理 (MES)</el-menu-item>
        <el-menu-item index="2">仓储管理 (WMS)</el-menu-item>
        <el-menu-item index="3">质量管理 (QMS)</el-menu-item>
        <el-menu-item index="4">设备管理 (EMS)</el-menu-item>
      </el-menu>
    </el-header>
    <el-main>
      <RouterView />
    </el-main>
  </el-container>
</template>

<style scoped>
.app-container {
  height: 100vh;
}

.app-header {
  display: flex;
  align-items: center;
  background: #409eff;
  color: white;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  margin-right: 40px;
}
</style>