package main

import (
	"drpy_js/f_opt"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"strings"

	"github.com/tidwall/gjson"

	"github.com/go-yaml/yaml"
)

type jsSource struct {
	host        string
	homeUrl     string
	url         string
	class_name  string
	class_url   string
	detailUrl   string
	searchUrl   string
	headers     map[string]string
	lazy_js     string
	category_js string
	detail_js   string
	search_js   string
}

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

var jsc jsSource
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
	jsc.host = gjson.Get(js_content, "host").String()
	jsc.homeUrl = gjson.Get(js_content, "homeUrl").String()
	jsc.url = gjson.Get(js_content, "url").String()
	jsc.class_name = gjson.Get(js_content, "class_name").String()
	jsc.class_url = gjson.Get(js_content, "class_url").String()
	jsc.detailUrl = gjson.Get(js_content, "detailUrl").String()
	jsc.searchUrl = gjson.Get(js_content, "searchUrl").String()
	jsc.lazy_js = gjson.Get(js_content, "lazy_js").String()
	jsc.category_js = gjson.Get(js_content, "一级").String()
	jsc.detail_js = gjson.Get(js_content, "二级").String()
	jsc.search_js = gjson.Get(js_content, "搜索").String()
	jsc.headers = getJscHeaders(gjson.Get(js_content, "headers").String())
}
func getJscHeaders(json_headers string) map[string]string {
	headersMap := make(map[string]string)
	keys := gjson.Get(json_headers, "@keys").Array()
	for _, key := range keys {
		headersMap[key.String()] = gjson.Get(json_headers, key.String()).String()
	}

	return headersMap
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
	if cfg.search_switch {

		fmt.Println("搜索部分")
	} else {

		fmt.Println("home部分")
	}

}
