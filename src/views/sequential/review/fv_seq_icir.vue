<template>
  <div style="padding: 20px">
    <Updemo/>

    <el-divider content-position="left">Excel 导入</el-divider>
    <el-row class="mb20" :gutter="20">
      <el-col :md="6">
        <el-card style="min-height:120px;margin-bottom: 20px">
          <el-row class="mb20">
            <el-checkbox :indeterminate="isIndeterminateCorr" v-model="checkCorrAll" @change="handleCheckAllChangeCorr">
              相关系数
            </el-checkbox>
            <div style="margin: 15px 0;"></div>
            <el-checkbox-group v-model="check_correlation" @change="handleCheckedCorrChange">
              <el-checkbox v-for="corr in corrCheck" :label="corr" :key="corr">{{ corr }}</el-checkbox>
            </el-checkbox-group>
          </el-row>
        </el-card>

        <el-card style="min-height:120px;">
          <el-row class="mb20">
            <el-checkbox :indeterminate="isIndeterminateLabel" v-model="checkLabelAll"
                         @change="handleCheckAllChangeLabel">收益周期
            </el-checkbox>
            <div style="margin: 15px 0;"></div>
            <el-checkbox-group v-model="checkedLabel" @change="handleCheckedLabelChange">
              <el-checkbox v-for="label in labelCheck" :label="label" :key="label">{{ label }}</el-checkbox>
            </el-checkbox-group>
          </el-row>
        </el-card>
      </el-col>
      <el-col :md="10">
        <el-card style="min-height:260px;margin-bottom: 20px">
          <el-row :gutter="20" style="margin-bottom: 20px">
            <el-tag>收益方法</el-tag>
            <el-divider direction="vertical"></el-divider>
            <el-radio-group v-model="earnings_fun">
              <el-radio :label="'close_price'">close_price</el-radio>
              <el-radio :label="'open_price'">open_price</el-radio>
            </el-radio-group>
          </el-row>

          <el-row :gutter="20" style="margin-bottom: 20px">
            <el-tag>时间窗口</el-tag>
            <el-divider direction="vertical"></el-divider>
            <el-checkbox-group v-model="windows" style="    display: inline-block;">

              <el-checkbox :label=60>60</el-checkbox>
              <el-checkbox :label=120>120</el-checkbox>
              <el-checkbox :label=240>240</el-checkbox>

              <el-checkbox :label="'till_now'">from_beginning</el-checkbox>
            </el-checkbox-group>
          </el-row>
        </el-card>

      </el-col>
      <el-col :md="7">
        <el-card style="min-height:260px;width: 405px">
          <el-upload
            class="upload-demo"
            drag
            :on-progress="handleAvatarEvent"
            :on-success="handleAvatarSuccess"
            :on-error="handleAvatarError"
            :action="baseUrl + '/fv/sq/review/icir/'"
            :data='{"correlation":check_correlation,
            "periods_list":checkedLabel,
            "earnings_fun":earnings_fun,
            "windows":windows,
            }'
            multiple

          >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能上传xlsx/csv文件，且不超过500MB</div>
          </el-upload>
        </el-card>
      </el-col>
    </el-row>


    <el-row :gutter="20" v-if="factor_item" style="margin-top: 20px;margin-bottom: 20px">
      <el-col class="mb20">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <el-row :gutter="20" justify="center">
              <el-col :span="22" style="">
                <el-tag type="danger" style="margin-right: 15px">{{ t_name }}</el-tag>
                <el-select filterable placeholder="请选择" @change="handChangeSelect"
                           v-model="select_type_value"
                           style="width: 100px;margin-right: 15px">
                  <el-option
                    v-for="(val,key) in table_type"
                    :key="key"
                    :label="key"
                    :value="key"
                  >
                  </el-option>
                </el-select>

                <el-select v-model="select_window_value" filterable placeholder="请选择"
                           @change="handChangeWindowsSelect"
                           style="width: 100px">
                  <el-option
                    v-for="key in table_window"
                    :key=key
                    :label=key
                    :value=key
                  >
                  </el-option>
                </el-select>

                <el-radio-group v-model="corr_label" @change="handleLabelClick"
                                style="vertical-align: baseline !important;margin-left: 35px">
                  <el-radio :label="label_name" :key="label_name" border v-for="label_name in factor_label_arr">
                    {{
                      mapLabel[label_name]
                    }}
                  </el-radio>

                </el-radio-group>
              </el-col>

              <el-col :span="2">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-button size="small" type="primary" icon="el-icon-download" @click="exportExcel('summary')">
                      Summary
                    </el-button>
                  </el-col>

                </el-row>
              </el-col>

            </el-row>


          </div>


          <Scroll :on-reach-bottom="handleReachBottom" :distance-to-edge="3" v-if="table_length > 10">
            <el-table :data="table_label" stripe style="width: 100%;margin-bottom:10px;" v-loading="loading"
                      :key="t_name">

              <el-table-column v-for="(val,key) in table_label[0]"
                               :prop="key"
                               :label="key"
                               :key="key"
                               v-if="key !== 'trading_date'"
                               width="220"
              ></el-table-column>
              <el-table-column></el-table-column>

            </el-table>
          </Scroll>
          <el-table :data="table_label" stripe style="width: 100%;margin-bottom:10px;" v-loading="loading" v-else
                    :key="t_name">

            <el-table-column v-for="(val,key) in table_label[0]"
                             :prop="key"
                             :label="key"
                             :key="key"
                             v-if="key !== 'trading_date'"
                             width="220"
            ></el-table-column>
            <el-table-column></el-table-column>

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
                  <el-select v-model="select_factor_value" filterable placeholder="请选择"
                             @change="handChangeFactorSelect">
                  <el-option
                    v-for="key in factor_value"
                    :key="key"
                    :label="key"
                    :value="key"
                    v-if="key !== 'trading_date'"
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
import XLSX from "xlsx";
import commonUtil from "../../../utils/commonUtil";
import {Loading} from "element-ui";
import CommonUtil from "@/utils/commonUtil";
import echarts from "echarts";
import Updemo from "@/views/components/excel/upload-demo"
import commonConfig from "../../../utils/commonConfig";
import Config from '@/settings'

