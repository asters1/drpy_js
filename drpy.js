import cheerio from './libs/cheerio.min.js'
import chalk from 'chalk'
import { Uri, _ } from './libs/cat.js'
import fs from 'fs'
import './libs/cat_index.js'
import { exec } from 'child_process'

var rule = {}
var cfg = {}
/*** 以下是内置变量和解析方法 **/
var MY_URL
var HOST
var RKEY // 源的唯一标识

let VODS = [] // 一级或者搜索需要的数据列表
let VOD = {} // 二级的单个数据
let TABS = [] // 二级的自定义线路列表 如: TABS=['道长在线','道长在线2']
let LISTS = [] // 二级的自定义选集播放列表 如: LISTS=[['第1集$http://1.mp4','第2集$http://2.mp4'],['第3集$http://1.mp4','第4集$http://2.mp4']]

var fetch
var print
var log
var rule_fetch_params
var fetch_params // 每个位置单独的
var oheaders
// var play_url; // 二级详情页注入变量,为了适配js模式0 (不在这里定义了,直接二级里定义了个空字符串)
var _pdfh
var _pdfa
var _pd
// const DOM_CHECK_ATTR = ['url', 'src', 'href', 'data-original', 'data-src'];
const DOM_CHECK_ATTR = /(url|src|href|-original|-src|-play|-url|style)$/
// 过滤特殊链接,不走urlJoin
const SPECIAL_URL = /^(ftp|magnet|thunder|ws):/
const SELECT_REGEX = /:eq|:lt|:gt|#/g
const SELECT_REGEX_A = /:eq|:lt|:gt/g
//修改setResult
const SETRESULT_REGEX = /(setResult)\(([^)]*)\)/g
//UA
const MOBILE_UA =
  'Mozilla/5.0 (Linux; Android 11; M2007J3SC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045714 Mobile Safari/537.36'
const PC_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36'
const UA = 'Mozilla/5.0'
const UC_UA =
  'Mozilla/5.0 (Linux; U; Android 9; zh-CN; MI 9 Build/PKQ1.181121.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.5.5.1035 Mobile Safari/537.36'
const IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
const RULE_CK = 'cookie' // 源cookie的key值
// const KEY = typeof(key)!=='undefined'&&key?key:'drpy_' + (rule.title || rule.host); // 源的唯一标识
const CATE_EXCLUDE = '首页|留言|APP|下载|资讯|新闻|动态'
const TAB_EXCLUDE = '猜你|喜欢|下载|剧情|热播'

// =================自定义函数=======================
//初始化环境
function init(js_path) {
  let js_data =
    R_File(js_path) +
    `
JSON.stringify(rule)
  `
  // console.loh(js_data)
  rule = JSON.parse(eval(js_data))
  rule_fetch_params = {
    headers: rule.headers || false,
    timeout: rule.timeout,
    encoding: rule.encoding,
  }
  fetch_params = JSON.parse(JSON.stringify(rule_fetch_params))
  MY_URL = getHome(rule.host)

  // console.log(rule_fetch_params)
  return rule
}

// 读文件
function R_File(file_path) {
  return fs.readFileSync(file_path).toString()
}
//写文件
function W_File(file_path, str) {
  // 使用writeFile方法清空并写入文件
  fs.writeFile(file_path, str, (err) => {
    if (err) {
      console.log('写入文件时发生错误：', err)
      process.exit(1)
    }
  })
}
//打印绿色字体
function printGreen(str) {
  console.log('\x1B[32m' + str + '\x1B[0m')
}
//打印灰色字体
function printGrey(str) {
  console.log(chalk.rgb(128, 128, 128)(str))
  // console.log('\x1B[2m' + str + '\x1B[0m')
  // console.log('\x1B[30m' + str + '\x1B[0m')
}
async function evals(str) {
  W_File('./debug.js', str)
  var result
  await new Promise((resolve, reject) => {
    exec('node "./debug.js"', (error, stdout, stderr) => {
      if (error) {
        console.log('js运行失败!!')
        reject(error)
      } else {
        result = stdout
        resolve()
      }
    })
  })
  return result
}

//环境变量转Jscode
function env_to_jscode(obj) {
  var obj_key_list = Object.keys(obj)
  var str = ''
  for (var i = 0; i < obj_key_list.length; i++) {
    if (typeof obj[obj_key_list[i]] === 'string') {
      str =
        str + 'var ' + obj_key_list[i] + ' = "' + obj[obj_key_list[i]] + '";\n'
    } else if (typeof obj[obj_key_list[i]] === 'object') {
      str =
        str +
        'var ' +
        obj_key_list[i] +
        ' = ' +
        JSON.stringify(obj[obj_key_list[i]]) +
        ';\n'
    } else {
      str =
        str + 'var ' + obj_key_list[i] + ' = ' + obj[obj_key_list[i]] + ';\n'
    }
  }
  // print(str)
  return str
}
// ========================================

/**
es6py扩展
 */
if (typeof Object.assign != 'function') {
  Object.assign = function () {
    var target = arguments[0]
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i]
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key]
        }
      }
    }
    return target
  }
}
if (!String.prototype.includes) {
  String.prototype.includes = function (search, start) {
    if (typeof start !== 'number') {
      start = 0
    }

    if (start + search.length > this.length) {
      return false
    } else {
      return this.indexOf(search, start) !== -1
    }
  }
}

if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, 'includes', {
    value: function (searchElement, fromIndex) {
      if (this == null) {
        //this是空或者未定义，抛出错误
        throw new TypeError('"this" is null or not defined')
      }

      var o = Object(this) //将this转变成对象
      var len = o.length >>> 0 //无符号右移0位，获取对象length属性，如果未定义就会变成0

      if (len === 0) {
        //length为0直接返回false未找到目标值
        return false
      }

      var n = fromIndex | 0 //查找起始索引
      var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0) //计算正确起始索引，因为有可能是负值

      while (k < len) {
        //从起始索引处开始循环
        if (o[k] === searchElement) {
          //如果某一位置与寻找目标相等，返回true，找到了
          return true
        }
        k++
      }
      return false //未找到，返回false
    },
  })
}
if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (prefix) {
    return this.slice(0, prefix.length) === prefix
  }
}
if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1
  }
}
Object.prototype.myValues = function (obj) {
  if (obj == null) {
    throw new TypeError('Cannot convert undefined or null to object')
  }
  var res = []
  for (var k in obj) {
    if (obj.hasOwnProperty(k)) {
      //需判断是否是本身的属性
      res.push(obj[k])
    }
  }
  return res
}
if (typeof Object.prototype.values != 'function') {
  Object.prototype.values = function (obj) {
    if (obj == null) {
      throw new TypeError('Cannot convert undefined or null to object')
    }
    var res = []
    for (var k in obj) {
      if (obj.hasOwnProperty(k)) {
        //需判断是否是本身的属性
        res.push(obj[k])
      }
    }
    return res
  }
}
if (typeof Array.prototype.join != 'function') {
  Array.prototype.join = function (emoji) {
    // emoji = emoji||',';
    emoji = emoji || ''
    let self = this
    let str = ''
    let i = 0
    if (!Array.isArray(self)) {
      throw String(self) + 'is not Array'
    }
    if (self.length === 0) {
      return ''
    }
    if (self.length === 1) {
      return String(self[0])
    }
    i = 1
    str = this[0]
    for (; i < self.length; i++) {
      str += String(emoji) + String(self[i])
    }
    return str
  }
}

