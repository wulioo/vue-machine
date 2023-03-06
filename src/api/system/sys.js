import request from "@/utils/request";

const sys = {

  // 计算期货时效ICIR
  getSysVersion() {
    return request.get('/system/version/');
  },


};
export default sys
