<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Application {
  id?: string
  employeeId: string
  positionId: string
  status: string
  applyDate?: string
  interviewDate?: string
  interviewResult?: string
  remark?: string
}

interface Employee {
  id: string
  name: string
}

interface Position {
  id: string
  title: string
}

const applications = ref<Application[]>([])
const employees = ref<Employee[]>([])
const positions = ref<Position[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingApplication = ref<Application | null>(null)

const form = ref<Application>({
  employeeId: '',
  positionId: '',
  status: 'pending',
  remark: ''
})

const fetchApplications = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/applications')
    applications.value = await res.json()
  } catch (error) {
    ElMessage.error('获取报名列表失败')
  } finally {
    loading.value = false
  }
}

const fetchEmployees = async () => {
  try {
    const res = await fetch('/api/employees')
    employees.value = await res.json()
  } catch (error) {
    console.error('获取员工列表失败')
  }
}

const fetchPositions = async () => {
  try {
    const res = await fetch('/api/positions/published')
    positions.value = await res.json()
  } catch (error) {
    console.error('获取岗位列表失败')
  }
}

const handleAdd = () => {
  editingApplication.value = null
  form.value = {
    employeeId: employees.value[0]?.id || '',
    positionId: positions.value[0]?.id || '',
    status: 'pending',
    remark: ''
  }
  dialogVisible.value = true
}

const handleEdit = (application: Application) => {
  editingApplication.value = application
  form.value = { ...application }
  dialogVisible.value = true
}

const handleDelete = async (application: Application) => {
  try {
    await ElMessageBox.confirm('确定要删除该报名记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await fetch(`/api/applications/${application.id}`, { method: 'DELETE' })
    ElMessage.success('删除成功')
    fetchApplications()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  try {
    if (editingApplication.value) {
      await fetch(`/api/applications/${editingApplication.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.value)
      })
      ElMessage.success('更新成功')
    } else {
      await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.value)
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchApplications()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const getEmployeeName = (employeeId: string) => {
  const employee = employees.value.find(e => e.id === employeeId)
  return employee?.name || '-'
}

const getPositionTitle = (positionId: string) => {
  const position = positions.value.find(p => p.id === positionId)
  return position?.title || '-'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    interviewing: '面试中',
    accepted: '已录用',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    pending: 'warning',
    interviewing: 'primary',
    accepted: 'success',
    rejected: 'danger'
  }
  return typeMap[status] || 'info'
}

onMounted(() => {
  fetchApplications()
  fetchEmployees()
  fetchPositions()
})
</script>

<template>
  <div class="application-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>报名管理</span>
          <el-button type="primary" @click="handleAdd">添加报名</el-button>
        </div>
      </template>
      
      <el-table :data="applications" v-loading="loading" stripe>
        <el-table-column label="员工姓名" width="120">
          <template #default="{ row }">
            {{ getEmployeeName(row.employeeId) }}
          </template>
        </el-table-column>
        <el-table-column label="岗位名称" width="200">
          <template #default="{ row }">
            {{ getPositionTitle(row.positionId) }}
          </template>
        </el-table-column>
        <el-table-column prop="applyDate" label="报名日期" width="120" />
        <el-table-column prop="interviewDate" label="面试日期" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="interviewResult" label="面试结果" width="150" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingApplication ? '编辑报名' : '添加报名'"
      width="600px"
    >
      <el-form :model="form" label-width="120px">
        <el-form-item label="员工">
          <el-select v-model="form.employeeId" style="width: 100%">
            <el-option
              v-for="employee in employees"
              :key="employee.id"
              :label="employee.name"
              :value="employee.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="岗位">
          <el-select v-model="form.positionId" style="width: 100%">
            <el-option
              v-for="position in positions"
              :key="position.id"
              :label="position.title"
              :value="position.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="待处理" value="pending" />
            <el-option label="面试中" value="interviewing" />
            <el-option label="已录用" value="accepted" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item label="面试日期">
          <el-date-picker
            v-model="form.interviewDate"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="面试结果">
          <el-input v-model="form.interviewResult" type="textarea" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