String.prototype.rstrip = function (chars) {
  let regex = new RegExp(chars + '$')
  return this.replace(regex, '')
}

Array.prototype.append = Array.prototype.push
String.prototype.strip = String.prototype.trim
async function request(url, obj, ocr_flag) {
  //
  // console.log(fetch_params)
  ocr_flag = ocr_flag || false
  if (typeof obj === 'undefined' || !obj || obj === {}) {
    if (!fetch_params || !fetch_params.headers) {
      let headers = {
        'User-Agent': MOBILE_UA,
      }
      if (rule.headers) {
        Object.assign(headers, rule.headers)
      }
      if (!fetch_params) {
        fetch_params = {}
      }
      fetch_params.headers = headers
    }
    if (!fetch_params.headers.Referer) {
      fetch_params.headers.Referer = getHome(url)
    }
    obj = fetch_params
  } else {
    let headers = obj.headers || {}
    let keys = Object.keys(headers).map((it) => it.toLowerCase())
    if (!keys.includes('user-agent')) {
      headers['User-Agent'] = MOBILE_UA
    }
    if (!keys.includes('referer')) {
      headers['Referer'] = getHome(url)
    }
    obj.headers = headers
  }
  if (rule.encoding && rule.encoding !== 'utf-8' && !ocr_flag) {
    if (
      !obj.headers.hasOwnProperty('Content-Type') &&
      !obj.headers.hasOwnProperty('content-type')
    ) {
      // 手动指定了就不管
      obj.headers['Content-Type'] = 'text/html; charset=' + rule.encoding
    }
  }
  if (
    typeof obj.body != 'undefined' &&
    obj.body &&
    typeof obj.body === 'string'
  ) {
    // let data = {};
    // obj.body.split('&').forEach(it=>{
    //     data[it.split('=')[0]] = it.split('=')[1]
    // });
    // obj.data = data;
    // delete obj.body

    // 传body加 "Content-Type":"application/x-www-form-urlencoded;" 即可post form
    if (
      !obj.headers.hasOwnProperty('Content-Type') &&
      !obj.headers.hasOwnProperty('content-type')
    ) {
      // 手动指定了就不管
      obj.headers['Content-Type'] =
        'application/x-www-form-urlencoded; charset=' + rule.encoding
    }
  } else if (
    typeof obj.body != 'undefined' &&
    obj.body &&
    typeof obj.body === 'object'
  ) {
    obj.data = obj.body
    delete obj.body
  }
  if (!url) {
    return obj.withHeaders ? '{}' : ''
  }
  if (obj.toBase64) {
    // 返回base64,用于请求图片
    obj.buffer = 2
    delete obj.toBase64
  }
  if (obj.redirect === false) {
    obj.redirect = 0
  }
  // console.log(JSON.stringify(obj.headers))
  if (obj.headers['User-Agent'] == 'PC_UA') {
    obj.headers['User-Agent'] = PC_UA
  } else if (obj.headers['User-Agent'] == 'IOS_UA') {
    obj.headers['User-Agent'] = IOS_UA
  } else if (obj.headers['User-Agent'] == 'MOBILE_UA') {
    obj.headers['User-Agent'] = MOBILE_UA
  } else if (obj.headers['User-Agent'] == 'UC_UA') {
    obj.headers['User-Agent'] = UC_UA
  } else if (obj.headers['User-Agent'] == 'UA') {
    obj.headers['User-Agent'] = UA
  }

  // console.log(JSON.stringify(obj.headers))
  // console.log('request:'+url+' obj:'+JSON.stringify(obj));
  // console.log(
  //   'request:' + url + `|method:${obj.method || 'GET'}|body:${obj.body || ''}`,
  // )
  // console.log('请求开始---')
  let res = await req(url, obj)
  // console.log('请求结束---')
  let html = res.content || ''
  // console.log(html)
  if (obj.withHeaders) {
    let htmlWithHeaders = res.headers
    htmlWithHeaders.body = html
    return JSON.stringify(htmlWithHeaders)
  } else {
    return html
  }
}

/**
 * 搜索列表数据解析
 * @param searchObj
 * @returns {string}
 */
