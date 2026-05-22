<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Salary {
  id?: string
  employeeId: string
  year: number
  month: number
  baseSalary: number
  performanceSalary: number
  allowance: number
  deduction: number
  totalSalary: number
  actualSalary: number
  status: string
  paidDate?: string
  remark: string
}

interface Employee {
  id: string
  name: string
}

const salaries = ref<Salary[]>([])
const employees = ref<Employee[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingSalary = ref<Salary | null>(null)
const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1

const form = ref<Salary>({
  employeeId: '',
  year: currentYear,
  month: currentMonth,
  baseSalary: 0,
  performanceSalary: 0,
  allowance: 0,
  deduction: 0,
  totalSalary: 0,
  actualSalary: 0,
  status: 'pending',
  remark: ''
})

const fetchSalaries = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/salaries')
    salaries.value = await res.json()
  } catch (error) {
    ElMessage.error('获取工资列表失败')
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

const handleAdd = () => {
  editingSalary.value = null
  form.value = {
    employeeId: employees.value[0]?.id || '',
    year: currentYear,
    month: currentMonth,
    baseSalary: 0,
    performanceSalary: 0,
    allowance: 0,
    deduction: 0,
    totalSalary: 0,
    actualSalary: 0,
    status: 'pending',
    remark: ''
  }
  dialogVisible.value = true
}

const handleEdit = (salary: Salary) => {
  editingSalary.value = salary
  form.value = { ...salary }
  dialogVisible.value = true
}

const handleDelete = async (salary: Salary) => {
  try {
    await ElMessageBox.confirm('确定要删除该工资记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await fetch(`/api/salaries/${salary.id}`, { method: 'DELETE' })
    ElMessage.success('删除成功')
    fetchSalaries()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleMarkPaid = async (salary: Salary) => {
  try {
    await fetch(`/api/salaries/${salary.id}/paid`, { method: 'PUT' })
    ElMessage.success('已标记为已发放')
    fetchSalaries()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleSubmit = async () => {
  try {
    form.value.totalSalary = form.value.baseSalary + form.value.performanceSalary + form.value.allowance
    form.value.actualSalary = form.value.totalSalary - form.value.deduction
    
    if (editingSalary.value) {
      await fetch(`/api/salaries/${editingSalary.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.value)
      })
      ElMessage.success('更新成功')
    } else {
      await fetch('/api/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.value)
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchSalaries()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const getEmployeeName = (employeeId: string) => {
  const employee = employees.value.find(e => e.id === employeeId)
  return employee?.name || '-'
}

const getStatusText = (status: string) => {
  return status === 'paid' ? '已发放' : '待发放'
}

const getStatusType = (status: string) => {
  return status === 'paid' ? 'success' : 'warning'
}

onMounted(() => {
  fetchSalaries()
  fetchEmployees()
})
</script>

<template>
  <div class="salary-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>工资管理</span>
          <el-button type="primary" @click="handleAdd">添加工资</el-button>
        </div>
      </template>
      
      <el-table :data="salaries" v-loading="loading" stripe>
        <el-table-column label="员工姓名" width="120">
          <template #default="{ row }">
            {{ getEmployeeName(row.employeeId) }}
          </template>
        </el-table-column>
        <el-table-column label="年月" width="120">
          <template #default="{ row }">
            {{ row.year }}年{{ row.month }}月
          </template>
        </el-table-column>
        <el-table-column prop="baseSalary" label="基本工资" width="120" />
        <el-table-column prop="performanceSalary" label="绩效工资" width="120" />
        <el-table-column prop="allowance" label="补贴" width="100" />
        <el-table-column prop="deduction" label="扣款" width="100" />
        <el-table-column prop="totalSalary" label="应发工资" width="120" />
        <el-table-column prop="actualSalary" label="实发工资" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="250">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button
              v-if="row.status === 'pending'"
              link
              type="success"
              @click="handleMarkPaid(row)"
            >
              标记发放
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingSalary ? '编辑工资' : '添加工资'"
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
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="年份">
              <el-input-number v-model="form.year" :min="2020" :max="2030" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="月份">
              <el-input-number v-model="form.month" :min="1" :max="12" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="基本工资">
              <el-input-number v-model="form.baseSalary" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="绩效工资">
              <el-input-number v-model="form.performanceSalary" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="补贴">
              <el-input-number v-model="form.allowance" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="扣款">
              <el-input-number v-model="form.deduction" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="待发放" value="pending" />
            <el-option label="已发放" value="paid" />
          </el-select>
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
