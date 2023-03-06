<template>
  <div style="padding: 20px">
    <el-row class="flex-wrap" :gutter="20">
      <el-col :span="3">
        <el-date-picker
          v-model="trading_time"
          type="date"
          align="center"
          value-format="yyyy-MM-dd"
          style="width: 100%"
          placeholder="选择日期">
        </el-date-picker>

      </el-col>
      <el-col :span="5">
        <el-button type="primary" @click="FactorPosition()">因子持仓计算</el-button>
      </el-col>

    </el-row>

    <el-divider content-position="left">因子列表</el-divider>
    <el-card class="box-card">
    <Table @click="handleClick"></Table>
      <el-row class="flex-wrap" :gutter="20">
        <el-col :xl="10.5" class="mb20" :span="10.5"
                v-loading="show" element-loading-text="数据加载中..."
                element-loading-spinner="el-icon-loading">

          <el-cascader-panel ref="myCascader" v-model="check_node" :key="refresh" :options="options"
                             :props="{multiple:true}">
          </el-cascader-panel>

        </el-col>
        <el-col :span="6.5" v-show="!show">
          <el-card shadow="never" style="height: 300px">


            <el-row :gutter="20" style="margin-bottom: 20px;margin-left: 0">
              <el-tag style="">分层层数</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-radio-group v-model="check_layered">
                <el-radio :label="val" v-for="val in layeredList">{{ val }}</el-radio>
              </el-radio-group>

            </el-row>
            <el-row :gutter="20" style="margin-bottom: 20px;">
              <el-tag>收益周期</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-radio-group v-model="check_periods">
                <el-radio :label="val" v-for="val in Periods">{{ val }}</el-radio>
              </el-radio-group>

            </el-row>
            <el-row :gutter="20" style="margin-bottom: 20px;">
              <el-tag>因子权重</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-button type="success"
                         size="mini"
                         style="width: 70%"
                         :disabled="check_node != '' ?false:true"
                         @click="cal_weight()"

              >分配权重
              </el-button>
            </el-row>
            <el-row :gutter="20" style="margin-bottom: 20px;">
              <el-tag>交易金额</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-input
                style="width: 70%"
                placeholder="请输入内容"
                size="mini"
                prefix-icon="el-icon-money"
                v-model="trader_money">
              </el-input>
            </el-row>

            <el-row :gutter="20" style="margin-bottom: 20px;">
              <el-tag>品种过滤</el-tag>
              <el-divider direction="vertical"></el-divider>

              <el-input
                class="input-new-tag"
                v-if="inputVisible"
                v-model="inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm"
                @blur="handleInputConfirm"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="mini" @click="showInput" style="width: 70%">+ 输入标的
              </el-button>

            </el-row>
            <el-row :gutter="20" style="margin-bottom: 20px;">
              <el-tag
                :key="tag"
                v-for="tag in dynamicTags"
                closable
                type="success"
                :disable-transitions="false"
                @close="handleClose(tag)">
                {{ tag }}
              </el-tag>
            </el-row>

          </el-card>
        </el-col>
        <el-col :span="6.5" v-show="!show">
          <el-card shadow="never" style="height: 300px">


            <el-row :gutter="20" style="margin-bottom: 20px;margin-left: 0">
              <el-tag style="">其他</el-tag>
              <el-divider direction="vertical"></el-divider>
                <el-checkbox v-model="night_trading">交易夜盘品种</el-checkbox>
            </el-row>

          </el-card>
        </el-col>
      </el-row>
    </el-card>
    <!--    因子权重-->
    <el-dialog title="因子权重分配" :visible.sync="dialogVisible" center width="22%" :close-on-click-modal="false">
      <div class="sketch_content">
        <div v-if="tableName == 'fac_table' || tableName == 'sga_table'">
          <el-radio-group v-model="weight_table" size="small" style="margin:20px 0 20px">
            <el-radio :label="name" border v-for="(val,name) in factor_node">{{ name }}</el-radio>
          </el-radio-group>
          <el-form ref="form" :model="weight_form" label-width="100px">
            <div v-for="(val,name) in  factor_node[weight_table]">
              <el-form-item :label="s" v-for="s in  val" :key="s">
                     <span slot="label">
                      <el-tooltip class="item" effect="dark" :content="s" placement="left">
                        <span>{{ s }}</span>
                      </el-tooltip>
                </span>
                <el-input v-model="weight_form[s]" maxlength="3" style="width: 90%"></el-input>
                <span>%</span>
              </el-form-item>
            </div>
          </el-form>
        </div>
        <div v-else>
          <el-form ref="form" :model="weight_form" label-width="100px" style="margin:15px 0 15px">
            <div v-for="val in  weight_node">
              <el-form-item :label="s" v-for="s in  val" :key="s">
                <span slot="label">
                      <el-tooltip class="item" effect="dark" :content="s" placement="left">
                        <span>{{ s }}</span>
                      </el-tooltip>
                </span>
                <el-input v-model="weight_form[s]" maxlength="3"></el-input>
              </el-form-item>
            </div>
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="weight_submit" style="width: 100%">确 定</el-button>
        </div>
      </div>

    </el-dialog>

    <el-dialog :title="factor_value" :visible.sync="dialogTableVisible" :close-on-click-modal="false">
      <div class="sketch_content" style="padding: 0px;max-height: 550px">
        <el-table :data="t_factor" stripe height="500" style="margin-bottom:10px;padding: 0;">


          <el-table-column
            prop="index"
            label="index"
            type="index"
            align="center"
            width="80"
          >
          </el-table-column>
          <el-table-column
            prop="type_name_ab"
            label="type_name_ab"
            key="type_name_ab"
            align="center"
            fixed
            width="130"
          >

          </el-table-column>
          <el-table-column v-for="(val,key) in t_factor[0]"
                           :prop="key"
                           :label="key"
                           :key="key"
                           sortable
                           v-if="key != 'trading_date' & key!='type_name_ab'"

                           :width="key.length > 16 ? 250 :150"
                           align="center"
          ></el-table-column>


        </el-table>
      </div>
    </el-dialog>
    <!--    查看单因子持仓-->
    <el-row :gutter="20" v-if="factor_item" style="margin-top: 20px;margin-bottom: 20px">
      <el-col class="mb20">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
              <span style="margin-right: 30px">
                 <el-radio-group v-model="t_name" @change="handTableClick" style="margin-right: 15px">
                     <el-radio :label="tname" v-for="(table,tname) in factor_item" :key="tname">
                    <el-tag type="danger">{{ tname }}
                    </el-tag>
                  </el-radio>
                    </el-radio-group>

                 <el-select v-model="factor_value" placeholder="查看单因子持仓"
                            @change="handleFactorSelect"
                            v-show="Object.keys(factor_item[t_name]['single']).length > 1 ? true:false">
                <el-option
                  v-for="(item,name) in factor_item[t_name]['single']"
                  :key="name"
                  :label="name"
                  :value="name"
                >
                </el-option>
              </el-select>
                   <div style="float:right;display: flex;align-items: center;">
              <el-button size="small" type="primary" icon="el-icon-download"
                         @click="exportExcel()">positioning</el-button>
            </div>
              </span>
          </div>
          <el-table :data="t_table" stripe style="width: 100%;margin-bottom:10px;" height="500"
                    :key="t_name">
            <el-table-column
              type="index"
              align="center"
            >
            </el-table-column>
            <el-table-column
              prop="type_name_ab"
              label="type_name_ab"
              key="type_name_ab"
              align="center"
              fixed
              width="130"
            >
            </el-table-column>
            <el-table-column v-for="(val,key) in t_table[0]"
                             :prop="key"
                             :label="key"
                             :key="key"
                             sortable
                             v-if="key !== 'trading_date' & key!='type_name_ab'"
                             :width="key.length > 16 ? 250 :150"
                             align="center"
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
import commonConfig from "../../../utils/commonConfig";
import XLSX from "xlsx";
import CommonUtil from "@/utils/commonUtil";
import echarts from "echarts";
import {getPlatform} from '@/utils/auth'
import Config from '@/settings'
import {Notification} from 'element-ui'
import Table from "@/views/components/factor/table";


