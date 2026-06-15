export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },

  towers: {
    list: '/towers',
    detail: (id: string | number) => `/towers/${id}`,
    create: '/towers',
    update: (id: string | number) => `/towers/${id}`,
    delete: (id: string | number) => `/towers/${id}`,
  },

  alarms: {
    list: '/alarms',
    detail: (id: string | number) => `/alarms/${id}`,
  },

  workOrders: {
    list: '/work-orders',
    detail: (id: string | number) => `/work-orders/${id}`,
  },
};