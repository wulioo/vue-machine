<template>
  <div style="padding: 20px">
    <Updemo/>

    <el-divider content-position="left">Excel 导入</el-divider>
    <el-row class="mb20" :gutter="20">
      <el-col :md="6">
        <el-card style="min-height:140px;margin-bottom: 20px">
          <el-row class="mb20">
            <el-checkbox v-model="checkCorrAll" :indeterminate="isIndeterminateCorr" @change="handleCheckAllChangeCorr">
              相关系数
            </el-checkbox>
            <div style="margin: 15px 0;"/>
            <el-checkbox-group v-model="checkedCorr" @change="handleCheckedCorrChange">
              <el-checkbox v-for="corr in corrCheck" :key="corr" :label="corr">{{ corr }}</el-checkbox>
            </el-checkbox-group>
          </el-row>
        </el-card>

        <el-card style="min-height:140px;">
          <el-row class="mb20">
            <el-checkbox
              v-model="checkLabelAll"
              :indeterminate="isIndeterminateLabel"
              @change="handleCheckAllChangeLabel"
            >收益周期
            </el-checkbox>
            <div style="margin: 15px 0;"/>
            <el-checkbox-group v-model="checkedLabel" @change="handleCheckedLabelChange">
              <el-checkbox v-for="label in labelCheck" :key="label" :label="label">{{ label }}</el-checkbox>
            </el-checkbox-group>
          </el-row>
        </el-card>
      </el-col>
      <el-col :md="8">
        <el-card style="min-height:300px;margin-bottom: 20px">
          <el-row style="margin-bottom: 20px">
            <div style="">
              <el-tag>收益方法</el-tag>
              <el-divider direction="vertical"/>
              <el-radio-group v-model="earnings_fun">
                <el-radio :label="'close_price'">close_price</el-radio>
                <el-radio :label="'open_price'">open_price</el-radio>
                <el-radio :label="'volat_price'">close/volatility</el-radio>

              </el-radio-group>
            </div>

          </el-row>
          <el-row>
            <div style="">
              <el-tag>计算选项</el-tag>
              <el-divider direction="vertical"/>
              <el-checkbox v-model="factor_diff">平均因子收益</el-checkbox>
              <el-checkbox v-model="factor_sort">因子排序</el-checkbox>
            </div>
          </el-row>
        </el-card>

      </el-col>
      <el-col :md="7">
        <el-card style="min-height:260px;width: 405px">
          <el-upload
            ref="uploadFile"
            class="upload-demo"
            drag
            :action="baseUrl + 'future/review/icir'"
            :auto-upload="false"
            :limit="2"
            multiple
          >
            <i class="el-icon-upload"/>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>

            <div slot="tip" class="el-upload__tip">只能上传xlsx/csv文件，且不超过500MB</div>
          </el-upload>
          <div>
            <el-button style="margin-top: 15px;width: 100%" size="small" type="success" @click="submitUpload">提交到服务器
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row v-if="factor_item" :gutter="20" style="margin-top: 20px;margin-bottom: 20px">
      <el-col class="mb20">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <el-row>
              <el-col :span="18">
                <el-radio-group v-model="corr_label" @change="handleLabelClick">
                  <span style="margin-right: 30px">
                    <el-tag type="danger">{{ t_name }}</el-tag>
                  </span>
                  <el-radio v-for="label_name in checkedLabel" :key="`label_${label_name}`"
                            :label="`label_${label_name}`" border>{{
                      mapLabel[`label_${label_name}`]
                    }}
                  </el-radio>
                </el-radio-group>
              </el-col>

              <el-col :span="6">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-button size="small" type="primary" icon="el-icon-download" @click="exportExcel('summary')">
                      Summary
                    </el-button>
                  </el-col>
                  <el-col :span="8">
                    <el-button size="small" type="primary" icon="el-icon-download" @click="exportExcel('normal')">
                      Normal_IC
                    </el-button>
                  </el-col>
                  <el-col :span="8">
                    <el-button size="small" type="primary" icon="el-icon-download" @click="exportExcel('rank')">Rank_IC
                    </el-button>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </div>

          <Scroll v-if="table_length > 10" :on-reach-bottom="handleReachBottom" :distance-to-edge="3">
            <el-table
              :key="t_name"
              v-loading="loading"
              :data="table_label"
              stripe
              style="width: 100%;margin-bottom:10px;"
            >

              <el-table-column
                v-for="(val,key) in table_label[0]"
                v-if="key !== 'trading_date'"
                :key="key"
                :prop="key"
                :label="key"
                sortable
                width="220"
              />
              <el-table-column/>

            </el-table>
          </Scroll>
          <el-table
            v-else
            :key="t_name"
            v-loading="loading"
            :data="table_label"
            stripe
            style="width: 100%;margin-bottom:10px;"
          >

            <el-table-column
              v-for="(val,key) in table_label[0]"
              v-if="key !== 'trading_date'"
              :key="key"
              :prop="key"
              :label="key"
              sortable
              width="220"
            />
            <el-table-column/>

          </el-table>

        </el-card>

      </el-col>

    </el-row>
        <el-row :gutter="20" v-if="factor_item" style="margin-top: 20px;margin-bottom: 20px">
      <el-col class="mb20" :xl="24">
        <el-card class="box-card">
            <div slot="header" class="clearfix">
            <span style="margin-right: 30px">
              <el-radio-group v-model="corr" @change="handCorrClick">
                <el-radio
                  v-for="cname in checkedCorr"
                  :key="cname"
                  :label="cname"
                  border
                >
                  {{ cname }}
                </el-radio>
              </el-radio-group>

            </span>
            <span>
              <el-select v-model="select_value" filterable placeholder="请选择" @change="handChangeSelect">
                <el-option
                  v-for="(val,key) in table_ic_corr"
                  v-if="key !== 'data'"
                  :key="key"
                  :label="key"
                  :value="key"
                />
              </el-select>
            </span>

          </div>
          <div id="cum_sum_ic" style="height:500px;width: 100%">
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row v-if="factor_item" :gutter="20" style="margin-top: 20px;margin-bottom: 20px">
      <el-col class="mb20" :xl="24">
        <el-card class="box-card">

          <div id="myChartName" style="height:500px;width: 100%"/>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script>
