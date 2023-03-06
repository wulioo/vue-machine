<template>
  <div style="padding: 20px">
    <Updemo />
    <el-divider content-position="left">Excel 导入</el-divider>

    <el-card style="min-height:260px;width: 405px">
      <el-upload
        class="upload-demo"
        drag
        :on-progress="handleAvatarEvent"
        :on-success="handleAvatarSuccess"
        :on-error="handleAvatarError"
        :action="baseUrl + 'future/review/distribute/'"

        multiple
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div slot="tip" class="el-upload__tip">只能上传xlsx/csv文件，且不超过500MB</div>
      </el-upload>
    </el-card>

    <el-row v-if="factor_item" :gutter="20" style="margin-top: 20px;margin-bottom: 20px">
      <el-col class="mb20">
        <el-card class="box-card">
          <el-row slot="header" class="clearfix">
            <el-col>
              <el-tag type="danger" style="margin-right: 20px">{{ t_name }}
              </el-tag>
              <el-select v-model="factor" placeholder="请选择" style="margin-right: 30px" @change="handChangeSelect">
                <el-option
                  v-for="factor_name in factor_col"
                  :key="factor_name"
                  :label="factor_name"
                  :value="factor_name"
                />
              </el-select>
              <!--              <el-button size="small" type="primary" icon="el-icon-download" @click="exportExcel()">因子分布图-->
              <!--              </el-button>-->

            </el-col>

          </el-row>
          <img :src="baseUrl+file_name" alt="" style="width: 100%">
        </el-card>

      </el-col>

    </el-row>
  </div>
</template>

<script>
import commonUtil from '../../../utils/commonUtil'
import XLSX from 'xlsx'
import CommonUtil from '@/utils/commonUtil'
import { getPlatform } from '@/utils/auth'
import { Loading } from 'element-ui'
import Updemo from '@/views/components/excel/upload-demo'

var loadingInstance

export default {

  name: 'FvReviewDistribute',
  components: {
    Updemo
  },
  data() {
    return {
      baseUrl: process.env.VUE_APP_BASE_API,
      t_name: '',
      factor_item: '',
      factor: '',
      factor_col: '',
      file_name: ''

    }
  },
  computed: {},
  watch: {},
  created() {
  },
  mounted() {

  },
  methods: {
    handleAvatarEvent() {
      const optios = {
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      }
      this.cur_time = Date.now()
      // 添加全局遮罩
      loadingInstance = Loading.service(optios)
    },
    handleAvatarSuccess(res, file) {
      const that = this
      this.factor_item = res
      this.t_name = file.name
      if ((Date.now() - that.cur_time) / 1000 > 60) {
        that.$notice('因子分布', '计算完成,请返回浏览器查看详情！')
      }
      for (const [table, f_itme] of Object.entries(this.factor_item)) {
        this.t_name = table
        this.factor_col = Object.keys(f_itme)
        this.factor = this.factor_col[0]
        this.file_name = this.factor_item[this.t_name][this.factor]
      }

      loadingInstance.close()
    },
    handleAvatarError(err, file, fileList) {
      loadingInstance.close()
      if (err.status == 500) {
        commonUtil.message('服务器内部错误', 'error')
      }
      let res = err.message
      res = JSON.parse(res)
      if (res.code == 400) {
        commonUtil.message(res.msg, 'error')
      }
    },

    exportExcel() {
      // 创建book
      var wb = XLSX.utils.book_new()
      // json转sheet
      const factor_name = Object.keys(this.factor_item)
      const factor_value = Object.values(this.factor_item)
      const data = [[''].concat(factor_name)]
      // for (let val of factor_value) {
      //   data.push(val)
      // }
      for (let i = 0; i < factor_value[0].length; i++) {
        const new_arr = []
        new_arr.push(factor_name[i])
        for (const val of factor_value) {
          new_arr.push(val[i])
        }
        data.push(new_arr)
      }
      var ws = XLSX.utils.aoa_to_sheet(data, {})

      // 设置列宽
      const cols_width = []
      for (const v of data[0]) {
        let set_len = v.length
        if (set_len == 0) {
          set_len = 25
        }
        cols_width.push({ width: set_len + 1 })
      }
      ws['!cols'] = cols_width
      var timestamp = new Date().getTime()
      // sheet写入book
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
      // 输出
      XLSX.writeFile(wb, 'Corr.csv')
    },
    handChangeSelect(val) {
      this.factor = val
      this.file_name = this.factor_item[this.t_name][this.factor]
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .el-card .el-card__body .el-row {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.el-table .warning-row {
  background: oldlace;
}

.el-table .success-row {
  background: #f0f9eb;
}

.drag-btn {
  cursor: move;
  font-size: 12px;
}

.el-cascader-panel.is-bordered {
  height: 300px;
}

/deep/ .el-cascader-menu__wrap {
  height: 100%;
}

/deep/ .el-table__body-wrapper .is-scrolling-left {
  height: 100%
}
</style>
