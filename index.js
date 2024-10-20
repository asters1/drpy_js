import './drpy.js'
var vod = {}
var test_play_url = ''
var test_play_flag = ''
var test_class = {}
var test_filter = {}
// var js_env = {}

console.log('\n正在执行预处理...\n')
// js_env.rule = rule
var init_obj = await JxInit(js_env_path)
try {
  js_env_path.rule = init_obj.rule
} catch {}
try {
  js_env_path.rule_fetch_params = init_obj.rule_fetch_params
} catch {}

// printGreen(JSON.stringify(js_env_path.rule_fetch_params))
console.log('\n================预处理结束=================\n\n')
// process.exit(0)
if (cfg.skip_request) {
  vod = cfg.vod
} else {
  if (cfg.search_switch) {
    printGreen('\n================搜索=================\n\n')
    var searchObj = {}

    searchObj.pg = cfg.test_page
    searchObj.wd = cfg.search_keyword
    searchObj.搜索 = js_env_path.rule.搜索
    searchObj.searchUrl = js_env_path.rule.searchUrl
    var searchEnv = searchObj

    searchEnv.searchObj = JSON.parse(JSON.stringify(searchObj))
    searchEnv.rule = js_env_path.rule
    searchEnv.rule_fetch_params = js_env_path.rule_fetch_params
    var res_search_str = await JxSearch(searchEnv)
    var res_search = JSON.parse(res_search_str)
    if (res_search.list == undefined) {
      console.log('获取搜索列表失败!!')
      console.log(res_search_str)
      process.exit(1)
    }
    // console.log(res_search)
    for (let i = 0; i < res_search.list.length; i++) {
      let V = res_search.list[i]
      printGreen('序号:  ' + i + '\n')
      // printGrey('序号==>' + i)
      printGreen('名称:  ' + V['vod_name'] + '\n')
      printGreen(' ID :  ' + V['vod_id'] + '\n')
      printGrey('封面:  ' + V['vod_pic'] + '\n')
      printGrey('描述:  ' + V['vod_remarks'] + '\n')
      if (i == cfg.test_vod_index) {
        vod = V
      }
    }
  } else {
    printGreen('\n================HOME=================\n')
    var class_name = rule.class_name
    var class_url = rule.class_url
    var filter = rule.filter
    // console.log(filter)
    if (
      class_name == '' ||
      class_url == '' ||
      class_name == undefined ||
      class_url == undefined
    ) {
      console.log(class_name)
      console.log(class_url)
      console.log('class_name或者class_url为空或者未定义')
      process.exit(1)
    }

    var class_name_list = class_name.split('&')
    var class_url_list = class_url.split('&')
    if (class_url_list.length == class_name_list.length) {
      for (let i = 0; i < class_name_list.length; i++) {
        printGreen(
          '\n' + class_name_list[i] + '[' + class_url_list[i] + ']\n\n',
        )
        if (i == cfg.test_type_index) {
          test_class.class_name = class_name_list[i]
          test_class.class_url = class_url_list[i]
        }
        let filter_tag
        try {
          filter_tag = filter[class_url_list[i]]
        } catch {
          filter_tag = undefined
        }
        if (filter_tag == undefined) {
          console.log('筛选未定义')
        } else {
          // let tag_list=filter_tag
          // console.log(JSON.stringify(filter_tag))
          for (let j = 0; j < filter_tag.length; j++) {
            printMagenta(filter_tag[j].name + ' ')
            let t_list = filter_tag[j].value
            for (let k = 0; k < t_list.length; k++) {
              printGreen(k + '.')
              printDefault(t_list[k].n)
              printGrey('[' + t_list[k].n + ']' + ' ')
              if (
                i == cfg.test_type_index &&
                j == cfg.filter_type_index &&
                k == cfg.filter_num_index
              ) {
                test_filter.key = filter_tag[j].key
                test_filter.name = filter_tag[j].name
                test_filter.value = t_list[k]
              }
            }
            printDefault('\n\n')
          }
        }
      }
      printGreen('\n\n你测试的分类是:')
      printMagenta(test_class.class_name + '[' + test_class.class_url + ']\n')
      if (test_filter.key != undefined) {
        printGreen('你测试的筛选是:key->')
        printMagenta(test_filter.key)
        printGreen(',name->')
        printMagenta(test_filter.name)
        printGreen(',value->')
        printMagenta(JSON.stringify(test_filter.value) + '\n')
        test_filter.extend = {}
        test_filter.extend[test_filter.key] = test_filter.value.v

        // {\"url\":\"https://zhuiju4.cc/vodshow/fyclassfyfilter.html\",\"一级\":\"js:/nrequest(/\"http://localhost:8080/one_/\"+JSON.stringify(cateObj))/nrequest(/\"http://localhost:8080/input=/\"+input)/n/n  \",\"tid\":\"movie\",\"pg\":1,\"filter\":true,\"extend\":{}}
      }
      printGreen('================一级=================\n\n')

      var cateObj = {}
      cateObj.url = rule.host + rule.url
      cateObj.一级 = rule.一级
      cateObj.tid = test_class.class_url
      cateObj.pg = cfg.test_page
      cateObj.filter = true
      cateObj.extend = test_filter.extend
      // console.log(test_filter.extend)
      if (cateObj.extend == undefined) {
        cateObj.extend = {}
      }
      var cateEnv = cateObj
      cateEnv.cateObj = JSON.parse(JSON.stringify(cateObj))
      cateEnv.rule = js_env_path.rule
      cateEnv.rule_fetch_params = js_env_path.rule_fetch_params

      // console.log(JSON.stringify(cateObj))
      var res_cate = await JxCategory(cateEnv)
      var res_cate_obj = JSON.parse(res_cate)

      // process.exit(0)
      // console.log(res_cate_obj)
      let vod_list = res_cate_obj.list
      if (res_cate_obj.list == undefined) {
        console.log('获取一级列表失败!!')
        console.log(res_cate)
        process.exit(1)
      }
      for (let i = 0; i < vod_list.length; i++) {
        let V = vod_list[i]
        printGreen('序号:  ' + i + '\n')
        // printGrey('序号==>' + i)
        printGreen('名称:  ' + V['vod_name'] + '\n')
        printGreen(' ID :  ' + V['vod_id'] + '\n')
        printGrey('封面:  ' + V['vod_pic'] + '\n')
        printGrey('描述:  ' + V['vod_remarks'] + '\n')
        if (i == cfg.test_vod_index) {
          vod = V
        }
      }
    } else {
      console.log('class_name和class_url长度不相等，请检查!')
    }
  }
}
if (vod['vod_id'] == 'no_data') {
  process.exit(1)
}
printGreen(
  '\r\n你测试的视频是:' + vod['vod_name'] + '[' + vod['vod_id'] + ']\n',
)
printGreen('================二级=================\n\n')
var detailObj = {}

