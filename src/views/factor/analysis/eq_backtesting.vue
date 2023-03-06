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
        <el-button type="primary" @click="backtesting()">因子回测</el-button>
      </el-col>

    </el-row>

    <el-divider content-position="left">因子列表</el-divider>
    <el-card class="box-card">

      <el-row class="flex-wrap" :gutter=20>
        <el-col :xl="9.5" class="mb20" :span="9.5" v-loading="show"
                element-loading-text="数据加载中..."
                element-loading-spinner="el-icon-loading">

          <el-cascader-panel ref="myCascader" :key="refresh" :options="options" :props="{multiple:true}">
          </el-cascader-panel>

        </el-col>
        <el-col :span="9.5" v-show="!show">
          <el-card shadow="never" style="height: 300px">
            <el-row style="margin-bottom: 20px">
              <el-tag>收益方法</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-radio-group v-model="earnings_fun">
                <el-radio :label="'close_price'">close_price</el-radio>
                <el-radio :label="'open_price'">open_price</el-radio>
              </el-radio-group>
            </el-row>

            <el-row :gutter="20" style="margin-bottom: 20px;margin-left: 0">
              <el-tag style="">分层层数</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-radio-group v-model="group_name" style=" display: inline-block;">
                <el-radio :label="val" v-for="val in layeredList"></el-radio>
              </el-radio-group>
            </el-row>
            <el-row :gutter="20" style="margin-bottom: 20px;">
              <el-tag>收益周期</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-checkbox-group v-model="check_periods" style=" display: inline-block;">
                <el-checkbox :label="val" v-for="val in Periods"></el-checkbox>
              </el-checkbox-group>
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

            <el-radio-group v-model="factor_label" @change="handleLabelClick" style="margin-left: 40px">
              <el-radio :label="label_name" border :key="label_name" v-for="label_name in factor_label_arr">{{
                  mapLabel[label_name]
                }}
              </el-radio>
            </el-radio-group>
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

var myChart
export default {
  name: 'fv_analy_layered',
  data() {
    return {
      index_code: 'all',
      check_layered_fun: ['直接排序法'],
      exchange_layered_fun: Config.layered_fun,
      group_name: 5,
      layeredList: Config.layered,
      check_periods: [1, 3, 5, 10],
      Periods: Config.Periods,
      exchange_future: Config.exchange_future,
      check_exchange: Config.check_exchange,
      tableName: 'table',
      refresh: 1,
      varieties: 'all',
      show: true,
      earnings_fun: 'close_price',
      mapLabel: commonConfig.mappingLabel,
      factor_col: [],
      // group_list: [],
      factor: '',
      t_name: '',
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
      let factor_label_arr = Object.keys(that.factor_col[that.factor])

      that.factor_label = factor_label_arr[0]




      this.getEchartsData()
    },

    handleLabelClick(label) {
      this.factor_label = label
      let that = this
      this.getEchartsData()

    },

    getLabelFactor() {
      let table = Object.values(this.factor_item)[0]
      let factor = Object.values(table)[0]

      return Object.keys(factor)
    },

    initEcharts() {
      let that = this
      let data = that.factor_item
      that.factor_col = Object.values(that.factor_item)[0]

      that.factor_label_arr = that.getLabelFactor()
      for (let [table, factor_itme] of Object.entries(data)) {
        that.t_name = table
        for (let [factor, label_list] of Object.entries(factor_itme)) {
          that.factor = factor
          for (let [label, data] of Object.entries(label_list)) {
            that.factor_label = label
            return
          }
        }
      }
    },
    backtesting() {
      let loading = CommonUtil.loading()
      let that = this
      let stime = this.trading_time[0]
      let etime = this.trading_time[1]
      let node = this.$refs['myCascader'].getCheckedNodes()
      let factor = commonUtil.recursionTree(node, 3)

      let parma = {
        'factor': factor,
        'stime': stime, 'etime': etime,
        'earnings_fun': this.earnings_fun,
        // 'varieties': that.varieties,
        'layering': that.group_name,
        // 'layered_fun': that.check_layered_fun,
        'periods': that.check_periods,
        'index_code': that.index_code,
        // 'exchange_future': that.check_exchange,
        // 'table_name': that.tableName,
        // 'night_trading': that.night_trading
      }

      let cur_time = Date.now()
      this.$api.layered.getEqBackTesting(parma).then(res => {
        if ((Date.now() - cur_time) / 1000 > 60) {
          that.$notice('单因子回测', "计算完成,请返回浏览器查看详情！")
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
      let redis_key = that.factor_item[that.t_name][that.factor][that.factor_label]
      let parma = {
        'redis_key': redis_key
      }
      this.$api.layered.getEchartBackTestIng(parma).then((res) => {
        let myChartName = this.t_name + '_' + this.factor + '_' + this.group_name + '_' + this.factor_label
        that.desHander()
        setTimeout(() => {
          myChart = echarts.init(document.getElementById(myChartName));

          let option = {
            title: {
              text: '单因子回测'
            },
            tooltip: {
              trigger: 'axis'
            }, toolbox: {
              feature: {
                saveAsImage: {}
              }
            },
            xAxis: {
              type: 'category',
              data: res['y_data']
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                data: res['x_data'],
                type: 'line'
              }
            ]
          };


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
    this.$api.factor.getFactorList('layered', platform).then(res => {
      that.options = res
      that.show = false
    })
    window.onresize = function () {
      if (myChart) {
        myChart.resize();

      }


    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .el-cascader-panel .el-scrollbar {
  //min-width: 150px;
  max-width: 220px;
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

/deep/ .el-col .el-col-4 {
  margin-top: 3px;
}

///deep/ .el-card__body .el-tabs .el-tabs--top{
//  height: 550px;
//}
</style>
