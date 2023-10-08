import { createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from "../views/HomePage.vue";
export const routes: Array<RouteRecordRaw> = [
     {
          path: '/',
          name: 'homePage',
          component: Home,
          meta: {
               displayName: "首页",
               hideSelf: true,
               requiresAuth: false,
          }
     },
]
const router = createRouter({
     routes,
     history: createWebHashHistory(import.meta.env.BASE_URL),
     linkActiveClass: "active"
})


export default router
