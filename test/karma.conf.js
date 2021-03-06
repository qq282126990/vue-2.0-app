// This is a karma config file. For more details see
//   http://karma-runner.github.io/0.13/config/configuration-file.html
// we are also using it with karma-webpack
//   https://github.com/webpack/karma-webpack

let webpackConfig = require('../build/webpack.test.config.js');

module.exports = function (config) {
      config.set({
            // 指定要运行测试的浏览器，可以指定多个。必须要安装对应的加载器(launcher)，karma 会在调起本地的浏览器。
            browsers: ['Chrome'],
            // 指定使用的测试框架
            frameworks: ['mocha', 'chai'],
            // 这个插件会将每个测试用例的测试结果打印到命令行 console 中。
            reporters: ['spec', 'coverage'],
            // 希望执行的测试文件, 这里的文件会经过 preprocessor 处理后，通过 script 便签添加到测试页面中。
            files: [
                  './index.js'
            ],
            // 使用 webapck 对文件进行编译打包，同时配置 sourcemap 方便调试代码
            preprocessors: {
                  './index.js': ['webpack', 'sourcemap']
            },
            // wepack 配置项
            webpack: webpackConfig,
            webpackMiddleware: {
                  noInfo: true
            },
            // 运行一次后退出，如果设为 true，运行后会默认 watch "files" 中指定的文件，如果有修改会自动重新执行。
            singleRun: false,
            // 浏览器地址
            listenAddress: 'localhost'
      })
}
