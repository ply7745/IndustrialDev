import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('./views/Dashboard.vue')
  },
  {
    path: '/employee',
    name: 'Employee',
    component: () => import('./views/Employee.vue')
  },
  {
    path: '/company',
    name: 'Company',
    component: () => import('./views/Company.vue')
  },
  {
    path: '/position',
    name: 'Position',
    component: () => import('./views/Position.vue')
  },
  {
    path: '/salary',
    name: 'Salary',
    component: () => import('./views/Salary.vue')
  },
  {
    path: '/application',
    name: 'Application',
    component: () => import('./views/Application.vue')
  },
  {
    path: '/notification',
    name: 'Notification',
    component: () => import('./views/Notification.vue')
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