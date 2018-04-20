<template>
  <div class="singleImageUpload2 upload-container">
    <el-upload class="image-uploader" :data="dataObj" drag :multiple="false" :show-file-list="false"
      :headers="headers"
      action="http://api.zhanghaihe.com/v2.0/uploadImg.ajax"
      :on-success="handleImageScucess">
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    </el-upload>
    <div v-show="imageUrl.length>0" class="image-preview">
      <div class="image-preview-wrapper" v-show="imageUrl.length>1">
        <img :src="imageUrl">
        <div class="image-preview-action">
          <i @click="rmImage" class="el-icon-delete"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { uploadImg } from '@/api/upload'
import { getToken } from '@/utils/auth'

export default {
  name: 'singleImageUpload2',
  props: {
    value: String
  },
  computed: {
    imageUrl() {
      return this.value
    }
  },
  data() {
    return {
      dataObj: { token: '', key: '' },
      headers: { 'X-Token': getToken() }
    }
  },
  methods: {
    rmImage() {
      this.emitInput('')
    },
    emitInput(val) {
      this.$emit('input', val)
    },
    handleUploadImg(){
      uploadImg().then(response => {
        console.log(respone);
      })
    },
    handleImageScucess(res) {
      console.log(res);
      if (res.code === '0') {
          this.emitInput("http://api.zhanghaihe.com/api/v2.0/img/" + res.data)
      }
    },
    beforeUpload() {
      const isLt3M = file.size / 1024 / 1024 < 3;
      if (!isLt3M) {
        this.$message.error('上传图片大小不能超过 3MB!');
      }
      return isLt3M;
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.upload-container {
  width: 100%;
  height: 100%;
  position: relative;
  .image-uploader {
    height: 100%;
  }
  .image-preview {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0px;
    top: 0px;
    border: 1px dashed #d9d9d9;
    .image-preview-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .image-preview-action {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      cursor: default;
      text-align: center;
      color: #fff;
      opacity: 0;
      font-size: 20px;
      background-color: rgba(0, 0, 0, .5);
      transition: opacity .3s;
      cursor: pointer;
      text-align: center;
      line-height: 200px;
      .el-icon-delete {
        font-size: 36px;
      }
    }
    &:hover {
      .image-preview-action {
        opacity: 1;
      }
    }
  }
}
</style>
