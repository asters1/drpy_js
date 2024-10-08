package main

import (
	"drpy_js/f_opt"
	"drpy_js/ottos"
	"drpy_js/parseJson"
	"drpy_js/tools"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"strings"

	"github.com/fatih/color"
	"github.com/robertkrimen/otto"
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
var vm_jsc *otto.Otto

func JXJS(js_str string) string {
	js_str = strings.ReplaceAll(js_str, "let ", "var ")
	js_str = strings.TrimSpace(js_str)
	if strings.HasPrefix(js_str, "js:") {
		js_str = js_str[3:]
		js_str = strings.TrimSpace(js_str)
		res, err := vm_jsc.Run(js_str)
		if err != nil {
			fmt.Println(`JXJS函数运行出错!`, err)
			os.Exit(1)
		}
		return res.String()
	} else {
		return ""
	}

}
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
	green := color.New(color.FgGreen).SprintFunc()

	vm_jsc = ottos.VM_Init(jsc)
	test_vod := make(map[string]string)
	if cfg.search_switch {

		fmt.Println("\r\n================搜索=================\r\n ")
		fmt.Println("你测试的搜索关键字是==>" + cfg.search_keyword + "\r\n")
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
		res_search := JXJS(jsc.Search_js)
		res_search_map := parseJson.GetSearchJsonMap(res_search)
		for i := 0; i < len(res_search_map); i++ {
			fmt.Println("=====================================")
			V := res_search_map[i]
			fmt.Println(green("名称:" + V["vod_name"]))
			fmt.Println(green(" ID :" + V["vod_id"]))
			fmt.Println("封面:" + V["vod_pic"])
			fmt.Println("描述:" + V["vod_remarks"])
			if i == cfg.test_vod_index {
				test_vod = V
			}
		}

	} else {

		fmt.Println("home部分")
	}
	fmt.Println("=====================================")
	fmt.Println(green("你测试的视频名称为==>  " + test_vod["vod_name"]))
	fmt.Println(green("你测试的视频 ID 为==>  " + test_vod["vod_id"]))
	fmt.Println("\r\n================二级=================\r\n ")
	fmt.Println(green("你测试的视频 ID 为==>  " + test_vod["vod_id"]))
	vm_jsc.Set("input", test_vod["vod_id"])
	JXJS(jsc.Detail_js)

}
