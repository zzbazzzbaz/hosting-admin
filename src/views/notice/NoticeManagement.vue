<template>
  <div class="space-y-4">
    <el-card class="pastel-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-50">筛选条件</span>
          <el-button type="primary" @click="handleCreate">新增通知</el-button>
        </div>
      </template>
      <el-form :model="filters" label-width="90" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <el-form-item label="通知标题">
          <el-input
            v-model="filters.title"
            placeholder="输入标题关键字"
            clearable
          />
        </el-form-item>
      </el-form>
      <div class="mt-4 flex justify-end gap-3">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </div>
    </el-card>

    <el-card class="pastel-card">
      <template #header>
        <span class="font-semibold text-slate-50">通知列表</span>
      </template>
      <el-table
        :data="noticeList"
        :loading="loading"
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="content" label="内容" min-width="240" show-overflow-tooltip />
        <el-table-column prop="userName" label="创建人" min-width="140" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" effect="dark">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-xs text-slate-300">共 {{ totalNotices }} 条通知</div>
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalNotices"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑通知' : '新增通知'"
      width="640px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="90px"
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入通知标题"
            maxlength="100"
            clearable
          />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            placeholder="请输入通知内容"
            :autosize="{ minRows: 4, maxRows: 8 }"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addNotice, deleteNotice, getNoticePageList, updateNotice } from '@/api/curd/notice'
import { useUserStore } from '@/stores/user'

const filters = reactive({
  title: '',
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const noticeList = ref([])
const totalNotices = ref(0)
const loading = ref(false)

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const submitLoading = ref(false)
const formData = reactive({
  id: null,
  title: '',
  content: '',
})

const formRules = {
  title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入通知内容', trigger: 'blur' }],
}

const userStore = useUserStore()
const currentUserId = computed(() => userStore.profile.userId)

const normalizeStatusValue = (value) => {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  return Number.isNaN(num) ? value : num
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

const getStatusLabel = (status) => {
  const normalized = normalizeStatusValue(status)
  if (normalized === 0) return '正常'
  if (normalized === 1) return '停用'
  if (normalized === null) return '—'
  return String(normalized)
}

const getStatusType = (status) => {
  const normalized = normalizeStatusValue(status)
  if (normalized === 0) return 'success'
  if (normalized === 1) return 'warning'
  return 'info'
}

const fetchNoticeList = async () => {
  try {
    loading.value = true
    const result = await getNoticePageList({
      page: pagination.current,
      pageSize: pagination.size,
      title: filters.title || undefined,
    })

    if (result.code === 200 || result.code === 0) {
      noticeList.value = result.data.list || []
      totalNotices.value = result.data.total || 0
    } else {
      ElMessage.error(result.message || '获取通知列表失败')
    }
  } catch (error) {
    console.error('获取通知列表失败:', error)
    ElMessage.error('获取通知列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  pagination.current = 1
  fetchNoticeList()
}

const handleReset = () => {
  Object.assign(filters, { title: '' })
  pagination.current = 1
  fetchNoticeList()
}

const openDialog = (data = null) => {
  isEdit.value = !!data
  if (data) {
    formData.id = data.id
    formData.title = data.title || ''
    formData.content = data.content || ''
  } else {
    formData.id = null
    formData.title = ''
    formData.content = ''
  }
  dialogVisible.value = true
}

const handleCreate = () => {
  openDialog()
}

const handleEdit = (row) => {
  openDialog(row)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (isEdit.value) {
        await updateNotice({
          id: formData.id,
          title: formData.title,
          content: formData.content,
        })
        ElMessage.success('通知已更新')
      } else {
        if (!currentUserId.value) {
          ElMessage.error('缺少当前用户ID，请重新登录后重试')
          return
        }
        await addNotice({
          title: formData.title,
          content: formData.content,
          userId: currentUserId.value,
        })
        ElMessage.success('通知已创建')
      }
      dialogVisible.value = false
      fetchNoticeList()
    } catch (error) {
      console.error('提交通知失败:', error)
      ElMessage.error('提交失败，请稍后重试')
    } finally {
      submitLoading.value = false
    }
  })
}

const handleDelete = async (row) => {
  if (!row?.id) return
  try {
    await ElMessageBox.confirm(`确认删除通知「${row.title || row.id}」吗？`, '提示', {
      type: 'warning',
    })
    await deleteNotice(row.id)
    ElMessage.success('删除成功')
    fetchNoticeList()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      console.error('删除通知失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

const handleDialogClose = () => {
  formRef.value?.clearValidate()
}

watch([() => pagination.current, () => pagination.size], () => {
  fetchNoticeList()
})

onMounted(() => {
  fetchNoticeList()
})
</script>