export default {
  name: 'fv_analy_positioning',
        components: {
    Table
  },
  data() {
    return {
      night_trading:false,
      weight_node: '',
      table_type: 'table',
      dialogTableVisible: false,
      factor_value: '',
      factor_weight: {},
      weight_table: '',
      factor_node: '',
      check_node: '',
      dialogVisible: false,
      dynamicTags: [],
      inputVisible: false,
      inputValue: '',
      trader_money: '',
      check_layered: 5,
      layeredList: Config.layered,
      check_periods: 1,
      Periods: Config.Periods,
      tableName: 'table',
      refresh: 1,
      show: true,
      t_name: '',
      t_table: '',
      t_factor: '',
      tabPosition: 'top',
      activeName: 'second',
      factor_item: '',
      options: [],
      trading_time: '',
      weight_form: {}
    }
  },
  created() {
  },
  computed: {},
  watch: {},
  methods: {
    handTableClick(val) {
      this.t_name = val
      this.t_table = this.factor_item[this.t_name]['summary']
    },
    handleFactorSelect(val) {
      this.factor_value = val
      this.t_factor = this.factor_item[this.t_name]['single'][this.factor_value]
      this.dialogTableVisible = true
    },
    weight_submit() {
      let weight_sum = 0
      let category_weight_sum = 0

      for (let [t_name, val] of Object.entries(this.factor_node)) {
        this.factor_weight[t_name] = {}
        for (let data of Object.values(val)) {
          for (let factor of data) {
            if (this.weight_form[factor] == undefined) {
              Notification.error({
                title: `请输入${factor} 因子权重`,
                duration: 5000
              })
              return
            }
            if (this.weight_form[factor] == 0) {
              Notification.error({
                title: `${factor} 因子权重不能为0`,
                duration: 5000
              })
              return
            }

            if (this.tableName == "sga_table" || this.tableName == "fac_table") {
              weight_sum += parseInt(this.weight_form[factor])
              this.factor_weight[t_name][factor] = this.weight_form[factor]
            } else {
              category_weight_sum += parseInt(this.weight_form[factor])

            }


          }
          if (this.tableName == "sga_table" || this.tableName == "fac_table") {
            if (weight_sum !== 100) {
              Notification.error({
                title: `${t_name} 权重：${weight_sum}% 不符合`,
                duration: 5000
              })
              return
            }
            weight_sum = 0
          }

        }

      }
      if (this.tableName == "fac_category" || this.tableName == "sga_category") {
        if (category_weight_sum !== 100) {
          Notification.error({
            title: `因子分类权重：${category_weight_sum}% 不符合`,
            duration: 5000
          })
          return
        }
        this.factor_weight = this.weight_form

      }
      this.dialogVisible = false
    },
    cal_weight() {

      let that = this
      let node = this.$refs['myCascader'].getCheckedNodes()

      if (that.tableName === 'fac_table' || that.tableName === 'sga_table') {
        this.factor_node = commonUtil.recursionTree(node, 3)
        this.weight_table = Object.keys(this.factor_node)[0]
      } else {
        this.factor_node = commonUtil.recursionTree(node, 4)
        let w_table = []
        for (let val of Object.values(this.factor_node)) {
          for (let factor of Object.values(val)) {
            w_table.push(factor)
          }

        }
        this.weight_node = w_table
      }


      that.dialogVisible = true

    },
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
    },
    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        this.dynamicTags.push(inputValue);
      }
      this.inputVisible = false;
      this.inputValue = '';
    },
    handleClick(table_name, data, refresh, show) {
      this.options = data
      this.tableName = table_name
      this.refresh = refresh
      this.show = show
      this.$refs['myCascader'].clearCheckedNodes()
    },
    FactorPosition() {
      let loading = CommonUtil.loading()
      let that = this
      let stime = this.trading_time
      if (JSON.stringify(that.factor_weight) == "{}") {
        Notification.error({
          title: `请输入因子权重`,
          duration: 5000
        })
        loading.close()
        return
      }
      if (that.trader_money == "") {
        Notification.error({
          title: `请输入交易金额`,
          duration: 5000
        })
        loading.close()
        return
      }

      let param = {
        'factor': that.factor_node,
        'cur_time': stime,
        'weight': that.factor_weight,
        "layering": that.check_layered,
        'periods': that.check_periods,
        'money': that.trader_money,
        'type_name_ab': that.dynamicTags,
        'table_name': that.tableName,
        'night_trading':that.night_trading

      }
      let cur_time = Date.now()

      this.$api.factor.calFvFactorPosition(param).then(res => {
        if ((Date.now() - cur_time) / 1000 > 60) {
          that.$notice('相关性分析', "计算完成,请返回浏览器查看详情！")
        }
        that.factor_item = res
        that.t_name = Object.keys(res)[0]
        that.t_table = Object.values(res)[0]['summary']
        this.weight_form = {}
        this.factor_weight = {}
        loading.close()

      }).catch(error => {
        loading.close()
        console.log(error)
      })

    },

    exportExcel() {

      //创建book
      var wb = XLSX.utils.book_new();
      //json转sheet

      var ws = XLSX.utils.json_to_sheet(this.t_table, {});

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
      XLSX.writeFile(wb, this.t_name +  "positining.csv");
    },
  },
  mounted() {



  }
}
</script>


