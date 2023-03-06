import {Loading, Message} from "element-ui";

const commonUtil = {
  getCircularReplacer: function () {
    const seen = new WeakSet()
    return (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return
        }
        seen.add(value)
      }
      return value
    }
  },
  notNull: function (obj) {
    return obj != null && obj != undefined && obj != 'null' && obj != 'undefined' && obj != ''
  },
  isNull: function (obj) {
    return !this.notNull(obj)
  },
  getSettingStorage: function (key) {
    let val = localStorage.getItem(key)
    val = this.notNull(val) ? val : false
    return val == 'true'
  },

  recursionTree: function (node, level) {
    let label = {}
    for (let n of node) {
      if (level === 3) {
        if (n.level === level) {
          if (label[n.parent.parent.value] == undefined) {
            label[n.parent.parent.value] = {}
            label[n.parent.parent.value]['factor_list'] = []
            label[n.parent.parent.value]['factor_list'].push(n.value)
          } else {
            label[n.parent.parent.value]['factor_list'].push(n.value)

          }
        }
      } else {
        if (n.level === level) {
          if (label[n.parent.parent.parent.value] === undefined) {
            label[n.parent.parent.parent.value] = {}
            label[n.parent.parent.parent.value][n.parent.parent.value] = {}
            label[n.parent.parent.parent.value][n.parent.parent.value] = []
            label[n.parent.parent.parent.value][n.parent.parent.value].push(n.value)
          } else {
            if (label[n.parent.parent.parent.value][n.parent.parent.value] === undefined) {
              label[n.parent.parent.parent.value][n.parent.parent.value]= []
              label[n.parent.parent.parent.value][n.parent.parent.value].push(n.value)
            } else {
              label[n.parent.parent.parent.value][n.parent.parent.value].push(n.value)

            }

          }
        }
      }

      //旧版本2022-12-5
      // if (n.level === level) {
      //   if (label[n.parent.parent.value] == undefined) {
      //     label[n.parent.parent.value] = {}
      //     label[n.parent.parent.value][n.parent.value] = []
      //     label[n.parent.parent.value][n.parent.value].push(n.value)
      //   } else {
      //     if (label[n.parent.parent.value][n.parent.value] == undefined) {
      //       label[n.parent.parent.value][n.parent.value] = []
      //       label[n.parent.parent.value][n.parent.value].push(n.value)
      //     } else {
      //       label[n.parent.parent.value][n.parent.value].push(n.value)
      //     }
      //   }
      // }
    }
    return label
  },
  message: function (msg, type = 'success') {
    Message({
      message: msg,
      type: type,
      duration: 2 * 1000,
      offset: 77
    });
  },
  loading: function () {
    let optios = {
      lock: true,
      text: 'Loading',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    }

    return Loading.service(optios);
  },
  group: function (array, subGroupLength) {
    let index = 0;
    let newArray = [];
    while (index < array.length) {
      newArray.push(array.slice(index, index += subGroupLength));
    }
    return newArray;
  }
}

export default commonUtil
