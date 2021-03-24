const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const common = require('./webpack.config')
const {
    merge
} = require('webpack-merge')

var env = process.env.NODE_ENV || 'dev',
    flag = env == 'ana';
const prodConfig = merge(common, {
    mode: 'production',
    entry: './src/index.js',
    output: {
        filename: 'js/[name].[hash].js',
        path: path.resolve(__dirname, '../dist'),
        clean: true, //打包前优先清除原打包文件
    },
    resolve: {
        // 配置省略文件路径的后缀名
        extensions: ['*', '.js', '.vue', '.json', '.css', 'ts'],
        alias: {
            '@': path.join(__dirname, '../src')
        }
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
    module: {
        rules: [{
                test: /\.(jpg|png|svg|gif)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        esModule: false,
                        limit: 20 * 1000,
                        fallback: 'file-loader',
                        name: '[name]-[hash:5].min.[ext]',
                        outputPath: '/assets/img/'
                    }
                }]
            },
            {
                test: /\.(eot|woff2?|ttf|svg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        esModule: false,
                        name: '[name]-[hash:5].min.[ext]',
                        limit: 5000,
                        publicPath: '/assets/static/fonts/',
                        outputPath: '/assets/fonts/'
                    }
                }]
            },
        ]
    },
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

});


flag && prodConfig.plugins.push(
    //可视化并分析你的 bundle，检查哪些模块占用空间，哪些可能是重复使用的。
    new BundleAnalyzerPlugin({
        //  可以是`server`，`static`或`disabled`。
        //  在`server`模式下，分析器将启动HTTP服务器来显示软件包报告。
        //  在“静态”模式下，会生成带有报告的单个HTML文件。
        //  在`disabled`模式下，你可以使用这个插件来将`generateStatsFile`设置为`true`来生成Webpack Stats JSON文件。
        analyzerMode: 'server',
        //  将在“服务器”模式下使用的主机启动HTTP服务器。
        analyzerHost: '127.0.0.1',
        //  将在“服务器”模式下使用的端口启动HTTP服务器。
        analyzerPort: 8888,
        //  路径捆绑，将在`static`模式下生成的报告文件。
        //  相对于捆绑输出目录。
        reportFilename: 'report.html',
        //  模块大小默认显示在报告中。
        //  应该是`stat`，`parsed`或者`gzip`中的一个。
        //  有关更多信息，请参见“定义”一节。
        defaultSizes: 'parsed',
        //  在默认浏览器中自动打开报告
        openAnalyzer: true,
        //  如果为true，则Webpack Stats JSON文件将在bundle输出目录中生成
        generateStatsFile: false,
        //  如果`generateStatsFile`为`true`，将会生成Webpack Stats JSON文件的名字。
        //  相对于捆绑输出目录。
        statsFilename: 'stats.json',
        //  stats.toJson（）方法的选项。
        //  例如，您可以使用`source：false`选项排除统计文件中模块的来源。
        //  在这里查看更多选项：https：  //github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
        statsOptions: null,
        logLevel: 'info' // 日志级别。可以是'信息'，'警告'，'错误'或'沉默'。
    }),
);

module.exports = prodConfig;