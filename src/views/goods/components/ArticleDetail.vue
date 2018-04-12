<template>
  <div class="createPost-container">
    <el-form class="form-container" :model="postForm" :rules="rules" ref="postForm">

      <sticky :className="'sub-navbar '+postForm.status">
        <template v-if="fetchSuccess">
          <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm()">发布
          </el-button>
          <el-button v-loading="loading" type="warning" @click="draftForm">草稿</el-button>
        </template>
        <template v-else>
          <el-tag>发送异常错误,刷新页面,或者联系程序员</el-tag>
        </template>

      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <el-col :span="21">
            <el-form-item style="margin-bottom: 40px;" prop="title">
              <MDinput name="name" v-model="postForm.goodsname" required :maxlength="100">
                商品名称
              </MDinput>
              <span v-show="postForm.goodsname.length>=26" class='title-prompt'>app可能会显示不全</span>
            </el-form-item>

            <div class="postInfo-container">
              <el-row>
                <el-col :span="8">
                  <el-form-item label-width="45px" label="分类:" class="postInfo-container-item">
                    <el-tag
                      v-if='postForm.categoryid!=""'
                      :key="postForm.categoryid"
                      closable
                      :disable-transitions="false"
                      @close="handleCategoryClose">
                      {{postForm.categoryName}}
                    </el-tag>
                    <el-button v-else class="button-new-tag" size="small" @click="showCategoryDialog">选择分类</el-button>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label-width="45px" label="价格:" class="postInfo-container-item">
              <el-input placeholder="请输入价格" v-model="postForm.price" style="width:180px">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label-width="60px" label="市场价:" class="postInfo-container-item">
              <el-input placeholder="请输入价格" style='width:180px' v-model="postForm.marketprice">
                <template style="width:25px" slot="append">元</template>
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label-width="60px" label="进货价:" class="postInfo-container-item">
              <el-input placeholder="请输入价格" style='width:180px' v-model="postForm.purchaserprice">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label-width="45px" label="库存:" class="postInfo-container-item">
              <el-input placeholder="请输入价格" v-model="postForm.price" style="width:180px">
                <template slot="append">件</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label-width="60px" label="运费:" class="postInfo-container-item">
              <el-checkbox v-model="logisticsCheck" label="收取运费" border></el-checkbox>
              <el-input placeholder="请输入运费"  style='width:180px' v-if="logisticsCheck == true" v-model="postForm.logistics">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label-width="45px" label="作者:" class="postInfo-container-item">
              <el-input placeholder="制作商" v-model="postForm.manufactory" style="width:180px">
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label-width="60px" label="产地:" class="postInfo-container-item">
              <el-input placeholder="产地" v-model="postForm.producingarea" >
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item style="margin-bottom: 40px;" label-width="45px" label="摘要:">
          <el-input type="textarea" class="article-textarea" :rows="1" autosize placeholder="请输入内容" v-model="postForm.subtitle">
          </el-input>
          <span class="word-counter" v-show="contentShortLength">{{contentShortLength}}字</span>
        </el-form-item>

        <el-upload
          action="http://api.zhanghaihe.com/api/v2.0/uploadImg.ajax"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove">
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
        <br>
        <div class="editor-container">
          <tinymce :height=1200 ref="editor" v-model="postForm.description"></tinymce>
        </div>
      </div>
    </el-form>

    <el-dialog title="分类选择" :visible.sync="dialogCategoryFormVisible">
      <el-input placeholder="输入关键字进行过滤" v-model="filterCategoryText"></el-input>
      <el-tree :data="categoryListData" :props="categoryProps"
        :filter-node-method="filterCategoryNode"
        show-checkbox
        @check-change='handleCategoryChecked'
        :highlight-current='highlightCurrent'
        node-key="id"
        ref="treeCategory"></el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCategoryFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCategoryForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import Upload from '@/components/Upload/singleImage3'
import MDinput from '@/components/MDinput'
import Multiselect from 'vue-multiselect'// 使用的一个多选框组件，element-ui的select不能满足所有需求
import 'vue-multiselect/dist/vue-multiselect.min.css'// 多选框组件css
import Sticky from '@/components/Sticky' // 粘性header组件
import { validateURL } from '@/utils/validate'
import { fetchArticle } from '@/api/article'
import { userSearch } from '@/api/remoteSearch'
import { categoryListShow } from '@/api/category'

const defaultForm = {
  goodsname: '',
  categoryid: '',
  categoryName: '',
  subtitle: '',
  price: '',
  marketprice: '',
  purchaserprice: '',
  storedcount: '',
  pics: '',
  pic: '',
  manufactory: '',
  producingarea: '',
  description: '',
  remark: '',
  logisticsId: '',
  logistics: '',
  state: '',
  paixu: '',
  goodsid: undefined,
  platforms: ['a-platform'],
  comment_disabled: false
}