async function searchParse(searchObj) {
  fetch_params = JSON.parse(JSON.stringify(rule_fetch_params))
  let d = []
  if (!searchObj.searchUrl) {
    return '{}'
  }
  let p = searchObj.搜索 === '*' && rule.一级 ? rule.一级 : searchObj.搜索
  if (!p || typeof p !== 'string') {
    return '{}'
  }
  p = p.trim()
  let pp = rule.一级.split(';')
  let url = searchObj.searchUrl.replaceAll('**', searchObj.wd)
  if (
    searchObj.pg === 1 &&
    url.includes('[') &&
    url.includes(']') &&
    !url.includes('#')
  ) {
    url = url.split('[')[1].split(']')[0]
  } else if (
    searchObj.pg > 1 &&
    url.includes('[') &&
    url.includes(']') &&
    !url.includes('#')
  ) {
    url = url.split('[')[0]
  }
  if (/fypage/.test(url)) {
    if (url.includes('(') && url.includes(')')) {
      let url_rep = url.match(/.*?\((.*)\)/)[1]
      // console.log(url_rep);
      let cnt_page = url_rep.replaceAll('fypage', searchObj.pg)
      // console.log(cnt_page)
      let cnt_pg = eval(cnt_page)
      // console.log(cnt_pg);
      url = url
        .replaceAll(url_rep, cnt_pg)
        .replaceAll('(', '')
        .replaceAll(')', '')
    } else {
      url = url.replaceAll('fypage', searchObj.pg)
    }
  }

  MY_URL = searchObj.host + url
  // console.log(MY_URL)
  // log(searchObj.搜索);
  // setItem('MY_URL',MY_URL);
  if (p.startsWith('js:')) {
    const TYPE = 'search'
    const MY_PAGE = searchObj.pg
    const KEY = searchObj.wd
    var input = MY_URL
    var detailUrl = rule.detailUrl || ''
    // console.log(input)
    var Js_Code = p.trim().replace('js:', '')
    Js_Code = Js_Code.replaceAll('request(', 'await request(')
    Js_Code = Js_Code.replace(
      SETRESULT_REGEX,
      ' console.log(JSON.stringify($1($2))) ',
    )
    var Js_Env = {}
    Js_Env.input = input
    Js_Code = `import "./drpy.js"\n\n` + env_to_jscode(Js_Env) + '\n' + Js_Code
    try {
      var res_search = await evals(Js_Code)
    } catch (e) {
      console.log('jscode运行出错!')
    }
    VODS = JSON.parse(res_search)
    d = VODS
  } else {
    p = p.split(';')
    if (p.length < 5) {
      return '{}'
    }
    let p0 = getPP(p, 0, pp, 0)
    let _ps = parseTags.getParse(p0)
    _pdfa = _ps.pdfa
    _pdfh = _ps.pdfh
    _pd = _ps.pd
    let is_json = p0.startsWith('json:')
    p0 = p0.replace(/^(jsp:|json:|jq:)/, '')
    // print('1381 p0:'+p0);
    try {
      let req_method =
        MY_URL.split(';').length > 1
          ? MY_URL.split(';')[1].toLowerCase()
          : 'get'
      let html
      if (req_method === 'post') {
        let rurls = MY_URL.split(';')[0].split('#')
        let rurl = rurls[0]
        let params = rurls.length > 1 ? rurls[1] : ''
        print(`post=》rurl:${rurl},params:${params}`)
        // let new_dict = {};
        // let new_tmp = params.split('&');
        // new_tmp.forEach(i=>{
        //     new_dict[i.split('=')[0]] = i.split('=')[1];
        // });
        // html = post(rurl,{body:new_dict});
        let _fetch_params = JSON.parse(JSON.stringify(rule_fetch_params))
        let postData = { body: params }
        Object.assign(_fetch_params, postData)
        html = post(rurl, _fetch_params)
      } else if (req_method === 'postjson') {
        let rurls = MY_URL.split(';')[0].split('#')
        let rurl = rurls[0]
        let params = rurls.length > 1 ? rurls[1] : ''
        print(`postjson-》rurl:${rurl},params:${params}`)
        try {
          params = JSON.parse(params)
        } catch (e) {
          params = '{}'
        }
        let _fetch_params = JSON.parse(JSON.stringify(rule_fetch_params))
        let postData = { body: params }
        Object.assign(_fetch_params, postData)
        html = post(rurl, _fetch_params)
      } else {
        html = await getHtml(MY_URL)
      }
      if (html) {
        if (/系统安全验证|输入验证码/.test(html)) {
          let cookie = verifyCode(MY_URL)
          if (cookie) {
            console.log(`本次成功过验证,cookie:${cookie}`)
            setItem(RULE_CK, cookie)
          } else {
            console.log(`本次自动过搜索验证失败,cookie:${cookie}`)
          }
          // obj.headers['Cookie'] = cookie;
          html = await getHtml(MY_URL)
        }
        if (!html.includes(searchObj.wd)) {
          console.log(
            '搜索结果源码未包含关键字,疑似搜索失败,正为您打印结果源码',
          )
          console.log(html)
        }
        if (is_json) {
          // console.log(html);
          html = dealJson(html)
          // console.log(JSON.stringify(html));
        }
        // console.log(html);
        let list = _pdfa(html, p0)
        // print(list.length);
        // print(list);
        let p1 = getPP(p, 1, pp, 1)
        let p2 = getPP(p, 2, pp, 2)
        let p3 = getPP(p, 3, pp, 3)
        let p4 = getPP(p, 4, pp, 4)
        let p5 = getPP(p, 5, pp, 5)
        list.forEach((it) => {
          let links = p4.split('+').map((_p4) => {
            return !rule.detailUrl ? _pd(it, _p4, MY_URL) : _pdfh(it, _p4)
          })
          let link = links.join('$')
          let content
          if (p.length > 5 && p[5]) {
            content = _pdfh(it, p5)
          } else {
            content = ''
          }
          let vod_id = link
          let vod_name = _pdfh(it, p1).replace(/\n|\t/g, '').trim()
          let vod_pic = _pd(it, p2, MY_URL)
          if (rule.二级 === '*') {
            vod_id = vod_id + '@@' + vod_name + '@@' + vod_pic
          }
          let ob = {
            vod_id: vod_id,
            vod_name: vod_name,
            vod_pic: vod_pic,
            vod_remarks: _pdfh(it, p3).replace(/\n|\t/g, '').trim(),
            vod_content: content.replace(/\n|\t/g, '').trim(),
          }
          d.push(ob)
        })
      }
    } catch (e) {
      print('搜索发生错误:' + e.message)
      return '{}'
    }
  }
  if (rule.图片替换 && rule.图片替换.includes('=>')) {
    let replace_from = rule.图片替换.split('=>')[0]
    let replace_to = rule.图片替换.split('=>')[1]
    d.forEach((it) => {
      if (it.vod_pic && it.vod_pic.startsWith('http')) {
        it.vod_pic = it.vod_pic.replace(replace_from, replace_to)
      }
    })
  }
  if (rule.图片来源) {
    d.forEach((it) => {
      if (it.vod_pic && it.vod_pic.startsWith('http')) {
        it.vod_pic = it.vod_pic + rule.图片来源
      }
    })
  }
  // print(d);
  return JSON.stringify({
    page: parseInt(searchObj.pg),
    pagecount: 10,
    limit: 20,
    total: 100,
    list: d,
  })
}
/**
 * 二级详情页数据解析
 * @param detailObj
 * @returns {string}
 */
