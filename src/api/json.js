const user = {
  routers: [
    {
      "alwaysShow": true,
      "children": [{
        "component": "factor/analysis/icir",
        "hidden": false,
        "meta": {"icon": "factor_analy", "noCache": true, "title": "因子ICIR"},
        "name": "fv_analy_icir",
        "path": "icir"
      }, {
        "component": "factor/analysis/layered",
        "hidden": false,
        "meta": {"icon": "charts", "noCache": true, "title": "分层测试"},
        "name": "analysis_layered",
        "path": "layered"
      },
        {
          "component": "factor/analysis/ndcg",
          "hidden": false,
          "meta": {"icon": "az", "noCache": true, "title": "NDCG"},
          "name": "analysis_ndcg",
          "path": "ndcg"
        },
        {
          "component": "factor/analysis/corr",
          "hidden": false,
          "meta": {"icon": "corr", "noCache": true, "title": "相关性分析"},
          "name": "analysis_corr",
          "path": "corr"
        },
      ],
      "component": "Layout",
      "hidden": false,
      "meta": {"icon": "sqlMonitor", "noCache": true, "title": "因子分析"},
      "name": "因子分析",
      "path": "/factor/analysis",
      "redirect": "noredirect"
    },
    {
      "alwaysShow": true,
      "children": [{
        "component": "factor/review/icir",
        "hidden": false,
        "meta": {"icon": "factor_analy", "noCache": true, "title": "因子ICIR"},
        "name": "review_icir",
        "path": "icir"
      }, {
        "component": "factor/review/layered",
        "hidden": false,
        "meta": {"icon": "charts", "noCache": true, "title": "分层测试"},
        "name": "review_layered",
        "path": "layered"
      }, {
        "component": "factor/review/ndcg",
        "hidden": false,
        "meta": {"icon": "az", "noCache": true, "title": "NDCG"},
        "name": "review_ndcg",
        "path": "ndcg"
      },],
      "component": "Layout",
      "hidden": false,
      "meta": {"icon": "review", "noCache": true, "title": "因子评测"},
      "name": "因子评测",
      "path": "/factor/review",
      "redirect": "noredirect"
    },
    {
      "alwaysShow": true,
      "children": [{
        "component": "system/user/index",
        "hidden": false,
        "meta": {"icon": "peoples", "noCache": true, "title": "用户管理"},
        "name": "User",
        "path": "user"
      }, {
        "component": "system/role/index",
        "hidden": false,
        "meta": {"icon": "role", "noCache": true, "title": "角色管理"},
        "name": "Role",
        "path": "role"
      }, {
        "component": "system/menu/index",
        "hidden": false,
        "meta": {"icon": "menu", "noCache": true, "title": "菜单管理"},
        "name": "Menu",
        "path": "menu"
      }, {
        "component": "system/dept/index",
        "hidden": false,
        "meta": {"icon": "dept", "noCache": true, "title": "部门管理"},
        "name": "Dept",
        "path": "dept"
      }, {
        "component": "system/job/index",
        "hidden": false,
        "meta": {"icon": "Steve-Jobs", "noCache": true, "title": "岗位管理"},
        "name": "Job",
        "path": "job"
      }, {
        "component": "system/dict/index",
        "hidden": false,
        "meta": {"icon": "dictionary", "noCache": true, "title": "字典管理"},
        "name": "Dict",
        "path": "dict"
      }, {
        "component": "system/timing/index",
        "hidden": false,
        "meta": {"icon": "timing", "noCache": true, "title": "任务调度"},
        "name": "Timing",
        "path": "timing"
      }],
      "component": "Layout",
      "hidden": false,
      "meta": {"icon": "system", "noCache": true, "title": "系统管理"},
      "name": "系统管理",
      "path": "/system",
      "redirect": "noredirect"
    },
    {
      "alwaysShow": true,
      "children": [{
        "component": "monitor/online/index",
        "hidden": false,
        "meta": {"icon": "Steve-Jobs", "noCache": true, "title": "在线用户"},
        "name": "OnlineUser",
        "path": "online"
      }, {
        "component": "monitor/log/index",
        "hidden": false,
        "meta": {"icon": "log", "noCache": false, "title": "操作日志"},
        "name": "Log",
        "path": "logs"
      }, {
        "component": "monitor/log/errorLog",
        "hidden": false,
        "meta": {"icon": "error", "noCache": true, "title": "异常日志"},
        "name": "ErrorLog",
        "path": "errorLog"
      }, {
        "component": "monitor/server/index",
        "hidden": false,
        "meta": {"icon": "codeConsole", "noCache": true, "title": "服务监控"},
        "name": "ServerMonitor",
        "path": "server"
      }, {
        "component": "monitor/sql/index",
        "hidden": true,
        "meta": {"icon": "sqlMonitor", "noCache": true, "title": "SQL监控"},
        "name": "Sql",
        "path": "druid"
      }],
      "component": "Layout",
      "hidden": false,
      "meta": {"icon": "monitor", "noCache": true, "title": "系统监控"},
      "name": "系统监控",
      "path": "/monitor",
      "redirect": "noredirect"
    },
    // {
    //   "alwaysShow": true,
    //   "children": [{
    //     "component": "mnt/server/index",
    //     "hidden": false,
    //     "meta": {"icon": "server", "noCache": true, "title": "服务器"},
    //     "name": "ServerDeploy",
    //     "path": "mnt/serverDeploy"
    //   }, {
    //     "component": "mnt/app/index",
    //     "hidden": false,
    //     "meta": {"icon": "app", "noCache": true, "title": "应用管理"},
    //     "name": "App",
    //     "path": "mnt/app"
    //   }, {
    //     "component": "mnt/deploy/index",
    //     "hidden": false,
    //     "meta": {"icon": "deploy", "noCache": true, "title": "部署管理"},
    //     "name": "Deploy",
    //     "path": "mnt/deploy"
    //   }, {
    //     "component": "mnt/deployHistory/index",
    //     "hidden": false,
    //     "meta": {"icon": "backup", "noCache": true, "title": "部署备份"},
    //     "name": "DeployHistory",
    //     "path": "mnt/deployHistory"
    //   }, {
    //     "component": "mnt/database/index",
    //     "hidden": false,
    //     "meta": {"icon": "database", "noCache": true, "title": "数据库管理"},
    //     "name": "Database",
    //     "path": "mnt/database"
    //   }],
    //   "component": "Layout",
    //   "hidden": false,
    //   "meta": {"icon": "mnt", "noCache": true, "title": "运维管理"},
    //   "name": "Mnt",
    //   "path": "/mnt",
    //   "redirect": "noredirect"
    // },
    // {
    //   "alwaysShow": true,
    //   "children": [{
    //     "component": "generator/index",
    //     "hidden": false,
    //     "meta": {"icon": "dev", "noCache": false, "title": "代码生成"},
    //     "name": "GeneratorIndex",
    //     "path": "generator"
    //   }, {
    //     "component": "generator/config",
    //     "hidden": true,
    //     "meta": {"icon": "dev", "noCache": false, "title": "生成配置"},
    //     "name": "GeneratorConfig",
    //     "path": "generator/config/:tableName"
    //   }, {
    //     "component": "tools/storage/index",
    //     "hidden": false,
    //     "meta": {"icon": "qiniu", "noCache": true, "title": "存储管理"},
    //     "name": "Storage",
    //     "path": "storage"
    //   }, {
    //     "component": "tools/email/index",
    //     "hidden": false,
    //     "meta": {"icon": "email", "noCache": true, "title": "邮件工具"},
    //     "name": "Email",
    //     "path": "email"
    //   }, {
    //     "component": "tools/swagger/index",
    //     "hidden": true,
    //     "meta": {"icon": "swagger", "noCache": true, "title": "接口文档"},
    //     "name": "Swagger",
    //     "path": "swagger2"
    //   }, {
    //     "component": "tools/aliPay/index",
    //     "hidden": false,
    //     "meta": {"icon": "alipay", "noCache": true, "title": "支付宝工具"},
    //     "name": "AliPay",
    //     "path": "aliPay"
    //   }, {
    //     "component": "generator/preview",
    //     "hidden": true,
    //     "meta": {"icon": "java", "noCache": false, "title": "生成预览"},
    //     "name": "Preview",
    //     "path": "generator/preview/:tableName"
    //   }],
    //   "component": "Layout",
    //   "hidden": false,
    //   "meta": {"icon": "sys-tools", "noCache": true, "title": "系统工具"},
    //   "name": "系统工具",
    //   "path": "/sys-tools",
    //   "redirect": "noredirect"
    // },
    //   {
    //   "alwaysShow": true,
    //   "children": [{
    //     "component": "components/Echarts",
    //     "hidden": false,
    //     "meta": {"icon": "chart", "noCache": false, "title": "图表库"},
    //     "name": "Echarts",
    //     "path": "echarts"
    //   }, {
    //     "component": "components/icons/index",
    //     "hidden": false,
    //     "meta": {"icon": "icon", "noCache": true, "title": "图标库"},
    //     "name": "Icons",
    //     "path": "icon"
    //   }, {
    //     "component": "components/Editor",
    //     "hidden": false,
    //     "meta": {"icon": "fwb", "noCache": true, "title": "富文本"},
    //     "name": "Editor",
    //     "path": "tinymce"
    //   }, {
    //     "component": "components/MarkDown",
    //     "hidden": false,
    //     "meta": {"icon": "markdown", "noCache": true, "title": "Markdown"},
    //     "name": "Markdown",
    //     "path": "markdown"
    //   }, {
    //     "component": "components/YamlEdit",
    //     "hidden": false,
    //     "meta": {"icon": "dev", "noCache": true, "title": "Yaml编辑器"},
    //     "name": "YamlEdit",
    //     "path": "yaml"
    //   }],
    //   "component": "Layout",
    //   "hidden": false,
    //   "meta": {"icon": "zujian", "noCache": true, "title": "组件管理"},
    //   "name": "组件管理",
    //   "path": "/components",
    //   "redirect": "noredirect"
    // },
    //   {
    //   "alwaysShow": true,
    //   "children": [{
    //     "alwaysShow": true,
    //     "children": [{
    //       "component": "nested/menu1/menu1-1",
    //       "hidden": false,
    //       "meta": {"icon": "menu", "noCache": false, "title": "三级菜单1"},
    //       "name": "Test",
    //       "path": "menu1-1"
    //     }, {
    //       "component": "nested/menu1/menu1-2",
    //       "hidden": false,
    //       "meta": {"icon": "menu", "noCache": true, "title": "三级菜单2"},
    //       "name": "三级菜单2",
    //       "path": "menu1-2"
    //     }],
    //     "component": "ParentView",
    //     "hidden": false,
    //     "meta": {"icon": "menu", "noCache": true, "title": "二级菜单1"},
    //     "name": "二级菜单1",
    //     "path": "menu1",
    //     "redirect": "noredirect"
    //   }, {
    //     "component": "nested/menu2/index",
    //     "hidden": false,
    //     "meta": {"icon": "menu", "noCache": true, "title": "二级菜单2"},
    //     "name": "二级菜单2",
    //     "path": "menu2"
    //   }],
    //   "component": "Layout",
    //   "hidden": false,
    //   "meta": {"icon": "menu", "noCache": true, "title": "多级菜单"},
    //   "name": "多级菜单",
    //   "path": "/nested",
    //   "redirect": "noredirect"
    // }
  ],
  login: {
    "user": {
      "authorities": [
        {
          "authority": "admin"
        }
      ],
      "dataScopes": [],
      "roles": [
        "admin"
      ],
      "user": {
        "avatarName": "avatar.jpeg",
        "avatarPath": "/home/eladmin/avatar/avatar.jpeg",
        "createTime": "2018-08-23 09:11:56",
        "dept": {
          "id": 2,
          "name": "研发部"
        },
        "email": "admin@el-admin.vip",
        "enabled": true,
        "gender": "男",
        "id": 1,
        "isAdmin": true,
        "jobs": [
          {
            "id": 11,
            "name": "全栈开发"
          }
        ],
        "nickName": "管理员",
        "password": "$2a$10$Egp1/gvFlt7zhlXVfEFw4OfWQCGPw0ClmMcc6FjTnvXNRVf9zdMRa",
        "phone": "18888888888",
        "pwdResetTime": "2020-05-03 16:38:31",
        "roles": [
          {
            "dataScope": "全部",
            "id": 1,
            "level": 1,
            "name": "超级管理员"
          }
        ],
        "updateBy": "admin",
        "updateTime": "2020-09-05 10:43:31",
        "username": "admin"
      }
    },
    "token": "Bearer eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiIwYmNjMDcyMGJhMTM0OGVlODM1MzBkODM3NjBkYzQ5NyIsInVzZXIiOiJhZG1pbiIsInN1YiI6ImFkbWluIn0.cTHRBzj1MGApERHih2n1WW2cSftbBKgu926OmmK6iYAdCgMWq6PtdoqCBhF2HhQtlR-eO8oSg6tJqcSatKZWbw"
  },
  info: {
    "authorities": [
      {
        "authority": "admin"
      }
    ],
    "dataScopes": [],
    "roles": [
      "admin"
    ],
    "user": {
      "avatarName": "avatar.jpeg",
      "avatarPath": "/home/eladmin/avatar/avatar.jpeg",
      "createTime": "2018-08-23 09:11:56",
      "dept": {
        "id": 2,
        "name": "研发部"
      },
      "email": "admin@el-admin.vip",
      "enabled": true,
      "gender": "男",
      "id": 1,
      "isAdmin": true,
      "jobs": [
        {
          "id": 11,
          "name": "全栈开发"
        }
      ],
      "nickName": "管理员",
      "password": "$2a$10$Egp1/gvFlt7zhlXVfEFw4OfWQCGPw0ClmMcc6FjTnvXNRVf9zdMRa",
      "phone": "18888888888",
      "pwdResetTime": "2020-05-03 16:38:31",
      "roles": [
        {
          "dataScope": "全部",
          "id": 1,
          "level": 1,
          "name": "超级管理员"
        }
      ],
      "updateBy": "admin",
      "updateTime": "2020-09-05 10:43:31",
      "username": "admin"
    }
  }
}
export default user
