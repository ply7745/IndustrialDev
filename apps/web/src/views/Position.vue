<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Position {
  id?: string
  title: string
  description: string
  requirements: string
  salaryMin: number
  salaryMax: number
  location: string
  recruitCount: number
  status: string
  companyId: string
  publishDate?: string
}

interface Company {
  id: string
  name: string
}

const positions = ref<Position[]>([])
const companies = ref<Company[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingPosition = ref<Position | null>(null)
const form = ref<Position>({
  title: '',
  description: '',
  requirements: '',
  salaryMin: 0,
  salaryMax: 0,
  location: '',
  recruitCount: 1,
  status: 'draft',
  companyId: ''
})

const fetchPositions = async () => {
  loading.value = true
  try {
    const res = await fetch('/api/positions')
    positions.value = await res.json()
  } catch (error) {
    ElMessage.error('获取岗位列表失败')
  } finally {
    loading.value = false
  }
}

const fetchCompanies = async () => {
  try {
    const res = await fetch('/api/companies')
    companies.value = await res.json()
  } catch (error) {
    console.error('获取企业列表失败')
  }
}

const handleAdd = () => {
  editingPosition.value = null
  form.value = {
    title: '',
    description: '',
    requirements: '',
    salaryMin: 0,
    salaryMax: 0,
    location: '',
    recruitCount: 1,
    status: 'draft',
    companyId: companies.value[0]?.id || ''
  }
  dialogVisible.value = true
}

const handleEdit = (position: Position) => {
  editingPosition.value = position
  form.value = { ...position }
  dialogVisible.value = true
}

const handleDelete = async (position: Position) => {
  try {
    await ElMessageBox.confirm('确定要删除该岗位吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await fetch(`/api/positions/${position.id}`, { method: 'DELETE' })
    ElMessage.success('删除成功')
    fetchPositions()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handlePublish = async (position: Position) => {
  try {
    await fetch(`/api/positions/${position.id}/publish`, { method: 'PUT' })
    ElMessage.success('发布成功')
    fetchPositions()
  } catch (error) {
    ElMessage.error('发布失败')
  }
}

const handleSubmit = async () => {
  try {
    if (editingPosition.value) {
      await fetch(`/api/positions/${editingPosition.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.value)
      })
      ElMessage.success('更新成功')
    } else {
      await fetch('/api/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.value)
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchPositions()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    closed: '已关闭'
  }
  return statusMap[status] || status
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    draft: 'info',
    published: 'success',
    closed: 'danger'
  }
  return typeMap[status] || 'info'
}

const getCompanyName = (companyId: string) => {
  const company = companies.value.find(c => c.id === companyId)
  return company?.name || '-'
}

onMounted(() => {
  fetchPositions()
  fetchCompanies()
})
</script>

<template>
  <div class="position-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>岗位管理</span>
          <el-button type="primary" @click="handleAdd">添加岗位</el-button>
        </div>
      </template>
      
      <el-table :data="positions" v-loading="loading" stripe>
        <el-table-column prop="title" label="岗位名称" width="180" />
        <el-table-column label="所属企业" width="200">
          <template #default="{ row }">
            {{ getCompanyName(row.companyId) }}
          </template>
        </el-table-column>
        <el-table-column label="薪资范围" width="150">
          <template #default="{ row }">
            {{ row.salaryMin }} - {{ row.salaryMax }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="工作地点" width="150" />
        <el-table-column prop="recruitCount" label="招聘人数" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="280">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button
              v-if="row.status === 'draft'"
              link
              type="success"
              @click="handlePublish(row)"
            >
              发布
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingPosition ? '编辑岗位' : '添加岗位'"
      width="700px"
    >
      <el-form :model="form" label-width="120px">
        <el-form-item label="岗位名称">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="所属企业">
          <el-select v-model="form.companyId" style="width: 100%">
            <el-option
              v-for="company in companies"
              :key="company.id"
              :label="company.name"
              :value="company.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="岗位描述">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="岗位要求">
          <el-input v-model="form.requirements" type="textarea" :rows="3" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="最低薪资">
              <el-input-number v-model="form.salaryMin" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最高薪资">
              <el-input-number v-model="form.salaryMax" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="工作地点">
          <el-input v-model="form.location" />
        </el-form-item>
        <el-form-item label="招聘人数">
          <el-input-number v-model="form.recruitCount" :min="1" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已关闭" value="closed" />
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
