<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <el-breadcrumb-item>
      <el-dropdown trigger="click">
      <span class="el-dropdown-link">
        {{ dropdownName }}<i class="el-icon-arrow-down el-icon--right"></i>
      </span>
        <el-dropdown-menu slot="dropdown">
          <span style="display:block;" @click="switchs(1)" v-show="platformShow !== '1'">
          <el-dropdown-item>期货平台</el-dropdown-item>
          </span>
          <span style="display:block;" @click="switchs(2)" v-show="platformShow !== '2'">
          <el-dropdown-item>股票平台</el-dropdown-item>
        </span>
        </el-dropdown-menu>
      </el-dropdown>
    </el-breadcrumb-item>
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item,index) in levelList" :key="item.path">
        <span v-if="item.redirect==='noredirect'||index==levelList.length-1" class="no-redirect">{{
            item.meta.title
          }}</span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
import pathToRegexp from 'path-to-regexp'
import {setPlatform, getPlatform} from '@/utils/auth'

export default {
  data() {
    return {
      levelList: null,
      dropdownName: '期货平台',
      platformShow:getPlatform()
    }
  },
  watch: {
    $route(route) {
      // if you go to the redirect page, do not update the breadcrumbs
      if (route.path.startsWith('/redirect/')) {
        return
      }
      this.getBreadcrumb()
    }
  },
  created() {
    this.getBreadcrumb()

  },
  methods: {
    switchs(val) {
      // if(val === 1){
      //   this.dropdownName = '期货平台'
      // }else {
      //   this.dropdownName = '股票平台'
      // }
      setPlatform(val)
      if (this.$route.path === '/dashboard') {
        window.location.reload(); //监测到路由发生跳转时刷新一次页面
      } else {
        window.location.href = '/dashboard'
        // this.$router.push('/dashboard')
      }

    },
    getBreadcrumb() {
      // only show routes with meta.title
      let matched = this.$route.matched.filter(item => item.meta && item.meta.title)
      const first = matched[0]

      if (!this.isDashboard(first)) {
        matched = [{path: '/dashboard', meta: {title: '首页'}}].concat(matched)
      }

      this.levelList = matched.filter(item => item.meta && item.meta.title && item.meta.breadcrumb !== false)
    },
    isDashboard(route) {
      const name = route && route.name
      if (!name) {
        return false
      }
      return name.trim().toLocaleLowerCase() === 'Dashboard'.toLocaleLowerCase()
    },
    pathCompile(path) {
      // To solve this problem https://github.com/PanJiaChen/vue-element-admin/issues/561
      const {params} = this.$route
      var toPath = pathToRegexp.compile(path)
      return toPath(params)
    },
    handleLink(item) {
      const {redirect, path} = item
      if (redirect) {
        this.$router.push(redirect)
        return
      }
      this.$router.push(this.pathCompile(path))
    }
  },
  mounted() {
    // let platform = getPlatform()

    if (this.platformShow == 1) {
      this.dropdownName = '期货平台'
    } else {
      this.dropdownName = '股票平台'
    }
  }
}
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}

.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
}

.el-icon-arrow-down {
  font-size: 12px;
}
</style>