async function detailParse(detailObj) {
  let t1 = new Date().getTime()
  fetch_params = JSON.parse(JSON.stringify(rule_fetch_params))
  let orId = detailObj.orId
  let vod_name = '片名'
  let vod_pic = ''
  let vod_id = orId
  if (rule.二级 === '*') {
    // vod_id = orId.split('@@')[0]; // 千万不能分割
    let extra = orId.split('@@')
    vod_name = extra.length > 1 ? extra[1] : vod_name
    vod_pic = extra.length > 2 ? extra[2] : vod_pic
  }
  // print(vod_pic);
  let vod = {
    vod_id: vod_id, //"id",
    vod_name: vod_name,
    vod_pic: vod_pic,
    type_name: '类型',
    vod_year: '年份',
    vod_area: '地区',
    vod_remarks: '更新信息',
    vod_actor: '主演',
    vod_director: '导演',
    vod_content: '简介',
  }
  let p = detailObj.二级
  let url = detailObj.url
  let detailUrl = detailObj.detailUrl
  let fyclass = detailObj.fyclass
  let tab_exclude = detailObj.tab_exclude
  let html = detailObj.html || ''
  MY_URL = url
  if (detailObj.二级访问前) {
    try {
      print(`尝试在二级访问前执行代码:${detailObj.二级访问前}`)
      eval(detailObj.二级访问前.trim().replace('js:', ''))
    } catch (e) {
      print(`二级访问前执行代码出现错误:${e.message}`)
    }
  }
  // console.log(MY_URL);
  // setItem('MY_URL',MY_URL);
  if (p === '*') {
    vod.vod_play_from = '道长在线'
    vod.vod_remarks = detailUrl
    vod.vod_actor = '没有二级,只有一级链接直接嗅探播放'
    vod.vod_content = MY_URL
    vod.vod_play_url = '嗅探播放$' + MY_URL.split('@@')[0]
  } else if (typeof p === 'string' && p.trim().startsWith('js:')) {
    const TYPE = 'detail'
    var input = MY_URL
    var play_url = ''
    var Js_Env = {}
    var Js_Code = p.trim().replace('js:', '')
    Js_Code = Js_Code.replaceAll('request(', 'await request(')
    Js_Env.input = detailObj.input
    Js_Env.VOD = {}
    Js_Code = `import "./drpy.js"\n\n` + env_to_jscode(Js_Env) + '\n' + Js_Code
    Js_Code = Js_Code + '\n\nconsole.log(JSON.stringify(VOD));'
    try {
      var res_detail = await evals(Js_Code)
      // console.log(res_detail)
    } catch (e) {
      console.log('jscode运行出错!')
    }
    // eval(p.trim().replace('js:', ''))
    console.log(res_detail)
    var res = JSON.parse(res_detail)
    VOD = res
    vod = VOD
    // console.log(JSON.stringify(vod))
  } else if (p && typeof p === 'object') {
    let tt1 = new Date().getTime()
    if (!html) {
      MY_URL = detailObj.input
      html = await getHtml(MY_URL)
    }
    // print(`二级${MY_URL}仅获取源码耗时:${new Date().getTime() - tt1}毫秒`)
    let _impJQP = false
    let _ps
    if (p.is_json) {
      print('二级是json')
      _ps = parseTags.json
      html = dealJson(html)
    } else if (p.is_jsp) {
      print('二级是jsp')
      _ps = parseTags.jsp
    } else if (p.is_jq) {
      print('二级是jq')
      _ps = parseTags.jq
    } else {
      print('二级默认jq')
      _ps = parseTags.jq
      // print('二级默认jsp')
      // _ps = parseTags.jsp;
    }
    if (_ps === parseTags.jq) {
      // jquery解析提前load(html)
      _impJQP = true
    }
    if (_impJQP) {
      let ttt1 = new Date().getTime()
      let c$ = cheerio.load(html)
      // print(`二级${MY_URL}仅c$源码耗时:${(new Date()).getTime()-ttt1}毫秒`);
      html = { rr: c$, ele: c$('html')[0] }
      // print(
      //   `二级${MY_URL}仅cheerio.load源码耗时:${new Date().getTime() - ttt1}毫秒`,
      // )
    }
    let tt2 = new Date().getTime()
    // print(`二级${MY_URL}获取并装载源码耗时:${tt2 - tt1}毫秒`)
    _pdfa = _ps.pdfa
    _pdfh = _ps.pdfh
    _pd = _ps.pd
    if (p.title) {
      let p1 = p.title.split(';')
      vod.vod_name = _pdfh(html, p1[0]).replace(/\n|\t/g, '').trim()
      let type_name =
        p1.length > 1
          ? _pdfh(html, p1[1]).replace(/\n|\t/g, '').replace(/ /g, '').trim()
          : ''
      vod.type_name = type_name || vod.type_name
    }
    if (p.desc) {
      try {
        let p1 = p.desc.split(';')
        vod.vod_remarks = _pdfh(html, p1[0]).replace(/\n|\t/g, '').trim()
        vod.vod_year =
          p1.length > 1 ? _pdfh(html, p1[1]).replace(/\n|\t/g, '').trim() : ''
        vod.vod_area =
          p1.length > 2 ? _pdfh(html, p1[2]).replace(/\n|\t/g, '').trim() : ''
        // vod.vod_actor = p1.length > 3 ? _pdfh(html, p1[3]).replaceAll('\n', ' ').trim():'';
        vod.vod_actor =
          p1.length > 3 ? _pdfh(html, p1[3]).replace(/\n|\t/g, '').trim() : ''
        vod.vod_director =
          p1.length > 4 ? _pdfh(html, p1[4]).replace(/\n|\t/g, '').trim() : ''
      } catch (e) {}
    }
    if (p.content) {
      try {
        let p1 = p.content.split(';')
        vod.vod_content = _pdfh(html, p1[0]).replace(/\n|\t/g, '').trim()
      } catch (e) {}
    }
    if (p.img) {
      try {
        let p1 = p.img.split(';')
        vod.vod_pic = _pd(html, p1[0], MY_URL)
      } catch (e) {}
    }

    let vod_play_from = '$$$'
    let playFrom = []
    if (p.重定向 && p.重定向.startsWith('js:')) {
      print('开始执行重定向代码:' + p.重定向)
      html = eval(p.重定向.replace('js:', ''))
      if (_impJQP) {
        let c$ = cheerio.load(html)
        html = { rr: c$, ele: c$('html')[0] }
      }
    }

    // console.log(2);
    if (p.tabs) {
      if (p.tabs.startsWith('js:')) {
        print('开始执行tabs代码:' + p.tabs)
        if (html && _impJQP && typeof html !== 'string') {
          try {
            // 假装是jq的对象拿来转换一下字符串,try为了防止json的情况报错
            html = html.rr(html.ele).toString()
          } catch (e) {}
        }
        var input = MY_URL
        eval(p.tabs.replace('js:', ''))
        playFrom = TABS
      } else {
        let p_tab = p.tabs.split(';')[0]
        // console.log(p_tab);
        let vHeader = _pdfa(html, p_tab)
        // console.log(vHeader.length)
        let tab_text = p.tab_text || 'body&&Text'
        // print('tab_text:'+tab_text);
        let new_map = {}
        for (let v of vHeader) {
          let v_title = _pdfh(v, tab_text).trim()
          // console.log(v_title)
          if (tab_exclude && new RegExp(tab_exclude).test(v_title)) {
            continue
          }
          if (!new_map.hasOwnProperty(v_title)) {
            new_map[v_title] = 1
          } else {
            new_map[v_title] += 1
          }
          if (new_map[v_title] > 1) {
            v_title += Number(new_map[v_title] - 1)
          }
          playFrom.push(v_title)
        }
      }
      // console.log(JSON.stringify(playFrom))
    } else {
      playFrom = ['道长在线']
    }
    vod.vod_play_from = playFrom.join(vod_play_from)

    // console.log(3);
    let vod_play_url = '$$$'
    let vod_tab_list = []
    if (p.lists) {
      if (p.lists.startsWith('js:')) {
        print('开始执行lists代码:' + p.lists)
        try {
          if (html && _impJQP && typeof html !== 'string') {
            // 假装是jq的对象拿来转换一下字符串,try为了防止json的情况报错
            try {
              html = html.rr(html.ele).toString()
            } catch (e) {}
          }
          var input = MY_URL
          var play_url = ''
          eval(p.lists.replace('js:', ''))
          for (let i in LISTS) {
            if (LISTS.hasOwnProperty(i)) {
              // print(i);
              try {
                LISTS[i] = LISTS[i].map((it) =>
                  it.split('$').slice(0, 2).join('$'),
                )
              } catch (e) {
                print('格式化LISTS发生错误:' + e.message)
              }
            }
          }
          vod_play_url = LISTS.map((it) => it.join('#')).join(vod_play_url)
        } catch (e) {
          print('js执行lists: 发生错误:' + e.message)
        }
      } else {
        let list_text = p.list_text || 'body&&Text'
        let list_url = p.list_url || 'a&&href'
        // print('list_text:'+list_text);
        // print('list_url:'+list_url);
        // print('list_parse:'+p.lists);
        let is_tab_js = p.tabs.trim().startsWith('js:')
        for (let i = 0; i < playFrom.length; i++) {
          let tab_name = playFrom[i]
          let tab_ext =
            p.tabs.split(';').length > 1 && !is_tab_js
              ? p.tabs.split(';')[1]
              : ''
          let p1 = p.lists.replaceAll('#idv', tab_name).replaceAll('#id', i)
          tab_ext = tab_ext.replaceAll('#idv', tab_name).replaceAll('#id', i)
          // 测试jsp提速
          // console.log(p1);
          // p1 = p1.replace(':eq(0)',',0').replace(' ','&&');
          // console.log(p1);
          // console.log(html);
          let vodList = []
          try {
            vodList = _pdfa(html, p1)
            // console.log('len(vodList):' + vodList.length)
          } catch (e) {
            // console.log(e.message);
          }
          let new_vod_list = []
          // print('tab_ext:'+tab_ext);
          let tabName = tab_ext ? _pdfh(html, tab_ext) : tab_name
          // console.log(tabName)
          // console.log('cheerio解析Text');
          // 此处存在性能问题: pt版2000集需要650毫秒,俊版1300毫秒 特么的优化不动 主要后面定位url的我拿他没法
          // 主要性能问题在于 _pd(it, list_url, MY_URL)
          let tt1 = new Date().getTime()
          // vodList.forEach((it,idex)=>{
          //     // 请注意,这里要固定pdfh解析body&&Text,不需要下划线,没写错
          //     // new_vod_list.push(pdfh(it,'body&&Text')+'$'+_pd(it,'a&&href',MY_URL));
          //     // new_vod_list.push(cheerio.load(it).text()+'$'+_pd(it,'a&&href',MY_URL));
          //     // new_vod_list.push(_pdfh(it, list_text).trim() + '$' + _pd(it, list_url, MY_URL));
          //     // new_vod_list.push(_pdfh(it, list_text).trim() + '$' +idex);
          //     // new_vod_list.push(idex + '$' +_pdfh(it, list_url));
          //     new_vod_list.push(_pdfh(it, list_text).trim() + '$' +_pd(it, list_url,MY_URL));
          // });
          if (vodList.length > 0) {
            for (let i = 0; i < vodList.length; i++) {
              let it = vodList[i]
              new_vod_list.push(
                _pdfh(it, list_text).trim() + '$' + _pd(it, list_url, MY_URL),
              )
            }
            new_vod_list = forceOrder(new_vod_list, '', (x) => x.split('$')[0])
            // console.log(
            //   `drpy影响性能代码共计列表数循环次数:${vodList.length},耗时:${new Date().getTime() - tt1}毫秒`,
            // )
          }
          let vlist = new_vod_list.join('#')
          vod_tab_list.push(vlist)
        }
        vod_play_url = vod_tab_list.join(vod_play_url)
      }
    }
    vod.vod_play_url = vod_play_url
  }
  if (rule.图片替换 && rule.图片替换.includes('=>')) {
    let replace_from = rule.图片替换.split('=>')[0]
    let replace_to = rule.图片替换.split('=>')[1]
    vod.vod_pic = vod.vod_pic.replace(replace_from, replace_to)
  }
  if (rule.图片来源 && vod.vod_pic && vod.vod_pic.startsWith('http')) {
    vod.vod_pic = vod.vod_pic + rule.图片来源
  }
  if (!vod.vod_id || (vod_id.includes('$') && vod.vod_id !== vod_id)) {
    vod.vod_id = vod_id
  }
  let t2 = new Date().getTime()
  // console.log(`加载二级界面${MY_URL}耗时:${t2 - t1}毫秒`)
  return JSON.stringify(vod)
}
/**
 * 选集播放点击事件解析
 * @param playObj
 * @returns {string}
 */
