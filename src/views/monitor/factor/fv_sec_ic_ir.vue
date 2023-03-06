<template>
  <div class="app-container">
    <el-divider content-position="left">ICIR</el-divider>
    <el-card class="box-card">
      <div slot="header" class="clearfix">

        <el-radio-group v-model="select_db" size="mini" @change="handTableClick">
          <el-radio label="tq_factor" border>因子库</el-radio>
          <el-radio label="tq_signal" border>信号库</el-radio>
        </el-radio-group>
        <el-divider direction="vertical"></el-divider>
        <el-select v-model="label" placeholder="请选择" @change="handleOption">
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-divider direction="vertical"></el-divider>
        <el-checkbox v-model="is_night" @change="handleNight" true-label="1" false-label="0">是否夜盘交易</el-checkbox>
        <el-button type="primary" style="float: right" @click="cal_ic_ir()">计算-ICIR</el-button>
      </div>
      <el-table
        :data="tableData"
        stripe
        style="width: 100%">
        <el-table-column v-for="(val,key) in tableData[0]"
                         :prop="key"
                         :label="key"
                         :key="key"
                         align="center"
                         sortable
        >
        </el-table-column>
      </el-table>

    </el-card>
  </div>
</template>

<script>


import CommonUtil from "../../../utils/commonUtil";

export default {
  name: 'fv_monitor_icir',
  components: {},
  created() {
  },
  data() {
    return {
      is_night: 0,
      label: 'label_1',
      select_db: 'tq_factor',

      options: [{
        value: 'label_1',
        label: '1天收益'
      }, {
        value: 'label_2',
        label: '2天收益'
      }, {
        value: 'label_3',
        label: '3天收益'
      }, {
        value: 'label_5',
        label: '5天收益'
      }, {
        value: 'label_10',
        label: '10天收益'
      }],
      tableData: []
    }
  },
  methods: {
    handTableClick(val) {
      this.label = 'label_1'
      this.is_night = 0
      this.getICIR()
    },
    handleOption(val) {
      this.label = val
      this.getICIR()
    },
    handleNight(val) {
      this.is_night = val
      this.getICIR()
    },
    getICIR() {
      let that = this
      this.$api.monitor.getCmSecICIR(this.label, this.is_night,this.select_db).then(res => {
        that.tableData = res
      })
    },
    cal_ic_ir() {
      let that = this
      this.$api.monitor.CalCmSecICIR().then(res => {
        console.log(res)
        that.getICIR()
      })
    }
  },
  mounted() {
    this.getICIR()
  }
}
</script>

<style>
.demo-table-expand {
  font-size: 0;
}

.demo-table-expand label {
  width: 70px;
  color: #99a9bf;
}

.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}

.demo-table-expand .el-form-item__content {
  font-size: 12px;
}
</style>
