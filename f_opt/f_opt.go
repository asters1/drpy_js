package f_opt

import (
	"fmt"
	"os"
)

func R(file string) (string, error) {
	content, err := os.ReadFile(file)
	if err != nil {
		fmt.Println("读取文件"+file+"错误!-->", err)
		return "", err
	}
	return string(content), nil

}
func W(file_path string, content string) {
	file, err := os.OpenFile(file_path, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0666)
	if err != nil {
		fmt.Println("打开文件失败-->", err)
		os.Exit(1)
	}
	defer file.Close()
	file.WriteString(content)
}
