<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Employee {
  id?: string
  name: string
  idCard: string
  phone: string
  gender: string
  birthday: string
  age: number
  address: string
  emergencyContact: string
  emergencyPhone: string
  entryDate: string
  status: string
  companyId?: string
  avatar?: string
}

const employees = ref<Employee[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingEmployee = ref<Employee | null>(null)
const form = ref<Employee>({
  name: '',
  idCard: '',
  phone: '',
  gender: '男',
  birthday: '',
  age: 0,
  address: '',
  emergencyContact: '',
  emergencyPhone: '',
  entryDate: new Date().toISOString().split('T')[0],
  status: 'active'
})

const fetchEmployees = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/employees')
    employees.value = await res.json()
  } catch (error) {
    ElMessage.error('获取员工列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  editingEmployee.value = null
  form.value = {
    name: '',
    idCard: '',
    phone: '',
    gender: '男',
    birthday: '',
    age: 0,
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    entryDate: new Date().toISOString().split('T')[0],
    status: 'active'
  }
  dialogVisible.value = true
}

const handleEdit = (employee: Employee) => {
  editingEmployee.value = employee
  form.value = { ...employee }
  dialogVisible.value = true
}

const handleDelete = async (employee: Employee) => {
  try {
    await ElMessageBox.confirm('确定要删除该员工吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await fetch(`/api/employees/${employee.id}`, { method: 'DELETE' })
    ElMessage.success('删除成功')
    fetchEmployees()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  try {
    if (editingEmployee.value) {
      await fetch(`/api/employees/${editingEmployee.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.value)
      })
      ElMessage.success('更新成功')
    } else {
      await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.value)
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchEmployees()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '在职',
    inactive: '离职',
    pending: '待入职'
  }
  return statusMap[status] || status
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    pending: 'warning'
  }
  return typeMap[status] || 'info'
}

onMounted(() => {
  fetchEmployees()
})
</script>

<template>
  <div class="employee-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>员工管理</span>
          <el-button type="primary" @click="handleAdd">添加员工</el-button>
        </div>
      </template>
      
      <el-table :data="employees" v-loading="loading" stripe>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="idCard" label="身份证号" width="180" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="entryDate" label="入职日期" width="120" />
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
      :title="editingEmployee ? '编辑员工' : '添加员工'"
      width="600px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="form.idCard" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="form.gender">
            <el-radio value="男">男</el-radio>
            <el-radio value="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期">
          <el-date-picker
            v-model="form.birthday"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="年龄">
          <el-input-number v-model="form.age" :min="0" :max="150" />
        </el-form-item>
        <el-form-item label="住址">
          <el-input v-model="form.address" type="textarea" />
        </el-form-item>
        <el-form-item label="紧急联系人">
          <el-input v-model="form.emergencyContact" />
        </el-form-item>
        <el-form-item label="紧急联系电话">
          <el-input v-model="form.emergencyPhone" />
        </el-form-item>
        <el-form-item label="入职日期">
          <el-date-picker
            v-model="form.entryDate"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="在职" value="active" />
            <el-option label="离职" value="inactive" />
            <el-option label="待入职" value="pending" />
          </el-select>
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
