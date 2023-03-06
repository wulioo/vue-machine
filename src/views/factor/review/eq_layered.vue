<template>
  <div style="padding: 20px">
    <Updemo />

    <el-divider content-position="left">Excel 导入</el-divider>
    <el-row class="mb20" :gutter="20">

      <el-col :md="6">
        <el-card style="min-height:120px;margin-bottom: 20px">
          <el-row class="mb20">
            <el-checkbox v-model="checkCorrAll" :indeterminate="isIndeterminateCorr" @change="handleCheckAllChangeCorr">
              分层层数
            </el-checkbox>
            <div style="margin: 15px 0;" />
            <el-checkbox-group v-model="checkedCorr" @change="handleCheckedCorrChange">
              <el-checkbox v-for="corr in corrCheck" :key="corr" :label="corr">{{ corr }}</el-checkbox>
            </el-checkbox-group>
          </el-row>
        </el-card>

        <el-card style="min-height:120px;">
          <el-row class="mb20">
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
          </el-row>
        </el-card>
      </el-col>
      <el-col :md="6">
        <el-card style="min-height:120px;margin-bottom: 20px">
          <el-row>
            <div style="margin-bottom: 15px">
              <el-tag>收益方法</el-tag>
              <el-divider direction="vertical" />
            </div>
            <el-radio-group v-model="earnings_fun">
              <el-radio :label="'close_price'">close_price</el-radio>
              <el-radio :label="'open_price'">open_price</el-radio>
            </el-radio-group>
          </el-row>
        </el-card>
        <el-card style="min-height:120px;margin-bottom: 20px">
          <el-row>
            <div style="margin-bottom: 15px">
              <el-tag>分层方法</el-tag>
              <el-divider direction="vertical" />
            </div>
            <el-checkbox v-model="factor_neu">行业中性化</el-checkbox>

          </el-row>
        </el-card>
      </el-col>
      <el-col :md="6">
        <el-card style="min-height:260px;width: 405px">
          <el-upload
            class="upload-demo"
            drag
            :on-progress="handleAvatarEvent"
            :on-success="handleAvatarSuccess"
            :on-error="handleAvatarError"
            :action="baseUrl + 'equity/review/layered'"
            :data="{&quot;layered_num&quot;:checkedCorr,
                    &quot;periods&quot;:checkedLabel,
                    &quot;earnings_fun&quot;:earnings_fun,
                    &quot;factor_neu&quot;:factor_neu,
                    &quot;redis_key&quot;:redis_key
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

    <el-row v-if="factor_item" :gutter="20" style="margin-top: 20px;margin-bottom: 30px">
      <el-col class="mb20">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <el-row :gutter="20">
              <el-col :span="1">
                <el-tag type="danger" style=" height: 32px;line-height: 32px;">{{ t_name }}
                </el-tag>

              </el-col>
              <el-col :span="3">
                <el-select v-model="factor" placeholder="请选择" @change="handChangeSelect">
                  <el-option
                    v-for="(factor,factor_name) in factor_col"
                    :key="factor_name"
                    :label="factor_name"
                    :value="factor_name"
                  />
                </el-select>
              </el-col>
              <el-col :span="18">
                <el-radio-group v-model="factor_label" @change="handleLabelClick">
                  <el-radio v-for="label_name in factor_label_arr" :key="label_name" :label="label_name" border>{{
                    mapLabel[label_name]
                  }}
                  </el-radio>
                </el-radio-group>
                <el-divider direction="vertical" />

                <el-radio-group v-model="group_name" @change="handleGroupClick">
                  <el-radio v-for="g_name in group_list" :key="g_name" :label="g_name" border>{{ g_name }}</el-radio>
                </el-radio-group>
              </el-col>

            </el-row>
          </div>

          <div :id="t_name+'_'+factor+'_'+group_name+'_'+factor_label" style="height:500px;" />

        </el-card>

      </el-col>

    </el-row>

  </div>
</template>

<script>
import XLSX from 'xlsx'
import commonUtil from '../../../utils/commonUtil'
import { Loading } from 'element-ui'
import echarts from 'echarts'
import Updemo from '@/views/components/excel/upload-demo'
import commonConfig from '../../../utils/commonConfig'

