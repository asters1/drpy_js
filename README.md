# 本项目衍生于[hjdhnx/dr_py](https://github.com/hjdhnx/dr_py)

## [drpy文档](https://github.com/hjdhnx/dr_py/tree/main/doc)

## [写源教程](https://github.com/hjdhnx/dr_py/blob/main/doc/%E5%86%99%E6%BA%90%E6%95%99%E7%A8%8B.md)

## [js示例](https://github.com/hjdhnx/dr_py/tree/main/js)

## rule简化版规则

```javascript
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
```

## 如何使用

- 安装依赖

```
bash init.sh
```

- 修改config.js中的测试文件路径

```javascript
  //测试的js文件路径
  // test_file: './zj5.js',
  test_file: './base.js',
```

### js中可以使用的变量(可能并未包含完全)

- HOST -> 就是rule中的host
- VOD -> 二级的单个数据
- input -> 请求的完整链接url

- searchObj -> 仅在搜索中可以使用
- cateObj -> 仅在一级中可以使用
- detailObj -> 仅在二级中可以使用
- playObj -> 仅在lazy中可以使用

### js中可以使用的函数及定义和用法(可能并未包含完全)

#### request请求及用法

- 注意事项:request请求,单独在js文件中请求需要加await,如果是在rule中使用则不可以加await!!!

```javascript
function request(url, obj, ocr_flag) {
  //url->请求链接
  // var obj = { headers: { ua: 'kk' }, method: 'post', data: { A: 'A', B: 'B' } }这是postjson请求的obj
  //ocr_flag不知道，可以不填
  // 例如request("http://httpbin.org/get")
  //返回的是请求到的body字符串
}
```

- 这是个request请求示例

```javascript
import './drpy.js'
var url = `http://httpbin.org/post`
var obj = { headers: { ua: 'kk' }, method: 'post', data: { A: 'A', B: 'B' } }
var res = await request(url, obj)
console.log(res)
```

#### setResult用法

```javascript
function setResult(d) {
  //接受一个数组，返回转化后的数组,搜索和一级需要
  //其中d是一个数组，如果不是数组，会返回一个空数组
  //-----------举例-------------
  //import './drpy.js'
  //var a = [{
  // img: '封面1',
  // desc: '描述1',
  // title: '标题1',
  // url: '链接1'
  // },{
  // img: '封面2',
  // desc: '描述2',
  // title: '标题2',
  // url: '链接2'
  // }]
  //var res = setResult(a)
  // console.log(JSON.stringify(res))
  //------------------------
  //会打印这个-->[{
  //"vod_id":"链接1",
  // "vod_name":"标题1",
  // "vod_remarks":"描述1",
  // "vod_content":"",
  // "vod_pic":"封面1"
  // },{
  //"vod_id":"链接2",
  // "vod_name":"标题2",
  // "vod_remarks":"描述2",
  // "vod_content":"",
  // "vod_pic":"封面2"
  // }]
  //------------------------
}
```

#### pdfh,pdfa,pd的用法

- pdfa(html, parse) 返回的是列表!
- 其中parse是规则,例如.fed-part-layout&&dl,规则只可意会不可言传
- pdfh(html, parse, base_url) 返回的是字符串!
- pd(html, parse) pdfh的升级版用于获取url链接!

- 注意事项:写的时候需要用jsp才能访问到pdfa,pdfh,pd

```javascript
pdfa = jsp.pdfa
pdfh = jsp.pdfh
pd = jsp.pd
```

## 写js时的返回值

### 一级和搜索返回值类型一样(json对象)

- 这是setResult之前的结构，用setResult转化一下即可,setResult接受的参数是对象,最终会和tvbox的返回值一样

```
[
  {
    url: 'https://zhuiju4.cc/wushan/87249',
    title: '你的万水千山',
    desc: 'HD',
    img: 'https://pic.youkupic.com/upload/vod/20241014-1/b9404fee07b46f809760fb61ccfb6953.jpg',
  },
  {
    url: 'https://zhuiju4.cc/wushan/87248',
    title: '峡谷情缘',
    desc: 'HD',
    img: 'https://pic.youkupic.com/upload/vod/20241014-1/b306a4c22f86d905c3e833d080d9aee9.jpg',
  },
  {
    url: 'https://zhuiju4.cc/wushan/87247',
    title: '我，何爷爷',
    desc: 'HD',
    img: 'https://pic.youkupic.com/upload/vod/20241014-1/4f35109981920daacca7657d45476865.jpg',
  },
]
```

- 如果使用规则来写的话。遵循第一个是列表，第二个是标题，第三个是Pic,第四个是描述，第五个是链接的选择

### 二级返回值(json字符串)

- 返回值json字符串需要储存在VOD中

```json
{
  "vod_id": "https://zhuiju4.cc/wushan/87249",
  "vod_name": "你的万水千山",
  //封面
  "vod_pic": "https://pic.youkupic.com/upload/vod/20241014-1/b9404fee07b46f809760fb61ccfb6953.jpg",
  //提示信息
  "vod_remarks": "HD",
  //类型
  "type_name": "剧情",
  //主演
  "vod_actor": "张奕 辛宇 李佳乐",
  //地区
  "vod_area": "中国大陆",
  //年份
  "vod_year": "2024",
  //导演
  "vod_director": "杨玉川",
  //简介
  "vod_content": "《你的万水千山》无删减版，影片主要讲述了：伊依来到西安。寻找已故爱人吴吴的记忆。却意外得知吴吴还活在世上。几番波折后,二人再次见面,得知彼此的良苦用心,吴吴是因为不让伊依受伤才不辞而别,他们互相理解,虽然身在黑夜,却仿佛浸润在暖阳之中,有情人终成眷厘，完美结局愿以一朵花的姿态行走世间，看得清世间繁杂却不在心中留下痕迹。花开成景，花落成诗。",
  // 播放源 多个用$$$分隔
  "vod_play_from": "追剧①$$$追剧③",
  // 播放列表 注意分隔符 分别是 多个源$$$分隔，源中的剧集用#分隔，剧集的名称和地址用$分隔
  "vod_play_url": "HD$https://zhuiju4.cc/vplay/87249-1-1$$$HD$https://zhuiju4.cc/vplay/87249-2-1"
}
```

### lazy返回值(可以是url字符串,也可以是json对象，但是需要储存在input中)

```javascript
//这是drpy定义的返回,所以需要储存在input中
var lazy_play =
  typeof input === 'object'
    ? input
    : {
        parse: 1,
        jx: tellIsJx(input),
        url: input,
      }
```

- lazy的返回,储存在input中

```json
{
  "parse": 0,
  "url": "https://v5.tlkqc.com/wjv5/202410/14/bcBQQXEsj677/video/index.m3u8",
  "jx": 0
}
```
