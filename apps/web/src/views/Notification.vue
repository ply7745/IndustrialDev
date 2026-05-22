<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

interface Notification {
  id?: string
  recipientId?: string
  recipientType: string
  type: string
  title: string
  content?: string
  isRead: boolean
  readAt?: string
  createdAt: string
}

const notifications = ref<Notification[]>([])
const loading = ref(false)

const fetchNotifications = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/notifications')
    notifications.value = await res.json()
  } catch (error) {
    ElMessage.error('获取通知列表失败')
  } finally {
    loading.value = false
  }
}

const handleMarkRead = async (notification: Notification) => {
  try {
    await fetch(`/api/notifications/${notification.id}/read`, { method: 'PUT' })
    notification.isRead = true
    ElMessage.success('已标记为已读')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    birthday: '生日祝福',
    holiday: '节日祝福',
    system: '系统通知',
    salary: '工资通知',
    interview: '面试通知'
  }
  return typeMap[type] || type
}

const getTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    birthday: '🎂',
    holiday: '🎉',
    system: '🔔',
    salary: '💰',
    interview: '📋'
  }
  return iconMap[type] || '📌'
}

onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <div class="notification-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>通知中心</span>
        </div>
      </template>
      
      <el-table :data="notifications" v-loading="loading" stripe>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <span class="notification-icon">{{ getTypeIcon(row.type) }}</span>
            {{ getTypeText(row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="content" label="内容" min-width="300" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isRead ? 'info' : 'primary'">
              {{ row.isRead ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" fixed="right" width="120">
          <template #default="{ row }">
            <el-button
              v-if="!row.isRead"
              link
              type="primary"
              @click="handleMarkRead(row)"
            >
              标记已读
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-icon {
  margin-right: 8px;
  font-size: 18px;
}
</style>
