# react-antd-lottery
一个通过yarn create react-app react-antd-lottery --template typescript react项目，结合tagcanvas做成了抽奖系统。

最原始版本是下载了一份vue+tagcanvas项目，魔改业务赶鸭子上架应付2019年的年会抽奖，今年重构了一下，原来的项目来源于https://github.com/fouber/lottery

什么是tagcanvas标签云https://www.goat1000.com/tagcanvas.php#links

关于如何在react中使用tagcanvas参考于https://stackoverflow.com/questions/60222556/how-to-import-this-old-library-called-tagcanvas

excel导入导出使用了https://github.com/SheetJS/sheetjs


# 项目在线运行地址(使用github的gh-pages分支进入根目录然后下移到dist):
https://yctjb1.github.io/react-antd-lottery/dist/#/home

### 补充：
虽然页面显示的限制写的超过400人时，实际标签页渲染只截取400人做展示。
实际上只有在远少的多的人数里点开始按钮不会出现明显卡顿，暂时没想到好法子解决。


## 如何使用：
下载后点击dist目录下的index.html即可

## 如何调试(推荐使用yarn):
执行
`yarn install`

`yarn run dev`



