const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const common = require('./webpack.config')
const {
    merge
} = require('webpack-merge')

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map', //开启sourceMap便于追踪定位问题
    resolve: {
        // 配置省略文件路径的后缀名
        extensions: ['*', '.js', '.vue', '.json', '.css', 'ts'],
        alias: {
            '@': path.join(__dirname, '../src')
        }
    },
    module: {
        rules: [{
            test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
            loader: "file-loader",
            options: {
                esModule: false,
                name: "[name].[hash:5].[ext]",
                include: path.resolve(__dirname, '../src'),
            },
        }, ]
    },
    plugins: [
        //热更新
        new webpack.HotModuleReplacementPlugin(),
        new CopyWebpackPlugin({
            patterns: [{
                from: 'public',
                to: "../dist"
            }],
        }),
    ],
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
        open: true, //When open is enabled, the dev server will open the browser.
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
});