var rule = {
  title: `追剧5网`,
  // host:'https://v.ikanbot.com',
  host: 'https://zhuiju4.cc',
  url: '/hot/index-fyclass-fyfilter-p-fypage.html[/hot/index-fyclass-fyfilter.html]',
  //https://www.ikanbot.com/search?q=%E6%96%97%E7%BD%97%E5%A4%A7&p=2
  // searchUrl:'/search?q=**&p=fypage',
  searchUrl: '/search/**----------fypage---/',
  searchable: 2,
  quickSearch: 0,
  filterable: 1,
  filter_url: '{{fl.tag}}',
  图片来源:
    '@Referer=https://v.ikanbot.com/@User-Agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  //图片替换: "//=>http://",
  filter: {
    movie: [
      {
        key: 'tag',
        name: '标签',
        value: [
          { n: '热门', v: '热门' },
          { n: '最新', v: '最新' },
          { n: '经典', v: '经典' },
          { n: '豆瓣高分', v: '豆瓣高分' },
          { n: '冷门佳片', v: '冷门佳片' },
          { n: '华语', v: '华语' },
          { n: '欧美', v: '欧美' },
          { n: '韩国', v: '韩国' },
          { n: '日本', v: '日本' },
          { n: '动作', v: '动作' },
          { n: '喜剧', v: '喜剧' },
          { n: '爱情', v: '爱情' },
          { n: '科幻', v: '科幻' },
          { n: '悬疑', v: '悬疑' },
          { n: '恐怖', v: '恐怖' },
          { n: '治愈', v: '治愈' },
          { n: '豆瓣top250', v: '豆瓣top250' },
        ],
      },
    ],
    tv: [
      {
        key: 'tag',
        name: '标签',
        value: [
          { n: '热门', v: '热门' },
          { n: '美剧', v: '美剧' },
          { n: '英剧', v: '英剧' },
          { n: '韩剧', v: '韩剧' },
          { n: '日剧', v: '日剧' },
          { n: '国产剧', v: '国产剧' },
          { n: '港剧', v: '港剧' },
          { n: '日本动画', v: '日本动画' },
          { n: '综艺', v: '综艺' },
          { n: '纪录片', v: '纪录片' },
        ],
      },
    ],
  },
  filter_def: {
    movie: { tag: '热门' },
    tv: { tag: '国产剧' },
  },
  filter获取方法: `
  let value = [];
  $('ul').eq(2).find('li').each(function() {
    // console.log($(this).text());
    let n = $(this).text().trim();
    value.push({
      'n': n, 'v': n
    });
  });
  // 电影执行:
  let data = {'movie': [{'key': 'tag', 'name': '标签', 'value': value}]};
  console.log(JSON.stringify(data));

  //剧集执行:
  let data = {'tv': [{'key': 'tag', 'name': '标签', 'value': value}]};
  console.log(JSON.stringify(data));
  `,
  // headers: '',
  headers: { 'User-Agent': 'IOS_UA', Referer: 'https://zhuiju4.cc' },
  class_name: '电影&剧集',
  class_url: 'movie&tv',
  play_parse: true,
  double: true,
  tab_remove: [
    'wjm3u8',
    'ikm3u8',
    'sdm3u8',
    'M3U8',
    'jinyingm3u8',
    'fsm3u8',
    'ukm3u8',
  ], //移除某个线路及相关的选集
  tab_order: [
    'bfzym3u8',
    '1080zyk',
    'kuaikan',
    'lzm3u8',
    'ffm3u8',
    'snm3u8',
    'qhm3u8',
    'gsm3u8',
    'zuidam3u8',
    'bjm3u8',
    'wolong',
    'xlm3u8',
    'yhm3u8',
  ], //线路顺序,按里面的顺序优先，没写的依次排后面
  tab_rename: {
    bfzym3u8: '暴风',
    '1080zyk': '优质',
    kuaikan: '快看',
    lzm3u8: '量子',
    ffm3u8: '非凡',
    snm3u8: '索尼',
    qhm3u8: '奇虎',
    haiwaikan: '海外看',
    gsm3u8: '光速',
    zuidam3u8: '最大',
    bjm3u8: '八戒',
    wolong: '卧龙',
    xlm3u8: '新浪',
    yhm3u8: '樱花',
    tkm3u8: '天空',
    jsm3u8: '极速',
    wjm3u8: '无尽',
    sdm3u8: '闪电',
    kcm3u8: '快车',
    jinyingm3u8: '金鹰',
    fsm3u8: '飞速',
    tpm3u8: '淘片',
    lem3u8: '鱼乐',
    dbm3u8: '百度',
    tomm3u8: '番茄',
    ukm3u8: 'U酷',
    ikm3u8: '爱坤',
    hnzym3u8: '红牛资源',
    hnm3u8: '红牛',
    '68zy_m3u8': '68',
    kdm3u8: '酷点',
    bdxm3u8: '北斗星',
    hhm3u8: '豪华',
    kbm3u8: '快播',
  }, //线路名替换如:lzm3u8替换为量子资源
  推荐: '.v-list;div.item;*;*;*;*', //这里可以为空，这样点播不会有内容
  // 一级:'.v-list&&div.item;p&&Text;img&&src;;a&&href', //一级的内容是推荐或者点播时候的一级匹配
  一级: '.v-list&&div.item;p&&Text;img&&data-src;;a&&href', //一级的内容是推荐或者点播时候的一级匹配
  // 二级:二级,
  //
  // 或者 {title:'',img:'',desc:'',content:'',tabs:'',lists:'',tab_text:'body&&Text',list_text:'body&&Text',list_url:'a&&href'} 同海阔dr二级

  二级: {
    title: '.fed-deta-content&&h3&&Text',
    img: '.fed-list-pics&&data-original',
    desc: '.fed-list-remarks&&Text',
    content: '.fed-conv-text.fed-padding.fed-text-muted&&Text',
    tabs: '.fed-tabs-boxs&&.fed-tabs-foot&&li',
    lists: '.fed-tabs-btm.fed-padding&&li',
    list_text: 'a&&Text',
  },
  // 二级: `js:
  // // console.log(input)
  // //
  // pdfh = jsp.pdfh;
  // pd = jsp.pd;
  // pdfa = jsp.pdfa;
  // try {
  //   VOD={}
  //   let html1 = request(input);
  //   VOD.vod_id=input;
  //   VOD.vod_name=pdfh(html1,".fed-deta-content&&h3&&Text")
  //   VOD.vod_pic=pd(html1,".fed-list-pics&&data-original")
  //   VOD.vod_actor=pdfh(html1,".fed-deta-content&&.fed-part-rows&&li&&Text").replace("主演：","").trim()
  //   VOD.vod_area=pdfh(html1,".fed-deta-content&&.fed-part-rows&&li:eq(4)&&Text").replace("地区：","").trim()
  //   VOD.vod_year=pdfh(html1,".fed-deta-content&&.fed-part-rows&&li:eq(2)&&a&&Text")
  //   VOD.vod_remarks=pdfh(html1,".fed-list-remarks&&Text")
  //   VOD.vod_director=pdfh(html1,".fed-deta-content&&.fed-part-rows&&li:eq(1)&&Text").replace("导演：","").trim()
  //   VOD.vod_content=pdfh(html1,".fed-conv-text.fed-padding.fed-text-muted&&Text")
  //   let play_from=[]
  //   let pf=pdfa(html1,".fed-tabs-boxs&&.fed-tabs-foot&&li")
  //   for(let i=0;i<pf.length;i++){
  //     let t=pdfh(pf[i],"a&&Text")
  //     play_from.push(t)
  //   }
  //   VOD.vod_play_from = play_from.join('$$$');
  //   let u_list=pdfa(html1,".fed-tabs-btm.fed-padding")
  //   var play_urls=[]
  //   for(let i=0;i<u_list.length;i++){
  //     var source_list=[]
  //
  //     let us=pdfa(u_list[i],"li")
  //     for(let j=0;j<us.length;j++){
  //       let v_n=pdfh(us[j],"a&&Text")
  //       let v_u=pd(us[j],"a&&href")
  //       let data=v_n+"$"+v_u
  //       source_list.push(data)
  //
  //     }
  //     play_urls.push(source_list.join("#"))
  //     // play_from.push(t)
  //
  //   }
  //   // console.log(play_urls)
  //   VOD.vod_play_url=play_urls.join("$$$")
  // } catch (e) {
  //   log('获取二级详情页发生错误:' + e.message)
  // }
  // `,
  // 搜索: '.fed-part-layout&&dl;.fed-part-eone&&Text;.fed-list-pics.fed-lazy&&data-original;.fed-deta-images&&Text;.fed-rims-info&&href', //第一个是列表，第二个是标题，第三个是Pic,第四个是描述，第五个是链接，

  搜索: `js:
  // console.log("aaaa")
  pdfh=jsp.pdfh;
  pdfa=jsp.pdfa;
  pd=jsp.pd;
  var d = [];
  var html = request(input);

  var list=pdfa(html,".fed-part-layout&&dl")
  for(var i=0;i<=list.length-1;i++){
    var v={}
    v.url=pd(list[i],".fed-rims-info&&href")
    v.title=pdfh(list[i],".fed-part-eone&&Text")
    v.desc=pdfh(list[i],".fed-deta-images&&Text")
    v.content=pdfh(list[i],".fed-part-eone&&Text")
    v.img=pd(list[i],".fed-list-pics.fed-lazy&&data-original")
    d.push(v)

    // console.log(JSON.stringify(v))
  }
  setResult(d)





  `, //第一个是列表，第二个是标题，第三个是Pic,第四个是描述，第五个是链接，
  lazy: `js:
  var play_u=""
  var html1=request(input)
  // console.log(html1)
  var play_regex = /player_aaaa=(.*?)</
  var m = html1.match(play_regex)
  if (m) {
    var player_aaaa = JSON.parse(m[1])
    play_u=player_aaaa.url
  }
  input={
    parse:0,
    url:play_u,
    jx:0
  }
  // console.log(input)


`,
  proxy_rule: '',
}
