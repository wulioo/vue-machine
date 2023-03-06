module.exports = {
  /**
   * @description 网站标题
   */
  title: 'Machine',
  /**
   * @description 是否显示 tagsView
   */
  tagsView: true,
  /**
   * @description 固定头部
   */
  fixedHeader: true,
  /**
   * @description 记住密码状态下的token在Cookie中存储的天数，默认1天
   */
  tokenCookieExpires: 1,
  /**
   * @description 记住密码状态下的密码在Cookie中存储的天数，默认1天s
   */
  passCookieExpires: 1,
  /**
   * @description token key
   */
  TokenKey: 'ELADMIN-TOEKN',
  /**
   * @description 请求超时时间，毫秒（默认2分钟）
   */
  timeout: 3600000,
  /**
   * @description 是否显示logo
   */
  sidebarLogo: true,
  /**
   * 是否显示设置的底部信息
   */
  showFooter: true,
  /**
   * 底部文字，支持html语法
   */
  footerTxt: '© Machine Learning Platform System Version v1.0.18a</a>',
  /**
   * 备案号
   */
  caseNumber: '',
  /**
   * 获取平台类型 默认期货
   */
  PlatformKey: 'Platform',
  /**
   * 交易所
   */
  exchange_future: ['SHF', 'CFE', 'DCE', 'CZC', 'INE'],
  /**
   * 收益周期
   */
  Periods: [1,2, 3, 5, 10],
  /**
   * 相关性分析
   */
  Correlation: ['pearson', 'spearman'],
  /**
   * 分层层数
   */
  layered: [5, 7, 10],
  /**
   * 分层方法
   */
  layered_fun: ['直接排序法'],
  /**
   * 交易所默认选项
   */
  check_exchange: ['SHF', 'DCE','CZC','INE'],


}