export default {
  name: 'articleDetail',
  components: { Tinymce, MDinput, Upload, Multiselect, Sticky },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    filterCategoryText(val) {
      this.$refs.treeCategory.filter(val);
    }
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (value === '') {
        this.$message({
          message: rule.field + '为必传项',
          type: 'error'
        })
        callback(null)
      } else {
        callback()
      }
    }
    const validateSourceUri = (rule, value, callback) => {
      if (value) {
        if (validateURL(value)) {
          callback()
        } else {
          this.$message({
            message: '外链url填写不正确',
            type: 'error'
          })
          callback(null)
        }
      } else {
        callback()
      }
    }
    return {
      dialogCategoryFormVisible:false,
      filterCategoryText:'',
      categoryListData:[],
      highlightCurrent:true,
      categoryProps: {
          children: 'children',
          label: 'name'
      },
      logisticsCheck: false,
      dialogImageUrl: '',
      dialogVisible: false,
      postForm: Object.assign({}, defaultForm),
      fetchSuccess: true,
      loading: false,
      userLIstOptions: [],
      platformsOptions: [
        { key: 'a-platform', name: 'a-platform' },
        { key: 'b-platform', name: 'b-platform' },
        { key: 'c-platform', name: 'c-platform' }
      ],
      rules: {
        image_uri: [{ validator: validateRequire }],
        title: [{ validator: validateRequire }],
        content: [{ validator: validateRequire }],
        source_uri: [{ validator: validateSourceUri, trigger: 'blur' }]
      }
    }
  },
  computed: {
    contentShortLength() {
      return 100
    }
  },
  created() {
    if (this.isEdit) {
      this.fetchData()
    } else {
      this.postForm = Object.assign({}, defaultForm)
    }
  },
  methods: {
    handleCategoryClose(){
      this.postForm.categoryid = ''
      this.postForm.categoryName = ''
    },
    handleCategoryForm(){
      if(this.$refs.treeCategory.getCheckedNodes()){
        console.log(this.$refs.treeCategory.getCheckedNodes()[0].name);
        this.postForm.categoryid = this.$refs.treeCategory.getCheckedNodes()[0].id
        this.postForm.categoryName = this.$refs.treeCategory.getCheckedNodes()[0].name
      }
      this.dialogCategoryFormVisible = false
    },
    showCategoryDialog(){
      this.categoryListData = []
      this.dialogCategoryFormVisible = true
      categoryListShow().then(response => {
        if (response.data.code === '0') {
          this.categoryListData = response.data.data
        } else {

        }
      })
    },
    filterCategoryNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    handleCategoryChecked(value,checked){
      if(!checked){
        return
      }
      if(this.$refs.treeCategory.getCheckedNodes()){
        for(var nodes of this.$refs.treeCategory.getCheckedNodes()){
          this.$refs.treeCategory.setChecked(nodes.id,false)
        }
      }
      this.$refs.treeCategory.setChecked(value.id,true)
    },
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    fetchData() {
      fetchArticle().then(response => {
        this.postForm = response.data
      }).catch(err => {
        this.fetchSuccess = false
        console.log(err)
      })
    },
    submitForm() {
      this.postForm.display_time = parseInt(this.display_time / 1000)
      console.log(this.postForm)
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$notify({
            title: '成功',
            message: '发布文章成功',
            type: 'success',
            duration: 2000
          })
          this.postForm.status = 'published'
          this.loading = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    draftForm() {
      if (this.postForm.content.length === 0 || this.postForm.title.length === 0) {
        this.$message({
          message: '请填写必要的标题和内容',
          type: 'warning'
        })
        return
      }
      this.$message({
        message: '保存成功',
        type: 'success',
        showClose: true,
        duration: 1000
      })
      this.postForm.status = 'draft'
    },
    getRemoteUserList(query) {
      userSearch(query).then(response => {
        if (!response.data.items) return
        console.log(response)
        this.userLIstOptions = response.data.items.map(v => ({
          key: v.name
        }))
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  @import "src/styles/mixin.scss";
  .title-prompt{
    position: absolute;
    right: 0px;
    font-size: 12px;
    top:10px;
    color:#ff4949;
  }
  .createPost-container {
    position: relative;
    .createPost-main-container {
      padding: 40px 45px 20px 50px;
      .postInfo-container {
        position: relative;
        @include clearfix;
        margin-bottom: 10px;
        .postInfo-container-item {
          float: left;
        }
      }
      .editor-container {
        min-height: 500px;
        margin: 0 0 30px;
        .editor-upload-btn-container {
            text-align: right;
            margin-right: 10px;
            .editor-upload-btn {
                display: inline-block;
            }
        }
      }
    }
    .word-counter {
      width: 40px;
      position: absolute;
      right: -10px;
      top: 0px;
    }
  }
</style>
