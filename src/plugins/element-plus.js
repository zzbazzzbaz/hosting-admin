import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

export function installElementPlus(app) {
  app.use(ElementPlus, { size: 'default', zIndex: 3000 })

  Object.entries(ElementPlusIconsVue).forEach(([name, component]) => {
    app.component(name, component)
  })
}
