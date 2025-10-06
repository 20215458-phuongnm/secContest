import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/registration-success',
      name: 'registration-success',
      component: () => import('../views/RegistrationSuccess.vue'),
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: () => import('../views/QuizView.vue'),
    },
    {
      path: '/quiz-questions',
      name: 'quiz-questions',
      component: () => import('../views/QuizQuestionsView.vue'),
    },
    {
      path: '/quiz-result',
      name: 'quiz-result',
      component: () => import('../views/QuizResultView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/admin',
      name: 'admin-login',
      component: () => import('../views/AdminLogin.vue'),
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('../views/AdminDashboard.vue'),
    },
    {
      path: '/admin/upload',
      name: 'admin-upload',
      component: () => import('../views/AdminUpload.vue'),
    },
    {
      path: '/admin/questions',
      name: 'admin-questions',
      component: () => import('../views/AdminQuestions.vue'),
    },
  ],
})

export default router