async function playParse(playObj) {
  fetch_params = JSON.parse(JSON.stringify(rule_fetch_params))
  MY_URL = playObj.url
  var MY_FLAG = playObj.flag
  if (!/http/.test(MY_URL)) {
    try {
      MY_URL = base64Decode(MY_URL)
    } catch (e) {}
  }
  MY_URL = decodeURIComponent(MY_URL)
  var input = MY_URL //注入给免嗅js
  var flag = MY_FLAG //注入播放线路名称给免嗅js
  let common_play = {
    parse: 1,
    url: input,
    flag: flag,
    // url:urlencode(input),
    jx: tellIsJx(input),
  }
  let lazy_play
  if (!rule.play_parse || !rule.lazy) {
    lazy_play = common_play
  } else if (rule.play_parse && rule.lazy && typeof rule.lazy === 'string') {
    try {
      let lazy_code = rule.lazy.replace('js:', '').trim()
      lazy_code = lazy_code.replaceAll('request(', 'await request(')
      lazy_code =
        `import "./drpy.js"\n` + env_to_jscode(playObj) + '\n' + lazy_code
      lazy_code = lazy_code + '\nconsole.log(JSON.stringify(input))'
      var res_play = await evals(lazy_code)
      try {
        input = JSON.parse(res_play)
      } catch {
        input = res_play
      }

      lazy_play =
        typeof input === 'object'
          ? input
          : {
              parse: 1,
              jx: tellIsJx(input),
              url: input,
            }
    } catch (e) {
      print('js免嗅错误:' + e.message)
      lazy_play = common_play
    }
  } else {
    lazy_play = common_play
  }
  // print('play_json:'+typeof(rule.play_json));
  // console.log(Array.isArray(rule.play_json));
  if (Array.isArray(rule.play_json) && rule.play_json.length > 0) {
    // 数组情况判断长度大于0
    let web_url = lazy_play.url
    for (let pjson of rule.play_json) {
      if (
        pjson.re &&
        (pjson.re === '*' || web_url.match(new RegExp(pjson.re)))
      ) {
        if (pjson.json && typeof pjson.json === 'object') {
          let base_json = pjson.json
          // print('开始合并:');
          // print(base_json);
          lazy_play = Object.assign(lazy_play, base_json)
          break
        }
      }
    }
  } else if (rule.play_json && !Array.isArray(rule.play_json)) {
    // 其他情况 非[] 判断true/false
    let base_json = {
      jx: 1,
      parse: 1,
    }
    lazy_play = Object.assign(lazy_play, base_json)
  } else if (!rule.play_json) {
    // 不解析传0
    let base_json = {
      jx: 0,
      parse: 1,
    }
    lazy_play = Object.assign(lazy_play, base_json)
  }
  console.log(JSON.stringify(lazy_play))
  return JSON.stringify(lazy_play)
}

