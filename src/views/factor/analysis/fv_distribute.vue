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
        <el-button type="primary" @click="calculateDistribute()">因子分布</el-button>
      </el-col>

    </el-row>

    <el-divider content-position="left">因子列表</el-divider>
    <el-card class="box-card">
      <Table @click="handleClick"></Table>
      <el-row class="flex-wrap" :gutter="20">
        <el-col :xl="10.5" class="mb20" :span="10.5"
                v-loading="show" element-loading-text="数据加载中..."
                element-loading-spinner="el-icon-loading">

          <el-cascader-panel ref="myCascader" :key="refresh" :options="options" :props="{multiple:true}">
          </el-cascader-panel>

        </el-col>
        <el-col :span="11.5">
          <el-card shadow="never" style="height: 300px">

            <el-row :gutter="20" style="margin-bottom: 20px">
              <el-tag>交易场所</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-checkbox-group v-model="check_exchange" style=" display: inline-block;">
                <el-checkbox :label="val" v-for="val in exchange_future"></el-checkbox>
              </el-checkbox-group>
            </el-row>
            <el-row :gutter="20" style="margin-bottom: 20px">
              <el-tag>计算选项</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-radio-group v-model="factor_sort">
                <el-radio :label="false">因子数值</el-radio>
                <el-radio :label="true">因子排序</el-radio>
              </el-radio-group>
              <!--              <el-checkbox v-model="factor_diff">平均因子收益</el-checkbox>-->
              <!--              <el-checkbox v-model="factor_sort">因子排序</el-checkbox>-->
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
          <el-row slot="header" class="clearfix">
            <el-col>
              <el-radio-group v-model="t_name" @change="handTableClick" style="margin-right: 15px">
                <el-radio :label="tname" v-for="(table,tname) in factor_item" :key="tname">
                  <el-tag type="danger">{{ tname }}
                  </el-tag>
                </el-radio>
              </el-radio-group>
              <el-select v-model="factor" placeholder="请选择" @change="handChangeSelect" style="margin-right: 30px">
                <el-option
                  v-for="factor_name in factor_col"
                  :key="factor_name"
                  :label="factor_name"
                  :value="factor_name">
                </el-option>
              </el-select>
              <!--              <el-button size="small" type="primary" icon="el-icon-download" @click="exportExcel()">因子分布图-->
              <!--              </el-button>-->

            </el-col>


          </el-row>
          <img :src="baseUrl+file_name" alt="" style="width: 100%">
        </el-card>

      </el-col>

    </el-row>
  </div>
</template>

<script>
import commonUtil from "../../../utils/commonUtil";
import commonConfig from "../../../utils/commonConfig";
import CommonUtil from "@/utils/commonUtil";
import {getPlatform} from '@/utils/auth'
import Config from '@/settings'
import Table from "@/views/components/factor/table";

var myChart


export default {
  name: 'fv_analy_distribute',
      components: {
    Table
  },
  data() {
    return {
      night_trading: false,
      factor_sort: false,
      baseUrl: process.env.VUE_APP_BASE_API,
      exchange_future: Config.exchange_future,
      check_exchange: Config.check_exchange,
      file_name: '',
      factor: '',
      refresh:1,
      factor_node: '',
      factor_col: '',
      tableName: 'table',
      show: true,
      t_name: '',
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

    calculateDistribute() {
      let loading = CommonUtil.loading()
      let that = this
      let stime = this.trading_time[0]
      let etime = this.trading_time[1]
      let node = this.$refs['myCascader'].getCheckedNodes()


     if (that.tableName === 'fac_table' || that.tableName === 'sga_table') {
        this.factor_node = commonUtil.recursionTree(node, 3)
      } else {
        this.factor_node = commonUtil.recursionTree(node, 4)
      }
      let param = {
        'factor': this.factor_node,
        'stime': stime,
        'etime': etime,
        'table_name': that.tableName,
        'exchange_future': that.check_exchange,
        'factor_sort': that.factor_sort,
        'night_trading': that.night_trading
      }
      let cur_time = Date.now()
      this.$api.factor.calFvFactorDistribute(param).then(res => {
        if ((Date.now() - cur_time) / 1000 > 60) {
          that.$notice('因子分布图', "计算完成,请返回浏览器查看详情！")
        }
        that.factor_item = res
        that.getinitData()
        loading.close()
      }).catch(error => {
        loading.close()
      })


    },

    handTableClick(table) {
      this.t_name = table

      this.factor_col = Object.keys(this.factor_item[this.t_name])
      this.factor = this.factor_col[0]
      this.file_name = this.factor_item[this.t_name][this.factor]


    },

    handChangeSelect(val) {
      this.factor = val
      this.file_name = this.factor_item[this.t_name][this.factor]
    }
    ,
    getinitData() {
      for (let [table, f_itme] of Object.entries(this.factor_item)) {
        this.t_name = table
        this.factor_col = Object.keys(f_itme)
        this.factor = this.factor_col[0]
        this.file_name = this.factor_item[this.t_name][this.factor]
        return
      }

    }
  },
  mounted() {



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