detailObj.orId = vod['vod_id']
detailObj.input = vod['vod_id']
detailObj.二级 = js_env_path.rule.二级
detailObj.tab_exclude = '猜你|喜欢|下载|剧情|热播'

var detailEnv = detailObj
detailEnv.detailObj = JSON.parse(JSON.stringify(detailObj))
detailEnv.rule = js_env_path.rule
detailEnv.rule_fetch_params = js_env_path.rule_fetch_params
detailEnv.VOD = {}

// process.exit(0)
var res_detail_str = await JxDetail(detailObj)
try {
  var res_detail = JSON.parse(res_detail_str)
} catch {
  console.log('解析二级失败!!\n')
  console.log(res_detail_str)
  process.exit(1)
}
if (
  res_detail.vod_play_from == undefined ||
  res_detail.vod_play_url == undefined
) {
  console.log('vod_play_from或者vod_play_url未定义!!\n')
  console.log(res_detail_str)
  process.exit(1)
}

printGrey('\n//视频ID(vod_id)\n')
printGreen(res_detail.vod_id + '\n')
printGrey('\n//视频名称(vod_name)\n')
printGreen(res_detail.vod_name + '\n')
printGrey('\n//视频封面(vod_pic)\n')
printGreen(res_detail.vod_pic + '\n')
printGrey('\n//类型(type_name)\n')
printGreen(res_detail.type_name + '\n')
printGrey('\n//年份(vod_year)\n')
printGreen(res_detail.vod_year + '\n')
printGrey('\n//地区(vod_area)\n')
printGreen(res_detail.vod_area + '\n')
printGrey('\n//提示信息(vod_remarks)\n')
printGreen(res_detail.vod_remarks + '\n')
printGrey('\n//主演(vod_actor)\n')
printGreen(res_detail.vod_actor + '\n')
printGrey('\n//导演(vod_director)\n')
printGreen(res_detail.vod_director + '\n')
printGrey('\n//简介(vod_content)\n')
printGreen(res_detail.vod_content + '\n')
printGrey('\n//视频播放列表\n')
// printGreen(res_detail.vod_content)
var vod_play_from_list = res_detail.vod_play_from.split('$$$')
var vod_play_url_list = res_detail.vod_play_url.split('$$$')
if (vod_play_from_list.length == vod_play_url_list.length) {
  for (let i = 0; i < vod_play_from_list.length; i++) {
    var play_url_list = vod_play_url_list[i].split('#')
    for (let j = 0; j < play_url_list.length; j++) {
      let vv = play_url_list[j].split('$')
      console.log(vod_play_from_list[i] + ' ==> ' + vv[0] + '[' + vv[1] + ']\n')
      if (i == cfg.test_vod_from_index && j == 0) {
        test_play_url = vv[1]
        test_play_flag = vod_play_from_list[i]
      }
    }
  }
} else {
  console.log('vod_play_from和vod_play_url长度不相等，请检查!')
  process.exit(1)
}

printGreen('\r\n测试的播放URL是:' + test_play_url + '\n')
printGreen('\r\n测试的播放flag是:' + test_play_flag + '\n')
printGreen('\n\n================lazy=================\n\n')
var playObj = { url: test_play_url, flag: test_play_flag, flags: [] }
playObj.input = test_play_url
var playEnv = playObj

playEnv.playObj = JSON.parse(JSON.stringify(playObj))
playEnv.lazy = js_env_path.rule.lazy
playEnv.rule = js_env_path.rule
playEnv.rule_fetch_params = js_env_path.rule_fetch_params
var res_play_str = await JxPlay(playEnv)

// {
//   parse: 1,
//   url: 'https://zhuiju4.cc/vplay/87249-1-1',
//   flag: '追剧①',
//   jx: 0
// }
// {
//   parse: 1,
//   url: 'https://v5.tlkqc.com/wjv5/202410/14/bcBQQXEs
// j677/video/index.m3u8',
//   jx: 0
// }
// console.log(res_play_str)
try {
  var res_play = JSON.parse(res_play_str)
} catch {
  console.log('解析lazy失���!!\n')
  console.log(res_play_str)
  process.exit(1)
}
// console.log(res_play)
// printGreen(res_play)
printGrey('//parse\n')
printGreen(res_play.parse + '\n')
printGrey('//url\n')
printGreen(res_play.url + '\n')
printGrey('//jx\n')
printGreen(res_play.jx + '\n')