/**
 * 推荐和搜索单字段继承一级
 * @param p 推荐或搜���的解析分割;列表
 * @param pn 自身列表序号
 * @param pp  一级解析分割;列表
 * @param ppn 继承一级序号
 * @returns {*}
 */
function getPP(p, pn, pp, ppn) {
  try {
    let ps = p[pn] === '*' && pp.length > ppn ? pp[ppn] : p[pn]
    return ps
  } catch (e) {
    return ''
  }
}
/**
 * 检查宝塔验证并自动跳过获取正确源码
 * @param html 之前获取的html
 * @param url 之前的来源url
 * @param obj 来源obj
 * @returns {string|DocumentFragment|*}
 */
function checkHtml(html, url, obj) {
  if (/\?btwaf=/.test(html)) {
    let btwaf = html.match(/btwaf(.*?)"/)[1]
    url = url.split('#')[0] + '?btwaf' + btwaf
    print('宝塔验证访问链接:' + url)
    html = request(url, obj)
  }
  return html
}
/**
 *  带一次宝塔验证的源码获取
 * @param url 请求链接
 * @param obj 请求参数
 * @returns {string|DocumentFragment}
 */
async function getCode(url, obj) {
  let html = await request(url, obj)
  html = checkHtml(html, url, obj)
  return html
}

/**
 *  获取数据库配置表对应的key字段的value，没有这个key就返回value默认传参.需要有缓存,第一次获取后会存在内存里
 * @param k 键
 * @param v 值
 * @returns {*}
 */
function getItem(k, v) {
  return local.get(RKEY, k) || v
}
/**
 * 源rule专用的请求方法,自动注入cookie
 * @param url 请求链接
 * @returns {string|DocumentFragment}
 */
async function getHtml(url) {
  let obj = {}
  if (rule.headers) {
    obj.headers = rule.headers
  }
  let cookie = getItem(RULE_CK, '')
  if (cookie) {
    // log('有cookie:'+cookie);
    if (
      obj.headers &&
      !Object.keys(obj.headers)
        .map((it) => it.toLowerCase())
        .includes('cookie')
    ) {
      // log('历史无cookie,新增过验证后的cookie')
      obj.headers['Cookie'] = cookie
    } else if (
      obj.headers &&
      obj.headers.cookie &&
      obj.headers.cookie !== cookie
    ) {
      obj.headers['Cookie'] = cookie
      log('历史有小写过期的cookie,更新过验证后的cookie')
    } else if (
      obj.headers &&
      obj.headers.Cookie &&
      obj.headers.Cookie !== cookie
    ) {
      obj.headers['Cookie'] = cookie
      log('历史有大写过期的cookie,更新过验证后的cookie')
    } else if (!obj.headers) {
      obj.headers = { Cookie: cookie }
      log('历史无headers,更新过验证后的含cookie的headers')
    }
  }
  let html = await getCode(url, obj)
  return html
}
print = function (data) {
  if (cfg.print_switch) {
    data = data || ''
    if (typeof data == 'object' && Object.keys(data).length > 0) {
      try {
        data = JSON.stringify(data)
        console.log(data)
      } catch (e) {
        // console.log('print:'+e.message);
        console.log(typeof data + ':' + data.length)
        return
      }
    } else if (typeof data == 'object' && Object.keys(data).length < 1) {
      console.log('null object')
    } else {
      console.log(data)
    }
  }
}
// log = print

// 内置 pdfh,pdfa,pd
const defaultParser = {
  pdfh(html, parse, base_url) {
    if (!parse || !parse.trim()) {
      return ''
    }
    let eleFind = typeof html === 'object'
    let option = undefined
    if (eleFind && parse.startsWith('body&&')) {
      parse = parse.substr(6)
      if (parse.indexOf('&&') < 0) {
        option = parse.trim()
        parse = '*=*'
      }
    }
    if (parse.indexOf('&&') > -1) {
      let sp = parse.split('&&')
      option = sp[sp.length - 1]
      sp.splice(sp.length - 1)
      if (sp.length > 1) {
        for (let i in sp) {
          if (!SELECT_REGEX.test(sp[i])) {
            sp[i] = sp[i] + ':eq(0)'
          }
        }
      } else {
        if (!SELECT_REGEX.test(sp[0])) {
          sp[0] = sp[0] + ':eq(0)'
        }
      }
      parse = sp.join(' ')
    }
    let result = ''
    const $ = eleFind ? html.rr : cheerio.load(html)
    let ret = eleFind
      ? parse === '*=*' || $(html.ele).is(parse)
        ? html.ele
        : $(html.ele).find(parse)
      : $(parse)
    if (option) {
      if (option === 'Text') {
        result = $(ret).text()
      } else if (option === 'Html') {
        result = $(ret).html()
      } else {
        result = $(ret).attr(option)
      }
      if (result && base_url && DOM_CHECK_ATTR.test(option)) {
        if (/http/.test(result)) {
          result = result.substr(result.indexOf('http'))
        } else {
          result = urljoin(base_url, result)
        }
      }
    } else {
      result = $(ret).toString()
    }
    return result
  },

  pdfa(html, parse) {
    // console.log(parse)
    if (!parse || !parse.trim()) {
      return []
    }
    let eleFind = typeof html === 'object'
    // console.log(eleFind)
    if (parse.indexOf('&&') > -1) {
      let sp = parse.split('&&')
      for (let i in sp) {
        if (!SELECT_REGEX_A.test(sp[i]) && i < sp.length - 1) {
          sp[i] = sp[i] + ':eq(0)'
        }
      }
      parse = sp.join(' ')
      // console.log(parse)
    }
    const $ = eleFind ? html.rr : cheerio.load(html)
    // console.log(cheerio.load(html))
    // print($)
    let ret = eleFind
      ? $(html.ele).is(parse)
        ? html.ele
        : $(html.ele).find(parse)
      : $(parse)
    let result = []
    if (ret) {
      ret.each(function (idx, ele) {
        result.push({ rr: $, ele: ele })
      })
    }
    // print(result)
    return result
  },
  pd(html, parse, uri) {
    let ret = this.pdfh(html, parse)
    if (typeof uri === 'undefined' || !uri) {
      uri = ''
    }
    if (DOM_CHECK_ATTR.test(parse) && !SPECIAL_URL.test(ret)) {
      if (/http/.test(ret)) {
        ret = ret.substr(ret.indexOf('http'))
      } else {
        ret = urljoin(MY_URL, ret)
      }
    }
    return ret
  },
}
/**
 *  pdfh原版优���,能取style属性里的图片链接
 * @param html 源码
 * @param parse 解析表达式
 * @returns {string|*}
 */
function pdfh2(html, parse) {
  let html2 = html
  try {
    if (typeof html !== 'string') {
      html2 = html.rr(html.ele).toString()
    }
  } catch (e) {
    print('html对象转文本发生了错误:' + e.message)
  }
  let result = defaultParser.pdfh(html2, parse)
  let option = parse.includes('&&')
    ? parse.split('&&').slice(-1)[0]
    : parse.split(' ').slice(-1)[0]
  if (/style/.test(option.toLowerCase()) && /url\(/.test(result)) {
    try {
      result = result.match(/url\((.*?)\)/)[1]
      // 2023/07/28新增 style取内部链接自动去除首尾单双引号
      result = result.replace(/^['|"](.*)['|"]$/, '$1')
    } catch (e) {}
  }
  return result
}

/**
 * pdfa原版优化,可以转换jq的html对象
 * @param html
 * @param parse
 * @returns {*}
 */
function pdfa2(html, parse) {
  let html2 = html
  try {
    if (typeof html !== 'string') {
      html2 = html.rr(html.ele).toString()
    }
  } catch (e) {
    print('html对象转文本发生了错误:' + e.message)
  }
  return defaultParser.pdfa(html2, parse)
}

/**
 * pd原版方法重写-增加自动urljoin
 * @param html
 * @param parse
 * @param uri
 * @returns {*}
 */
function pd2(html, parse, uri) {
  let ret = pdfh2(html, parse)
  if (typeof uri === 'undefined' || !uri) {
    uri = ''
  }
  if (DOM_CHECK_ATTR.test(parse) && !SPECIAL_URL.test(ret)) {
    if (/http/.test(ret)) {
      ret = ret.substr(ret.indexOf('http'))
    } else {
      ret = urljoin(MY_URL, ret)
    }
  }
  // MY_URL = getItem('MY_URL',MY_URL);
  // console.log(`规则${RKEY}打印MY_URL:${MY_URL},uri:${uri}`);
  return ret
}

function urljoin(base, url) {
  base = base || ''
  url = url || ''
  let baseU = new Uri(base.trim().rstrip('/'))
  url = url.trim().rstrip('/')
  let u = undefined
  if (url.startsWith('http://') || url.startsWith('https://')) {
    u = new Uri(url)
  } else if (url.startsWith('://')) {
    u = new Uri(baseU.protocol() + url)
  } else if (url.startsWith('//')) {
    u = new Uri(baseU.protocol() + ':' + url)
  } else {
    u = new Uri(
      baseU.protocol() +
        '://' +
        baseU.host() +
        (baseU.port() ? ':' + baseU.port() : '') +
        '/' +
        url,
    )
  }
  if ((!u.path() || u.path().trim().length === 0) && baseU.path())
    u.path(baseU.path())
  if (!u.query() && baseU.query()) u.query(baseU.query())
  return u.toString()
}
var urljoin2 = urljoin
/**
 * 获取链接的host(带http��议的完整链接)
 * @param url 任意一个正常完整的Url,自动提取根
 * @returns {string}
 */
function getHome(url) {
  if (!url) {
    return ''
  }
  let tmp = url.split('//')
  url = tmp[0] + '//' + tmp[1].split('/')[0]
  try {
    url = decodeURIComponent(url)
  } catch (e) {}
  return url
}
//========编码���解码=======

function urlencode(str) {
  str = (str + '').toString()
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/%20/g, '+')
}

function base64Encode(text) {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text))
  // return text
}

function base64Decode(text) {
  return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(text))
  // return text
}

