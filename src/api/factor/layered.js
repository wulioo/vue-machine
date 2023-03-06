import request from '@/utils/request'

const layered = {

  // 获取因子列表
  getZonalTesting(data) {
    return request.post(`/future/zonaltesting/`, data)
  },

  // 获取分层股票
  getEqZonalTesting(data) {
    return request.post(`/equity/zonaltesting/`, data)
  },
  // 获取Echarts数据
  getEchartsData(data) {
    return request.post(`/future/echarts/`, data)
  },
  getBackTesting(data) {
    return request.post(`/future/backtesting/`, data)
  },
    getEqBackTesting(data) {
    return request.post(`/equity/backtesting/`, data)
  },
  getEchartBackTestIng(data) {
    return request.post(`/future/backtesting/echarts`, data)
  }
}
export default layered

