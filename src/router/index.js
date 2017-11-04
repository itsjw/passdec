import Vue from 'vue'
import Router from 'vue-router'
import pass from '@/components/pass'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'pass',
      component: pass
    }
  ]
})
