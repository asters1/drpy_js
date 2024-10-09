package parseJson

import (
	"encoding/json"
	"fmt"
	"os"
	"reflect"
)

func ReflectType(x interface{}) {
	v := reflect.TypeOf(x)
	fmt.Printf("type:%v\n", v)
}
func GetJsonMap(j string) map[string]string {
	M := make(map[string]string)
	json_type, err := json.Marshal(j)
	if err != nil {
		fmt.Println("解析json失败!!")
		fmt.Println(j)
		os.Exit(1)

	}
	json_str := string(json_type)
	fmt.Println(json_str)

	return M
}
