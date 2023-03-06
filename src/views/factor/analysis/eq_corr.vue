<template>
  <div style="padding: 20px">
    <el-row class="flex-wrap" :gutter="20">
      <el-col :span="6">
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
        <el-button type="primary" @click="calculateCorr()">相关性分析</el-button>
      </el-col>

    </el-row>

    <el-divider content-position="left">因子列表</el-divider>
    <el-card class="box-card">

      <el-row class="flex-wrap" :gutter="20">
        <el-col :xl="10.5" class="mb20" :span="10.5"
                v-loading="show" element-loading-text="数据加载中..."
                element-loading-spinner="el-icon-loading">

          <el-cascader-panel ref="myCascader" :key="refresh" :options="options" :props="{multiple:true}">
          </el-cascader-panel>

        </el-col>
        <el-col :span="6" v-show="!show">
          <el-card shadow="never" style="height: 300px">

            <!--          <el-divider></el-divider>-->
            <el-row :gutter="20" style="margin-bottom: 15px;margin-left: 0">
              <el-tag>计算选项</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-checkbox v-model="factor_sort">因子排序</el-checkbox>
            </el-row>

            <el-divider></el-divider>
          </el-card>
        </el-col>
      </el-row>
    </el-card>


    <el-row :gutter="20" v-if="factor_item" style="margin-top: 20px;margin-bottom: 20px">
      <el-col class="mb20">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
              <span style="margin-right: 30px">
              <el-button size="small" type="primary" icon="el-icon-download" @click="exportExcel()">Corr</el-button>
              </span>

          </div>
          <div id="factor_corr" style="height:1000px;"></div>
        </el-card>

      </el-col>

    </el-row>
  </div>
</template>

<script>
import commonUtil from "../../../utils/commonUtil";
import commonConfig from "../../../utils/commonConfig";
import XLSX from "xlsx";
import CommonUtil from "@/utils/commonUtil";
import echarts from "echarts";
import {getPlatform} from '@/utils/auth'

