import request from '@/utils/request'

const factor = {

  // 获取服务器时间戳
  // getServerTime() {
  //   return request.get(`/app/getServerTime?XDEBUG_SESSION_START=as-web`);
  // },

  // 获取期货因子列表
  getFactorList(type, platform = 1) {
    return request.get('/future/list/?type=' + type + '&platform=' + platform)
  },
  // 获取期货因子分类列表
  getFactorCategoryList(type, platform = 1) {
    return request.get('/future/category/list/?type=' + type + '&platform=' + platform)
  },
  // 获取因子期货ICIR
  getFactorIcIr(data) {
    return request.post('/future/icir/', data)
  },

  // 获取因子股票ICIR
  getFactorEqIcIr(data) {
    return request.post('equity/icir/', data)
  },

  // 获取IC值
  getIc(data) {
    return request.post('/future/ic/', data)
  },
  // 获取Corr值
  getCorr(data) {
    return request.post('/future/getcorr/', data)
  },
  // 计算期货NDCG calCategoryNdcg
  calNdcg(data) {
    return request.post('/future/ndcg/', data)
  },
  // 计算期货分类NDCG

  // 计算股票NDCG
  calEqNdcg(data) {
    return request.post('/equity/ndcg/', data)
  },

  // 计算Corr
  calCorr(data) {
    return request.post('/future/corr/', data)
  },
    calEqCorr(data) {
    return request.post('/equity/corr/', data)
  },


  // 获取因子期货ICIR
  getAvgVarie(data) {
    return request.post('/future/varie/avg/', data)
  },
    getEqAvgVarie(data) {
    return request.post('/equity/varie/avg/', data)
  },

  calFvFactorDistribute(data) {
    return request.post('/future/distribute/', data)
  },
  calEqFactorDistribute(data) {
    return request.post('equity/distribute/', data)
  },

  calFvFactorPosition(data) {
    return request.post('/future/positioning/', data)
  }
}
export default factor

