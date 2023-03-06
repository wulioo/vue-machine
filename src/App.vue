<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* 滚动条 */
.el-scrollbar__wrap:not(.el-select-dropdown__wrap) {
  overflow: scroll;
  overflow-x: hidden !important;
}

</style>
