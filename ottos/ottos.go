package ottos

import (
	"drpy_js/tools"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/asters1/goquery"
	"github.com/robertkrimen/otto"
)

func Rtto_normal(js_str string) (string, error) {
	vm := otto.New()
	res, err := vm.Run(js_str)
	if err != nil {
		fmt.Println("otto_normal函数出错-->", err)
		return "", err
	}

	return res.String(), nil

}

type JsSource struct {
	Host        string
	HomeUrl     string
	Url         string
	Class_name  string
	Class_url   string
	DetailUrl   string
	SearchUrl   string
	Headers     map[string]string
	Lazy_js     string
	Category_js string
	Detail_js   string
	Search_js   string
}

func VM_Init(jsc JsSource) *otto.Otto {
	Headers := jsc.Headers

	vm_jsc := otto.New()
	vm_jsc.Set("jsc", jsc)
	// res_func, _ := vm_jsc.Run(`
	vm_jsc.Run(`
  Object.prototype.includes=function(subkey){
    for (var key in this){
      if (this.hasOwnProperty(key)){
        if(this[key]==subkey){
          return true
        }
      }
    }
    return false
  }
  function GetJsArray(jsonString){
    // let a="";
    return JSON.parse(jsonString);
  }
  function setResult(d){
    if(!Array.isArray(d)){
      return JSON.stringify([])
    }
    VODS = [];
    d.forEach(function (it){
      var obj = {
        vod_id:it.url||'',
        vod_name: it.title||'',
        vod_remarks: it.desc||'',
        vod_content: it.content||'',
        vod_pic: it.pic_url||it.img||'',
      };
      var keys = Object.keys(it);
      if(keys.includes('tname')){
        obj.type_name = it.tname||'';
      }
      if(keys.includes('tid')){
        obj.type_id = it.tid||'';
      }
      if(keys.includes('year')){
        obj.vod_year = it.year||'';
      }
      if(keys.includes('actor')){
        obj.vod_actor = it.actor||'';
      }
      if(keys.includes('director')){
        obj.vod_director = it.director||'';
      }
      if(keys.includes('area')){
        obj.vod_area = it.area||'';
      }
      VODS.push(obj);
    });
    return JSON.stringify(VODS)
  }
  `)

	jsp := make(map[string]func(call otto.FunctionCall) otto.Value)
	jsp["pdfh"] = func(call otto.FunctionCall) otto.Value {
		if len(call.ArgumentList) > 2 {
		}
		html := call.Argument(0).String()
		parse := call.Argument(1).String()
		if strings.TrimSpace(parse) == "" {
			fmt.Println("pdfh函数parse为空")
			res, _ := otto.ToValue("")
			return res
		}

		p_find_slice := strings.Split(parse, "&&")
		doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
		if err != nil {
			fmt.Println("goquery加载文档出错!!", err)
			os.Exit(1)
		}
		doc_find := doc.Find("*")
		// fmt.Println(doc_find.String())
		res_str := ""
		for i := 0; i < len(p_find_slice); i++ {
			index := 0
			p_find := ""
			if strings.Contains(p_find_slice[i], ":eq(") {
				p_find = p_find_slice[i][:strings.Index(p_find_slice[i], ":eq(")]
				index, _ = strconv.Atoi(p_find_slice[i][strings.Index(p_find_slice[i], ":eq(")+4 : strings.LastIndex(p_find_slice[i], ")")])

			} else {
				p_find = p_find_slice[i]
			}
			if i == len(p_find_slice)-1 {
				if p_find == "Text" {

					res_str = doc_find.Text()
				} else {

					res_str, _ = doc_find.Attr(p_find)
				}

			} else {
				doc_find = doc_find.Find(p_find).Eq(index)
			}

		}

		if res_str == "" {
			res_str = "pdfh函数返回结果为undefined或者为空"
		}
		res, _ := otto.ToValue(res_str)
		return res
	}
	jsp["pdfa"] = func(call otto.FunctionCall) otto.Value {
		// fmt.Println(len(call.ArgumentList))
		if len(call.ArgumentList) > 2 {
		}
		html := call.Argument(0).String()
		parse := call.Argument(1).String()
		// fmt.Println(html)
		parse = strings.ReplaceAll(parse, "&&", " ")
		// fmt.Println(parse)
		if strings.TrimSpace(parse) == "" {
			fmt.Println("pdfa函数parse为空")
			res, _ := otto.ToValue("")
			return res
		}
		// fmt.Println("ii")
		doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
		if err != nil {
			fmt.Println("goquery加载文档出错!!", err)
			os.Exit(1)
		}
		html_list := []string{}
		doc.Find(parse).Each(func(i int, s *goquery.Selection) {
			html, _ := s.String()
			html_list = append(html_list, html)

		})
		json_html, _ := json.Marshal(html_list)
		// fmt.Println(json_html)
		js_res_array, _ := vm_jsc.Call("GetJsArray", nil, string(json_html))

		return js_res_array

	}
	jsp["pd"] = func(call otto.FunctionCall) otto.Value {
		if len(call.ArgumentList) > 2 {
		}
		html := call.Argument(0).String()
		parse := call.Argument(1).String()
		res, _ := vm_jsc.Call("jsp.pdfh", nil, html, parse)
		res_str := strings.TrimSpace(res.String())

		// fmt.Println(res_str)
		if res_str[:2] == `//` {
			res_str = "http:" + res_str

		} else if strings.HasSuffix(res_str, "/") {
			res_str = jsc.Host + res_str

		}
		result, _ := otto.ToValue(res_str)
		return result

	}

	vm_jsc.Set("jsp", jsp)
	vm_jsc.Set("request", func(call otto.FunctionCall) otto.Value {
		// fmt.Println(call.Argument(0).String())
		// fmt.Println(len(call.ArgumentList))
		// Headers := make(map[string]string)
		if len(call.ArgumentList) > 1 {
			header_obj, err := call.Argument(1).Object().MarshalJSON()
			Headers = tools.GetJscHeaders(string(header_obj))

			if err != nil {
				fmt.Println("request中获得headers失败!!")
				os.Exit(1)

			}
		}

		//===================================
		METHOD := "get"
		URL := call.Argument(0).String()
		FormatData := ""
		DataMap := make(map[string]string)

		//===================================
		if METHOD == "get" {
			METHOD = http.MethodGet
		} else if METHOD == "post" {
			METHOD = http.MethodPost
		}
		for i, j := range DataMap {
			FormatData = FormatData + i + "=" + j + "&"
		}
		if FormatData != "" {
			FormatData = FormatData[:len(FormatData)-1]
		}
		client := &http.Client{}
		request, _ := http.NewRequest(
			METHOD,
			URL,
			strings.NewReader(FormatData),
		)
		request.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36")
		for k, v := range Headers {

			request.Header.Set(k, v)
			// fmt.Println(k,v)

		}
		// fmt.Println(client)
		// fmt.Println(request)
		resp, _ := client.Do(request)
		// fmt.Println(resp)
		body_bit, _ := ioutil.ReadAll(resp.Body)
		defer resp.Body.Close()
		res, _ := vm_jsc.ToValue(string(body_bit))

		return res

	})

	return vm_jsc

}
