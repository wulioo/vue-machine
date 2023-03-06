import {login, getInfo, logout} from '@/api/login'
import {getToken, setToken, removeToken,setPlatform} from '@/utils/auth'
import Config from '@/settings'
import User from '@/api/json'
const user = {
  state: {
    token: getToken(),
    user: {},
    roles: [],
    switchMachine: 1,
    // 第一次加载菜单时用到
    loadMenus: false
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_USER: (state, user) => {
      state.user = user
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_LOAD_MENUS: (state, loadMenus) => {
      state.loadMenus = loadMenus
    },
    SET_SWITCH_MACHINE: (state, switchMache) => {
      state.switchMachine = switchMache
    }
  },

  actions: {
    // 登录
    Login({commit}, userInfo) {
      const rememberMe = userInfo.rememberMe

      const PlatformKey = Config.PlatformKey
      return new Promise((resolve, reject) => {
        //, userInfo.code, userInfo.uuid
        login(userInfo.username, userInfo.password).then(res => {
          setToken(res.token, rememberMe)
          setPlatform(1)
          commit('SET_TOKEN', res.token)
          setUserInfo(res.user, commit)
          // 第一次加载菜单时用到， 具体见 src 目录下的 permission.js
          commit('SET_LOAD_MENUS', true)
          resolve()
        }).catch(error => {
          reject(error)
        })

      })
    },

    // 获取用户信息
    GetInfo({commit}) {
      return new Promise((resolve, reject) => {
        let res = User.info
        setUserInfo(res, commit)
        resolve(res)
        // getInfo().then(res => {
        //   setUserInfo(res, commit)
        //   resolve(res)
        // }).catch(error => {
        //   reject(error)
        // })
      })
    },
    // 登出
    LogOut({commit}) {
      return new Promise((resolve, reject) => {
        logOut(commit)
        // logout().then(res => {
        //   logOut(commit)
        //   resolve()
        // }).catch(error => {
        //   logOut(commit)
        //   reject(error)
        // })
      })
    },

    updateLoadMenus({commit}) {
      return new Promise((resolve, reject) => {
        commit('SET_LOAD_MENUS', false)
      })
    }
  }
}

export const logOut = (commit) => {
  commit('SET_TOKEN', '')
  commit('SET_ROLES', [])
  removeToken()
}

export const setUserInfo = (res, commit) => {
  // 如果没有任何权限，则赋予一个默认的权限，避免请求死循环
  if (res.roles.length === 0) {
    commit('SET_ROLES', ['ROLE_SYSTEM_DEFAULT'])
  } else {
    commit('SET_ROLES', res.roles)
  }
  commit('SET_USER', res.user)
}

export default user
