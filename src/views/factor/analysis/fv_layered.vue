<template>
  <div style="padding: 20px">
    <el-row class="flex-wrap" :gutter=20>
      <el-col :span="5" style="width: auto">
        <el-date-picker
          v-model="trading_time"
          type="daterange"
          align="center"
          unlink-panels
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptions">
        </el-date-picker>
      </el-col>


      <el-col :span="5">
        <el-button type="primary" @click="zonalTesting()">分层测试</el-button>
      </el-col>

    </el-row>

    <el-divider content-position="left">因子列表</el-divider>
    <el-card class="box-card">
      <Table @click="handleClick"></Table>
      <el-row class="flex-wrap" :gutter=20>
        <el-col :xl="9.5" class="mb20" :span="9.5" v-loading="show"
                element-loading-text="数据加载中..."
                element-loading-spinner="el-icon-loading">

          <el-cascader-panel ref="myCascader" :key="refresh" :options="options" :props="{multiple:true}">
          </el-cascader-panel>

        </el-col>
        <el-col :span="9.5" v-show="!show">
          <el-card shadow="never" style="height: 300px">
            <el-row style="margin-bottom: 15px">
              <el-tag>收益方法</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-radio-group v-model="earnings_fun">
                <el-radio :label="'close_price'">close_price</el-radio>
                <el-radio :label="'open_price'">open_price</el-radio>
                <el-radio :label="'volat_price'">close/volatility</el-radio>

              </el-radio-group>
            </el-row>
            <el-row :gutter="20" style="margin-bottom: 15px;">
              <el-tag>标的选项</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-radio-group v-model="varieties">
                <el-radio :label="'all'">默认覆盖标的</el-radio>
                <el-radio :label="'zero'">0值填充</el-radio>
                <el-radio :label="'mean'">截面均值填充</el-radio>
                <el-radio :label="'median'">截面中位数填充</el-radio>
              </el-radio-group>
            </el-row>
            <el-row :gutter="20" style="margin-bottom: 15px;">
              <el-tag>分层方法</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-checkbox-group v-model="check_layered_fun" style=" display: inline-block;">
                <el-checkbox :label="val" v-for="val in exchange_layered_fun"></el-checkbox>
              </el-checkbox-group>
            </el-row>
            <el-row :gutter="20" style="margin-bottom: 15px;margin-left: 0">
              <el-tag style="">分层层数</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-checkbox-group v-model="check_layered" style=" display: inline-block;">
                <el-checkbox :label="val" v-for="val in layeredList"></el-checkbox>
              </el-checkbox-group>
            </el-row>
            <el-row :gutter="20" style="margin-bottom: 15px;">
              <el-tag>收益周期</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-checkbox-group v-model="check_periods" style=" display: inline-block;">
                <el-checkbox :label="val" v-for="val in Periods"></el-checkbox>
              </el-checkbox-group>
            </el-row>
            <el-row :gutter="20" style="margin-bottom: 15px;">
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


    <el-row :gutter=20 v-if="factor_item" style="margin-top: 20px;margin-bottom: 20px">
      <el-col class="mb20">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
              <span style="margin-right: 30px">
                  <el-radio-group v-model="t_name" @change="handTableClick">
                  <el-radio :label="tname" :key="tname" v-for="(table,tname) in factor_item">
                    <el-tag type="danger">{{ tname }}
                    </el-tag>
                  </el-radio>
                </el-radio-group>
              </span>

            <el-select v-model="factor" placeholder="请选择" @change="handChangeSelect">
              <el-option
                v-for="(factor,factor_name) in factor_col"
                :key="factor_name"
                :label="factor_name"
                :value="factor_name">
              </el-option>
            </el-select>
            <el-divider direction="vertical"></el-divider>
            <el-select v-model="factor_label" placeholder="请选择" @change="handleLabelClick" size="mini"
                       style="width: 100px">
              <el-option
                v-for="(label,label_name) in factor_label_arr"
                :key="label_name"
                :label="mapLabel[label_name]"
                :value="label_name">
              </el-option>
            </el-select>
            <el-divider direction="vertical"></el-divider>
            <el-select v-model="group_name" placeholder="请选择" @change="handleGroupClick" size="mini"
                       style="width: 100px">
              <el-option
                v-for="(group,g_name)  in group_list"
                :key="g_name"
                :label="g_name"
                :value="g_name">
              </el-option>
            </el-select>
          </div>

          <div :id="t_name+'_'+factor+'_'+group_name+'_'+factor_label" style="height:500px;">
          </div>

        </el-card>

      </el-col>

    </el-row>

  </div>
</template>

<script>
import commonUtil from "../../../utils/commonUtil";

import echarts from "echarts";
import CommonUtil from "@/utils/commonUtil";
import commonConfig from "../../../utils/commonConfig";
import {getPlatform} from '@/utils/auth'
import Config from '@/settings'
import Table from "@/views/components/factor/table";

