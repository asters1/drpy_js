import './tools.js'
var input
var vod = {}
var test_play_url = ''
var test_play_flag = ''

if (cfg.skip_request) {
  vod = cfg.vod
} else {
  if (cfg.search_switch) {
    printGreen('\r\n================搜索=================\r\n')
    rule.pg = cfg.test_page
    rule.wd = cfg.search_keyword
    var res_search = JSON.parse(await JxSearch(rule))
    // #print(res)
    for (let i = 0; i < res_search.list.length; i++) {
      let V = res_search.list[i]
      printGreen('序号:  ' + i)
      // printGrey('序号==>' + i)
      printGreen('名称:  ' + V['vod_name'])
      printGreen(' ID :  ' + V['vod_id'])
      printGrey('封面:  ' + V['vod_pic'])
      printGrey('描述:  ' + V['vod_remarks'])
      if (i == cfg.test_vod_index) {
        vod = V
      }
    }
  } else {
  }
}

printGreen('\r\n你测试的视频是:' + vod['vod_name'] + '[' + vod['vod_id'] + ']')
printGreen('================二级=================\r\n')
rule.orId = vod['vod_id']
rule.input = vod['vod_id']
rule.tab_exclude = '猜你|喜欢|下载|剧情|热播'
var res_detail = JSON.parse(await JxDetail(rule))

printGrey('\n//视频ID(vod_id)')
printGreen(res_detail.vod_id)
printGrey('\n//视频名称(vod_name)')
printGreen(res_detail.vod_name)
printGrey('\n//视频封面(vod_pic)')
printGreen(res_detail.vod_pic)
printGrey('\n//类型(type_name)')
printGreen(res_detail.type_name)
printGrey('\n//年份(vod_year)')
printGreen(res_detail.vod_year)
printGrey('\n//地区(vod_area)')
printGreen(res_detail.vod_area)
printGrey('\n//提示信息(vod_remarks)')
printGreen(res_detail.vod_remarks)
printGrey('\n//主演(vod_actor)')
printGreen(res_detail.vod_actor)
printGrey('\n//导演(vod_director)')
printGreen(res_detail.vod_director)
printGrey('\n//简介(vod_content)')
printGreen(res_detail.vod_content)
printGrey('\n//视频播放列表')
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

printGreen('\r\n测试的播放URL是:' + test_play_url)
printGreen('\r\n测试的播放flag是:' + test_play_flag)
printGreen('\r\n================lazy=================\r\n')
var playObj = { url: test_play_url, flag: test_play_flag, flags: [] }
playObj.input = test_play_url
JxPlay(playObj)

// console.log(test_play_url)
// console.log(test_play_flag)
