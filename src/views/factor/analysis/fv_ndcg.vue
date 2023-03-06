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
          :picker-options="pickerOptions">
        </el-date-picker>
      </el-col>
      <el-col :span="5">
        <el-button type="primary" @click="calculateNdcg()">计算-NDCG</el-button>
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
        <el-col :span="9.5" v-show="!show">
          <el-card shadow="never" style="height: 300px">
            <el-row :gutter="20" style="margin-bottom: 20px;">
              <el-tag>收益方法</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-radio-group v-model="earnings_fun">
                <el-radio :label="'close_price'">close_price</el-radio>
                <el-radio :label="'open_price'">open_price</el-radio>
                                <el-radio :label="'volat_price'">close/volatility</el-radio>

              </el-radio-group>
            </el-row>
            <el-row :gutter="20" style="margin-bottom: 20px;">
              <el-tag>标的选项</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-radio-group v-model="varieties">
                <el-radio :label="'all'">默认覆盖标的</el-radio>
                <el-radio :label="'zero'">0值填充</el-radio>
                <el-radio :label="'mean'">截面均值填充</el-radio>
                <el-radio :label="'median'">截面中位数填充</el-radio>
              </el-radio-group>
            </el-row>


            <el-row :gutter="20" style="margin-bottom: 20px;">
              <el-tag>收益周期</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-checkbox-group v-model="check_periods" style=" display: inline-block;">
                <el-checkbox :label="val" v-for="val in Periods"></el-checkbox>
              </el-checkbox-group>
            </el-row>
            <el-row :gutter="20" style="margin-bottom: 20px;">
              <el-tag>交易场所</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-checkbox-group v-model="check_exchange" style=" display: inline-block;">
                <el-checkbox :label="val" v-for="val in exchange_future"></el-checkbox>
              </el-checkbox-group>
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


    <el-row :gutter="20" v-if="factor_item" style="margin-top: 20px;margin-bottom:20px;">
      <el-col class="mb20">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
              <span style="margin-right: 30px">
                  <el-radio-group v-model="t_name" @change="handTableClick">
                  <el-radio :label="tname" v-for="(table,tname) in factor_item" :key="tname">
                    <el-tag type="danger">{{ tname }}
                    </el-tag>
                  </el-radio>
                </el-radio-group>
              </span>
            <span>
                <el-radio-group v-model="labels" @change="handleLabelClick">
            <el-radio :label="label_name" :key="label_name" border v-for="(label,label_name) in factor_label">{{
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
            <el-table-column v-for="(val,key) in table_label[0]"
                             :prop="key"
                             :label="key"
                             :key="key"
                             v-if="key !== 'trading_date'"
                             width="180"
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
import XLSX from "xlsx";
import CommonUtil from "@/utils/commonUtil";
import commonConfig from "../../../utils/commonConfig";
import Config from '@/settings'
import Table from "@/views/components/factor/table";

export default {
  name: 'fv_analy_ndcg',
    components: {
    Table
  },
  data() {
    return {
      night_trading: false,
      redis_key: new Date().valueOf(),
      check_periods: [1, 3, 5, 10],
      Periods: Config.Periods,
      exchange_future: Config.exchange_future,
      check_exchange: Config.check_exchange,
      refresh: 1,
      varieties: 'all',
      show: true,
      tableName: 'table',
      earnings_fun: 'close_price',
      mapLabel: commonConfig.mappingLabel,
      t_name: '',
      labels: '',
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
      let data = this.factor_item
      for (let [t_name, table] of Object.entries(data)) {

        this.t_name = t_name
        this.factor_label = table

        this.labels = Object.keys(this.factor_label)[0];
        this.table_label = table[this.labels]
        return
      }

    },
    calculateNdcg() {
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
        'stime': stime, 'etime': etime,
        'earnings_fun': this.earnings_fun,
        'varieties': that.varieties,
        'periods': that.check_periods,
        'exchange_future': that.check_exchange,
        'table_name': that.tableName,
        'night_trading': that.night_trading
      }
      this.$api.factor.calNdcg(param).then(res => {
        if ((Date.now() - cur_time) / 1000 > 60) {
          that.$notice('NDCG', "计算完成,请返回浏览器查看详情！")
        }
        loading.close()
        that.factor_item = res
        that.setDefaultsFactor()
      }).catch(() => {
        loading.close()
      })

    },

    exportExcel() {

      //创建book
      var wb = XLSX.utils.book_new();
      //json转sheet

      var ws = XLSX.utils.json_to_sheet(this.table_label, {});

      //设置列宽
      ws["!cols"] = [
        {width: 15},
        {width: 15},
        {width: 30}
      ];
      var timestamp = new Date().getTime();
      //sheet写入book
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      //输出
      XLSX.writeFile(wb, this.t_name + "_NDCG_" + this.mapLabel[this.labels] + ".csv");
    },
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
