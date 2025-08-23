import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import NewTab from './NewTab.vue'

const app = createApp(NewTab)
app.use(ElementPlus)
app.mount('#app')