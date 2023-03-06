import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css'

import Element from 'element-ui'

// 数据字典
import dict from './components/Dict'

// 权限指令
import checkPer from '@/utils/permission'
import permission from './components/Permission'
import './assets/styles/element-variables.scss'

// global css
import './assets/styles/index.scss'

import App from './App'
import store from './store'
import router from './router/routers'

import './assets/icons' // icon
import './router/index' // permission control

import iView from 'iview'
import 'iview/dist/styles/iview.css'

// 加载通知

import api from '@/api/index.js'
//挂载API实例
Vue.use(api)

Vue.use(checkPer)
Vue.use(permission)
Vue.use(dict)
Vue.use(iView)
Vue.use(Element, {
  size: Cookies.get('size') || 'small' // set element-ui default size
})


Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

