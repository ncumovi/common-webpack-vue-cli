const path = require('path');
const webpack = require('webpack');
// const config = require('../config');

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