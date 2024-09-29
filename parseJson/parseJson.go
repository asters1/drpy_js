package parseJson

import (
	"fmt"
	"reflect"
)

func ReflectType(x interface{}) {
	v := reflect.TypeOf(x)
	fmt.Printf("type:%v\n", v)
}
