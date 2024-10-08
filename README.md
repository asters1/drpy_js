# drpy_js 调试

本项目为模拟drpy_js的运行，其中有的drpy_js函数可能并未实现，请自行添加

### 模板规则说明

所有相关属性说明

```javascript
var rule = {
  title: '', //规则标题,没有实际作用,但是可以作为cms类名称依据
  编码: '', //不填就默认utf-8
  搜索编码: '', //不填则不编码，默认都是按utf-8.可优先于全局编码属性.比如网页源码编码是gbk,这里可以指定utf-8搜索独立编码。多数情况这个属性不填或者填写gbk应对特殊的网站搜索
  host: '', //网页的域名根,包含http头如 https://www,baidu.com
  hostJs:
    'print(HOST);let html=request(HOST,{headers:{"User-Agent":PC_UA}});let src = jsp.pdfh(html,"ul&&li&&a&&href");print(src);HOST=src.replace("/index.php","")', //网页域名根动态抓取js代码。通过HOST=赋值
  homeUrl: '/latest/', //网站的首页链接,可以是完整路径或者相对路径,用于分类获取和推荐获取 fyclass是分类标签 fypage是页数
  url: '/fyclass/fypage.html[/fyclass/]', //网站的分类页面链接
  detailUrl: 'https://yanetflix.com/voddetail/fyid.html', //非必填,二级详情拼接链接,感觉没啥卵用
  searchUrl: '', //搜索链接 可以是完整路径或者相对路径,用于分类获取和推荐获取 **代表搜索词 fypage代表页数
  searchable: 0, //是否启用全局搜索,
  quickSearch: 0, //是否启用快速搜索,
  filterable: 0, //是否启用筛选,
  filter: {}, // 筛选条件字典
  // 默认筛选条件字典(不同分类可以指定同样筛选参数的不同默认值)
  filter_def: {
    douyu: {
      area: '一起看',
      other: '..',
    },
    huya: {
      area: '影音馆',
      other: '..',
    },
  },
  // 筛选网站传参,会自动传到分类链接下(本示例中的url参数)-url里参数为fyfilter,可参考蓝莓影视.js
  filter_url:
    'style={{fl.style}}&zone={{fl.zone}}&year={{fl.year}}&fee={{fl.fee}}&order={{fl.order}}',
  // 注意,由于猫有配置缓存,搜索配置没法热加载，修改了js不需要重启服务器
  // 但是需要tv_box进设置里换源使配置重新装载
  headers: {
    //网站的请求头,完整支持所有的,常带ua和cookies
    'User-Agent': 'MOBILE_UA',
    Cookie: 'searchneed=ok',
  },
  timeout: 5000, //网站的全局请求超时,默认是3000毫秒
  class_name: '电影&电视剧&动漫&综艺', //静态分类名称拼接
  class_url: '1&2&3&4', //静态分类标识拼接
  //动态分类获取 列表;标题;链接;正则提取 不需要正则的时候后面别加分号
  class_parse: '#side-menu:lt(1) li;a&&Text;a&&href;com/(.*?)/',
  // 除开全局过滤之外还需要过滤哪些标题不视为分类
  cate_exclude: '',
  // 除开全局动态线路名过滤之外还需要过滤哪些线路名标题不视为线路
  tab_exclude: '',
  //移除某个线路及相关的选集|js1
  tab_remove: ['tkm3u8'],
  //线路顺序,按里面的顺序优先，没写的依次排后面|js1
  tab_order: ['lzm3u8', 'wjm3u8', '1080zyk', 'zuidam3u8', 'snm3u8'],
  //线路名替换如:lzm3u8替换为量子资源|js1
  tab_rename: {
    lzm3u8: '量子',
    '1080zyk': '1080看',
    zuidam3u8: '最大资源',
    kuaikan: '快看',
    bfzym3u8: '暴风',
    ffm3u8: '非凡',
    snm3u8: '索尼',
    tpm3u8: '淘片',
    tkm3u8: '天空',
  },

  // 服务器解析播放
  play_parse: true,
  // play_json　传数组或者　类　true/false 比如 0,1 如果不传会内部默认处理 不传和传0可能效果不同
  // 效果等同说明: play_json:[{re:'*', json:{jx:0, parse:1}}], 等同于 play_json:0,
  play_json: [
    {
      re: '*',
      json: {
        jx: 1,
        parse: 1,
      },
    },
  ],
  //控制不同分类栏目下的总页面,不填就是默认999.哔哩影视大部分分类无法翻页，都需要指定页数为 1
  pagecount: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 7: 1, 时间表: 1 },
  // 自定义免嗅
  lazy: '',
  // 首页推荐显示数量
  limit: 6,
  double: true, //是否双层列表定位,默认false
  // 对图片加了referer验证的有效,海阔专用,普通规则请勿填写此键值
  图片来源:
    '@Referer=http://www.jianpianapp.com@User-Agent=jianpian-version350',
  // 替换所有图片链接 欲替换文本=>替换为文本
  图片替换: 'https://www.keke6.app/=>https://vres.a357899.cn/',

  // js写法，仅js模式1有效.可以用于代码动态获取全局cookie之类的
  // 可操作变量有 rule_fetch_params,rule,以及基础的网页访问request,post等操作
  预处理: 'rule_fetch_params.headers.Cookie = "xxxx";',
  // 类似海阔一级 列表;标题;图片;描述;链接;详情 其中最后一个参数选填
  // 如果是双层定位的话,推荐的第2段分号代码��是第2层定位列表代码
  推荐: '.col-sm-6;h3&&Text;img&&data-src;.date&&Text;a&&href',
  // 类似海阔一级 列表;标题;图片;描述;链接;详情 其中最后一个参数选填
  一级: '.col-sm-6;h3&&Text;img&&data-src;.date&&Text;a&&href',
  //二级发起访问前进行js处理。解决特殊情况一级给出的链接非二级真实源码而是前端重定向链接的源码
  二级访问前:
    'log(MY_URL);let jump=request(MY_URL).match(/href="(.*?)"/)[1];log(jump);MY_URL=urljoin2(MY_URL,jump)',
  // 二级可以是*,表示规则无二级,直接拿一级的链接进行嗅探
  // 二级 title: 片名;类型
  // 二级 desc: 主要信息;年代;地区;演员;导演
  // 或者 {title:'',img:'',desc:'',content:'',tabs:'',lists:'',tab_text:'body&&Text',list_text:'body&&Text',list_url:'a&&href'} 同海阔dr二级
  二级: '*',
  // 搜索可以是*,集成一级，或者跟一级一样的写法 列表;标题;图片;描述;链接;详情
  搜索: '*',
  // 本地代理规则，可用于修改m3u8文件文本去广告后返回代理文件地址，也可以代理加密图片
  proxy_rule: `js:
                log(input);
            input = [200,'text;plain','hello drpy']
                `,
  //是否启用辅助嗅探: 1,0
  sniffer: 1,
  // 辅助嗅探规则
  isVideo:
    'http((?!http).){26,}\\.(m3u8|mp4|flv|avi|mkv|wmv|mpg|mpeg|mov|ts|3gp|rm|rmvb|asf|m4a|mp3|wma)',
  // 辅助嗅探规则js写法
  isVideo: `js:
                    log(input);
            if(/m3u8/.test(input)){
                input = true
            }else{
                input = false
            }
            `,
}
```

# 搜索

简写的顺序->列表;标题;图片;描述;链接;详情(详情好像不显示，可以不用写)

```json
[
{"title":"吞噬星空",  //标题
"img":"https://pic.youkupic.co...m.jpg",  //图片链接
"desc":"更新至103集", //描述
"url":"https://zhuiju4.cc/vplay/42492-1-1/",//详情链接
"content":"简介之类的"  //详情
},
{"title":"title",
"img":"img",
"desc":"desc",
"url":"url",
"content":"content",
},
...
]
```
