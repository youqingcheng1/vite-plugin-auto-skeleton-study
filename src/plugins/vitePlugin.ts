import {Plugin, ViteDevServer} from 'vite'

// @ts-ignore
import bodyParser from 'body-parser'
import {parseVueRequest} from '@vitejs/plugin-vue'
import postcss from 'postcss'
import cssSkeletonGroupPlugin from "./cssSkeletonGroupPlugin";

// @ts-ignore
import fs from 'fs-extra'

const filename = './src/skeleton/content.json'

export function SkeletonPlaceholderPlugin() {
  return {
    name: 'skeleton-placeholder-plugin',
    enforce: 'pre',
    transform(src: string, id: string) {
      // src 源码， id 文件
      if (/\.vue$/.test(id)) {
        let file: Record<any, any>
        try {
          // 解析骨架屏代码为对象
          file = fs.readJsonSync(filename) || {}
        } catch (e) {
          file = {}
        }
        // 约定对应的骨架屏占位符
        // String.replace => 1. 直接替换 2. 参数n2为函数，函数回参是匹配的值
        let code = src.replace(/__SKELETON_(.*?)_CONTENT__/gm, function (match) {
          const record = file[match] || {}
          return record.content || ''
        })

        return {
          code,
          map: null // 如果可行将提供 source map
        }
      }
      return src
    },
  } as Plugin
}

export function SkeletonApiPlugin() {
  async function saveSkeletonContent(name: string, content: string, pathname: string) {
    // 创建文件
    await fs.ensureFile(filename)
    let file
    try {
      // 读取一个 JSON 对象，然后将其解析为一个对象
      file = await fs.readJson(filename)
    } catch (e) {
      file = {}
    }
    content = content.replace(/data-skeleton-.*?=.*?\s/igm, '') // 清空骨架屏标签
      .replace(/data-v-.*?=""/igm, '') // 清空scopeid

    content = `<div class="${name.toLowerCase()}">${content}</div>` // 样式类包裹，不再依赖scopeid对应的样式

    file[name] = {
      content,
      pathname
    }
    // 通过解析将对象写入 JSON 文件。
    await fs.writeJson(filename, file)
  }

  return {
    name: 'skeleton-api-plugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(bodyParser())
      server.middlewares.use('/update_skeleton', async (req: any, res: any, next: any) => {
        const {name, content = '', pathname} = req.body
        await saveSkeletonContent(name, content, pathname)
        // 骨架屏代码更新之后，重启服务
        res.end('success')
        server.restart()
      })
    },
    transform(src: string, id: string) {
      // 返回文件名（完整路径）, query 文件带的参数 { vue: true, type: 'style', index: 0, 'lang.scss': '' }
      const {filename, query} = parseVueRequest(id)
      console.log(filename)
      console.log(query)

      if (query.type === 'style') {
        // @ts-ignore
        const {skeleton} = query
        if (!skeleton) {
          return src
        }
        //vue-loader、 @vitejs/plugin-vue等工具解析SFC文件时，会为对应组件生成scopeId
        const name = `__SKELETON_${skeleton}_CONTENT__`.toLowerCase()
        const result = postcss([cssSkeletonGroupPlugin({wrapSelector: `.${name}`})]).process(src)
        return result.css
      }
      return src
    },
    transformIndexHtml(html: string) {
      let file
      try {
        file = fs.readJsonSync(filename)
      } catch (e) {
        file = {}
      }
      // todo 这里需要实现url正则匹配才行
      const code = `
          <script>
          var map = ${JSON.stringify(file)}
          var pathname = window.location.pathname
          var target = Object.values(map).find(function (row){
            return row.pathname === pathname
          })
          var content = target && target.content || ''
          content && document.write(content)
          </script>
      `
      return html.replace(/__SKELETON_CONTENT__/, code)
    }

  }
}
