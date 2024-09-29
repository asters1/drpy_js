package ottos

import (
	"fmt"

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
