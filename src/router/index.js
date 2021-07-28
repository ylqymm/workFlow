import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router);

export default new Router({
    mode:"history",
    routes: [
        {
            path: '/',
            component: () => import('../views/workFlow.vue'),
            meta: {
                title: '流程设置'
            }
        },
    ]
})