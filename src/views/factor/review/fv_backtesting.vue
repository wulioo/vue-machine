<template>
  <div style="padding: 20px">
    <Updemo/>

    <el-divider content-position="left">Excel 导入</el-divider>
    <el-row class="mb20" :gutter="20">

      <el-col :md="8">
        <el-card style="min-height:120px;margin-bottom: 20px">
          <el-row class="mb20">

            <div style="margin-bottom: 15px">
              <el-tag>分层层数</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-radio-group v-model="checkedCorr">
                <el-radio v-for="corr in corrCheck" :label="corr" :key="corr">{{ corr }}</el-radio>

              </el-radio-group>
            </div>
            <div style="margin-bottom: 15px">
              <el-tag>收益方法</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-radio-group v-model="earnings_fun">
                <el-radio :label="'close_price'">close_price</el-radio>
                <el-radio :label="'open_price'">open_price</el-radio>
                <el-radio :label="'volat_price'">close/volatility</el-radio>

              </el-radio-group>
            </div>
            <!--            <div style="margin: 15px 0;"></div>-->


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

      <el-col :md="6">
        <el-card style="min-height:260px;width: 405px">
          <el-upload
            class="upload-demo"
            drag
            :on-progress="handleAvatarEvent"
            :on-success="handleAvatarSuccess"
            :on-error="handleAvatarError"
            :action="baseUrl + 'future/review/backtesting/'"
            :data='{
              "layering":checkedCorr,
              "periods":checkedLabel,
              "earnings_fun":earnings_fun,
              }'
            multiple>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能上传xlsx/csv文件，且不超过500MB</div>
          </el-upload>

        </el-card>

      </el-col>
    </el-row>


    <el-row :gutter=20 v-if="factor_item" style="margin-top: 20px;margin-bottom: 20px">
      <el-col class="mb20">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
              <span style="margin-right: 30px">

                    <el-tag type="danger">{{ t_name }}
                    </el-tag>

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
import XLSX from "xlsx";
import commonUtil from "../../../utils/commonUtil";
import {Loading} from "element-ui";
import echarts from "echarts";
import Updemo from "@/views/components/excel/upload-demo"
import commonConfig from "../../../utils/commonConfig";

const corrOptions = [5, 7, 10];
const labelOptions = [1, 2, 3, 5, 10];
var loadingInstance;
var myChart
export default {
  name: 'fv_review_layered',
  components: {
    Updemo,
  },
  data() {
    return {
      // baseUrl: "http://127.0.0.1:8000/",
      layered: '',
      redis_key: new Date().valueOf(),
      baseUrl: process.env.VUE_APP_BASE_API,
      checkCorrAll: true,
      earnings_fun: 'close_price',
      checkedCorr: 5,
      corrCheck: corrOptions,
      isIndeterminateCorr: false,
      mapLabel: commonConfig.mappingLabel,


      checkLabelAll: true,
      checkedLabel: [1, 3, 5, 10],
      labelCheck: labelOptions,
      isIndeterminateLabel: false,
      cur_time: '',

      factor: '',
      factor_col: '',
      factor_label: 'label_1',
      group_list: '',
      group_name: '',

      factor_item: '',
      t_name: '',
      correlation: '',
      factor_corr: '',
      corr_label: 'label_1',
      factor_label_arr: '',
      table_label: [],

      multipleSelection: [],
      fileList: [],
      jsonData: null,
      jsonStr: ""
    };
  },
  methods: {
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
    handleLayered(val) {
      console.log(val)
      if (val == 'NaN' || val == '') {
        return
      }
      if (!this.corrCheck.includes(parseInt(val))) {
        this.corrCheck.push(parseInt(val))
      }
    },
    handleAvatarSuccess(res, file) {

      let that = this
      if ((Date.now() - that.cur_time) / 1000 > 60) {
        that.$notice('单因子回测', "计算完成,请返回浏览器查看详情！")
      }
      this.factor_item = res
      this.initEcharts()
      this.getEchartsData()

      loadingInstance.close()
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
    handChangeSelect(val) {
      this.factor = val
      this.getEchartsData()
    },


    handleCheckAllChangeLabel(val) {
      this.checkedLabel = val ? labelOptions : [];
      this.isIndeterminateLabel = false;
    },

    handleCheckedLabelChange(value) {
      let checkedCount = value.length;
      this.checkLabelAll = checkedCount === this.labelCheck.length;
      this.isIndeterminateLabel = checkedCount > 0 && checkedCount < this.labelCheck.length;
    },

    handleLabelClick(label) {
      this.factor_label = label
      let that = this
      this.getEchartsData()

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
            grid: {
              left: '0',
              right: '0',
              bottom: '0',
              containLabel: true
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


    desHander() {
      let myChartName = this.t_name + '_' + this.factor + '_' + this.group_name + '_' + this.factor_label

      myChart = echarts.init(document.getElementById(myChartName));
      // 销毁实例，销毁后实例无法再被使用。
      // 在什么情况下需要调用该函数进行销毁当前的实例呢？
      // 官方给的说明:在图表容器被销毁之后，调用 echartsInstance.dispose 销毁实例，
      myChart.dispose();
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
.el-col-1 {
  width: auto;
}
</style>
