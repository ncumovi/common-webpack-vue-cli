import 'babel-polyfill';
import Vue from 'vue'
import App from './App.vue'
import store from './store'
import _ from "lodash"
import axios from 'axios'
import VueAxios from 'vue-axios'
import router from './router/router'


Vue.use(VueAxios, axios)

import {
    Button,
    Icon
} from "vant";
Vue.use(Button);
Vue.use(Icon);


new Vue({
    el: '#app',
    store,
    router,
    render: h => h(App)
})