package ottos

import (
	"drpy_js/tools"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
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

func VM_Init(Headers map[string]string) *otto.Otto {
	vm_jsc := otto.New()
	// res_func, _ := vm_jsc.Run(`
	vm_jsc.Run(`
function GetJsArray(jsonString){
   return JSON.parse(jsonString);
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

		parse_slice := strings.Split(parse, "&&")
		p_find_slice := parse_slice[:len(parse_slice)-1]
		p_find := strings.Join(p_find_slice, " ")
		// fmt.Println(parse)
		// fmt.Println("ii")
		doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
		if err != nil {
			fmt.Println("goquery加载文档出错!!", err)
			os.Exit(1)
		}
		res_str := ""
		if parse_slice[len(parse_slice)-1] == "Text" {
			fmt.Println("Text")

			res_str = doc.Find(p_find).Text()

		} else {
			fmt.Println("Attr")
			res_str, _ = doc.Find(p_find).Attr(parse_slice[len(parse_slice)-1])

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

		fmt.Println("jsp.pd")
		fmt.Println("jsp.pd")
		fmt.Println("jsp.pd")
		res, _ := otto.ToValue("")
		return res

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
