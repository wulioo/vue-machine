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
          :picker-options="pickerOptions"
        />
      </el-col>
      <el-col :span="5">
        <el-button type="primary" @click="calculateDistribute()">因子分布</el-button>
      </el-col>

    </el-row>

    <el-divider content-position="left">因子列表</el-divider>
    <el-card class="box-card">

      <el-row class="flex-wrap" :gutter="20">
        <el-col
          v-loading="show"
          :xl="10.5"
          class="mb20"
          :span="10.5"
          element-loading-text="数据加载中..."
          element-loading-spinner="el-icon-loading"
        >

          <el-cascader-panel ref="myCascader" :options="options" :props="{multiple:true}" />

        </el-col>
        <el-col :span="11.5">
          <el-card shadow="never" style="height: 300px">

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
            <el-row :gutter="20" style="margin-bottom: 20px">
              <el-tag>计算选项</el-tag>
              <el-divider direction="vertical" />
              <el-radio-group v-model="factor_sort">
                <el-radio :label="false">因子数值</el-radio>
                <el-radio :label="true">因子排序</el-radio>
              </el-radio-group>
              <!--              <el-checkbox v-model="factor_diff">平均因子收益</el-checkbox>-->
              <!--              <el-checkbox v-model="factor_sort">因子排序</el-checkbox>-->
            </el-row>

          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <el-row v-if="factor_item" :gutter="20" style="margin-top: 20px;margin-bottom: 20px">
      <el-col class="mb20">
        <el-card class="box-card">
          <el-row slot="header" class="clearfix">
            <el-col>
              <el-radio-group v-model="t_name" style="margin-right: 15px" @change="handTableClick">
                <el-radio v-for="(table,tname) in factor_item" :key="tname" :label="tname">
                  <el-tag type="danger">{{ tname }}
                  </el-tag>
                </el-radio>
              </el-radio-group>
              <el-select v-model="factor" placeholder="请选择" style="margin-right: 30px" @change="handChangeSelect">
                <el-option
                  v-for="factor_name in factor_col"
                  :key="factor_name"
                  :label="factor_name"
                  :value="factor_name"
                />
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
import commonUtil from '../../../utils/commonUtil'
import commonConfig from '../../../utils/commonConfig'
import CommonUtil from '@/utils/commonUtil'
import { getPlatform } from '@/utils/auth'
import Config from '@/settings'

var myChart

export default {
  name: 'FvAnalyDistribute',
  data() {
    return {
      index_code: 'all',
      night_trading: false,
      factor_sort: false,
      baseUrl: process.env.VUE_APP_BASE_API,
      exchange_future: Config.exchange_future,
      check_exchange: Config.check_exchange,
      file_name: '',
      factor: '',
      factor_node: '',
      factor_col: '',
      tableName: 'table',
      show: true,
      t_name: '',
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
    this.$api.factor.getFactorList('corr', platform).then(res => {
      that.options = res
      that.show = false
    })
  },
  methods: {
    calculateDistribute() {
      const loading = CommonUtil.loading()
      const that = this
      const stime = this.trading_time[0]
      const etime = this.trading_time[1]
      const node = this.$refs['myCascader'].getCheckedNodes()

      this.factor_node = commonUtil.recursionTree(node, 3)

      const param = {
        'factor': this.factor_node,
        'stime': stime,
        'etime': etime,
        'index_code': that.index_code,
        'factor_sort': that.factor_sort
      }
      const cur_time = Date.now()
      this.$api.factor.calEqFactorDistribute(param).then(res => {
        if ((Date.now() - cur_time) / 1000 > 60) {
          that.$notice('因子分布图', '计算完成,请返回浏览器查看详情！')
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
    },
    getinitData() {
      for (const [table, f_itme] of Object.entries(this.factor_item)) {
        this.t_name = table
        this.factor_col = Object.keys(f_itme)
        this.factor = this.factor_col[0]
        this.file_name = this.factor_item[this.t_name][this.factor]
        return
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
</style>
