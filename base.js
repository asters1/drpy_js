var rule = {
  //规则标题,没有实际作用,但是可以作为cms类名称依据
  title: ``,
  //网页的域名根,包含http头如 https://www,baidu.com
  host: '',
  //网站的分类页面链接
  url: '',
  //网站的请求头,完整支持所有的,常带ua和cookies
  headers: { 'User-Agent': 'IOS_UA', Referer: '' },
  //静态分类名称拼接
  class_name: '电影&电视剧&动漫',
  //静态分类标识拼接
  class_url: 'dianying&dianshiju&dongman',
  //搜索链接 可以是完整路径或者相对路径,**代表搜索词 fypage代表页数
  searchUrl: '',
  //是否启用全局搜索
  searchable: 2,
  // 筛选网站传参,会自动传到分类链接下(本示例中的url参数)-url里参数为fyfilter,可参考蓝光影院.js
  filter_url: '',
  // 筛选条件字典
  filter: {},
  // 对图片加了referer验证的有效,海阔专用,普通规则请勿填写
  图片来源: '',
  // 默认筛选条件字典(不同分类可以指定同样筛选参数的不同默认值)
  filter_def: '',
  play_parse: true,
  double: true,
  //移除某个线路及相关的选集
  tab_remove: [],
  //线路顺序,按里面的顺序优先，没写的依次排后面
  tab_order: [],
  //线路名替换如:lzm3u8替换为量子资源
  tab_rename: {},
  //第一个是列表，第二个是标题，第三个是Pic,第四个是描述，第五个是链接，
  搜索: ``,
  一级: ``,
  二级: ``,
  lazy: ``,
}
