import Vue from 'vue'
import App from './App.vue'
import store from './store'
import _ from "lodash"


import {
    Button
} from "vant";
Vue.use(Button);


new Vue({
    el: '#app',
    store,
    render: h => h(App)
})