import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)



export const constantRoutes = [{
        path: '/home',
        component: () => import('@/views/home'),
    },
    {
        path: '/page',
        component: () => import('@/views/page'),
    },
    {
        path: '/map',
        component: () => import('@/views/map'),
    },
]


const createRouter = () => new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({
        y: 0
    }),
    routes: constantRoutes
})

const router = createRouter()


export default router