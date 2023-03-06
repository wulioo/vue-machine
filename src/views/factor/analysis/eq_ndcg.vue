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
        <el-button type="primary" @click="calculateNdcg()">计算-NDCG</el-button>
      </el-col>

    </el-row>

    <el-divider content-position="left">因子列表</el-divider>
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
          <el-row :gutter="20" style="margin-bottom: 20px;">
            <el-tag>收益周期</el-tag>
            <el-divider direction="vertical" />
            <el-checkbox-group v-model="check_periods" style=" display: inline-block;">
              <el-checkbox v-for="val in Periods" :label="val" />
            </el-checkbox-group>
          </el-row>
          <el-divider />

        </el-card>
      </el-col>
    </el-row>

    <el-row v-if="factor_item" :gutter="20" style="margin-top: 20px;margin-bottom:20px;">
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
            <span>
              <el-radio-group v-model="labels" @change="handleLabelClick">
                <el-radio v-for="(label,label_name) in factor_label" :key="label_name" :label="label_name" border>{{
                  mapLabel[label_name]
                }}
                </el-radio>

              </el-radio-group>
            </span>

            <div style="float:right;display: flex;align-items: center;">
              <el-button size="small" type="primary" icon="el-icon-download" @click="exportExcel()">NDCG</el-button>
            </div>
          </div>

          <el-table :data="table_label" stripe style="width: 100%;">
            <el-table-column
              v-for="(val,key) in table_label[0]"
              v-if="key !== 'trading_date'"
              :key="key"
              :prop="key"
              :label="key"
              width="180"
            />
            <el-table-column />
          </el-table>
        </el-card>

      </el-col>

    </el-row>
  </div>
</template>

<script>
import commonUtil from '../../../utils/commonUtil'
import XLSX from 'xlsx'
import CommonUtil from '@/utils/commonUtil'
import commonConfig from '../../../utils/commonConfig'
import Config from '@/settings'

export default {
  data() {
    return {
      check_periods: [1, 3, 5, 10],
      Periods: Config.Periods,
      index_code: 'all',
      show: true,
      earnings_fun: 'close_price',
      mapLabel: commonConfig.mappingLabel,
      t_name: '',
      labels: 'label_1',
      table_label: [],
      tabPosition: 'top',
      activeName: 'second',
      factor_label: [],
      factor_item: '',
      options: [],
      trading_time: '',
      pickerOptions: commonConfig.pickerOptions
    }
  },
  computed: {
    // editTypeChange() {
    //   return this.editType;
    // }
  },
  watch: {},
  created() {
  },
  mounted() {
    const that = this

    // 获取因子列表
    this.$api.factor.getFactorList('ndcg', 2).then(res => {
      that.options = res
      that.show = false
    })
  },
  methods: {
    handleLabelClick(label) {
      this.labels = label
      this.table_label = this.factor_item[this.t_name][this.labels]
    },
    handTableClick(table) {
      this.t_name = table
      this.labels = Object.keys(this.factor_item[table])[0]
      this.table_label = this.factor_item[this.t_name][this.labels]
    },

    setDefaultsFactor() {
      const data = this.factor_item
      for (const [t_name, table] of Object.entries(data)) {
        this.t_name = t_name
        this.factor_label = table

        this.labels = Object.keys(this.factor_label)[0]
        this.table_label = table[this.labels]
        return
      }
    },
    calculateNdcg() {
      const loading = CommonUtil.loading()
      const that = this
      const stime = this.trading_time[0]
      const etime = this.trading_time[1]
      const node = this.$refs['myCascader'].getCheckedNodes()
      const factor = commonUtil.recursionTree(node, 3)
      const param = {
        'factor': factor,
        'stime': stime,
        'etime': etime,
        'earnings_fun': this.earnings_fun,
        'periods': that.check_periods,
        'index_code': that.index_code
      }
      const cur_time = Date.now()
      this.$api.factor.calEqNdcg(param).then(res => {
        if ((Date.now() - cur_time) / 1000 > 60) {
          that.$notice('NDCG', '计算完成,请返回浏览器查看详情！')
        }
        loading.close()
        that.factor_item = res
        that.table_label = res
        that.setDefaultsFactor()
      })
    },

    exportExcel() {
      // 创建book
      var wb = XLSX.utils.book_new()
      // json转sheet

      var ws = XLSX.utils.json_to_sheet(this.table_label, {})

      // 设置列宽
      ws['!cols'] = [
        { width: 15 },
        { width: 15 },
        { width: 30 }
      ]
      var timestamp = new Date().getTime()
      // sheet写入book
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
      // 输出
      XLSX.writeFile(wb, this.t_name + '_NDCG_' + this.mapLabel[this.labels] + '.csv')
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
</style>
