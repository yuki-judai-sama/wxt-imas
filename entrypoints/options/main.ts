import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Options from './Options.vue'

const app = createApp(Options)
app.use(ElementPlus)
app.mount('#app')
