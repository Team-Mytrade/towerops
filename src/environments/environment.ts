export const environment = {
  production: false,
  appName: 'TowerOps',
  apiUrl: '/api',
  useMockApi: true,
  useMockAuth: true,

  realtime: {
    websocketUrl: 'ws://localhost:8080/ws',
    mqtt: {
      brokerUrl: 'ws://localhost:9001/mqtt',
      username: '',
      password: '',
      clientIdPrefix: 'towerops-web',
    },
  },
};