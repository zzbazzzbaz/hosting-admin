import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import pinia from './stores'
import { installElementPlus } from './plugins/element-plus'

import './assets/main.css'

const app = createApp(App)

app.use(pinia)
installElementPlus(app)
app.use(router)

app.mount('#app')
