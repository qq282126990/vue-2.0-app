const path = require('path');
const webpack = require('webpack');
// 压缩js
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// 国际化插件
const entry = require('./locale');

process.env.NODE_ENV = 'production';

module.exports = {
      // 整个 source map 作为一个单独的文件生成。它为 bundle 添加了一个引用注释，以便开发工具知道在哪里可以找到它。
      devtool: 'source-map',
      entry,
      module: {
            rules: [
                  {
                        test: /\.js$/,
                        loader: 'babel-loader',
                        options: {
                              sourceMap: true
                        },
                        exclude: /node_modules/
                  }
            ]
      },
      // 输出
      output: {
            path: path.resolve(__dirname, '../dist/locale'),
            publicPath: '/dist/locale',
            filename: '[name].js',
            library: 'ivue/locale',
            // 将你的 library 暴露为所有的模块定义下都可运行的方式。它将在 CommonJS, AMD 环境下运行
            libraryTarget: 'umd',
            // 当使用了 libraryTarget: "umd"，设置：
            umdNamedDefine: true
      },
      // 外部扩展
      externals: {
            vue: {
                  // 可以通过一个全局变量访问 library（例如，通过 script 标签）。
                  root: 'vue',
                  // 可以将 library 作为一个 CommonJS 模块访问。
                  commonjs: 'vue',
                  // 导出的是 module.exports.default.
                  commonjs2: 'vue',
                  // 类似于 commonjs，但使用 AMD 模块系统。
                  amd: 'vue'
            }
      },
      // 插件
      plugins: [
            // 允许创建一个在编译时可以配置的全局常量。这可能会对开发模式和发布模式的构建允许不同的行为非常有用
            new webpack.DefinePlugin({
                  'process.env': {
                        // 因为这个插件直接执行文本替换，给定的值必须包含字符串本身内的实际引号
                        NODE_ENV: '"production"'
                  }
            }),
            new UglifyJsPlugin({
                  // 启用并行化。默认并发运行数
                  parallel: true,
                  sourceMap: true
            })
      ]
}
