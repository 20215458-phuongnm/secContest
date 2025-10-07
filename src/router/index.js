import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { isAuthenticated, isUserRole, isAdminRole } from '@/utils/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public routes - no authentication required
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/registration-success',
      name: 'registration-success',
      component: () => import('../views/RegistrationSuccess.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/admin',
      name: 'admin-login',
      component: () => import('../views/AdminLogin.vue'),
      meta: { requiresAuth: false },
    },

    // User routes - require user authentication
    {
      path: '/quiz',
      name: 'quiz',
      component: () => import('../views/QuizView.vue'),
      meta: { requiresAuth: true, requiresRole: 'user' },
    },
    {
      path: '/quiz-questions',
      name: 'quiz-questions',
      component: () => import('../views/QuizQuestionsView.vue'),
      meta: { requiresAuth: true, requiresRole: 'user' },
    },
    {
      path: '/quiz-result',
      name: 'quiz-result',
      component: () => import('../views/QuizResultView.vue'),
      meta: { requiresAuth: true, requiresRole: 'user' },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true, requiresRole: 'user' },
    },

    // Admin routes - require admin authentication
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('../views/AdminDashboard.vue'),
      meta: { requiresAuth: true, requiresRole: 'admin' },
    },
    {
      path: '/admin/upload',
      name: 'admin-upload',
      component: () => import('../views/AdminUpload.vue'),
      meta: { requiresAuth: true, requiresRole: 'admin' },
    },
    {
      path: '/admin/questions',
      name: 'admin-questions',
      component: () => import('../views/AdminQuestions.vue'),
      meta: { requiresAuth: true, requiresRole: 'admin' },
    },
  ],
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth
  const requiredRole = to.meta.requiresRole
  const authenticated = isAuthenticated()

  console.log('Navigation guard:', {
    to: to.name,
    requiresAuth,
    requiredRole,
    authenticated,
    userRole: isUserRole() ? 'user' : isAdminRole() ? 'admin' : null,
  })

  // If route doesn't require auth, allow access
  if (!requiresAuth) {
    next()
    return
  }

  // If route requires auth but user is not authenticated
  if (!authenticated) {
    console.log('User not authenticated, redirecting to login')
    next({ name: 'home' })
    return
  }

  // If route requires specific role
  if (requiredRole) {
    if (requiredRole === 'user' && !isUserRole()) {
      console.log('User role required but user is not a user, redirecting')
      if (isAdminRole()) {
        next({ name: 'admin-dashboard' })
      } else {
        next({ name: 'home' })
      }
      return
    }

    if (requiredRole === 'admin' && !isAdminRole()) {
      console.log('Admin role required but user is not admin, redirecting')
      if (isUserRole()) {
        next({ name: 'quiz' })
      } else {
        next({ name: 'home' })
      }
      return
    }
  }

  // All checks passed, allow navigation
  next()
})

export default router