<style lang="less" scoped>
/deep/ .el-form .el-form-item .el-form-item__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sketch_content {
  // 必须有高度 overflow 为自动
  overflow: auto;
  //height: 434px;
  min-height: 150px;
  max-height: 350px;
  border-top: 1px solid #eff1f4;
  border-bottom: 1px solid #eff1f4;
  padding: 0px 30px 11px 27px;

  // 滚动条的样式,宽高分别对应横竖滚动条的尺寸
  &::-webkit-scrollbar {
    width: 3px;
    height: 3px !important;
  }

  // 滚动条里面默认的小方块,自定义样式
  &::-webkit-scrollbar-thumb {
    background: #8798AF;
    border-radius: 2px;
  }

  // 滚动条里面的轨道
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

/deep/ .el-dialog {
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  margin: 0 !important;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/deep/ .el-dialog--center .el-dialog__body {
  padding: 0px 0px 30px;
}

/deep/ .el-dialog .el-dialog__header {
  border-radius: 15px 15px 0 0;
  text-align: left;
  //background-color: CornflowerBlue;
  font-weight: 800;

}

/deep/ .el-dialog .el-dialog__header .el-dialog__title {
  //color: white;
}

.el-tag + .el-tag {
  margin-left: 10px;
}

.button-new-tag {
  //margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  //width: 90px;
  width: 70%;
  //margin-left: 10px;
  //vertical-align: bottom;
}

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
