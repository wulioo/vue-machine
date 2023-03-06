import request from "@/utils/request";

const sequential = {

  // 计算期货时效ICIR
  calIcIr(data) {
    return request.post('/fv/sq/icir/', data);
  },

  //获取ICIR值
  getIcIr(data) {
    return request.post('/fv/sq/redis_icir/', data);
  },
   calFvSeqCorr(data) {
    return request.post('/fv/sq/corr/', data)
  },

};
export default sequential

