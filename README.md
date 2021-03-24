##环境说明：

```js
webpack 5.x
vue 2.6
node v14.15.0
yarn 1.22.10
```

## 创建一个通用的工程化项目

#### 1、安装使用 yarn 作为包管理工具

#### 2、使用 yarn init 初始化一个 package.json 文件

#### 3、yarn add webpack --dev

&nbsp;&nbsp; --dev 表示开发依赖 打包类、编译类的放到此目录下 默认--save 安装到生产依赖目录下

#### 4、yarn add webpack-cli --dev

#### 5、webpack.config.js 配置项

```js
output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, 'dist/js'),
},
// [hash] - 本应用中任意文件更新，都会导致所有输出包名变化

// [chunkhash] - 本应用中有几个模块更新，导致几个模块包名变化

// [contenthash:8] - 本应用打包输出文件级别的更新，导致输出文件名变化 数字表示截取长度
```

#### 6、package.json 配置打包相关命令和入口

```js
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build:prod": "set NODE_ENV=prod&& webpack --progress --config build/webpack.prod.js"
},
//  set 设置环境变量
//  webpack是编译命令 --progress显示打包过程 --config后面跟编译的配置文件

```

#### 7、基础配置|开发环境配置|生产配置

```js
webpack.config.js;
webpack.dev.js;
webpack.prod.js;
```

