import {createApp} from 'vue'
import App from './App.vue'
import router from './router/index'

import '../../src/style/skeleton.scss'
import {initInject} from '../../src/client/index'
import jQuery from 'jquery'


window.jq = jQuery

createApp(App).use(router).mount('#app')

if (import.meta.env.DEV) {
  setTimeout(initInject)
}
