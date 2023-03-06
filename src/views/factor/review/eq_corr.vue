<template>
  <div style="padding: 20px">

    <Updemo/>


    <el-divider content-position="left">因子列表</el-divider>
    <el-card class="box-card">


      <el-row class="flex-wrap" :gutter="20">
        <el-col :xl="10.5" class="mb20" :span="10.5"
                v-loading="show" element-loading-text="数据加载中..."
                element-loading-spinner="el-icon-loading">

          <el-cascader-panel ref="myCascader"  :options="options" :props="{multiple:true}"
                             @change="beforeAvatarUpload">
          </el-cascader-panel>

        </el-col>
        <el-col :span="4" v-show="!show">
          <el-card shadow="never" style="height: 300px">

            <!--          <el-divider></el-divider>-->
            <el-row :gutter="20">
              <el-tag>计算选项</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-checkbox v-model="factor_sort">因子排序</el-checkbox>
            </el-row>
            <el-divider></el-divider>
          </el-card>
        </el-col>
        <el-col :xl="8" :span="8">
          <el-card style="min-height:260px;width: 405px">
            <el-upload
              class="upload-demo"
              drag
              :on-progress="handleAvatarEvent"
              :on-success="handleAvatarSuccess"
              :on-error="handleAvatarError"

              :action="baseUrl"
              :data='{"factor": factor,
             "stime": "2021-01-01",
             "etime": "2022-01-01",
             "factor_sort":factor_sort,
             "platform":platform,
             }'
              multiple>
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="el-upload__tip" slot="tip">只能上传xlsx/csv文件，且不超过500MB</div>
            </el-upload>
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
import XLSX from "xlsx";
import CommonUtil from "@/utils/commonUtil";
import echarts from "echarts";
import {Loading} from "element-ui";
import Updemo from "@/views/components/excel/upload-demo"
import {getPlatform} from '@/utils/auth'

var myChart, loadingInstance
export default {
  name:'fv_review_icir',

  components: {
    Updemo,
  },
  data() {
    return {
      platform: getPlatform(),
      show: true,
      factor_sort: false,
      baseUrl: process.env.VUE_APP_BASE_API  + 'equity/review/corr',
      factor: '',
      t_name: '',
      index_col: '',
      factor_item: '',
      options: [],
      cur_time: '',

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
      // const days = xy
      for (let i = 0; i < xy.length; i++) {
        // days.push(xy[i])
        for (let j = 0; j < this.factor_item[xy[i]].length; j++) {
          data.push([i, j, this.factor_item[xy[i]][j].toFixed(3)]);
        }
      }
      const hours = xy

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
            data: this.index_col,
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
      }, 100)
    },
    beforeAvatarUpload(file) {
      let node = this.$refs['myCascader'].getCheckedNodes()
     let factor = commonUtil.recursionTree(node, 3)

      this.factor = JSON.stringify(factor)

    },
    handleAvatarSuccess(res, file) {

      let that = this
      if ((Date.now() - that.cur_time) / 1000 > 60) {
        that.$notice('相关性分析', "计算完成,请返回浏览器查看详情！")
      }
      that.factor_item = res['data']
      that.index_col = res['index_col']
      that.getEcharts()

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


    exportExcel() {
      //创建book
      var wb = XLSX.utils.book_new();
      //json转sheet
      let factor_name = Object.keys(this.factor_item)
      let factor_value = Object.values(this.factor_item)
      let data = [[''].concat(factor_name)]
      for (let i = 0; i < factor_value[0].length; i++) {
        let new_arr = []
        new_arr.push(this.index_col[i])
        for (let val of factor_value) {
          new_arr.push(val[i])
        }
        data.push(new_arr)
      }
      var ws = XLSX.utils.aoa_to_sheet(data, {});
      let cols_width = []
      for (let v of data[0]) {
        let set_len = v.length
        if (set_len == 0) {
          set_len = 25
        }
        cols_width.push({width: set_len + 1})
      }
      ws["!cols"] = cols_width
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
/deep/ .el-cascader-panel .el-scrollbar {
  //min-width: 150px;
  max-width: 220px;
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
