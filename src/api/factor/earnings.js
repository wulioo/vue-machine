import request from "@/utils/request";

const earnings = {

  // 获取因子列表
  calEarnings(data) {
    return request.post(`/future/earnings/n/`, data);
  },
  calSharpeEarnings(data) {
    return request.post(`/future/earnings/sharpe/`, data);
  },

};
export default earnings
