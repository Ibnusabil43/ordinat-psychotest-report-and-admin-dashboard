import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/HomePage.vue'),
      meta: { transition: 'fade' }
    },
    {
      path: '/user-portal',
      name: 'UserPortal',
      component: () => import('@/views/UserLanding.vue'),
      meta: { transition: 'slide-up' }
    },
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: () => import('@/views/AdminLogin.vue'),
      meta: { transition: 'fade' }
    },
    {
      path: '/admin/dashboard',
      name: 'AdminDashboard',
      component: () => import('@/views/AdminDashboard.vue'),
      meta: { requiresAuth: true, role: 'admin', transition: 'slide-left' }
    },
    {
      path: '/admin/registration',
      name: 'AdminRegistration',
      component: () => import('@/views/AdminRegistration.vue'),
      meta: { requiresAuth: true, role: 'admin', transition: 'slide-left' }
    },
    {
      path: '/admin/upload',
      name: 'AdminUpload',
      component: () => import('@/views/AdminUpload.vue'),
      meta: { requiresAuth: true, role: 'admin', transition: 'slide-left' }
    },
    {
      path: '/admin/settings',
      name: 'AdminSettings',
      component: () => import('@/views/AdminSettings.vue'),
      meta: { requiresAuth: true, role: 'admin', transition: 'slide-left' }
    },
    {
      path: '/tester',
      name: 'TesterPortal',
      component: () => import('@/views/TesterPortal.vue'),
      meta: { requiresAuth: true, role: 'tester', transition: 'slide-up' }
    }
  ]
})

// Navigation guard for authentication
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth) {
    if (!authStore.isLoggedIn) {
      next({ name: 'EmployeeLogin' })
      return
    }
    
    if (to.meta.role && authStore.userRole !== to.meta.role) {
      // Redirect to appropriate dashboard based on role
      if (authStore.userRole === 'admin') {
        next({ name: 'AdminDashboard' })
      } else if (authStore.userRole === 'tester') {
        next({ name: 'TesterPortal' })
      } else {
        next({ name: 'EmployeeLogin' })
      }
      return
    }
  }
  
  next()
})

export default router
