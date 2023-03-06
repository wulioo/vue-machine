const commonConfig = {
  pickerOptions: {
    shortcuts: [{
      text: '最近半年',
      onClick(picker) {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 6);
        picker.$emit('pick', [start, end]);
      }
    }, {
      text: '最近一年',
      onClick(picker) {
        const end = new Date();
        const start = new Date()
        start.setFullYear(start.getFullYear() - 1);
        // const start = new Date(new Date().getFullYear() -1, 0);
        picker.$emit('pick', [start, end]);
      }
    },
      {
        text: '最近两年',
        onClick(picker) {
          const end = new Date();
          const start = new Date()
          start.setFullYear(start.getFullYear() - 2);
          // const start = new Date(new Date().getFullYear() - 2, 0);
          picker.$emit('pick', [start, end]);
        }
      },
      {
        text: '最近五年',
        onClick(picker) {
          const end = new Date();
          const start = new Date()
          start.setFullYear(start.getFullYear() - 5);
          // const start = new Date(new Date().getFullYear() - 5, 0);
          picker.$emit('pick', [start, end]);
        }
      },
      {
        text: '最近十年',
        onClick(picker) {
          const end = new Date();
            const start = new Date()
          start.setFullYear(start.getFullYear() - 10);
          // const start = new Date(new Date().getFullYear() - 10, 0);
          picker.$emit('pick', [start, end]);
        }
      },
    ]
  },
  mappingLabel: {
    'label_1': '1天收益',
    'label_2': '2天收益',
    'label_3': '3天收益',
    'label_5': '5天收益',
    'label_10': '10天收益'
  },
}

export default commonConfig
