package parseJson

import (
	"fmt"
	"os"
	"reflect"

	"github.com/tidwall/gjson"
)

func ReflectType(x interface{}) {
	v := reflect.TypeOf(x)
	fmt.Printf("type:%v\n", v)
}
func GetSearchJsonMap(j string) []map[string]string {
	// var M map[string]string
	var result []map[string]string
	gj := gjson.Parse(j)
	g_bl := gj.IsArray()
	if !g_bl {
		fmt.Println("search结果解析出错，请检查!未满足Array")
		os.Exit(1)

	}
	gj_list := gj.Array()
	for i := 0; i < len(gj_list); i++ {

		V := make(map[string]string)
		V["vod_id"] = gj_list[i].Get("vod_id").String()
		V["vod_name"] = gj_list[i].Get("vod_name").String()
		V["vod_pic"] = gj_list[i].Get("vod_pic").String()
		V["vod_remarks"] = gj_list[i].Get("vod_remarks").String()
		V["vod_content"] = gj_list[i].Get("vod_content").String()

		result = append(result, V)
	}
	// fmt.Println(result)

	return result
}