const corrOptions = [5, 7, 10]
const labelOptions = [1, 3, 5, 10]
var loadingInstance
var myChart
export default {
  components: {
    Updemo
  },
  data() {
    return {
      // baseUrl: "http://127.0.0.1:8000/",
      redis_key: new Date().valueOf(),
      factor_neu: false,
      baseUrl: process.env.VUE_APP_BASE_API,
      checkCorrAll: false,
      earnings_fun: 'close_price',
      checkedCorr: [5],
      corrCheck: corrOptions,
      isIndeterminateCorr: true,
      mapLabel: commonConfig.mappingLabel,

      checkLabelAll: true,
      checkedLabel: [1, 3, 5, 10],
      labelCheck: labelOptions,
      isIndeterminateLabel: false,
      cur_time: '',

      factor: '',
      factor_col: '',
      factor_label: 'label_1',
      group_list: '',
      group_name: '',

      factor_item: '',
      t_name: '',
      correlation: '',
      factor_corr: '',
      corr_label: 'label_1',
      factor_label_arr: '',
      table_label: [],

      multipleSelection: [],
      fileList: [],
      jsonData: null,
      jsonStr: ''
    }
  },
  mounted() {
    window.onresize = function() {
      if (myChart) {
        myChart.resize()
      }
    }
  },
  methods: {
    handChangeSelect(val) {
      this.factor = val
      this.getEchartsData()
    },
    exportExcel() {
      // 创建book
      var wb = XLSX.utils.book_new()
      // json转sheet

      var ws = XLSX.utils.json_to_sheet(this.table_label, {})

      // 设置列宽
      ws['!cols'] = [
        { width: 15 },
        { width: 15 },
        { width: 30 }
      ]
      var timestamp = new Date().getTime()
      // sheet写入book
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
      // 输出
      XLSX.writeFile(wb, 'file_' + timestamp + '.csv')
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
      this.factor_item = res
      this.t_name = file.name
      if ((Date.now() - that.cur_time) / 1000 > 60) {
        that.$notice('分层测试', '计算完成,请返回浏览器查看详情！')
      }
      this.factor_col = Object.values(that.factor_item)[0]
      this.factor = Object.keys(this.factor_col)[0]
      const group = Object.values(this.factor_col)[0]
      this.group_list = Object.keys(group)
      this.group_name = Object.keys(group)[0]
      this.factor_label_arr = Object.keys(Object.values(group)[0])
      this.factor_label = this.factor_label_arr[0]
      that.getEchartsData()

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
    handCorrClick(corr) {
      this.correlation = corr
      const that = this
      const parma = { 'table_name': that.t_name, 'correlation': that.correlation, 'corr_label': that.corr_label }
      that.$api.factor.getIc(parma).then(res => {
        that.table_label = res
      })
    },
    handleLabelClick(label) {
      this.factor_label = label
      const that = this
      this.getEchartsData()
    },
    getEchartsData() {
      const that = this
      const parma = {
        'table_name': this.t_name,
        'factor': this.factor,
        'group_name': this.group_name,
        'factor_label': this.factor_label,
        'redis_key': this.redis_key
      }
      this.$api.layered.getEchartsData(parma).then(({ data }) => {
        const myChartName = this.t_name + '_' + this.factor + '_' + this.group_name + '_' + this.factor_label
        const trading_date = data[data.length - 1]
        const del_data = data.slice(0, -1)
        setTimeout(() => {
          myChart = echarts.init(document.getElementById(myChartName))

          const option = {
            title: {
              text: '',
              subtext: ''
            },
            tooltip: {
              trigger: 'axis'
            },
            legend: {
              data: ['group1', 'group2', 'group3', 'group4', 'group5']
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
            },
            toolbox: {
              feature: {
                saveAsImage: {}
              }
            },
            xAxis: {
              type: 'category',
              boundaryGap: true,
              axisLabel: {
                // interval: 5 //间隔10
              },
              data: []
            },
            yAxis: {
              max: function(value) {
                return (value.max + 0.02).toFixed(2)
              },
              min: function(value) {
                return (value.min - 0.02).toFixed(2)
              },
              // max:1.16,
              //  min:0.9,
              type: 'value' // 根据value值来显示Y轴
            },
            series: [
              {
                name: 'Emails',
                type: 'line',
                // stack: 'Total',
                data: [120, 132, 101, 134, 90, 230, 210]
              }
            ]
          }
          // 设置图表标题
          option.title.text = that.factor
          option.title.subtext = that.group_name
          // 设置X轴数据
          option.series = del_data

          // 设置X轴标题
          option.xAxis.data = trading_date
          const group_n = []
          if (that.group_name === 'group5') {
            for (let i = 1; i <= 5; i++) {
              group_n.push('group' + i)
            }
          } else {
            for (let i = 1; i <= 10; i++) {
              group_n.push('group' + i)
            }
          }
          option.legend.data = group_n

          myChart.setOption(option)
        }, 100)
      })
    },
    handFactorClick(factor) {
      this.factor = factor
      const that = this
      this.getEchartsData()
    },
    handleGroupClick(group) {
      this.group_name = group
      this.desHander()
      this.getEchartsData()
    },
    desHander() {
      const myChartName = this.t_name + '_' + this.factor + '_' + this.group_name + '_' + this.factor_label

      myChart = echarts.init(document.getElementById(myChartName))
      // 销毁实例，销毁后实例无法再被使用。
      // 在什么情况下需要调用该函数进行销毁当前的实例呢？
      // 官方给的说明:在图表容器被销毁之后，调用 echartsInstance.dispose 销毁实例，
      myChart.dispose()
    }

  }
}
</script>

<style lang="scss" scoped>
.el-col-1 {
  width: auto;
}
</style>
