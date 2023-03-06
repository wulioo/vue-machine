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
        <el-button type="primary" @click="calEarnings()">计算-N日收益率</el-button>
      </el-col>

    </el-row>
    <el-divider content-position="left">因子列表</el-divider>

    <el-card class="box-card">
      <el-col :span="24">
        <el-row :gutter="20" style="margin-bottom: 20px">
          <el-tag>收益方法</el-tag>
          <el-divider direction="vertical"></el-divider>
          <el-radio-group v-model="earnings_fun">
            <el-radio :label="'close_price'">close_price</el-radio>
            <el-radio :label="'open_price'">open_price</el-radio>
          </el-radio-group>
        </el-row>
        <el-row :gutter="20" style="margin-bottom: 20px">
          <el-tag>收益周期</el-tag>
          <el-divider direction="vertical"></el-divider>
          <el-checkbox-group v-model="check_periods" style=" display: inline-block;margin-right: 30px">
            <el-checkbox :label="val" v-for="val in Periods"></el-checkbox>
          </el-checkbox-group>

          <el-tag>自定义</el-tag>
          <el-divider direction="vertical"></el-divider>
          <el-input v-model="earnings" size="mini" placeholder="请输入收益周期" style="width: 15%"
                    @change="handleEarnings"></el-input>
        </el-row>
        <el-row :gutter="20" style="margin-bottom: 20px">
          <el-tag>交易场所</el-tag>
          <el-divider direction="vertical"></el-divider>
          <el-checkbox-group v-model="check_exchange" style=" display: inline-block;">
            <el-checkbox :label="val" v-for="val in exchange_future"></el-checkbox>
          </el-checkbox-group>
        </el-row>
      </el-col>

    </el-card>

    <el-row :gutter="20" v-if="factor_item" style="margin-top: 20px;margin-bottom: 20px">
      <el-col class="mb20">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <el-button size="small" type="primary" icon="el-icon-download" @click="exportExcel()">
              Earnings
            </el-button>
          </div>
          <Scroll :on-reach-bottom="handleReachBottom" :distance-to-edge="3" v-if="table_length > 100" height="400">
            <el-table :data="table_label" stripe style="width: 100%;margin-bottom:10px;" v-loading="loading"
                      :key="t_name">

              <el-table-column v-for="(val,key) in table_label[0]"
                               :prop="key"
                               :label="key"
                               :key="key"

                               width="220"
              ></el-table-column>
              <el-table-column></el-table-column>

            </el-table>
          </Scroll>
          <el-table :data="table_label" stripe style="width: 100%;margin-bottom:10px;" v-loading="loading" v-else>
            <el-table-column v-for="(val,key) in table_label[0]"
                             :prop="key"
                             :label="key"
                             :key="key"
                             width="220"
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

var myChart
export default {
  name:'fv_earnings_n',
  components: {},
  data() {
    return {
      // ear_is_show:true,
      earnings: '',
      check_correlation: ['pearson', 'spearman'],
      CorrelationList: Config.Correlation,
      check_periods: [1, 3, 5, 10],
      Periods: Config.Periods,
      exchange_future: Config.exchange_future,
      check_exchange: Config.check_exchange,
      refresh: 1,
      varieties: 'all',
      tableName: 'first',
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
  watch: {
    // earnings(newVal,oldVal){
    //   console.log(newVal)
    // }
  },

  methods: {
    handleEarnings(val) {
      this.Periods.push(parseInt(val))
    },
    calEarnings() {
      let loading = CommonUtil.loading()
      let that = this
      let stime = this.trading_time[0]
      let etime = this.trading_time[1]


      let cur_time = Date.now()
      let param = {
        'stime': stime,
        'etime': etime,
        'earnings_fun': that.earnings_fun,
        'periods': that.check_periods,
        'exchange_future': that.check_exchange,
      }
      this.$api.earnings.calEarnings(param).then(res => {
        if ((Date.now() - cur_time) / 1000 > 60) {
          that.$notice('因子平均收益率', "计算完成,请返回浏览器查看详情！")

        }
        that.loading = false
        that.factor_item = res
        that.table_length = res.length
        that.group_array = CommonUtil.group(res, 100)
        that.table_label = that.group_array.shift()
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

      //sheet写入book
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      //输出
      XLSX.writeFile(wb, "return.csv");
    },

    desHander() {

      let myChart = echarts.init(document.getElementById("myChartName"));
      // 销毁实例，销毁后实例无法再被使用。
      // 在什么情况下需要调用该函数进行销毁当前的实例呢？
      // 官方给的说明:在图表容器被销毁之后，调用 echartsInstance.dispose 销毁实例，
      myChart.dispose();
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


  },
  mounted() {
    // 获取因子列表
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

/deep/ .el-card__body .ive-scroll-wrapper > .ivu-scroll-container {
  height: 400px !important;
}

</style>