const corrOptions = ['pearson', 'spearman'];
const labelOptions = [1,2, 3, 5, 10];
var loadingInstance;
var myChart
export default {
  name: 'fv_seq_review_ic',
  components: {
    Updemo,
  },
  data() {
    return {
      windows: [60, 120, 240],
      select_type_value: '',
      select_window_value: '',
      select_factor_value: '',
      table_type: '',
      table_window: '',
      check_correlation: ['pearson', 'spearman'],
      factor_value: '',

      redis_key: new Date().valueOf(),
      baseUrl: process.env.VUE_APP_BASE_API,
      mapLabel: commonConfig.mappingLabel,

      cur_time: '',
      table_corr: '',
      loading: true,
      corr: 'pearson',
      table_length: '',
      checkCorrAll: true,

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
      factor_label_arr: '',
      table_label: [],
      table_all: '',
      echarts: '',
      group_array: '',

      multipleSelection: [],
      fileList: [],

    };
  },
  methods: {
    handChangeFactorSelect(val) {
      let that = this
      that.select_factor_value = val
      that.getEchartsData()
      that.getChartByCumSumIC()
    },
    handChangeWindowsSelect(val) {
      this.select_window_value = val
      this.getIC()
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

      // ws["!cols"] = [
      //   {width: 15},
      //   {width: 15},
      //   {width: 30}
      // ];
      // var timestamp = new Date().getTime();
      //sheet写入book
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      //输出
      XLSX.writeFile(wb, files + "_" + this.mapLabel[this.corr_label] + ".csv");
    },

    async getIC() {
      let that = this
      let table_type = that.factor_item[that.t_name][that.select_type_value]
      let parma = {
        'table_type': table_type,
        'corr_label': that.corr_label,
        'windows': that.select_window_value,
        'corr': that.corr,
      }
      await that.$api.sequential.getIcIr(parma).then(res => {
        that.loading = false
        that.table_length = res['table'].length
        that.group_array = CommonUtil.group(res['table'], 100)
        that.table_label = that.group_array.shift()
        that.table_corr = res['charts']['ic']
        that.table_cum_ic = res['charts']['cum_ic']
        that.factor_value = Object.keys(res['charts']['ic'])
        that.select_factor_value = that.factor_value[0]
        that.export_all = res['table']
        that.getEchartsData()
        that.getChartByCumSumIC()
      })
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleCheckAllChangeCorr(val) {
      this.check_correlation = val ? corrOptions : [];
      this.isIndeterminateCorr = false;
    },
    handChangeSelect(val) {
      this.select_type_value = val
      this.getIC()
    },
    handleCheckAllChangeLabel(val) {
      this.checkedLabel = val ? labelOptions : [];
      this.isIndeterminateLabel = false;
    },
    handleCheckedCorrChange(value) {
      let checkedCount = value.length;
      this.checkCorrAll = checkedCount === this.corrCheck.length;
      this.isIndeterminateCorr = checkedCount > 0 && checkedCount < this.corrCheck.length;
    },
    handleCheckedLabelChange(value) {
      let checkedCount = value.length;
      this.checkLabelAll = checkedCount === this.labelCheck.length;
      this.isIndeterminateLabel = checkedCount > 0 && checkedCount < this.labelCheck.length;
    },
    handleAvatarSuccess(res, file) {

      let that = this
      if ((Date.now() - that.cur_time) / 1000 > 60) {
        that.$notice('因子ICIR', "计算完成,请返回浏览器查看详情！")
      }
      loadingInstance.close()
      this.factor_item = res
      that.setDefaultsFactor()
      that.getIC()


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
      this.correlation = 'summary'
      let optios = {
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      }
      this.cur_time = Date.now()
      //添加全局遮罩
      loadingInstance = Loading.service(optios);
    },
    handCorrClick(corr) {
      this.corr = corr
      this.getIC()
    },
    handleLabelClick(label) {
      this.corr_label = label
      this.getIC()
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
    setDefaultsFactor() {
      let that = this
      console.log(that.factor_item)
      for (let [t_name, table] of Object.entries(that.factor_item)) {
        that.t_name = t_name

        that.table_type = table

        that.select_window_value = that.windows[0]
        that.table_window = that.windows
        let new_arr = []
        for (let val of that.checkedLabel) {
          new_arr.push('label_' + val)
        }
        that.corr_label = new_arr[0]
        that.factor_label_arr = new_arr
        that.corr = that.check_correlation[0]
        that.select_type_value = Object.keys(table)[0]

        break

      }

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
        };
        let trading_date = that.table_corr['trading_date']

        // 设置X轴数据

        option.series = that.table_corr[that.select_factor_value]
        // 设置X轴标题
        option.xAxis.data = trading_date

        let new_arr = []
        let select = {}
        for (let i = 0; i < that.table_corr[that.select_factor_value].length; i++) {
          new_arr.push(that.table_corr[that.select_factor_value][i]['name'])
          select[that.table_corr[that.select_factor_value][i]['name']] = true
          // if (i > 0) {
          //   select[that.table_corr[that.select_factor_value][i]['name']] = true
          // } else {
          //   select[that.table_corr[that.select_factor_value][i]['name']] = false
          //
          // }

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
        option.series[0].data = that.table_cum_ic[that.select_factor_value]
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
  },
  mounted() {
    window.onresize = function () {
      if (myChart) {
        myChart.resize();

      }
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
