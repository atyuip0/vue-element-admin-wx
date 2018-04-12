<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container">
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" :placeholder="$t('table.title')" v-model="listQuery.title">
      </el-input>
      <el-select clearable class="filter-item" style="width: 130px" v-model="listQuery.status" placeholder="状态">
        <el-option v-for="item in  statusOptions" :key="item.name" :label="item.name" :value="item.id">
        </el-option>
      </el-select>
      <el-button class="filter-item" type="primary" v-waves icon="el-icon-search" @click="handleFilter">{{$t('table.search')}}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">{{$t('table.add')}}</el-button>
    </div>

    <el-table :key='tableKey' :data="list" v-loading="listLoading" element-loading-text="给我一点时间" border fit highlight-current-row
      style="width: 100%">
      <el-table-column align="center" :label="$t('table.id')" width="65">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="标题">
        <template slot-scope="scope">
          <span><a :href="scope.row.linkurl" target="_blank">{{scope.row.title}}</a></span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="类型">
        <template slot-scope="scope">
          <span>{{scope.row.type}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" label="图片">
        <template slot-scope="scope">
          <span>{{scope.row.picurl}}</span>
        </template>
      </el-table-column>
      <el-table-column min-width="80px" label="状态">
        <template slot-scope="scope">
          <el-tag>{{scope.row.status | stateFilter}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="排序">
        <template slot-scope="scope">
          <span>{{scope.row.paixu}}</span>
        </template>
      </el-table-column>
      <el-table-column width="110px" align="center" label="备注">
        <template slot-scope="scope">
          <span>{{scope.row.remark}}</span>
        </template>
      </el-table-column>
      <el-table-column width="150px" align="center" label="创建时间">
        <template slot-scope="scope">
          <span>{{scope.row.addTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('table.actions')" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status=='1'" size="mini" type="success" @click="handleModifyStatus(scope.row,'0')">启用
          </el-button>
          <el-button v-if="scope.row.status=='0'" size="mini" type="info" @click="handleModifyStatus(scope.row,'1')">停用
          </el-button>
          <el-button v-if="scope.row.id!=-1" size="mini" type="primary" @click="handleUpdate(scope.row)">编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="90px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="标题" prop="title">
          <el-input v-model="temp.title" placeholder="Please input"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-input v-model="temp.type" placeholder="Please input"></el-input>
        </el-form-item>
        <el-form-item label="图片" prop="picurl">
          <Upload v-model="temp.picurl"></Upload>
        </el-form-item>
        <el-form-item label="链接地址" prop="linkurl">
          <el-input placeholder="请输入内容" v-model="temp.linkurl">
            <template slot="prepend">Http://</template>
          </el-input>
        </el-form-item>
        <el-form-item label="排序" prop="paixu">
          <el-input v-model="temp.paixu" style="width: 60px;"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select class="filter-item" v-model="temp.status" placeholder="请选择">
            <el-option v-for="item in  statusOptions" :key="item.name" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" placeholder="Please input" v-model="temp.remark">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('table.cancel')}}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{$t('table.confirm')}}</el-button>
        <el-button v-else type="primary" @click="updateData">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { bannerList, modifyBannerStatus, addBanner, upBanner } from '@/api/banner'
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'
import Upload from '@/components/Upload/singleImage2'

export default {
  name: 'complexTable',
  components: { Upload },
  directives: {
    waves
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        title: "",
        status: 0,
        type: undefined
      },
      showReviewer: false,
      temp: {
        id: undefined,
        type: '1',
        title: '',
        picurl: '',
        linkurl: '',
        paixu: '1',
        status: '',
        remark: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }],
        picurl: [{ required: true, message: '请上传图片', trigger: 'change' }],
        paixu: [{ required: true, message: '请填写分类排序', trigger: 'change' }],
        status: [{ required: true, message: '请选择分类状态', trigger: 'change' }]
      },
      statusOptions: [
        {
          id:0,
          name:"启用"
        },
        {
          id:1,
          name:"停用"
        }
      ],
      downloadLoading: false
    }
  },
  filters: {
    stateTagFilter(state) {
      const stateTagMap = {
        0: 'success',
        1: 'info'
      }
      return stateTagMap[state]
    },
    stateFilter(state) {
      const stateMap = {
        0: '启用',
        1: '停用'
      }
      return stateMap[state]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      bannerList(this.listQuery).then(response => {
        if (response.data.code === '0') {
          this.list = response.data.data.content
          this.total = response.data.data.totalElements
          this.listLoading = false
        } else {
          this.listLoading = false
        }
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange(val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.listQuery.page = val
      this.getList()
    },
    handleModifyStatus(row, status) {
      var data = {
        "id":row.id,
        "status":status
      }
      modifyBannerStatus(data).then(response => {
        if (response.data.code === '0') {
          this.$message({
            message: '操作成功',
            type: 'success'
          })
          row.status = status
        } else {
          this.$message({
            message: response.data.msg + '，code:' + response.data.code,
            type: 'error'
          })
        }
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        type: '1',
        title: '',
        picurl: '',
        linkurl: '',
        paixu: '1',
        status: '',
        remark: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addBanner(this.temp).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = {
        id: row.id,
        type: row.type,
        title: row.title,
        picurl: row.picurl,
        linkurl: row.linkurl,
        paixu: row.paixu,
        status: row.status,
        remark: row.remark
      }
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          upBanner(tempData).then(() => {
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
          })
        }
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
