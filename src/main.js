import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import tokenManagerPlugin from './plugins/tokenManager'

const app = createApp(App)

app.use(router)
app.use(vuetify)
app.use(tokenManagerPlugin)
app.mount('#app')
