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
        <el-button type="primary" @click="calAvgVarie()">计算-Coverage</el-button>
      </el-col>

    </el-row>
    <el-divider content-position="left">因子列表</el-divider>

    <el-card class="box-card">
           <Table @click="handleClick"></Table>


      <el-row class="flex-wrap" :gutter="20"
              v-loading="show" element-loading-text="数据加载中..."
              element-loading-spinner="el-icon-loading">
        <el-col :xl="9.5" class="mb20" :span="9.5">

          <el-cascader-panel ref="myCascader" :key="refresh"
                             :options="options" :props="{multiple:true,}">
          </el-cascader-panel>

        </el-col>
        <el-col :span="11.5" v-show="!show">
          <el-card shadow="never" style="height: 300px">


            <el-row :gutter="20" style="margin-bottom: 20px">
              <el-tag>交易场所</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-checkbox-group v-model="check_exchange" style=" display: inline-block;">
                <el-checkbox :label="val" v-for="val in exchange_future"></el-checkbox>
              </el-checkbox-group>
            </el-row>
                      <el-row :gutter="20" style="margin-bottom: 20px;margin-left: 0">
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
              <el-button size="small" type="primary" icon="el-icon-download" @click="exportExcel()">
                Coverage
              </el-button>
            </el-row>

          </div>


          <el-table :data="factor_item" stripe style="width: 100%;margin-bottom:10px;" v-loading="loading"
                    :key="t_name">

            <el-table-column v-for="(val,key) in factor_item[0]"
                             :prop="key"
                             :label="key"
                             :key="key"
                             v-if="key !== 'trading_date'"
            ></el-table-column>
            <el-table-column></el-table-column>

          </el-table>


        </el-card>

      </el-col>

    </el-row>


  </div>
</template>

<script>
import commonUtil from "../../../utils/commonUtil";
import Config from '@/settings'
import XLSX from "xlsx";

import DateRangePicker from "@/components/DateRangePicker";
import CommonUtil from "../../../utils/commonUtil";
import echarts from "echarts";
import commonConfig from "../../../utils/commonConfig";
import vueSeamlessScroll from 'vue-seamless-scroll'
import Table from "@/views/components/factor/table";

var myChart
export default {
  name:'fv_avg_varie',
      components: {
    Table
  },

  data() {
    return {
      night_trading: false,
      check_correlation: ['pearson', 'spearman'],
      CorrelationList: Config.Correlation,
      check_periods: [1, 3, 5, 10],
      Periods: Config.Periods,
      exchange_future: Config.exchange_future,
      check_exchange: Config.check_exchange,
      refresh: 1,
      varieties: 'all',
      tableName: 'table',
      table_corr: '',
      mapLabel: commonConfig.mappingLabel,
      factor_diff: false,
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
    handleClick(table_name, data, refresh, show) {
      this.options = data
      this.tableName = table_name
      this.refresh = refresh
      this.show = show
      this.$refs['myCascader'].clearCheckedNodes()
    },
    calAvgVarie() {
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
        'exchange_future': that.check_exchange,
        'table_name':that.tableName,
        'night_trading': that.night_trading

      }
         this.$api.factor.getAvgVarie(param).then(res => {
          if ((Date.now() - cur_time) / 1000 > 60) {
            that.$notice('因子覆盖率', "计算完成,请返回浏览器查看详情！")
          }
          that.loading = false
          that.factor_item = res

          loading.close()

        }).catch(error => {
          loading.close()
          console.log(error)
        })
    },
    async exportExcel() {
      //创建book
      var wb = XLSX.utils.book_new();
      //json转sheet
      var ws = XLSX.utils.json_to_sheet(this.factor_item, {});
      // //设置列宽
      var timestamp = new Date().getTime();
      //sheet写入book
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      //输出
      XLSX.writeFile(wb, "coverage.csv");
    },


  },
  mounted() {
    let that = this

    window.onresize = function () {
      if (myChart) {
        myChart.resize();

      }
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

/deep/ .el-table__body-wrapper .is-scrolling-middle {
  height: 750px;
}

.is-scrolling-left .el-table__body-wrapper::-webkit-scrollbar { /*滚动条整体样式*/

  width: 2px; /*高宽分别对应横竖滚动条的尺寸*/

  height: 2px;

}


</style>
