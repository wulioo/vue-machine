<template>
  <div style="padding: 20px">
    <el-row class="flex-wrap" :gutter="20">
      <el-col :span="5" style="width: auto">

        <el-date-picker
          v-model="trading_time"
          type="daterange"
          align="center"
          unlink-panels
          range-separator=":"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptions"
        />
      </el-col>
      <el-col :span="6">
        <el-button type="primary" @click="calculateIcIr()">计算-ICIR</el-button>
      </el-col>

    </el-row>

    <el-divider content-position="left">因子列表</el-divider>
    <el-row
      v-loading="show"
      class="flex-wrap"
      :gutter="20"
      element-loading-text="数据加载中..."
      element-loading-spinner="el-icon-loading"
    >
      <el-col :xl="9.5" class="mb20" :span="9.5" style="padding-left: 0px!important;">

        <el-cascader-panel
          ref="myCascader"
          :options="options"
          :props="{multiple:true,}"
        />

      </el-col>
      <el-col v-show="!show" :span="8">
        <el-card shadow="never" style="height: 300px">
          <el-row :gutter="20" style="margin-bottom: 20px">
            <el-tag>收益方法</el-tag>
            <el-divider direction="vertical" />
            <el-radio-group v-model="earnings_fun">
              <el-radio :label="'close_price'">close_price</el-radio>
              <el-radio :label="'open_price'">open_price</el-radio>
            </el-radio-group>
          </el-row>
          <!--          <el-divider></el-divider>-->
          <el-row :gutter="20" style="margin-bottom: 15px">
            <el-tag>相关系数</el-tag>
            <el-divider direction="vertical" />
            <el-checkbox-group v-model="check_correlation" style=" display: inline-block;">
              <el-checkbox v-for="val in CorrelationList" :label="val" />
            </el-checkbox-group>
          </el-row>
          <el-row :gutter="20" style="margin-bottom: 15px">
            <el-tag>收益周期</el-tag>
            <el-divider direction="vertical" />
            <el-checkbox-group v-model="check_periods" style=" display: inline-block;">
              <el-checkbox v-for="val in Periods" :label="val" />
            </el-checkbox-group>
          </el-row>
          <el-row :gutter="20" style="margin-bottom: 20px">
            <el-tag>计算选项</el-tag>
            <el-divider direction="vertical" />
            <!--            <el-checkbox v-model="factor_diff">平均因子收益</el-checkbox>-->
            <el-checkbox v-model="factor_sort">因子排序</el-checkbox>
          </el-row>
          <el-row :gutter="20" style="margin-bottom: 20px">
            <el-tag>指数选择</el-tag>
            <el-divider direction="vertical" />
            <el-radio-group v-model="index_code">
              <el-radio :label="'all'">全部股票</el-radio>
              <el-radio :label="'000300.SH'">沪深300</el-radio>
              <el-radio :label="'000016.SH'">上证50</el-radio>
              <el-radio :label="'000905.SH'">中证500</el-radio>
              <el-radio :label="'000852.SH'">中证1000</el-radio>
            </el-radio-group>
          </el-row>

          <el-row :gutter="20" style="margin-bottom: 20px">
            <el-tag>平均收益</el-tag>

            <el-divider direction="vertical" />
            <el-checkbox-group
              v-model="checkedDiff"
              style=" display: inline-block;"
            >
              <el-checkbox v-for="d in factor_diff" :key="d" :label="d">{{ dffMapping[d] }}</el-checkbox>
            </el-checkbox-group>
          </el-row>
          <el-divider />
        </el-card>
      </el-col>
    </el-row>
    <el-row />

    <el-row v-if="factor_item" :gutter="20" style="margin-top: 20px;margin-bottom: 20px">
      <el-col class="mb20">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <!--            style="margin-right: 30px"-->
            <el-row :gutter="20" justify="center">
              <el-col :span="18" style="">
                <el-radio-group v-model="t_name" style="margin-right: 15px" @change="handTableClick">
                  <el-radio v-for="(table,tname) in factor_item" :key="tname" :label="tname">
                    <el-tag type="danger">{{ tname }}
                    </el-tag>
                  </el-radio>
                </el-radio-group>
                <el-radio-group v-model="corr_label" @change="handleLabelClick">
                  <el-radio v-for="(label,label_name) in factor_label_arr" :key="label_name" :label="label_name" border>
                    {{
                      mapLabel[label_name]
                    }}
                  </el-radio>

                </el-radio-group>
              </el-col>

              <el-col :span="6">
                <!--                <div style="float:right;display: flex;align-items: center;">-->
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
                    <el-button size="small" type="primary" icon="el-icon-download" @click="exportExcel('rank')">
                      Rank_IC
                    </el-button>
                  </el-col>
                </el-row>
                <!--                </div>-->
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
                width="220"
              />
              <el-table-column />

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
              width="220"
            />
            <el-table-column />

          </el-table>

        </el-card>

      </el-col>

    </el-row>

    <el-row v-if="factor_item" :gutter="20" style="margin-top: 20px;margin-bottom: 20px">
      <el-col class="mb20" :xl="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span style="margin-right: 30px">
              <el-radio-group v-model="corr" @change="handCorrClick">
                <el-radio
                  v-for="(corr,cname) in factor_corr"
                  v-if="cname !== 'summary'"
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
                  v-for="(val,key) in table_corr"
                  v-if="key !== 'data'"
                  :key="key"
                  :label="key"
                  :value="key"
                />
              </el-select>
            </span>

          </div>
          <div id="myChartName" style="height:500px;width: 100%" />
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script>
import commonUtil from '../../../utils/commonUtil'

