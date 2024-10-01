package ottos

import (
	"drpy_js/tools"
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
	jsp := make(map[string]func(call otto.FunctionCall) otto.Value)
	jsp["pdfh"] = func(call otto.FunctionCall) otto.Value {
		if len(call.ArgumentList) > 2 {
		}
		// html := call.Argument(0).String()
		parse := call.Argument(1).String()
		if !(parse == "") || !(strings.TrimSpace(parse) == "") {
			res, _ := otto.ToValue("")
			return res
		}
		res, _ := otto.ToValue("")
		return res
	}
	jsp["pdfa"] = func(call otto.FunctionCall) otto.Value {
		if len(call.ArgumentList) > 2 {
		}
		html := call.Argument(0).String()
		parse := call.Argument(1).String()
		if !(parse == "") || !(strings.TrimSpace(parse) == "") {
			res, _ := otto.ToValue("")
			return res
		}
		doc, err := goquery.NewDocumentFromReader(strings.NewReader(html))
		if err != nil {
			fmt.Println("goquery加载文档出错!!", err)
			os.Exit(1)
		}

		res, _ := otto.ToValue("")
		return res

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