function md5(text) {
  return CryptoJS.MD5(text).toString()
}

/**
 * 强制正序算法
 * @param lists  待正序列表
 * @param key 正序键
 * @param option 单个元素处理函数
 * @returns {*}
 */
function forceOrder(lists, key, option) {
  let start = Math.floor(lists.length / 2)
  let end = Math.min(lists.length - 1, start + 1)
  if (start >= end) {
    return lists
  }
  let first = lists[start]
  let second = lists[end]
  if (key) {
    try {
      first = first[key]
      second = second[key]
    } catch (e) {}
  }
  if (option && typeof option === 'function') {
    try {
      first = option(first)
      second = option(second)
    } catch (e) {}
  }
  first += ''
  second += ''
  // console.log(first,second);
  if (first.match(/(\d+)/) && second.match(/(\d+)/)) {
    let num1 = Number(first.match(/(\d+)/)[1])
    let num2 = Number(second.match(/(\d+)/)[1])
    if (num1 > num2) {
      lists.reverse()
    }
  }
  return lists
}
/**
 * 字符串按指定编码
 * @param input
 * @param encoding
 * @returns {*}
 */
function encodeStr(input, encoding) {
  encoding = encoding || 'gbk'
  if (encoding.startsWith('gb')) {
    const strTool = gbkTool()
    input = strTool.encode(input)
  }
  return input
}

/**
 * 字符串指定解码
 * @param input
 * @param encoding
 * @returns {*}
 */
function decodeStr(input, encoding) {
  encoding = encoding || 'gbk'
  if (encoding.startsWith('gb')) {
    const strTool = gbkTool()
    input = strTool.decode(input)
  }
  return input
}

function getCryptoJS() {
  // return request('https://ghproxy.net/https://raw.githubusercontent.com/hjdhnx/dr_py/main/libs/crypto-hiker.js');
  return 'console.log("CryptoJS已装载");'
}

// 封装的RSA加解密类
const RSA = {
  encode: function (data, key, option) {
    // log('encode');
    if (typeof rsaEncrypt === 'function') {
      if (!option || typeof option !== 'object') {
        return rsaEncrypt(data, key)
      } else {
        return rsaEncrypt(data, key, option)
      }
    } else {
      return false
    }
  },
  decode: function (data, key, option) {
    // log('decode');
    if (typeof rsaDecrypt === 'function') {
      if (!option || typeof option !== 'object') {
        return rsaDecrypt(data, key)
      } else {
        return rsaDecrypt(data, key, option)
      }
    } else {
      return false
    }
  },
}
function setResult(d) {
  if (!Array.isArray(d)) {
    return []
  }
  VODS = []
  // print(d);
  d.forEach(function (it) {
    let obj = {
      vod_id: it.url || '',
      vod_name: it.title || '',
      vod_remarks: it.desc || '',
      vod_content: it.content || '',
      vod_pic: it.pic_url || it.img || '',
    }
    let keys = Object.keys(it)
    if (keys.includes('tname')) {
      obj.type_name = it.tname || ''
    }
    if (keys.includes('tid')) {
      obj.type_id = it.tid || ''
    }
    if (keys.includes('year')) {
      obj.vod_year = it.year || ''
    }
    if (keys.includes('actor')) {
      obj.vod_actor = it.actor || ''
    }
    if (keys.includes('director')) {
      obj.vod_director = it.director || ''
    }
    if (keys.includes('area')) {
      obj.vod_area = it.area || ''
    }
    VODS.push(obj)
  })
  return VODS
}
//判断是否正版
function IsLegal(vipUrl) {
  let flag = new RegExp(
    'qq.com|iqiyi.com|youku.com|mgtv.com|bilibili.com|sohu.com|ixigua.com|pptv.com|miguvideo.com|le.com|1905.com|fun.tv',
  )
  return flag.test(vipUrl)
}
function tellIsJx(url) {
  try {
    let is_vip = !/\.(m3u8|mp4|m4a)$/.test(url.split('?')[0]) && IsLegal(url)
    return is_vip ? 1 : 0
  } catch (e) {
    return 1
  }
}

