var cfg = {
  //测试的js文件路径
  test_file: './xhs.js',
  // test_file: './base.js',
  //打印开关
  print_switch: false,
  // print_switch: true,
  // 搜索开关
  search_switch: false,
  // search_switch: true,
  //跳过一级或者搜索,可以不用发起请求，,但是要赋值给vod
  skip_request: false,
  // skip_request: true,
  vod: {
    vod_id: 'https://zhuiju4.cc/wushan/51769',
    vod_name: '斗罗大陆2：绝世唐门2023',
  },
  //搜索关键字
  search_keyword: '斗罗大陆',
  //测试的类型的下标从0开始(电影,电视剧...)
  test_type_index: 2,
  //筛选类型的第几个的下标(如:类型，地区，语言，年份....)
  filter_type_index: 0,
  //测试筛选的下标
  filter_num_index: 1,
  // 测试页数从1开始
  test_page: 1,
  //测试的视频下标，从0开始
  test_vod_index: 0,
  // 测试视频源的下标从0开始
  test_vod_from_index: 0,
}