var myChart
export default {
  name: 'fv_analy_corr',
  data() {
    return {
      night_trading: false,
      refresh: 1,
      show: true,
      factor_sort: false,
      earnings_fun: 'close_price',
      t_name: '',
      labels: 'label_1',
      table_label: [],
      tabPosition: 'top',
      activeName: 'second',
      factor_label: [],
      factor_item: '',
      options: [],
      trading_time: '',
      pickerOptions: commonConfig.pickerOptions,
    }
  },
  created() {
  },
  computed: {
    // editTypeChange() {
    //   return this.editType;
    // }
  },
  watch: {},
  methods: {

    getEcharts() {

      let xy = Object.keys(this.factor_item)
      //  组装热力图所需要的数据格式
      let data = []
      const days = xy
      for (let i = 0; i < xy.length; i++) {
        // days.push(xy[i])
        for (let j = 0; j < this.factor_item[xy[i]].length; j++) {
          data.push([j, i, this.factor_item[xy[i]][j].toFixed(3)]);
        }
      }
      const hours = xy


      // data = this.factor_item
      setTimeout(() => {
        myChart = echarts.init(document.getElementById("factor_corr"));
        let option = {
          title: {
            text: '相关性分析',
            subtext: '',
            left: "center"
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          tooltip: {
            position: 'top'
          },
          grid: {
            height: '80%',
            // top: '10%'
          },
          xAxis: {
            type: 'category',
            data: hours,
            axisLabel: {
              rotate: '90'
            },
            splitArea: {
              show: true
            }
          },
          yAxis: {
            type: 'category',
            inverse: true,
            data: days,
            splitArea: {
              show: true
            },
            // nameTextStyle: {
            //   lineHeight: 200,
            // },
            // axisLabel: {
            //   lineHeight: 56
            // }
          },
          visualMap: {
            min: -1,
            max: 1,
            type: "piecewise",

            pieces: [

              {gt: 0.75, lte: 1, label: '1.00', color: 'rgb(139, 0, 0)'}, // (500, 900]
              {gt: 0.5, lte: 0.75, label: '0.75', color: 'rgb(178, 34, 34)'}, // (310, 500]
              {gt: 0.25, lte: 0.5, label: '0.50', color: 'rgb(240, 128, 128)'}, // (200, 300]
              {gt: 0, lte: 0.25, label: '0.25', color: 'rgb(233, 150, 122)'}, // (10, 200]
              {value: 0, label: '0', color: 'rgb(255, 215, 0)'},
              {gt: -0.25, lte: 0, label: '-0.25', color: 'rgb(144, 238, 144)'}, // (500, 900]
              {gt: -0.50, lte: -0.25, label: '-0.50', color: 'rgb(60, 179, 113)'}, // (310, 500]
              {gt: -0.75, lte: -0.50, label: '-0.75', color: 'rgb(34, 139, 34)'}, // (200, 300]
              {gt: -1, lte: -0.75, label: '-1.00', color: 'rgb(0, 100, 0)'}, // (10, 200]

            ],

            splitNumber: 10,
            calculable: true,
            orient: 'vertical',
            top: 'center',
            right: '3%',
            // itemHeight: 400,
            // right: '15%',

            // target: {
            //   inRange: {
            //     color: ["rgb(0, 100, 0)", "rgb(34, 139, 34)", "rgb(60, 179, 113)", 'rgb(144, 238, 144)',
            //       "rgb(255, 215, 0)",
            //       'rgb(233, 150, 122)', 'rgb(240, 128, 128)', 'rgb(178, 34, 34)', 'rgb(139, 0, 0)'],
            //     symbolSize: [-1, -0.75, -0.50, -0.25, 0, 0.25, 0.50, 0.75, 1]
            //   }
            // },

          },
          series: [
            {
              name: 'Punch Card',
              type: 'heatmap',
              data: data,
              label: {
                show: true
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }
          ]
        };
        myChart.setOption(option);
        console.log(option)
      }, 100)
    } ,


    calculateCorr() {
      let loading = CommonUtil.loading()
      let that = this
      let stime = this.trading_time[0]
      let etime = this.trading_time[1]
      let node = this.$refs['myCascader'].getCheckedNodes()
      let factor = commonUtil.recursionTree(node, 3)

      let param = {
        'factor': factor,
        'stime': stime,
        'etime': etime,
        'factor_sort': that.factor_sort,
        'platform': getPlatform(),
        'table_name': that.tableName,
        'night_trading': that.night_trading
      }
      let cur_time = Date.now()
      this.$api.factor.calEqCorr(param).then(res => {
        if ((Date.now() - cur_time) / 1000 > 60) {
          that.$notice('相关性分析', "计算完成,请返回浏览器查看详情！")
        }
        that.factor_item = res
        that.getEcharts()
        loading.close()

      }).catch(error => {
        loading.close()
        console.log(error)
      })

    }
    ,

    exportExcel() {

      //创建book
      var wb = XLSX.utils.book_new();
      //json转sheet
      let factor_name = Object.keys(this.factor_item)
      let factor_value = Object.values(this.factor_item)
      let data = [[''].concat(factor_name)]
      // for (let val of factor_value) {
      //   data.push(val)
      // }
      for (let i = 0; i < factor_value[0].length; i++) {
        let new_arr = []
        new_arr.push(factor_name[i])
        for (let val of factor_value) {
          new_arr.push(val[i])
        }
        data.push(new_arr)
      }
      var ws = XLSX.utils.aoa_to_sheet(data, {});

      //设置列宽
      let cols_width = []
      for (let v of data[0]) {
        let set_len = v.length
        if (set_len == 0) {
          set_len = 25
        }
        cols_width.push({width: set_len + 1})
      }
      ws["!cols"] = cols_width
      var timestamp = new Date().getTime();
      //sheet写入book
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      //输出
      XLSX.writeFile(wb, "Corr.csv");
    },
  },
  mounted() {
    let that = this
    let platform = getPlatform()
    // 获取因子列表
    this.$api.factor.getFactorList('corr', platform).then(res => {
      that.options = res
      that.show = false
    })


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
