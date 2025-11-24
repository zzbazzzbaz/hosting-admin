<template>
  <div class="space-y-4">
    <el-card class="pastel-card" shadow="never">
      <div class="flex items-end justify-between gap-4">
        <el-form :model="filters" label-width="80" size="small" class="flex gap-3 flex-1">
          <el-form-item label="字典名称">
            <el-input v-model="filters.dicName" placeholder="支持模糊查询" clearable />
          </el-form-item>
          <el-form-item label="字典类型">
            <el-select v-model="filters.type" placeholder="请选择类型" clearable>
              <el-option
                v-for="item in dictionaryTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <div class="flex gap-2">
          <el-button size="small" @click="handleReset">重置</el-button>
          <el-button size="small" type="primary" @click="handleQuery">查询</el-button>
          <el-button size="small" type="primary" @click="handleCreate">新增字典</el-button>
        </div>
      </div>
    </el-card>

    <el-card class="pastel-card">
      <el-table :data="dictionaryList" :loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="dicName" label="字典名称" min-width="160" />
        <el-table-column label="字典类型" min-width="160">
          <template #default="{ row }">
            {{ getTypeLabel(row.type) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)"> 修改 </el-button>
            <el-button type="danger" link @click="handleDelete(row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-xs text-slate-500">共 {{ totalItems }} 条记录</div>
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalItems"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '修改字典' : '新增字典'"
      width="480px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <el-form-item label="字典名称" prop="dicName">
          <el-input
            v-model="formData.dicName"
            placeholder="请输入字典名称"
            maxlength="50"
            clearable
          />
        </el-form-item>
        <el-form-item label="字典类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型" clearable>
            <el-option
              v-for="item in dictionaryTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="dialogVisible = false"> 取消 </el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getDictionaryList,
  addDictionary,
  updateDictionary,
  deleteDictionary,
} from '@/api/curd/dictionary'

const dictionaryTypeOptions = [
  { value: 1, label: '年级' },
  { value: 2, label: '科目' },
  { value: 3, label: '学校' },
  { value: 4, label: '校区' },
  { value: 5, label: '教师评级分类' },
  { value: 6, label: '班级' },
  { value: 7, label: '学生今日状态' },
]

const getTypeLabel = (type) => {
  const match = dictionaryTypeOptions.find((item) => item.value === type)
  return match ? match.label : '-'
}

const filters = reactive({
  dicName: '',
  type: null,
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const dictionaryList = ref([])
const totalItems = ref(0)
const loading = ref(false)

const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: null,
  dicName: '',
  type: null,
})

const formRules = {
  dicName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择字典类型', trigger: 'change' }],
}

const fetchDictionaryList = async () => {
  if (!filters.type) {
    ElMessage.warning('请先选择字典类型')
    return
  }

  try {
    loading.value = true
    const result = await getDictionaryList({
      page: pagination.current,
      pageSize: pagination.size,
      type: filters.type,
      dicName: filters.dicName || undefined,
    })

    if (result.code === 200 || result.code === 0) {
      dictionaryList.value = result.data.list || []
      totalItems.value = result.data.total || 0
    } else {
      ElMessage.error(result.message || '获取字典列表失败')
    }
  } catch (error) {
    console.error('获取字典列表失败:', error)
    ElMessage.error('获取字典列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

watch([() => pagination.current, () => pagination.size], () => {
  fetchDictionaryList()
})

onMounted(() => {
  if (filters.type) {
    fetchDictionaryList()
  }
})

const handleQuery = () => {
  if (!filters.type) {
    ElMessage.warning('请选择字典类型')
    return
  }
  pagination.current = 1
  fetchDictionaryList()
}

const handleReset = () => {
  Object.assign(filters, {
    dicName: '',
    type: null,
  })
  pagination.current = 1
  dictionaryList.value = []
  totalItems.value = 0
}

const handleCreate = () => {
  isEdit.value = false
  dialogVisible.value = true
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    dicName: '',
    type: filters.type || null,
  })
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    let result

    if (isEdit.value) {
      result = await updateDictionary({
        id: formData.id,
        dicName: formData.dicName,
        type: formData.type,
      })
    } else {
      result = await addDictionary({
        dicName: formData.dicName,
        type: formData.type,
      })
    }

    if (result.code === 200 || result.code === 0) {
      ElMessage.success(result.message || (isEdit.value ? '修改字典成功' : '新增字典成功'))
      dialogVisible.value = false
      await fetchDictionaryList()
    } else {
      ElMessage.error(result.message || (isEdit.value ? '修改字典失败' : '新增字典失败'))
    }
  } catch (error) {
    if (error !== false) {
      console.error(`${isEdit.value ? '修改' : '新增'}字典失败:`, error)
      ElMessage.error(`${isEdit.value ? '修改' : '新增'}字典失败，请稍后重试`)
    }
  } finally {
    submitLoading.value = false
  }
}

const handleEdit = (row) => {
  Object.assign(formData, {
    id: row.id,
    dicName: row.dicName || '',
    type: row.type || null,
  })
  isEdit.value = true
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除字典项 ${row.dicName} 吗？删除后数据将无法恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
      }
    )

    const result = await deleteDictionary(row.id)

    if (result.code === 200 || result.code === 0) {
      ElMessage.success(result.message || '删除成功')
      await fetchDictionaryList()
    } else {
      ElMessage.error(result.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除字典失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}
</script>