var myChart
export default {
  name: 'fv_analy_layered',
    components: {
    Table
  },
  data() {
    return {
      night_trading: false,
      redis_key: new Date().valueOf(),
      check_layered_fun: ['直接排序法'],
      exchange_layered_fun: Config.layered_fun,
      check_layered: [5, 7],
      layeredList: Config.layered,
      check_periods: [1, 3, 5, 10],
      Periods: Config.Periods,
      exchange_future: Config.exchange_future,
      check_exchange: Config.check_exchange,
      tableName: 'fac_table',
      refresh: 1,
      varieties: 'all',
      show: true,
      earnings_fun: 'close_price',
      mapLabel: commonConfig.mappingLabel,
      factor_col: [],
      group_list: [],
      factor: '',
      t_name: '',
      group_name: '',
      factor_label: '',
      factor_label_arr: [],
      tabPosition: 'top',
      activeName: 'label_1',
      factor_item: '',
      options: [],
      trading_time: '',
      pickerOptions: commonConfig.pickerOptions,
    }
  },
  created() {
  },
  computed: {},
  watch: {},
  methods: {
    handleClick(table_name, data, refresh, show) {
      this.options = data
      this.tableName = table_name
      this.refresh = refresh
      this.show = show
      this.$refs['myCascader'].clearCheckedNodes()
    },
    handChangeSelect(val) {
      this.factor = val
      this.getEchartsData()
    },
    handTableClick(table) {
      this.t_name = table
      // this.desHander()
      let that = this
      that.factor_col = that.factor_item[table]
      that.factor = Object.keys(that.factor_col)[0]
      let factor_label_arr = Object.values(that.factor_col)[0]
      let group = Object.values(factor_label_arr)[0]
      that.factor_label = Object.keys(group)[0]

      that.group_list = factor_label_arr
      that.group_name = Object.keys(factor_label_arr)[0]

      that.factor_label_arr = group


      this.getEchartsData()
    },
    // handFactorClick(factor) {
    //   this.factor = factor
    //   let that = this
    //   this.getEchartsData()
    // },
    handleLabelClick(label) {
      this.factor_label = label
      let that = this
      this.getEchartsData()

    },
    handleGroupClick(group) {
      this.group_name = group
      // this.desHander()
      this.getEchartsData()
    },
    getLabelFactor() {
      let table = Object.values(this.factor_item)[0]
      let factor = Object.values(table)[0]
      return Object.values(factor)[0]
    },
    getFactorGroup() {
      let table = Object.values(this.factor_item)[0]
      return Object.values(table)[0]
    },
    initEcharts() {
      let that = this
      let data = that.factor_item
      that.factor_col = Object.values(that.factor_item)[0]

      that.factor_label_arr = that.getLabelFactor()
      that.group_list = that.getFactorGroup()
      for (let [table, factor_itme] of Object.entries(data)) {
        that.t_name = table
        for (let [factor, group_list] of Object.entries(factor_itme)) {
          that.factor = factor
          for (let [group, label_list] of Object.entries(group_list)) {
            that.group_name = group
            for (let [label, data] of Object.entries(label_list)) {
              that.factor_label = label
              return
            }
          }
        }
      }
    },
    zonalTesting() {
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

      let parma = {
        'factor': factor,
        'stime': stime, 'etime': etime,
        'earnings_fun': this.earnings_fun,
        'varieties': that.varieties,
        'layered_num': that.check_layered,
        'layered_fun': that.check_layered_fun,
        'periods': that.check_periods,
        'exchange_future': that.check_exchange,
        'redis_key': that.redis_key,
        'table_name': that.tableName,
        'night_trading': that.night_trading
      }

      let cur_time = Date.now()
      this.$api.layered.getZonalTesting(parma).then(res => {
        if ((Date.now() - cur_time) / 1000 > 60) {
          that.$notice('分层测试', "计算完成,请返回浏览器查看详情！")
        }
        that.factor_item = res
        // 初始化图图标默认选项
        that.initEcharts()
        // 设置图表实例
        that.getEchartsData()
        loading.close()
      }).catch(error => {
        console.log(error)
        loading.close()
      })

    },
    getEchartsData() {
      let that = this
      let parma = {
        'table_name': this.t_name,
        'factor': this.factor,
        'group_name': this.group_name,
        'factor_label': this.factor_label,
        'redis_key': this.redis_key
      }
      this.$api.layered.getEchartsData(parma).then(({data}) => {
        let myChartName = this.t_name + '_' + this.factor + '_' + this.group_name + '_' + this.factor_label
        let trading_date = data[data.length - 1]
        let del_data = data.slice(0, -1)
        that.desHander()
        setTimeout(() => {
          myChart = echarts.init(document.getElementById(myChartName));

          let option = {
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
              boundaryGap: true,
              axisLabel: {
                // interval: 5 //间隔10
              },
              data: []
            },
            yAxis: {
              max: function (value) {

                return (value.max + 0.02).toFixed(2);
              },
              min: function (value) {

                return (value.min - 0.02).toFixed(2);
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
              },
            ]
          };
          // 设置图表标题
          option.title.text = that.factor
          // option.title.subtext = that.group_name
          // 设置X轴数据
          option.series = del_data

          // 设置X轴标题
          option.xAxis.data = trading_date
          let group_n = []
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

          myChart.setOption(option);

        }, 100)
      })


    },
    // 销毁实例
    desHander() {
      let myChartName = this.t_name + '_' + this.factor + '_' + this.group_name + '_' + this.factor_label

      myChart = echarts.init(document.getElementById(myChartName));
      // 销毁实例，销毁后实例无法再被使用。
      // 在什么情况下需要调用该函数进行销毁当前的实例呢？
      // 官方给的说明:在图表容器被销毁之后，调用 echartsInstance.dispose 销毁实例，
      myChart.dispose();
    }

  },
  mounted() {
    let that = this
    let platform = getPlatform()
    // 获取因子列表
    // this.$api.factor.getFactorList('layered', platform).then(res => {
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

/deep/ .el-col .el-col-4 {
  margin-top: 3px;
}

///deep/ .el-card__body .el-tabs .el-tabs--top{
//  height: 550px;
//}
</style>
