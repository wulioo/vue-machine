// 分别导出 集合在一个对象API身上 default是一个对象
// export {default as user} from "./factor";
import factor from "./factor/factor";
import layered from "./factor/layered";
import earnings from "./factor/earnings";
import sequential from "./factor/sequential";
import common from "./factor/common";
import monitor from "./monitor/factor";
import sys from "./system/sys";
import Notification from "@/utils/notification"

const install = function (Vue) {
  if (install.installed) return
  install.installed = true

  // 定义属性到Vue原型中
  Object.defineProperties(Vue.prototype, {
    $api: {
      get() {
        return {
          'factor': factor,
          'layered': layered,
          'earnings': earnings,
          'sequential': sequential,
          'common':common,
          "monitor":monitor,
          "sys":sys
        }
      }
    },
    $notice: {
      get() {
        return Notification
      }
    }
  })
}

export default {
  install
}
