package tools

import (
	"strings"

	"github.com/tidwall/gjson"
)

const MOBILE_UA = "Mozilla/5.0 (Linux; Android 11; M2007J3SC Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045714 Mobile Safari/537.36"
const PC_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36"
const UA = "Mozilla/5.0"
const UC_UA = "Mozilla/5.0 (Linux; U; Android 9; zh-CN; MI 9 Build/PKQ1.181121.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.5.5.1035 Mobile Safari/537.36"
const IOS_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"

func GetJscHeaders(json_headers string) map[string]string {
	headersMap := make(map[string]string)
	keys := gjson.Get(json_headers, "@keys").Array()
	for _, key := range keys {
		value := strings.TrimSpace(gjson.Get(json_headers, key.String()).String())
		switch {
		case value == "MOBILE_UA":
			value = MOBILE_UA

		case value == "PC_UA":
			value = PC_UA
		case value == "UA":
			value = UA
		case value == "UC_UA":
			value = UC_UA
		case value == "IOS_UA":
			value = IOS_UA

		}

		headersMap[key.String()] = value
	}

	return headersMap
}
