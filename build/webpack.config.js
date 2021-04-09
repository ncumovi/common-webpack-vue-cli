const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

//使用vue-loader@15以上都需要使用vueloaderplugin这个插件
const {
    VueLoaderPlugin
} = require('vue-loader');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'js/[name].[hash].js',
        publicPath: process.env.NODE_ENV != 'prod' ? '/' : '../dist/',
        path: path.resolve(__dirname, '../dist'),
        clean: true, //打包前优先清除原打包文件
    },
    target: ['web', 'es5'], //← ← ←就是这个
    resolve: {
        // 配置省略文件路径的后缀名
        extensions: ['*', '.js', '.vue', '.json', '.css', 'ts'],
        alias: {
            '@': path.join(__dirname, '../src')
        }
    },
    module: {
        rules: [{
                test: /\.m?js$/,
                include: path.resolve(__dirname, '../src'),
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                useBuiltIns: "usage",
                                corejs: 3,
                                // caller.target will be the same as the target option from webpack
                                targets: {
                                    ie: "11"
                                }
                            }]
                        ],
                        plugins: ['@babel/plugin-proposal-object-rest-spread']
                    }
                }
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.less$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 1
                        }
                    },
                    {
                        loader: "less-loader",
                    }
                ]
            },
            {
                test: /\.vue$/,
                loader: "vue-loader",
                include: path.resolve(__dirname, '../src'),
            },

        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new webpack.DefinePlugin({ // 每一对键值都会被注入到代码当中
            API_BASE_URL: '"https: //api.example.com"' //传入字符串
        }),
        new HtmlWebpackPlugin({
            // title: '管理输出', //网页title
            template: path.resolve(__dirname, '../src/index.html'), //源模板文件
        }),

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
    ],
}