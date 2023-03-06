<template>
  <div style="padding: 20px">
    <Updemo />

    <el-divider content-position="left">Excel 导入</el-divider>
    <el-row class="mb20" :gutter="20">
      <el-col :md="7">
        <el-row class="mb20">
          <el-card style="min-height:120px;margin-bottom: 20px">
            <el-checkbox
              v-model="checkLabelAll"
              :indeterminate="isIndeterminateLabel"
              @change="handleCheckAllChangeLabel"
            >收益周期
            </el-checkbox>
            <div style="margin: 15px 0;" />
            <el-checkbox-group v-model="checkedLabel" @change="handleCheckedLabelChange">
              <el-checkbox v-for="label in labelCheck" :key="label" :label="label">{{ label }}</el-checkbox>
            </el-checkbox-group>

          </el-card>
        </el-row>
        <el-row class="mb20">
          <el-card style="min-height:120px;margin-bottom: 20px">

            <div style="margin-bottom: 15px">
              <el-tag>收益方法</el-tag>
              <el-divider direction="vertical" />
            </div>
            <el-radio-group v-model="earnings_fun">
              <el-radio :label="'close_price'">close_price</el-radio>
              <el-radio :label="'open_price'">open_price</el-radio>
                              <el-radio :label="'volat_price'">close/volatility</el-radio>

            </el-radio-group>

          </el-card>
        </el-row>
      </el-col>

      <el-col :md="7">
        <el-card style="min-height:260px;width: 405px">
          <el-upload
            class="upload-demo"
            drag
            :on-progress="handleAvatarEvent"
            :on-success="handleAvatarSuccess"
            :on-error="handleAvatarError"
            :action="baseUrl + 'future/review/ndcg'"
            :data="{
              'periods':checkedLabel,
              'earnings_fun':earnings_fun,
            }"
            multiple
          >
            <i class="el-icon-upload" />
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div slot="tip" class="el-upload__tip">只能上传xlsx/csv文件，且不超过500MB</div>
          </el-upload>
        </el-card>
      </el-col>
    </el-row>

    <el-row v-if="factor_item" :gutter="20" style="margin-top: 20px;margin-bottom: 20px">
      <el-col class="mb20">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span style="margin-right: 30px">
              <el-tag type="danger">{{ t_name }}
              </el-tag>
            </span>
            <el-radio-group v-model="labels" @change="handleLabelClick">
              <el-radio v-for="(label,label_name) in factor_label" :key="label_name" :label="label_name" border>{{
                mapLabel[label_name]
              }}
              </el-radio>

            </el-radio-group>
            <div style="float:right;display: flex;align-items: center;">
              <el-button size="small" type="primary" icon="el-icon-download" @click="exportExcel()">NDCG</el-button>
            </div>
          </div>
          <el-table :data="table_label" stripe style="width: 100%;margin-bottom:10px;">
            <el-table-column
              v-for="(val,key) in table_label[0]"
              v-if="key !== 'trading_date'"
              :key="key"
              :prop="key"
              :label="key"
              width="200"
            />
            <el-table-column />
          </el-table>
        </el-card>

      </el-col>

    </el-row>

  </div>
</template>

<script>
import XLSX from 'xlsx'
import commonUtil from '../../../utils/commonUtil'
import { Loading } from 'element-ui'
import Updemo from '@/views/components/excel/upload-demo'
import commonConfig from '../../../utils/commonConfig'

const corrOptions = ['pearson', 'spearman']
const labelOptions = [1,2, 3, 5, 10]
var loadingInstance
export default {
  name: 'EqReviewNdcg',
  components: {
    Updemo
  },
  data() {
    return {
      baseUrl: process.env.VUE_APP_BASE_API,
      mapLabel: commonConfig.mappingLabel,
      redis_key: new Date().valueOf(),

      earnings_fun: 'close_price',
      checkLabelAll: true,
      checkedLabel: [1, 3, 5, 10],
      labelCheck: labelOptions,
      isIndeterminateLabel: false,
      cur_time: '',

      factor_item: '',
      t_name: '',

      labels: 'label_1',
      factor_label: [],
      table_label: [],

      multipleSelection: [],
      fileList: []

    }
  },
  mounted() {

  },
  methods: {
    exportExcel() {
      // 创建book
      var wb = XLSX.utils.book_new()
      // json转sheet
      var ws = XLSX.utils.json_to_sheet(this.table_label, {})

      // 设置列宽
      ws['!cols'] = [
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 15 }
      ]
      var timestamp = new Date().getTime()
      // sheet写入book
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
      // 输出
      XLSX.writeFile(wb, 'NDCG_' + this.mapLabel[this.labels] + '.csv')
    },

    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    handleCheckAllChangeCorr(val) {
      this.checkedCorr = val ? corrOptions : []
      this.isIndeterminateCorr = false
    },
    handleCheckAllChangeLabel(val) {
      this.checkedLabel = val ? labelOptions : []
      this.isIndeterminateLabel = false
    },
    handleCheckedCorrChange(value) {
      const checkedCount = value.length
      this.checkCorrAll = checkedCount === this.corrCheck.length
      this.isIndeterminateCorr = checkedCount > 0 && checkedCount < this.corrCheck.length
    },
    handleCheckedLabelChange(value) {
      const checkedCount = value.length
      this.checkLabelAll = checkedCount === this.labelCheck.length
      this.isIndeterminateLabel = checkedCount > 0 && checkedCount < this.labelCheck.length
    },
    handleAvatarSuccess(res, file) {
      const that = this
      if ((Date.now() - that.cur_time) / 1000 > 60) {
        that.$notice('NDCG', '计算完成,请返回浏览器查看详情！')
      }
      this.factor_item = res
      this.setDefaultsFactor()

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
    handleLabelClick(label) {
      this.labels = label
      this.table_label = this.factor_item[this.t_name][this.labels]
    },
    setDefaultsFactor() {
      const data = this.factor_item
      for (const [t_name, table] of Object.entries(data)) {
        this.t_name = t_name
        this.factor_label = table

        this.labels = Object.keys(this.factor_label)[0]
        this.table_label = table[this.labels]
        return
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