import XLSX from 'xlsx'
import commonUtil from '../../../utils/commonUtil'
import {Loading} from 'element-ui'
import CommonUtil from '@/utils/commonUtil'
import echarts from 'echarts'
import Updemo from '@/views/components/excel/upload-demo'
import commonConfig from '../../../utils/commonConfig'

const corrOptions = ['pearson', 'spearman']
const labelOptions = [1,2, 3, 5, 10]
var loadingInstance
var myChart
export default {
  name: 'FvReviewIcir',
  components: {
    Updemo
  },
  data() {
    return {
      redis_key: new Date().valueOf(),
      baseUrl: process.env.VUE_APP_BASE_API,
      mapLabel: commonConfig.mappingLabel,
      factor_diff: false,
      factor_sort: false,
      cur_time: '',
      table_ic_corr: '',
      loading: true,
      corr: 'pearson',
      table_length: '',
      checkCorrAll: true,
      checkedCorr: ['pearson', 'spearman'],
      corrCheck: corrOptions,
      isIndeterminateCorr: false,
      earnings_fun: 'close_price',
      checkLabelAll: true,
      checkedLabel: [1, 3, 5, 10],
      labelCheck: labelOptions,
      isIndeterminateLabel: false,
      factor_op: [],
      select_value: '',

      factor_item: '',
      t_name: '',
      correlation: 'summary',
      factor_corr: '',
      corr_label: 'label_1',
      factor_label: [],
      table_label: [],
      table_all: '',
      echarts: '',
      group_array: '',
      table_cum_ic: '',
      multipleSelection: [],
      fileList: [],
      jsonData: null,
      jsonStr: ''
    }
  },
  mounted() {
    window.onresize = function () {
      if (myChart) {
        myChart.resize()
      }
    }
  },
  methods: {
    submitUpload() {
      const that = this
      const optios = {
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      }
      this.cur_time = Date.now()
      // 添加全局遮罩
      loadingInstance = Loading.service(optios)
      const {uploadFiles, action, data} = this.$refs.uploadFile
      if (uploadFiles.length == 0) {
        loadingInstance.close()
        commonUtil.message('请选择文件', 'error')
        return
      }
      const form_data = new FormData()
      let flag = true
      for (const [key, file] of Object.entries(uploadFiles)) {
        if (file.name === 'label.csv') {
          flag = false
          form_data.append('label', file.raw)
        } else {
          form_data.append('factor', file.raw)
        }
      }
      if (flag && Object.entries(uploadFiles).length > 1) {
        loadingInstance.close()
        commonUtil.message('缺少label.csv文件', 'error')
        return
      }

      form_data.append('correlation', this.checkedCorr)
      form_data.append('periods', this.checkedLabel)
      form_data.append('earnings_fun', this.earnings_fun)
      form_data.append('factor_diff', this.factor_diff)
      form_data.append('factor_sort', this.factor_sort)
      this.$api.common.uploadFile(action, form_data).then(res => {
        that.$refs.uploadFile.clearFiles()
        loadingInstance.close()
        if ((Date.now() - that.cur_time) / 1000 > 60) {
          that.$notice('因子ICIR', '计算完成,请返回浏览器查看详情！')
        }
        that.factor_item = res
        that.t_name = Object.keys(res)[0]
        that.corr_label = `label_${that.checkedLabel[0]}`
        that.corr = that.checkedCorr[0]
        that.getIC()
        that.getCorr()
      }).catch(() => {
        loadingInstance.close()
      })
    },
    async exportExcel(type) {
      var files
      if (type === 'summary') {
        this.correlation = 'summary'
        files = 'summary'
        await this.getIC()
      } else if (type === 'normal') {
        this.correlation = 'pearson'
        files = 'Normal_IC'
        await this.getIC()
      } else if (type === 'rank') {
        this.correlation = 'spearman'
        files = 'Rank_IC'
        await this.getIC()
      }
      // 创建book
      var wb = XLSX.utils.book_new()
      // json转sheet

      var ws = XLSX.utils.json_to_sheet(this.export_all, {})
      // 设置列宽
      const cols_width = []
      for (const v of Object.keys(this.export_all[0])) {
        let set_len = v.length
        if (v == 'factor') {
          set_len = 25
        }
        cols_width.push({width: set_len + 1})
      }
      ws['!cols'] = cols_width

      // ws["!cols"] = [
      //   {width: 15},
      //   {width: 15},
      //   {width: 30}
      // ];
      // var timestamp = new Date().getTime();
      // sheet写入book
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
      // 输出
      XLSX.writeFile(wb, files + '_' + this.mapLabel[this.corr_label] + '.csv')
    },

    async getIC() {
      const that = this
      const parma = {
        'table_name': that.t_name,
        'correlation': that.correlation,
        'corr_label': that.corr_label,
        'redis_key': that.factor_item[that.t_name]
      }
      await that.$api.factor.getIc(parma).then(res => {
        that.loading = false
        that.table_length = res.length
        that.group_array = CommonUtil.group(res, 10)

        if (that.correlation === 'summary') {
          that.table_label = that.group_array.shift()
        }

        that.export_all = res
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleCheckAllChangeCorr(val) {
      this.checkedCorr = val ? corrOptions : []
      this.isIndeterminateCorr = false
    },
    handChangeSelect(val) {
      this.getEchartsData()
      this.getChartByCumSumIC()
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

    handCorrClick(corr) {
      this.corr = corr
      this.getCorr()
    },
    handleLabelClick(label) {
      this.correlation = 'summary'
      this.corr_label = label
      this.getIC()
      this.getCorr()
    },
    handleReachBottom() {
      const that = this
      return new Promise(resolve => {
        setTimeout(() => {
          that.table_label = that.table_label.concat(that.group_array.shift())

          resolve()
        }, 500)
      })
    },
    getEchartsData() {
      const that = this
      that.desHander()
      setTimeout(() => {
        myChart = echarts.init(document.getElementById('myChartName'))
        const option = {
          title: {
            text: 'IC走势图'
          },
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: [],
            width: '80%',
            type: 'scroll',
            selected: {
              'Video Ads': true,
              Direct: false,
              Search: true,
              'Search Engine': false
            },
            padding: [
              5, // 上
              10, // 右
              5, // 下
              10 // 左
            ]

          },
          grid: {
            left: '0',
            right: '0',
            bottom: '0',
            containLabel: true
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: 'Email',
              type: 'line',
              stack: 'Total',
              data: [120, 132, 101, 134, 90, 230, 210]
            },
            {
              name: 'Union Ads',
              type: 'line',
              stack: 'Total',
              data: [220, 182, 191, 234, 290, 330, 310]
            },
            {
              name: 'Video Ads',
              type: 'line',
              stack: 'Total',
              data: [150, 232, 201, 154, 190, 330, 410]
            },
            {
              name: 'Direct',
              type: 'line',
              stack: 'Total',
              data: [320, 332, 301, 334, 390, 330, 320]
            },
            {
              name: 'Search Engine',
              type: 'line',
              stack: 'Total',
              data: [820, 932, 901, 934, 1290, 1330, 1320]
            }
          ]
        }
        const trading_date = that.table_ic_corr['data']

        // 设置X轴数据

        option.series = that.table_ic_corr[that.select_value]
        // 设置X轴标题
        option.xAxis.data = trading_date

        const new_arr = []
        const select = {}
        for (let i = 0; i < that.table_ic_corr[that.select_value].length; i++) {
          new_arr.push(that.table_ic_corr[that.select_value][i]['name'])
          if (i > 0) {
            select[that.table_ic_corr[that.select_value][i]['name']] = true
          } else {
            select[that.table_ic_corr[that.select_value][i]['name']] = false
          }
        }

        option.legend.selected = select
        option.legend.data = new_arr
        myChart.setOption(option)
      }, 300)
    },
    getChartByCumSumIC() {
      const that = this
      that.desHander()
      setTimeout(() => {
        myChart = echarts.init(document.getElementById('cum_sum_ic'))
        let option = {
          title: {
            text: '累计IC走势图'
          },
          tooltip: {
            trigger: 'axis'
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          grid: {
            left: '0',
            right: '0',
            bottom: '0',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: []
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              data: [],
              type: 'line',
              showSymbol: false
            }
          ]
        };
        option.xAxis.data = that.table_cum_ic['trading_date']
        option.series[0].data = that.table_cum_ic[that.select_value]
        myChart.setOption(option)
      }, 300)
    },
    getCorr() {
      const that = this
      const parma = {
        'table_name': that.t_name,
        'correlation': that.corr,
        'corr_label': that.corr_label,
        'redis_key': that.factor_item[that.t_name]
      }
      that.$api.factor.getCorr(parma).then(res => {
        that.table_ic_corr = res['ic']
        that.table_cum_ic = res['cum_ic']
        that.select_value = Object.keys(res['ic'])[0]


        that.getEchartsData()
        that.getChartByCumSumIC()
      })
    },
     desHander() {

      let myChart = echarts.init(document.getElementById("myChartName"));
      let ic_cum = echarts.init(document.getElementById("cum_sum_ic"));
      // 销毁实例，销毁后实例无法再被使用。
      // 在什么情况下需要调用该函数进行销毁当前的实例呢？
      // 官方给的说明:在图表容器被销毁之后，调用 echartsInstance.dispose 销毁实例，
      myChart.dispose();
      ic_cum.dispose()
    },

  }
}
</script>

<style lang="scss" scoped>
</style>
