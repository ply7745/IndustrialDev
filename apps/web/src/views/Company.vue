<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Company {
  id?: string
  name: string
  unifiedCreditCode: string
  contactPerson: string
  contactPhone: string
  address: string
  businessScope: string
  status: string
  cooperationDate: string
}

const companies = ref<Company[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingCompany = ref<Company | null>(null)
const form = ref<Company>({
  name: '',
  unifiedCreditCode: '',
  contactPerson: '',
  contactPhone: '',
  address: '',
  businessScope: '',
  status: 'active',
  cooperationDate: new Date().toISOString().split('T')[0]
})

const fetchCompanies = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/companies')
    companies.value = await res.json()
  } catch (error) {
    ElMessage.error('获取企业列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  editingCompany.value = null
  form.value = {
    name: '',
    unifiedCreditCode: '',
    contactPerson: '',
    contactPhone: '',
    address: '',
    businessScope: '',
    status: 'active',
    cooperationDate: new Date().toISOString().split('T')[0]
  }
  dialogVisible.value = true
}

const handleEdit = (company: Company) => {
  editingCompany.value = company
  form.value = { ...company }
  dialogVisible.value = true
}

const handleDelete = async (company: Company) => {
  try {
    await ElMessageBox.confirm('确定要删除该企业吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await fetch(`/api/companies/${company.id}`, { method: 'DELETE' })
    ElMessage.success('删除成功')
    fetchCompanies()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  try {
    if (editingCompany.value) {
      await fetch(`/api/companies/${editingCompany.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.value)
      })
      ElMessage.success('更新成功')
    } else {
      await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.value)
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchCompanies()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const getStatusText = (status: string) => {
  return status === 'active' ? '合作中' : '已停止'
}

const getStatusType = (status: string) => {
  return status === 'active' ? 'success' : 'info'
}

onMounted(() => {
  fetchCompanies()
})
</script>

<template>
  <div class="company-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>企业管理</span>
          <el-button type="primary" @click="handleAdd">添加企业</el-button>
        </div>
      </template>
      
      <el-table :data="companies" v-loading="loading" stripe>
        <el-table-column prop="name" label="企业名称" min-width="200" />
        <el-table-column prop="unifiedCreditCode" label="统一社会信用代码" width="200" />
        <el-table-column prop="contactPerson" label="联系人" width="120" />
        <el-table-column prop="contactPhone" label="联系电话" width="140" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cooperationDate" label="合作日期" width="120" />
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
      :title="editingCompany ? '编辑企业' : '添加企业'"
      width="600px"
    >
      <el-form :model="form" label-width="140px">
        <el-form-item label="企业名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="统一社会信用代码">
          <el-input v-model="form.unifiedCreditCode" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="form.contactPerson" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.contactPhone" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" type="textarea" />
        </el-form-item>
        <el-form-item label="经营范围">
          <el-input v-model="form.businessScope" type="textarea" />
        </el-form-item>
        <el-form-item label="合作日期">
          <el-date-picker
            v-model="form.cooperationDate"
            type="date"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="合作中" value="active" />
            <el-option label="已停止" value="inactive" />
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
