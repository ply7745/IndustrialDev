import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('./views/Dashboard.vue')
  },
  {
    path: '/mes',
    name: 'MES',
    component: () => import('./views/MES.vue')
  },
  {
    path: '/wms',
    name: 'WMS',
    component: () => import('./views/WMS.vue')
  },
  {
    path: '/qms',
    name: 'QMS',
    component: () => import('./views/QMS.vue')
  },
  {
    path: '/ems',
    name: 'EMS',
    component: () => import('./views/EMS.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router