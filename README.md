# react-antd-lottery
一个通过yarn create react-app react-antd-lottery --template typescript  创建的react^16.13.1 + react-dom^16.13.1 + antd^4.5.2 + @craco/craco^5.6.4 + craco-less^1.17.0 + react-router^5.2.0的项目， 将来预计开发成一个纯前端的抽奖系统

## 一、搭建与配置

**重点：ts模板下[craco](https://github.com/gsoft-inc/craco)化配置项的create-react-app + antd项目** 

### 1.搭建：

yarn create react-app react-antd-lottery --template typescript

yarn add react-router less-loader @types/react-router antd



### 2.可配置化

 [craco](https://github.com/gsoft-inc/craco) （一个对 create-react-app 进行自定义配置的社区解决方案）。

yarn add @craco/craco

```
/* package.json */
"scripts": {
-   "start": "react-scripts start",
-   "build": "react-scripts build",
-   "test": "react-scripts test",
+   "start": "craco start",
+   "build": "craco build",
+   "test": "craco test",
}
```

然后在项目根目录创建一个 `craco.config.js` 用于修改默认配置。

```
/* craco.config.js */
module.exports = {
  // ...
};
```

### 3.自定义主题（配置.less文件的支持）

yarn add craco-less

并修改 `craco.config.js`文件如下：

```
const CracoLessPlugin = require('craco-less');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { '@primary-color': '#1DA57A' },//不修改主题就注释掉这行
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
```

### 4.打包相关

(1)修改打包后的引用路径：

在package.json中添加	"homepage": "./"

(2)修改快捷引用路径

【在webpack与typescript结合使用的情况下】

```
//craco.config.js中

const path = require('path')
module.exports = {
    reactScriptsVersion: "react-scripts",/* (default value) */
    webpack: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@components': path.resolve(__dirname, 'src/components'),
            '@pages': path.resolve(__dirname, 'src/pages'),
            '@utils': path.resolve(__dirname, 'src/utils')
        }
    },

};

//除了配置craco.config.js中webpack的alias，也需要修改tsconfig.json如下
  "exclude": [
    "node_modules",
    "dist",
    "build"
  ],
  "extends": "./paths.json"
  
//照着extends项所配置的路径，在项目根目录创建paths.json内容如下（这里需要注意两边的/*）
{
    "compilerOptions": {
        "baseUrl": "./",
        "paths": {
            "@/*": ["src/*"],
            "@components/*": ["src/components/*"],
            "@pages/*": ["src/pages/*"],
            "@utils/*": ["src/utils/*"]
        }
    }
}

```

(3)修改打包后的输出文件夹

https://img-blog.csdnimg.cn/20200807081301792.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM1MzA2NzM2,size_16,color_FFFFFF,t_70