踩坑的地方：
1、配置了 babel-loader，但是没有生效，打包的文件依然是 ES6 语法，网上各种百度，各种方法都尝试了还是不行，因为我用的是 webpack5.x webpack 官方有个[target](https://webpack.docschina.org/configuration/target/)
如下配置即可，填上这个属性以后就可以在 IE11 正常打开了

```js
module.exports = {
  // ...
  target: ["web", "es5"],
};
```

2、url-loader 在处理图片的时候，在针对小于 limit 限制的时候，把图片转成 base64，替换到 js 里面，针对大于限制的则启用 file-loader 将文件拷贝到静态资源 assets/img 下，开发环境只需要配置 file-loader 即可，针对
生产环境才配置 url-loader 处理，配置了 url-loader 就不要再配置 file-loader.

3、包和包之间的关系很难理清除，经常是版本不兼容，或者不匹配，建议多看官方文档

## 靓点

#### 1、使用了变量注入插件

```js
    new webpack.DefinePlugin({ // 每一对键值都会被注入到代码当中
        API_BASE_URL: '"https: //api.example.com"' //传入字符串
    }),
```

#### 2、编译后的 js 自动替换到 html 模板中

```js
    new HtmlWebpackPlugin({
        // title: '管理输出', //网页title
        template: path.resolve(__dirname, '../src/index.html'), //源模板文件 必须要配置
    }),
```

#### 3、使用了 dllPlugin 打包第三方插件 缩短 webapck 打包时间

```js
    //webpack.config.js

    //DllReferencePlugin项的参数有如下：
    //context: manifest文件中请求的上下文。
    //manifest: 编译时的一个用于加载的JSON的manifest的绝对路径。
    //context: 请求到模块id的映射(默认值为 manifest.content)
    //name: dll暴露的地方的名称(默认值为manifest.name)
    //scope: dll中内容的前缀。
    //sourceType: dll是如何暴露的libraryTarget。
    new webpack.DllReferencePlugin({
        context: __dirname,
        manifest: require('../vender-manifest.json')
    }),

    //webpack.dll.js
    const path = require('path');
    const webpack = require('webpack');
    module.exports = {
        entry: {
            vender: ['vue', 'lodash', 'element-ui'],
        },
        output: {
            path: path.join(__dirname, '../public/dll'),
            filename: '[name].dll.js',
            library: '[name]_library'
        },
        //DllPlugin 插件有三个配置项参数如下：
        //context(可选)： manifest文件中请求的上下文，默认为该webpack文件上下文。
        //name: 公开的dll函数的名称，和 output.library保持一致。
        //path: manifest.json 生成文件的位置和文件名称。
        plugins: [
            new webpack.DllPlugin({
                path: path.join(__dirname, '../', '[name]-manifest.json'),
                name: '[name]_library'
            })
        ]
    }

    //package.json
    "dll": "webpack --config build/webpack.dll.js"

```

#### 4、热更新功能

```js
    devServer: {
        contentBase: path.join(__dirname, '../dist'), //本地服务器所加载的页面所在的目录
        historyApiFallback: true, //不跳转
        host: 'localhost',
        port: 9898,
        inline: true, //实时刷新
        hot: true, //Enable webpack's Hot Module Replacement feature
        compress: true, //Enable gzip compression for everything served
        overlay: true, //用于在浏览器输出编译错误的，默认是关闭的
        stats: "errors-only", //To show only errors in your bundle
        open: false, //When open is enabled, the dev server will open the browser.
        quiet: true, // lets WebpackDashboard do its thing
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                pathRewrite: {
                    "^/api": ""
                }
            }
        } //重定向
    },
    plugins: [
        //热更新
        new webpack.HotModuleReplacementPlugin()
    ],
```

#### 5、打包清除原文件功能 | 复制静态资源文件功能

```js
    output: {
        filename: 'js/[name].[hash].js',
        path: path.resolve(__dirname, '../dist'),
        clean: true, //打包前优先清除原打包文件
    },
    plugins: [
        new CleanWebpackPlugin(),
        // 开发中尽量不要使用这个插件
        // 因为开发中会频繁的执行打包任务
        // 当静态资源比较多或比较大时，打包中的开销就会比较大，降低开发效率
        // 一般都在上线前使用该插件
        new CopyWebpackPlugin({
            patterns: [{
                from: 'public',
                to: "../dist"
            }],
        }),
    ],
```

#### 6、分包功能 | tree-shaking 摇晃树

```js
    //webpack.prod.js
    optimization: {
        usedExports: true,
        minimize: true, //告知 webpack 使用 UglifyJsPlugin 或其它在 optimization.minimizer 定义的插件压缩 bundle。
        minimizer: [new UglifyJsPlugin()],
        concatenateModules: true, //尽可能将全部模块合并输出到一个函数中，既提升了运行效率，有降低了代码体积
        //拆包
        splitChunks: {
            chunks: 'all', //这表明将选择哪些 chunk 进行优化。当提供一个字符串，有效值为 all，async 和 initial。设置为 all 可能特别强大，因为这意味着 chunk 可以在异步和非异步 chunk 之间共享。
            minSize: 40000, //表示被拆分出的 bundle 在拆分之前的体积的最小数值，只有 >= minSize 的 bundle 会被拆分出来；大于30kb会被拆分
            minRemainingSize: 0,
            maxSize: 100000, //告诉 webpack 尝试将大于 maxSize 个字节的 chunk 分割成较小的部分。 这些较小的部分在体积上至少为 minSize（仅次于 maxSize）
            minChunks: 1, //拆分前必须共享模块的最小 chunks 数。模块至少使用的次数
            maxAsyncRequests: 5, //用来表示其能拆分按需加载的模块的最大数量；被多次引入、体积大的那个模块或多个模块集会被打包出来
            maxInitialRequests: 3, //入口点的最大并行请求数
            automaticNameDelimiter: '~',
            cacheGroups: {
                //cacheGroups 即缓存组，其中的每一项缓存组都可以继承/覆盖之前提到的 splitChunks 参数
                // （如 name、maxSize、minSize、maxInitialRequests、maxAsyncRequests 等），除此之外还额外提供了三个配置，分别为：test, priority 和 reuseExistingChunk。
                // test: 表示要过滤 modules，默认为所有的 modules，可匹配模块路径或 chunk 名字，当匹配到某个 chunk 的名字时，这个 chunk 里面引入的所有 module 都会选中；
                // priority：权重，数字越大表示优先级越高。一个 module 可能会满足多个 cacheGroups 的正则匹配，到底将哪个缓存组应用于这个 module，取决于优先级；
                // reuseExistingChunk：表示是否使用已有的 chunk，true 则表示如果当前的 chunk 包含的模块已经被抽取出去了，那么将不会重新生成新的，即几个 chunk 复用被拆分出去的一个 module；
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    reuseExistingChunk: true,
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true,
                },
            }
        }
    },
```

#### 7、webpack 编译分析

```js
//webpack.prod.js
flag &&
  prodConfig.plugins.push(
    //可视化并分析你的 bundle，检查哪些模块占用空间，哪些可能是重复使用的。
    new BundleAnalyzerPlugin({
      //  可以是`server`，`static`或`disabled`。
      //  在`server`模式下，分析器将启动HTTP服务器来显示软件包报告。
      //  在“静态”模式下，会生成带有报告的单个HTML文件。
      //  在`disabled`模式下，你可以使用这个插件来将`generateStatsFile`设置为`true`来生成Webpack Stats JSON文件。
      analyzerMode: "server",
      //  将在“服务器”模式下使用的主机启动HTTP服务器。
      analyzerHost: "127.0.0.1",
      //  将在“服务器”模式下使用的端口启动HTTP服务器。
      analyzerPort: 8888,
      //  路径捆绑，将在`static`模式下生成的报告文件。
      //  相对于捆绑输出目录。
      reportFilename: "report.html",
      //  模块大小默认显示在报告中。
      //  应该是`stat`，`parsed`或者`gzip`中的一个。
      //  有关更多信息，请参见“定义”一节。
      defaultSizes: "parsed",
      //  在默认浏览器中自动打开报告
      openAnalyzer: true,
      //  如果为true，则Webpack Stats JSON文件将在bundle输出目录中生成
      generateStatsFile: false,
      //  如果`generateStatsFile`为`true`，将会生成Webpack Stats JSON文件的名字。
      //  相对于捆绑输出目录。
      statsFilename: "stats.json",
      //  stats.toJson（）方法的选项。
      //  例如，您可以使用`source：false`选项排除统计文件中模块的来源。
      //  在这里查看更多选项：https：  //github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
      statsOptions: null,
      logLevel: "info", // 日志级别。可以是'信息'，'警告'，'错误'或'沉默'。
    })
  );
```

## 使用说明

#### 1、yarn install 安装项目所需依赖

#### 2、yarn dev 开发环境

#### 3、yarn build:prod 生产打包
