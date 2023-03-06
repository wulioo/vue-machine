import request from '@/utils/request'

const monitor = {

  getCmSecICIR(label, is_night,db) {
    return request.get(`/fv/cm/sec/icir/list/?label=${label}&is_night=${is_night}&db=${db}`)
  },

  getCmSeqICIR(label, type,db) {
    return request.get(`/fv/cm/seq/icir/list/?label=${label}&type=${type}&db=${db}`)
  },
  getTypeNameAbList() {
    return request.get(`/fv/cm/seq/type/list/`)
  },
  CalCmSecICIR() {
    return request.get(`/fv/cm/sec/icir`)
  },
  CalCmSeqICIR() {
    return request.get(`/fv/cm/seq/icir`)
  },
}
export default monitor
