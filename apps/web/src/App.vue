<script setup lang="ts">
import { RouterView, useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const handleMenuSelect = (index: string) => {
  const pathMap: Record<string, string> = {
    '1': '/mes',
    '2': '/wms',
    '3': '/qms',
    '4': '/ems',
    '5': '/employee',
    '6': '/company',
    '7': '/position',
    '8': '/salary',
    '9': '/application',
    '10': '/notification'
  }
  if (pathMap[index]) {
    router.push(pathMap[index])
  }
}
</script>

<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="logo">劳务公司员工信息管理系统</div>
      <el-menu
        mode="horizontal"
        :ellipsis="false"
        :default-active="route.path"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/employee">员工管理</el-menu-item>
        <el-menu-item index="/company">企业管理</el-menu-item>
        <el-menu-item index="/position">岗位管理</el-menu-item>
        <el-menu-item index="/salary">工资管理</el-menu-item>
        <el-menu-item index="/application">报名管理</el-menu-item>
        <el-menu-item index="/notification">通知中心</el-menu-item>
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