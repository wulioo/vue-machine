import request from "@/utils/request";

const common = {

  // 上传文件
  uploadFile(action,data) {
    return request.post(action, data);
  },

};
export default common