import XLSX from 'xlsx'

import DateRangePicker from '@/components/DateRangePicker'
import CommonUtil from '../../../utils/commonUtil'
import echarts from 'echarts'
import commonConfig from '../../../utils/commonConfig'
import vueSeamlessScroll from 'vue-seamless-scroll'
import Config from '@/settings'

var myChart
const diffOptions = ['ls_return_mean', 'lo_return_mean', 'so_return_mean']
export default {
  components: {},
  data() {
    return {
      checkAll: false,
      checkedDiff: [],
      redis_key: new Date().valueOf(),
      // factor_diff: diffOptions,
      isIndeterminate: true,
      check_correlation: ['pearson', 'spearman'],
      CorrelationList: Config.Correlation,
      check_periods: [1, 3, 5, 10],
      Periods: Config.Periods,
      dffMapping: {
        'ls_return_mean': '多空收益',
        'lo_return_mean': '多头收益',
        'so_return_mean': '空头收益'
      },
      table_corr: '',
      index_code: 'all',
      mapLabel: commonConfig.mappingLabel,
      factor_diff: diffOptions,
      factor_sort: false,
      loading: true,
      show: true,
      corr: 'pearson',
      echarts: '',
      earnings_fun: 'close_price',
      factor_corr: '',
      factor_label_arr: '',
      test: '',
      t_name: '',
      correlation: 'summary',
      corr_label: 'label_1',
      table_label: [],
      table_all: [],
      group_array: [],
      tabPosition: 'top',
      activeName: 'second',
      table_length: '',
      factor_item: '',
      options: [],
      trading_time: '',
      export_all: '',
      pickerOptions: commonConfig.pickerOptions,
      factor_op: [],
      select_value: ''
    }
  },
  computed: {
    optionSwitch1() {
      return {
        autoPlay: false,
        switchSingleStep: 140
      }
    }
  },
  watch: {},
  created() {
  },
  mounted() {
    const that = this
    // 获取因子列表
    this.$api.factor.getFactorList('ic', 2).then(res => {
      that.options = res
      that.show = false
    })
    window.onresize = function() {
      if (myChart) {
        myChart.resize()
      }
    }
  },

  methods: {
    getCorr() {
      const that = this
      const parma = {
        'table_name': that.t_name,
        'correlation': that.corr,
        'corr_label': that.corr_label,
        'redis_key': that.redis_key
      }

      that.$api.factor.getCorr(parma).then(res => {
        that.table_corr = res
        that.select_value = Object.keys(res)[0]

        that.getEchartsData()
      })
    },
    handleLabelClick(label) {
      this.correlation = 'summary'
      this.corr_label = label
      this.getIC()
      this.getCorr()
    },
    handCorrClick(corr) {
      this.corr = corr
      const that = this
      this.getCorr()
    },
    handTableClick(table) {
      this.t_name = table
      this.factor_corr = this.factor_item[table]
      this.correlation = 'summary'
      this.corr_label = 'label_1'
      this.factor_label_arr = Object.values(this.factor_corr)[0]
      const that = this
      // that.desHander()
      that.getIC()
      that.getCorr()
    },
    handChangeSelect(val) {
      this.getEchartsData()
    },
    getLabelFactor() {
      const corr = Object.values(this.factor_item)[0]
      return Object.values(corr)[0]
    },
    async setDefaultsFactor() {
      this.factor_corr = Object.values(this.factor_item)[0]
      this.factor_label_arr = this.getLabelFactor()
      const data = this.factor_item
      for (const [t_name, table] of Object.entries(data)) {
        this.t_name = t_name
        for (const [corr_name, corr] of Object.entries(table)) {
          this.correlation = 'summary'
          for (const [label_name, label] of Object.entries(corr)) {
            this.corr_label = label_name

            return
          }
        }
      }
    },
    calculateIcIr() {
      const loading = CommonUtil.loading()
      const that = this
      const stime = this.trading_time[0]
      const etime = this.trading_time[1]
      const node = this.$refs['myCascader'].getCheckedNodes()
      const factor = commonUtil.recursionTree(node, 3)
      const param = {
        'factor': factor,
        'stime': stime,
        'etime': etime,
        'earnings_fun': that.earnings_fun,
        'factor_diff': that.checkedDiff,
        'factor_sort': that.factor_sort,
        'index_code': that.index_code,
        'correlation': that.check_correlation,
        'periods': that.check_periods,
        'redis_key': that.redis_key
      }

      const cur_time = Date.now()
      this.$api.factor.getFactorEqIcIr(param).then(res => {
        if ((Date.now() - cur_time) / 1000 > 60) {
          that.$notice('因子ICIR', '计算完成,请返回浏览器查看详情！')
        }
        that.factor_item = res
        that.setDefaultsFactor()
        loading.close()
        that.getIC()
        that.getCorr()
      }).catch(error => {
        loading.close()
        console.log(error)
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
        cols_width.push({ width: set_len + 1 })
      }
      ws['!cols'] = cols_width
      var timestamp = new Date().getTime()
      // sheet写入book
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
      // 输出
      XLSX.writeFile(wb, this.t_name + '_' + files + '_' + this.mapLabel[this.corr_label] + '.csv')
    },
    getEchartsData() {
      const that = this
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
        const trading_date = that.table_corr['data']

        // 设置X轴数据

        option.series = that.table_corr[that.select_value]
        // 设置X轴标题
        option.xAxis.data = trading_date

        // let new_arr = []
        // for (let val of that.table_corr[that.select_value]) {
        //   new_arr.push(val.name)
        // }
        const new_arr = []
        const select = {}
        for (let i = 0; i < that.table_corr[that.select_value].length; i++) {
          new_arr.push(that.table_corr[that.select_value][i]['name'])
          if (i > 0) {
            select[that.table_corr[that.select_value][i]['name']] = true
          } else {
            select[that.table_corr[that.select_value][i]['name']] = false
          }
        }

        option.legend.selected = select
        option.legend.data = new_arr
        myChart.setOption(option)
      }, 300)
    },
    desHander() {
      const myChart = echarts.init(document.getElementById('myChartName'))
      // 销毁实例，销毁后实例无法再被使用。
      // 在什么情况下需要调用该函数进行销毁当前的实例呢？
      // 官方给的说明:在图表容器被销毁之后，调用 echartsInstance.dispose 销毁实例，
      myChart.dispose()
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

    async getIC() {
      const that = this
      const parma = {
        'table_name': that.t_name,
        'correlation': that.correlation,
        'corr_label': that.corr_label,
        'redis_key': that.redis_key
      }
      await that.$api.factor.getIc(parma).then(res => {
        that.loading = false
        that.table_length = res.length
        that.group_array = CommonUtil.group(res, 10)

        if (that.correlation === 'summary') {
          // that.table_all = res
          that.table_label = that.group_array.shift()
        }

        that.export_all = res
      })
    }
  }

}
</script>

<style lang="less" scoped>

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

/deep/ .el-table__body-wrapper .is-scrolling-middle {
  height: 750px;
}

.is-scrolling-left .el-table__body-wrapper::-webkit-scrollbar { /*滚动条整体样式*/

  width: 2px; /*高宽分别对应横竖滚动条的尺寸*/

  height: 2px;

}

</style>
