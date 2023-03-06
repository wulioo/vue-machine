<template>
  <div>
    <el-tabs v-model="tableName" @tab-click="handleClick"   style="margin-bottom: 0">
      <el-tab-pane label="因子表类" name="fac_table"></el-tab-pane>
      <el-tab-pane label="因子分类" name="fac_category"></el-tab-pane>
      <el-tab-pane label="信号表类" name="sga_table"></el-tab-pane>
      <el-tab-pane label="信号分类" name="sga_category"></el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: "Table",
  data() {
    return {
      tableName: 'fac_table',
    }
  },
  methods: {
    handleClick(tab, event) {
      let that = this
      if (tab.name === 'fac_table' || tab.name === "sga_table") {
        // 获取因子列表
        this.$api.factor.getFactorList(tab.name).then(res => {
          that.$emit("click",that.tableName, res, 1, false);
        })
      } else if(tab.name === 'fac_category' || tab.name === "sga_category") {
        this.$api.factor.getFactorCategoryList(tab.name).then(res => {
          that.$emit("click",that.tableName, res, 2, false);

        })
      }
    },
  },
  mounted() {
    let that = this
    // 获取因子列表
    this.$api.factor.getFactorList(that.tableName).then(res => {

      that.$emit("click",that.tableName, res, 1, false);
    })
  }
}
</script>

<style scoped>

</style>