const parseTags = {
  jsp: {
    pdfh: pdfh2,
    pdfa: pdfa2,
    pd: pd2,
  },
  json: {
    pdfh(html, parse) {
      if (!parse || !parse.trim()) {
        return ''
      }
      if (typeof html === 'string') {
        // print('jsonpath:pdfh字符串转dict');
        html = JSON.parse(html)
      }
      parse = parse.trim()
      if (!parse.startsWith('$.')) {
        parse = '$.' + parse
      }
      parse = parse.split('||')
      for (let ps of parse) {
        let ret = cheerio.jp(ps, html)
        if (Array.isArray(ret)) {
          ret = ret[0] || ''
        } else {
          ret = ret || ''
        }
        if (ret && typeof ret !== 'string') {
          ret = ret.toString()
        }
        if (ret) {
          return ret
        }
      }
      return ''
    },
    pdfa(html, parse) {
      if (!parse || !parse.trim()) {
        return ''
      }
      if (typeof html === 'string') {
        // print('jsonpath:pdfa字符串转dict');
        html = JSON.parse(html)
      }
      parse = parse.trim()
      if (!parse.startsWith('$.')) {
        parse = '$.' + parse
      }
      let ret = cheerio.jp(parse, html)
      if (Array.isArray(ret) && Array.isArray(ret[0]) && ret.length === 1) {
        return ret[0] || []
      }
      return ret || []
    },
    pd(html, parse) {
      let ret = parseTags.json.pdfh(html, parse)
      if (ret) {
        return urljoin(MY_URL, ret)
      }
      return ret
    },
  },
  jq: {
    pdfh(html, parse, base_url) {
      if (!parse || !parse.trim()) {
        return ''
      }
      let eleFind = typeof html === 'object'
      let option = undefined
      if (eleFind && parse.startsWith('body&&')) {
        parse = parse.substr(6)
        if (parse.indexOf('&&') < 0) {
          option = parse.trim()
          parse = '*=*'
        }
      }
      if (parse.indexOf('&&') > -1) {
        let sp = parse.split('&&')
        option = sp[sp.length - 1]
        sp.splice(sp.length - 1)
        if (sp.length > 1) {
          for (let i in sp) {
            //Javascript自定义Array.prototype干扰for-in循环
            if (sp.hasOwnProperty(i)) {
              if (!SELECT_REGEX.test(sp[i])) {
                sp[i] = sp[i] + ':eq(0)'
              }
            }
          }
        } else {
          if (!SELECT_REGEX.test(sp[0])) {
            sp[0] = sp[0] + ':eq(0)'
          }
        }
        parse = sp.join(' ')
      }
      let result = ''
      const $ = eleFind ? html.rr : cheerio.load(html)
      let ret = eleFind
        ? parse === '*=*' || $(html.ele).is(parse)
          ? html.ele
          : $(html.ele).find(parse)
        : $(parse)
      if (option) {
        if (option === 'Text') {
          result = $(ret).text()
        } else if (option === 'Html') {
          result = $(ret).html()
        } else {
          result = $(ret).attr(option)
          if (/style/.test(option.toLowerCase()) && /url\(/.test(result)) {
            try {
              result = result.match(/url\((.*?)\)/)[1]
              // 2023/07/28新增 style取内部链接自动去除首尾单双引号
              result = result.replace(/^['|"](.*)['|"]$/, '$1')
            } catch (e) {}
          }
        }
        if (
          result &&
          base_url &&
          DOM_CHECK_ATTR.test(option) &&
          !SPECIAL_URL.test(result)
        ) {
          if (/http/.test(result)) {
            result = result.substr(result.indexOf('http'))
          } else {
            result = urljoin(base_url, result)
          }
        }
      } else {
        result = $(ret).toString()
      }
      return result
    },
    pdfa(html, parse) {
      if (!parse || !parse.trim()) {
        print('!parse')
        return []
      }
      let eleFind = typeof html === 'object'
      // print('parse前:'+parse);
      if (parse.indexOf('&&') > -1) {
        let sp = parse.split('&&')
        for (let i in sp) {
          if (sp.hasOwnProperty(i)) {
            if (!SELECT_REGEX_A.test(sp[i]) && i < sp.length - 1) {
              if (sp[i] !== 'body') {
                // sp[i] = sp[i] + ':eq(0)';
                sp[i] = sp[i] + ':first'
              }
            }
          }
        }
        parse = sp.join(' ')
      }
      // print('parse后:'+parse);
      const $ = eleFind ? html.rr : cheerio.load(html)
      let ret = eleFind
        ? $(html.ele).is(parse)
          ? html.ele
          : $(html.ele).find(parse)
        : $(parse)
      let result = []
      // print('outerHTML:');
      // print($(ret[0]).prop("outerHTML"));
      if (ret) {
        ret.each(function (idx, ele) {
          result.push({ rr: $, ele: ele })
          // result.push({ rr: $, ele: $(ele).prop("outerHTML")}); // 性能贼差
        })
      }
      return result
    },
    pd(html, parse, uri) {
      return parseTags.jq.pdfh(html, parse, MY_URL)
    },
  },
  getParse(p0) {
    //非js开头的情况自动获取解析标签
    if (p0.startsWith('jsp:')) {
      return this.jsp
    } else if (p0.startsWith('json:')) {
      return this.json
    } else if (p0.startsWith('jq:')) {
      return this.jq
    } else {
      return this.jq
    }
  },
}
//全局
globalThis.request = request

// ============运行============

let cfg_data = R_File('./config.js')
cfg = JSON.parse(
  eval(
    cfg_data +
      `
JSON.stringify(cfg)
  `,
  ),
)
rule = init(cfg.test_file)
//全局
globalThis.rule = rule
globalThis.cfg = cfg
//函数
globalThis.printGreen = printGreen
globalThis.printGrey = printGrey
globalThis.encodeUrl = urlencode
globalThis.urlencode = urlencode
//可以在rule中使用的变量与函数
globalThis.jsp = parseTags.jsp
globalThis.log = print
globalThis.print = print
globalThis.jq = parseTags.jq
globalThis.pdfh = undefined
globalThis.pdfa = undefined
globalThis.pd = undefined
globalThis.setResult = setResult
//解析
globalThis.searchParse = searchParse
globalThis.JxSearch = searchParse
globalThis.detailParse = detailParse
globalThis.JxDetail = detailParse
globalThis.playDetail = playParse
globalThis.JxPlay = playParse
