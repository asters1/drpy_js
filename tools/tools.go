package tools

import "github.com/tidwall/gjson"

func GetJscHeaders(json_headers string) map[string]string {
	headersMap := make(map[string]string)
	keys := gjson.Get(json_headers, "@keys").Array()
	for _, key := range keys {
		headersMap[key.String()] = gjson.Get(json_headers, key.String()).String()
	}

	return headersMap
}
