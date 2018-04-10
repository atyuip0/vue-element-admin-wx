<template>
  <div class="app-container">

    <el-tag style="margin-bottom:20px;">
      <a href="https://github.com/PanJiaChen/vue-element-admin/tree/master/src/components/TreeTable" target="_blank">Documentation</a>
    </el-tag>

    <tree-table :data="data" :evalFunc="func" :evalArgs="args" :expandAll="expandAll" border>
      <el-table-column label="分类名称">
        <template slot-scope="scope">
          <span >{{scope.row.name}}</span>
        </template>
      </el-table-column>
      <el-table-column label="图标">
        <template slot-scope="scope">
          <span >{{scope.row.icon}}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序">
        <template slot-scope="scope">
          <span>{{scope.row.paixu}}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态">
        <template v-if="scope.row.id!=-1" slot-scope="scope">
          <el-tag :type="scope.row.status | stateTagFilter">{{scope.row.status | stateFilter}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注">
        <template slot-scope="scope">
          <span style="color:sandybrown">{{scope.row.remark}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220">
        <template slot-scope="scope">
          <el-button v-if="scope.row.id!=-1 && scope.row.status!='0'" size="mini" type="success" @click="handleModifyStatus(scope.row,'0')">启用
          </el-button>
          <el-button v-if="scope.row.id!=-1 && scope.row.status=='0'" size="mini" type="info" @click="handleModifyStatus(scope.row,'1')">停用
          </el-button>
          <el-button size="mini" type="primary" @click="handleCreate(scope.row)">新建
          </el-button>
          <el-button v-if="scope.row.id!=-1" size="mini" type="primary" @click="handleUpdate(scope.row)">编辑
          </el-button>
        </template>
      </el-table-column>
    </tree-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" ref="dataForm" :model="temp" label-position="left" label-width="90px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="父节点">
          <template slot-scope="scope">
            <span>{{temp.parentName}}</span>
          </template>
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="temp.name" placeholder="Please input"></el-input>
        </el-form-item>
        <el-form-item label="分类图标" prop="icon">
          <Upload v-model="temp.icon"></Upload>
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
/**
  Auth: Lei.j1ang
  Created: 2018/1/19-14:54
*/
import { categoryList, modifyCategoryStatus, addCategory } from '@/api/category'
import treeTable from '@/components/TreeTable'
import treeToArray from './customEval'
import Upload from '@/components/Upload/singleImage2'

export default {
  name: 'customTreeTableDemo',
  components: { treeTable, Upload },
  data() {
    return {
      func: treeToArray,
      expandAll: false,
      data:[],
      args: [null, null, 'timeLine'],
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      rules: {
        name: [{ required: true, message: '请填写分类名称', trigger: 'change' }],
        icon: [{ required: true, message: '请上传分类图标', trigger: 'change' }],
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
      temp: {
        id: undefined,
        parentId: '-1',
        parentName: '',
        icon: '',
        name: '',
        paixu: '1',
        status: '',
        remark: ''
      },
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
        0: '已启用',
        1: '已停用'
      }
      return stateMap[state]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    message(row) {
      this.$message.info(row.event)
    },
    handleModifyStatus(row, status) {
      var data = {
        "id":row.id,
        "status":status
      }
      modifyCategoryStatus(data).then(response => {
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
    getList(row) {
      categoryList().then(response => {
        if (response.data.code === '0') {
          this.data = response.data.data
        } else {
        }
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        parentId: '-1',
        parentName: '',
        icon: '',
        name: '',
        paixu: '1',
        status: '',
        remark: ''
      }
    },
    handleCreate(row) {
      this.resetTemp()
      this.temp.parentId = row.id;
      this.temp.parentName = row.name;
      if (row.id === -1) {
        this.temp.parentName = '根分类';
      }
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          addCategory(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.timestamp = new Date(this.temp.timestamp)
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
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleAvatarSuccess(res, file) {
        this.temp.icon = URL.createObjectURL(file.raw);
    },
    beforeAvatarUpload(file) {
      const isLt3M = file.size / 1024 / 1024 < 3;

      if (!isLt3M) {
        this.$message.error('上传图片大小不能超过 3MB!');
      }
      return isLt3M;
    }
  }
}
</script>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
