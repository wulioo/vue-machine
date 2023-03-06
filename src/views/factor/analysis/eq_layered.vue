<template>
  <div style="padding: 20px">
    <el-row class="flex-wrap" :gutter="20">
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
          :picker-options="pickerOptions"
        />
      </el-col>

      <el-col :span="5">
        <el-button type="primary" @click="zonalTesting()">分层测试</el-button>
      </el-col>

      <!--         <el-col :span="5">-->
      <!--           <router-link :to="{path:'/factor/review/eq_icir'}"> asd</router-link>-->
      <!--      </el-col>-->
    </el-row>

    <el-divider content-position="left">因子列表</el-divider>
    <el-row class="flex-wrap" :gutter="20">
      <el-col
        v-loading="show"
        :xl="9.5"
        class="mb20"
        :span="9.5"
        element-loading-text="数据加载中..."
        element-loading-spinner="el-icon-loading"
      >

        <el-cascader-panel ref="myCascader" :options="options" :props="{multiple:true}" />

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
          <el-row :gutter="20" style="margin-bottom: 15px;">
            <el-tag style="">分层层数</el-tag>
            <el-divider direction="vertical" />
            <el-checkbox-group v-model="check_layered" style=" display: inline-block;">
              <el-checkbox v-for="val in layeredList" :label="val" />
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
          <el-divider />
          <!--          <el-row>-->
          <!--            <el-tag>收益方法</el-tag>-->
          <!--            <el-divider direction="vertical"></el-divider>-->
          <!--            <el-radio-group v-model="earnings_fun">-->
          <!--              <el-radio :label="'close_price'">close_price</el-radio>-->
          <!--              <el-radio :label="'open_price'">open_price</el-radio>-->
          <!--            </el-radio-group>-->
          <!--          </el-row>-->
        </el-card>
      </el-col>
    </el-row>

    <el-row v-if="factor_item" :gutter="20" style="margin-top: 20px;margin-bottom: 20px">
      <el-col class="mb20">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span style="margin-right: 30px">
              <el-radio-group v-model="t_name" @change="handTableClick">
                <el-radio v-for="(table,tname) in factor_item" :key="tname" :label="tname">
                  <el-tag type="danger">{{ tname }}
                  </el-tag>
                </el-radio>
              </el-radio-group>
            </span>
            <el-radio-group v-model="factor" size="small" @change="handFactorClick">
              <el-row :gutter="20">
                <el-col>
                  <el-select v-model="factor" placeholder="请选择" @change="handChangeSelect">
                    <el-option
                      v-for="(factor,factor_name) in factor_col"
                      :key="factor_name"
                      :label="factor_name"
                      :value="factor_name"
                    />
                  </el-select>
                </el-col>

              </el-row>
            </el-radio-group>

          </div>
          <el-radio-group v-model="factor_label" @change="handleLabelClick">
            <el-radio v-for="(label,label_name) in factor_label_arr" :key="label_name" :label="label_name" border>{{
              mapLabel[label_name]
            }}
            </el-radio>
          </el-radio-group>
          <el-divider direction="vertical" />

          <el-radio-group v-model="group_name" @change="handleGroupClick">
            <el-radio v-for="(group,g_name) in group_list" :key="g_name" :label="g_name">{{ g_name }}</el-radio>
          </el-radio-group>

          <el-divider />
          <div :id="t_name+'_'+factor+'_'+group_name+'_'+factor_label" style="height:500px;" />

        </el-card>

      </el-col>

    </el-row>

  </div>
</template>

<script>
import commonUtil from '../../../utils/commonUtil'

import echarts from 'echarts'
import CommonUtil from '@/utils/commonUtil'
import commonConfig from '../../../utils/commonConfig'
import { getPlatform } from '@/utils/auth'
import Config from '@/settings'

var myChart
export default {
  data() {
    return {
      redis_key: new Date().valueOf(),
      check_layered: [5, 7],
      layeredList: Config.layered,
      check_periods: [1, 3, 5, 10],
      Periods: Config.Periods,
      index_code: 'all',
      show: true,
      earnings_fun: 'close_price',
      mapLabel: commonConfig.mappingLabel,
      factor_col: [],
      group_list: [],
      factor: '',
      t_name: '',
      group_name: '',
      factor_label: 'label_1',
      factor_label_arr: [],
      tabPosition: 'top',
      activeName: 'label_1',
      factor_item: '',
      options: [],
      trading_time: '',
      pickerOptions: commonConfig.pickerOptions
    }
  },
  computed: {},
  watch: {},
  created() {
  },
  mounted() {
    const that = this
    const platform = getPlatform()
    // 获取因子列表
    this.$api.factor.getFactorList('layered', platform).then(res => {
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
    handChangeSelect(val) {
      this.factor = val
      this.getEchartsData()
    },
    handTableClick(table) {
      this.t_name = table
      this.desHander()
      const that = this
      that.factor_col = that.factor_item[that.t_name]
      that.factor = Object.keys(that.factor_col)[0]
      const factor_label_arr = Object.values(that.factor_col)[0]
      that.factor_label = 'label_1'
      that.group_list = factor_label_arr
      that.group_name = Object.keys(factor_label_arr)[0]
      const group = Object.values(factor_label_arr)[0]
      that.factor_label_arr = group

      this.getEchartsData()
    },
    handFactorClick(factor) {
      this.factor = factor
      const that = this
      this.getEchartsData()
    },
    handleLabelClick(label) {
      this.factor_label = label
      const that = this
      this.getEchartsData()
    },
    handleGroupClick(group) {
      this.group_name = group
      this.desHander()
      this.getEchartsData()
    },
    getLabelFactor() {
      const table = Object.values(this.factor_item)[0]
      const factor = Object.values(table)[0]
      return Object.values(factor)[0]
    },
    getFactorGroup() {
      const table = Object.values(this.factor_item)[0]
      return Object.values(table)[0]
    },
    initEcharts() {
      const that = this
      const data = that.factor_item
      that.factor_col = Object.values(that.factor_item)[0]

      that.factor_label_arr = that.getLabelFactor()
      that.group_list = that.getFactorGroup()
      for (const [table, factor_itme] of Object.entries(data)) {
        that.t_name = table
        for (const [factor, group_list] of Object.entries(factor_itme)) {
          that.factor = factor
          for (const [group, label_list] of Object.entries(group_list)) {
            that.group_name = group
            for (const [label, data] of Object.entries(label_list)) {
              that.factor_label = label
              return
            }
          }
        }
      }
    },
    zonalTesting() {
      const loading = CommonUtil.loading()
      const that = this
      const stime = this.trading_time[0]
      const etime = this.trading_time[1]
      const node = this.$refs['myCascader'].getCheckedNodes()
      const factor = commonUtil.recursionTree(node, 3)

      const parma = {
        'factor': factor,
        'stime': stime,
        'etime': etime,
        'earnings_fun': this.earnings_fun,
        'layered_num': that.check_layered,
        'index_code': that.index_code,
        'periods': that.check_periods,
        'redis_key': that.redis_key
      }
      const cur_time = Date.now()
      this.$api.layered.getEqZonalTesting(parma).then(res => {
        if ((Date.now() - cur_time) / 1000 > 60) {
          that.$notice('分层测试', '计算完成,请返回浏览器查看详情！')
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
    // 销毁实例
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

/deep/ .el-col .el-col-4 {
  margin-top: 3px;
}

///deep/ .el-card__body .el-tabs .el-tabs--top{
//  height: 550px;
//}
</style>
