import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import Inspect from 'vite-plugin-inspect'


// @ts-ignore
import {SkeletonPlaceholderPlugin, SkeletonApiPlugin} from '../src/plugins/vitePlugin'


export default defineConfig({
  plugins: [
    // @ts-ignore
    SkeletonPlaceholderPlugin(),
    vue(),
    SkeletonApiPlugin(),
    Inspect() as any
  ],
  build: {
    cssCodeSplit: false
  }
})
