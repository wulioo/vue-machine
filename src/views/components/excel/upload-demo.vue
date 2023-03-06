<template>
  <div>
    <el-row class="mb20">
      <el-alert title="上传文件的示例demo,可以下载查看具体上传文件的格式信息！" type="success">
        <slot>

          <div>
            <img src="@/assets/images/excel.png" alt="" style="width: 50px;height: 50px;cursor: pointer;"
                 @click="demo">
          </div>
        </slot>
      </el-alert>
    </el-row>
  </div>
</template>

<script>
import XLSX from "xlsx";
import Demo from '@/api/tools/demo'

export default {
  name: "Updemo",
  methods: {
     demo() {
      //创建book
      var wb = XLSX.utils.book_new();
      //json转sheet


      var ws = XLSX.utils.json_to_sheet(Demo, {});

      //设置列宽
      ws["!cols"] = [
        {width: 15},
        {width: 15},
        {width: 30}
      ];
      //sheet写入book
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      //输出
      XLSX.writeFile(wb, "demo.xlsx");
    },
  },
  mounted() {
  }

}
</script>

<style scoped>

</style>
