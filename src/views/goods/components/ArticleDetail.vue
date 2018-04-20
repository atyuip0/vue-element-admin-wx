<template>
  <div class="createPost-container">
    <el-form class="form-container" :model="postForm" :rules="rules" ref="postForm">

      <sticky :className="'sub-navbar '+postForm.status">
        <template v-if="fetchSuccess">
          <el-button v-loading="loading" style="margin-left: 10px;" type="success" @click="submitForm()">保存
          </el-button>
        </template>
        <template v-else>
          <el-tag>发送异常错误,刷新页面,或者联系程序员</el-tag>
        </template>

      </sticky>

      <div class="createPost-main-container">
        <el-row>
          <el-col :span="21">
            <el-form-item style="margin-bottom: 40px;" prop="goodsname">
              <MDinput name="name" v-model="postForm.goodsname" required :maxlength="100">
                商品名称
              </MDinput>
              <span v-show="postForm.goodsname.length>=26" class='title-prompt'>app可能会显示不全</span>
            </el-form-item>

            <div class="postInfo-container">
              <el-row>
                <el-col :span="10">
                  <el-form-item label-width="45px" label="分类:" prop="categoryid" class="postInfo-container-item">
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
            <el-form-item label-width="45px" label="价格:" prop="priceStr" class="postInfo-container-item">
              <el-input placeholder="请输入价格" v-model="postForm.priceStr" style="width:180px">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label-width="60px" label="市场价:" prop="marketpriceStr" class="postInfo-container-item">
              <el-input placeholder="请输入价格" style='width:180px' v-model="postForm.marketpriceStr">
                <template style="width:25px" slot="append">元</template>
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label-width="60px" label="进货价:" prop="purchaserpriceStr" class="postInfo-container-item">
              <el-input placeholder="请输入价格" style='width:180px' v-model="postForm.purchaserpriceStr">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label-width="45px" label="库存:" prop="storedcount" class="postInfo-container-item">
              <el-input placeholder="请输入库存" v-model="postForm.storedcount" style="width:180px">
                <template slot="append">件</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label-width="60px" label="运费:" prop="logisticsStr" class="postInfo-container-item">
              <el-checkbox v-model="logisticsCheck" label="收取运费" border></el-checkbox>
              <el-input placeholder="请输入运费"  style='width:180px' v-if="logisticsCheck == true" v-model="postForm.logisticsStr">
                <template slot="append">元</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="8">
            <el-form-item label-width="45px" label="作者:" prop="manufactory" class="postInfo-container-item">
              <el-input placeholder="制作商" v-model="postForm.manufactory" style="width:180px">
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label-width="60px" label="产地:" prop="producingarea" class="postInfo-container-item">
              <el-input placeholder="产地" v-model="postForm.producingarea" >
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item style="margin-bottom: 40px;" label-width="45px" prop="subtitle" label="摘要:">
          <el-input type="textarea" class="article-textarea" :rows="1" autosize placeholder="请输入内容" v-model="postForm.subtitle">
          </el-input>
          <span class="word-counter" v-show="contentShortLength">{{contentShortLength}}字</span>
        </el-form-item>

        <el-upload
          action="http://api.zhanghaihe.com/v2.0/uploadImg.ajax"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleImgRemove"
          :on-success="handleImgSuccess">
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
        <br>
        <div class="editor-container">
          <tinymce :height=1200 ref="editor" prop="description" v-model="postForm.description"></tinymce>
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
import { validateMoney } from '@/utils/validate'
import { getQueryString } from '@/utils/url'
import { fetchArticle } from '@/api/article'
import { addGoods, getGoods } from '@/api/goods'
import { categoryListShow } from '@/api/category'

const defaultForm = {
  goodsname: '',
  categoryid: '',
  categoryName: '',
  subtitle: '',
  price: '',
  priceStr: '',
  marketprice: '',
  marketpriceStr: '',
  purchaserprice: '',
  purchaserpriceStr: '',
  storedcount: '',
  pics: '',
  pic: '',
  imgFileList:[],
  manufactory: '',
  producingarea: '',
  description: '',
  remark: '',
  logisticsId: '',
  logistics: '0',
  logisticsStr: '',
  state: '',
  paixu: '',
  goodsid: undefined
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
        callback(new Error(this.rules[rule.field][0].message))
      } else {
        callback()
      }
    }
    const validatePrice = (rule, value, callback) => {
      if (validateMoney(value)) {
        callback()
      } else {
        callback(new Error(this.rules[rule.field][0].message))
      }
    }
    const validateLogistics = (rule, value, callback) => {
      if (this.logisticsCheck) {
        if (validateMoney(value)) {
          callback()
        } else {
          callback(new Error(this.rules[rule.field][0].message))
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
      rules: {
        goodsname: [{ validator: validateRequire, message: "请填写商品名称" }],
        categoryid: [{ validator: validateRequire, message: "请选择商品分类" }],
        subtitle: [{ validator: validateRequire, message: "请填写商品副标题" }],
        priceStr: [{ validator: validatePrice, message: "请填写商品价格" }],
        marketpriceStr: [{ validator: validatePrice, message: "请填写商品市场价" }],
        purchaserpriceStr: [{ validator: validatePrice, message: "请填写商品进货价" }],
        storedcount: [{ validator: validateRequire, message: "请填写商品库存" }],
        manufactory: [{ validator: validateRequire, message: "请填写制作商" }],
        producingarea: [{ validator: validateRequire, message: "请填写产地" }],
        description: [{ validator: validateRequire, message: "请填写详情" }],
        logisticsStr: [{ validator: validateLogistics, message: "请填写运费" }]

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
    handleImgRemove(file, fileList) {
      this.postForm.imgFileList = fileList
      console.log(file, fileList);
      console.log(this.dialogImageUrl);
    },
    handleImgSuccess(response, file, fileList){
      this.postForm.imgFileList = fileList
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    fetchData() {

      let goodsid = {
        goodsid: getQueryString('id')
      }
      console.log(goodsid);
      getGoods(goodsid).then(response => {
        console.log(response)
        this.postForm = response.data.data
        if(this.postForm.logisticsId != -1) {
          this.logisticsCheck = true;
        }
      }).catch(err => {
        this.fetchSuccess = false
        console.log(err)
      })
    },
    submitForm() {
      console.log(this.postForm)
      if(this.logisticsCheck){
        this.postForm.logisticsId = 1;
      } else {
        this.postForm.logisticsId = -1;
      }
      if(this.postForm.imgFileList){
        var pics = ''
        for(var imgFile of this.postForm.imgFileList){
          if( pics != '' ) {
            pics += ','
          } else {
            this.postForm.pic = "http://api.zhanghaihe.com/v2.0/img/" + imgFile.response.data
          }
          pics = pics + "http://api.zhanghaihe.com/v2.0/img/" + imgFile.response.data
        }
        this.postForm.pics = pics
      }
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true
          addGoods(this.postForm).then(response => {
            this.$notify({
              title: '成功',
              message: '保存商品成功',
              type: 'success',
              duration: 2000
            })
            window.location.href = '/#/goods/index'
            this.loading = false
          }).catch(err => {
            console.log(err)
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
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
