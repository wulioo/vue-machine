<template>
  <div style="padding: 20px">
    <el-row class="flex-wrap" :gutter="20" style="margin-bottom: 25px">
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
          :picker-options="pickerOptions">
        </el-date-picker>
      </el-col>
      <el-col :span="5">
        <el-button type="primary" @click="calculateIcIr()">计算-ICIR</el-button>
      </el-col>

    </el-row>
    <el-divider content-position="left">因子列表</el-divider>

    <el-card class="box-card">
      <Table @click="handleClick"></Table>
      <el-row class="flex-wrap" :gutter="20"
              v-loading="show" element-loading-text="数据加载中..."
              element-loading-spinner="el-icon-loading">
        <el-col :xl="9.5" class="mb20" :span="9.5" style="padding-left: 0px!important;">

          <el-cascader-panel ref="myCascader" :key="refresh"
                             :options="options" :props="{multiple:true,}">
          </el-cascader-panel>

        </el-col>
        <el-col :span="11.5" v-show="!show">
          <el-card shadow="never" style="height: 300px">
            <el-row :gutter="20" style="margin-bottom: 15px">
              <el-tag>收益方法</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-radio-group v-model="earnings_fun">
                <el-radio :label="'close_price'">close_price</el-radio>
                <el-radio :label="'open_price'">open_price</el-radio>
                <el-radio :label="'volat_price'">close/volatility</el-radio>
              </el-radio-group>
            </el-row>
            <!--          <el-divider></el-divider>-->
            <el-row :gutter="20" style="margin-bottom: 15px">
              <el-tag>计算选项</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-checkbox v-model="factor_diff">平均因子收益</el-checkbox>
              <el-checkbox v-model="factor_sort">因子排序</el-checkbox>
            </el-row>
            <el-row :gutter="20" style="margin-bottom: 15px">
              <el-tag>标的选项</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-radio-group v-model="varieties">
                <el-radio :label="'all'">默认覆盖标的</el-radio>
                <el-radio :label="'zero'">0值填充</el-radio>
                <el-radio :label="'mean'">截面均值填充</el-radio>
                <el-radio :label="'median'">截面中位数填充</el-radio>
              </el-radio-group>
            </el-row>

            <el-row :gutter="20" style="margin-bottom: 15px">
              <el-tag>相关系数</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-checkbox-group v-model="check_correlation" style=" display: inline-block;">
                <el-checkbox :label="val" v-for="val in CorrelationList"></el-checkbox>
              </el-checkbox-group>
            </el-row>
            <el-row :gutter="20" style="margin-bottom: 15px">
              <el-tag>收益周期</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-checkbox-group v-model="check_periods" style=" display: inline-block;">
                <el-checkbox :label="val" v-for="val in Periods"></el-checkbox>
              </el-checkbox-group>
            </el-row>
            <el-row :gutter="20" style="margin-bottom: 15px">
              <el-tag>交易场所</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-checkbox-group v-model="check_exchange" style=" display: inline-block;">
                <el-checkbox :label="val" v-for="val in exchange_future"></el-checkbox>
              </el-checkbox-group>
            </el-row>
            <el-row :gutter="20" style="margin-bottom: 15px;margin-left: 0">
              <el-tag style="">其他操作</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-checkbox v-model="night_trading">交易夜盘品种</el-checkbox>
            </el-row>
          </el-card>
        </el-col>

      </el-row>
    </el-card>
    <el-row :gutter="20" v-if="factor_item" style="margin-top: 20px;margin-bottom: 20px">
      <el-col class="mb20">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <!--            style="margin-right: 30px"-->
            <el-row :gutter="20" justify="center">
              <el-col :span="18" style="">
                <el-radio-group v-model="t_name" @change="handTableClick" style="margin-right: 15px">
                  <el-radio :label="tname" v-for="(table,tname) in factor_item" :key="tname">
                    <el-tag type="danger">{{ tname }}
                    </el-tag>
                  </el-radio>
                </el-radio-group>
                <el-radio-group v-model="corr_label" @change="handleLabelClick">
                  <el-radio :label="`label_${label_name}`" :key="`label_${label_name}`" border
                            v-for="label_name in check_periods">
                    {{
                      mapLabel[`label_${label_name}`]
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
              </el-col>

            </el-row>


          </div>


          <Scroll :on-reach-bottom="handleReachBottom" :distance-to-edge="3" v-if="table_length > 10">
            <el-table :data="table_label" stripe style="width: 100%;margin-bottom:10px;" v-loading="loading"
                      :key="t_name">
              <el-table-column prop="factors" label="factors" key="factors" width="220"></el-table-column>
              <el-table-column v-for="(val,key) in table_label[0]"
                               :prop="key"
                               :label="key"
                               :key="key"
                               sortable
                               align="center"
                               v-if="key !== 'trading_date' && key !== 'factors'"
                               width="150"
              ></el-table-column>

            </el-table>
          </Scroll>
          <el-table :data="table_label" stripe style="width: 100%;margin-bottom:10px;" v-loading="loading" v-else
                    :key="t_name">
            <el-table-column prop="factors" label="factors" key="factors" width="220"></el-table-column>
            <el-table-column v-for="(val,key) in table_label[0]"
                             :prop="key"
                             :label="key"
                             :key="key"
                             sortable
                             v-if="key !== 'trading_date' && key !== 'factors'"
                             align="center"
                             width="150"
            ></el-table-column>

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
                  <el-radio :label="cname" border v-for="cname in check_correlation" :key="cname">
                   {{ cname }}
                  </el-radio>
                </el-radio-group>
              </span>
            <span>
              <el-select v-model="select_value" filterable placeholder="请选择" @change="handChangeSelect">
              <el-option
                v-for="(val,key) in table_ic_corr"
                :key="key"
                :label="key"
                :value="key"
                v-if="key !== 'data'"
              >
              </el-option>
            </el-select>
            </span>


          </div>
          <div id="cum_sum_ic" style="height:500px;width: 100%">
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" v-if="factor_item" style="margin-top: 20px;margin-bottom: 20px">
      <el-col class="mb20" :xl="24">
        <el-card class="box-card">

          <div id="myChartName" style="height:500px;width: 100%">
          </div>
        </el-card>
      </el-col>
    </el-row>


  </div>
</template>

<script>
import Table from "../../components/factor/table"
import commonUtil from "../../../utils/commonUtil";
import Config from '@/settings'
import XLSX from "xlsx";
import DateRangePicker from "@/components/DateRangePicker";
import CommonUtil from "../../../utils/commonUtil";
import echarts from "echarts";
import commonConfig from "../../../utils/commonConfig";
import vueSeamlessScroll from 'vue-seamless-scroll'

var myChart
export default {
  name: 'fv_analy_icir',
  components: {
    Table
  },
  data() {
    return {
      night_trading: false,
      redis_key: new Date().valueOf(),
      check_correlation: ['pearson', 'spearman'],
      CorrelationList: Config.Correlation,
      check_periods: [1, 3, 5, 10],
      Periods: Config.Periods,
      exchange_future: Config.exchange_future,
      check_exchange: Config.check_exchange,

      refresh: 1,
      show: true,
      tableName: '',
      options: [],


      varieties: 'all',

      table_ic_corr: '',
      mapLabel: commonConfig.mappingLabel,
      factor_diff: false,
      factor_sort: false,
      loading: true,

      corr: 'pearson',
      echarts: '',
      earnings_fun: 'close_price',
      factor_corr: '',
      factor_label_arr: '',
      test: '',
      t_name: '',
      correlation: 'summary',
      corr_label: '',
      table_label: [],
      table_all: [],
      group_array: [],
      tabPosition: 'top',
      activeName: 'second',
      table_length: '',
      factor_item: '',

      trading_time: '',
      export_all: '',
      pickerOptions: commonConfig.pickerOptions,
      factor_op: [],
      select_value: ''
    }
  },
  created() {
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

  methods: {
    getCorr() {
      let that = this
      let parma = {
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
    handleLabelClick(label) {
      this.correlation = 'summary'
      this.corr_label = label
      this.getIC()
      this.getCorr()
    },
    handCorrClick(corr) {
      this.corr = corr
      this.getCorr()
    },
    handleClick(table_name, data, refresh, show) {
      this.options = data
      this.tableName = table_name
      this.refresh = refresh
      this.show = show
      this.$refs['myCascader'].clearCheckedNodes()
    },
    handTableClick(table) {
      let that = this
      this.t_name = table
      this.correlation = 'summary'
      that.corr_label = `label_${that.check_periods[0]}`
      that.corr = that.check_correlation[0]

      that.getIC()
      that.getCorr()

    },
    handChangeSelect(val) {
      this.getEchartsData()
      this.getChartByCumSumIC()
    },
    getLabelFactor() {
      let corr = Object.values(this.factor_item)[0]
      return Object.values(corr)[0]
    },

    calculateIcIr() {
      let loading = CommonUtil.loading()
      let that = this
      let stime = this.trading_time[0]
      let etime = this.trading_time[1]
      let node = this.$refs['myCascader'].getCheckedNodes()
      let factor
      if (that.tableName === 'fac_table' || that.tableName === 'sga_table') {
        factor = commonUtil.recursionTree(node, 3)
      } else {
        factor = commonUtil.recursionTree(node, 4)
      }

      let cur_time = Date.now()
      let param = {
        'factor': factor,
        'stime': stime,
        'etime': etime,
        'earnings_fun': that.earnings_fun,
        'factor_diff': that.factor_diff,
        'factor_sort': that.factor_sort,
        'varieties': that.varieties,
        'correlation': that.check_correlation,
        'periods': that.check_periods,
        'exchange_future': that.check_exchange,
        // 'redis_key': that.redis_key,
        'table_name': that.tableName,
        'night_trading': that.night_trading
      }

      this.$api.factor.getFactorIcIr(param).then(res => {
        if ((Date.now() - cur_time) / 1000 > 60) {
          that.$notice('因子ICIR', "计算完成,请返回浏览器查看详情！")
        }

        that.factor_item = res
        that.t_name = Object.keys(res)[0]
        that.corr_label = `label_${that.check_periods[0]}`
        that.corr = that.check_correlation[0]
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
      } else if (type === "rank") {
        this.correlation = 'spearman'
        files = 'Rank_IC'
        await this.getIC()
      }
      //创建book
      var wb = XLSX.utils.book_new();
      //json转sheet

      var ws = XLSX.utils.json_to_sheet(this.export_all, {});

      //设置列宽
      let cols_width = []
      for (let v of Object.keys(this.export_all[0])) {
        let set_len = v.length
        if (v == 'factor') {
          set_len = 25
        }
        cols_width.push({width: set_len + 1})
      }
      ws["!cols"] = cols_width

      var timestamp = new Date().getTime();
      //sheet写入book
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      //输出
      XLSX.writeFile(wb, this.t_name + '_' + files + "_" + this.mapLabel[this.corr_label] + ".csv");
    },
    getEchartsData() {
      let that = this
      that.desHander()
      setTimeout(() => {
        myChart = echarts.init(document.getElementById("myChartName"));
        let option = {
          title: {
            text: 'IC走势图'
          },
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            data: [],
            width: "80%",
            type: 'scroll',
            selected: {
              'Video Ads': true,
              Direct: false,
              Search: true,
              'Search Engine': false
            },
            padding: [
              5,  // 上
              10, // 右
              5,  // 下
              10, // 左
            ],


          },
          //调整IC图在卡片内 上下左右的间距
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
          ]
        };
        let trading_date = that.table_ic_corr['data']

        // 设置X轴数据

        option.series = that.table_ic_corr[that.select_value]
        // 设置X轴标题
        option.xAxis.data = trading_date

        let new_arr = []
        let select = {}
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
        myChart.setOption(option);
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
    desHander() {

      let myChart = echarts.init(document.getElementById("myChartName"));
      let ic_cum = echarts.init(document.getElementById("cum_sum_ic"));
      // 销毁实例，销毁后实例无法再被使用。
      // 在什么情况下需要调用该函数进行销毁当前的实例呢？
      // 官方给的说明:在图表容器被销毁之后，调用 echartsInstance.dispose 销毁实例，
      myChart.dispose();
      ic_cum.dispose()
    },
    handleReachBottom() {
      let that = this
      return new Promise(resolve => {
        setTimeout(() => {
          that.table_label = that.table_label.concat(that.group_array.shift())
          resolve();
        }, 500);
      })

    },

    async getIC() {
      let that = this
      let parma = {
        'table_name': that.t_name,
        'correlation': that.correlation,
        'corr_label': that.corr_label,
        'redis_key': that.factor_item[that.t_name]
      }
      await that.$api.factor.getIc(parma).then(res => {
        that.loading = false
        that.group_array = CommonUtil.group(res, 100)

        if (that.correlation === 'summary') {
          that.table_length = res.length

          that.table_label = that.group_array.shift()
        }

        that.export_all = res

      })
    },
  },
  mounted() {
    // let that = this
    // 获取因子列表
    // this.$api.factor.getFactorList().then(res => {
    //   that.options = res
    //   that.show = false
    // })
    window.onresize = function () {
      if (myChart) {
        myChart.resize();

      }
    }

  }

}
</script>

<style lang="less" scoped>
///deep/ .el-cascader-panel .el-scrollbar {
//  //min-width: 150px;
//  max-width: 220px;
//}

/deep/ .ivu-scroll-wrapper .ivu-scroll-container {
  height: 500px !important;
}

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

/deep/ .el-table__body-wrapper .is-scrolling-middle {
  height: 750px;
}

.is-scrolling-left .el-table__body-wrapper::-webkit-scrollbar { /*滚动条整体样式*/

  width: 2px; /*高宽分别对应横竖滚动条的尺寸*/

  height: 2px;

}


</style>
