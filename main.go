package main

import (
	"drpy_js/f_opt"
	"drpy_js/ottos"
	"drpy_js/tools"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"strings"

	"github.com/tidwall/gjson"

	"github.com/go-yaml/yaml"
)

type config struct {
	extend              string
	filter_switch       bool
	filter_type_index   int
	filter_num_index    int
	search_switch       bool
	search_keyword      string
	test_type_index     int
	test_category_page  string
	test_vod_index      int
	test_vod_from_index int
}

var jsc ottos.JsSource
var cfg config

func Init() {
	InitConfig()
	if len(os.Args) < 2 {
		fmt.Println("请输入测试的drpy_js文件!")
		os.Exit(1)
	}
	js_path := os.Args[1]
	js_str, err := f_opt.R(js_path)
	if err != nil {
		os.Exit(1)
	}
	// fmt.Println(js_str + "\n" + `JSON.stringify(rule)`)
	// kk, _ := ottos.Rtto_normal(js_str + "\n" + `JSON.stringify(rule)`)
	// cmd := exec.Command("node", js_str+`)
	f_opt.W("./cache.js", js_str+`
  console.log(JSON.stringify(rule))`)
	cmd := exec.Command("node", "./cache.js")
	content, err := cmd.Output()
	if err != nil {
		fmt.Println("js文件有误请检查-->", err)
		os.Exit(1)

	}
	js_content := strings.TrimSpace(string(content))
	jsc.Host = gjson.Get(js_content, "host").String()
	jsc.Host = strings.TrimSpace(jsc.Host)
	if string(jsc.Host[len(jsc.Host)-1]) == "/" {
		jsc.Host = jsc.Host[:len(jsc.Host)-1]
	}
	jsc.HomeUrl = gjson.Get(js_content, "homeUrl").String()
	jsc.Url = gjson.Get(js_content, "url").String()
	jsc.Class_name = gjson.Get(js_content, "class_name").String()
	jsc.Class_url = gjson.Get(js_content, "class_url").String()
	jsc.DetailUrl = gjson.Get(js_content, "detailUrl").String()
	jsc.SearchUrl = gjson.Get(js_content, "searchUrl").String()
	jsc.Lazy_js = gjson.Get(js_content, "lazy_js").String()
	jsc.Category_js = gjson.Get(js_content, "一级").String()
	jsc.Detail_js = gjson.Get(js_content, "二级").String()
	jsc.Search_js = gjson.Get(js_content, "搜索").String()
	jsc.Headers = tools.GetJscHeaders(gjson.Get(js_content, "headers").String())
}

// 读取yaml配置文件
func InitConfig() {
	data, err := ioutil.ReadFile("./config.yaml")
	if err != nil {
		fmt.Println("读取config.yaml文件失败!请检查!")
		return
	}
	var obj map[string]interface{}
	err = yaml.Unmarshal(data, &obj)
	if err != nil {
		fmt.Println("解析config.yaml文件失败!请检查!")
	}
	for k, v := range obj {
		switch {
		case k == "extend":
			if str, ok := v.(string); ok {
				cfg.extend = str
			} else {
				fmt.Println("extend不是字符串类型!请检查!")
			}
		case k == "filter_switch":
			if bl, ok := v.(bool); ok {
				cfg.filter_switch = bl
			} else {
				fmt.Println("filter_switch不是bool类型!请检查!")
			}
		case k == "filter_type_index":
			if num, ok := v.(int); ok {
				cfg.filter_type_index = num
			} else {
				fmt.Println("filter_type_index不是int类型!请检查!")
			}
		case k == "filter_num_index":
			if num, ok := v.(int); ok {
				cfg.filter_num_index = num
			} else {
				fmt.Println("filter_num_index不是int类型!请检查!")
			}
		case k == "search_switch":
			if bl, ok := v.(bool); ok {
				cfg.search_switch = bl
			} else {
				fmt.Println("search_switch不是bool类型!请检查!")
			}
		case k == "search_keyword":
			if str, ok := v.(string); ok {
				cfg.search_keyword = str
			} else {
				fmt.Println("search_keyword不是字符串类型!请检查!")
			}
		case k == "test_type_index":
			if num, ok := v.(int); ok {
				cfg.test_type_index = num
			} else {
				fmt.Println("test_type_index不是int类型!请检查!")
			}
		case k == "test_category_page":
			if str, ok := v.(string); ok {
				cfg.test_category_page = str
			} else {
				fmt.Println("test_category_page不是字符串类型!请检查!")
			}
		case k == "test_vod_index":
			if num, ok := v.(int); ok {
				cfg.test_vod_index = num
			} else {
				fmt.Println("test_vod_index不是int类型!请检查!")
			}
		case k == "test_vod_from_index":
			if num, ok := v.(int); ok {
				cfg.test_vod_from_index = num
			} else {
				fmt.Println("test_vod_from_index不是int类型!请检查!")
			}

		}
	}
}
func main() {
	Init()
	vm_jsc := ottos.VM_Init(jsc)
	if cfg.search_switch {

		// fmt.Println(jsc.search_js)
		input := ""
		if strings.HasPrefix(jsc.SearchUrl, "/") {
			input = jsc.Host + jsc.SearchUrl
		} else {
			input = jsc.SearchUrl

		}
		input = strings.ReplaceAll(input, `**`, cfg.search_keyword)
		input = strings.ReplaceAll(input, `fypage`, "1")
		vm_jsc.Set("input", input)
		jsc.Search_js = strings.TrimSpace(jsc.Search_js)
		if strings.HasPrefix(jsc.Search_js, "js:") {
			jsc.Search_js = jsc.Search_js[3:]
			jsc.Search_js = strings.TrimSpace(jsc.Search_js)
		}

		_, err := vm_jsc.Run(jsc.Search_js)
		if err != nil {
			fmt.Println(`res_search, err := vm_jsc.Run(jsc.search_js运行出错!`, err)
			os.Exit(1)
		}
		// fmt.Println(res_search)

		//
		// vm_jsc.Run(`var res=request("https://zhuiju6.cc/search/%E5%89%91%E6%9D%A5----------1---/"   ,{})
		// console.log(res)

		// `)
		fmt.Println("搜索部分")
	} else {

		fmt.Println("home部分")
	}

}
