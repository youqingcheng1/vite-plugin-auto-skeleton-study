### vite 插件 
**开发调用rollup 钩子，生产环境直接使用rollup 生命钩子**
开发环境 vite
服务器启动阶段: options和buildStart钩子会在服务启动时被调用。
请求响应阶段: 当浏览器发起请求时，Vite 内部依次调用resolveId、load和transform钩子。
服务器关闭阶段: Vite 会依次执行buildEnd和closeBundle钩子。

Vite 独有的五个钩子
```
config: 用来进一步修改配置。
configResolved: 用来记录最终的配置信息。
configureServer: 用来获取 Vite Dev Server 实例，添加中间件。
transformIndexHtml: 用来转换 HTML 的内容。
handleHotUpdate: 用来进行热更新模块的过滤，或者进行自定义的热更新处理。
```
test-hooks-plugin
```
// test-hooks-plugin.ts
// 注: 请求响应阶段的钩子
// 如 resolveId, load, transform, transformIndexHtml在下文介绍
// 以下为服务启动和关闭的钩子
export default function testHookPlugin () {
  return {
    name: 'test-hooks-plugin', 
    // Vite 独有钩子
    config(config) {
      console.log('config');
    },
    // Vite 独有钩子
    configResolved(resolvedCofnig) {
      console.log('configResolved');
    },
    // 通用钩子
    options(opts) {
      console.log('options');
      return opts;
    },
    // Vite 独有钩子
    configureServer(server) {
      console.log('configureServer');
      setTimeout(() => {
        // 手动退出进程
        process.kill(process.pid, 'SIGTERM');
      }, 3000)
    },
    // 通用钩子
    buildStart() {
      console.log('buildStart');
    },
    // 通用钩子
    buildEnd() {
      console.log('buildEnd');
    },
    // 通用钩子
    closeBundle() {
      console.log('closeBundle');
    }
}
```
Vite 插件的执行顺序
![image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/83c255efbdec4c66971a30ff270c70a9~tplv-k3u1fbpfcp-zoom-in-crop-mark:3024:0:0:0.awebp?)

生产环境
直接使用rollp生命钩子

[vite api插件文档](https://cn.vitejs.dev/guide/api-plugin.html)

[rollup api文档](https://rollupjs.org/introduction/)

[vite 插件文章](https://juejin.cn/book/7050063811973218341/section/7065976180125466638)

[vite-plugin-inspect vite插件检查](https://github.com/antfu/vite-plugin-inspect)

[@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)

[vite 全文章介绍](https://zhuanlan.zhihu.com/p/467325485)

### 注意点
vue-loader、@vitejs/plugin-vue等工具解析SFC文件时，会为对应组件生成scopeId（参考之前的源码分析：从vue-loader源码分析CSS-Scoped的实现），然后通过postcss插件，通过组合选择器实现了类似于css作用域的样式表
```
.card[data-v-xxx] {}
```
我们的生成骨架屏的时机是在开发环境下进行的，这就导致在生产环境下，看到的骨架屏并没有原始样式类对应的尺寸和布局。