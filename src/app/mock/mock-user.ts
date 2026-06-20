import { AuthUser } from "../core/models/auth.models";

export const MOCK_USER: AuthUser = {
  id: 'USR001',

  name: 'System Administrator',

  email: 'admin@towerops.com',

  role: 'Super Admin',

  country: 'UAE',

  siteTypes: [
    'towers',
    'buildings',
    'warehouses',
  ],

  permissions: [
    'dashboard.view',

    'towers.view',
    'buildings.view',
    'warehouses.view',

    'alarms.view',
    'workorders.view',
    'maintenance.view',
    'assets.view',
    'reports.view',
    'settings.view',
  ],

  tenant: {
    id: 'TEN001',
    name: 'Etisalat UAE',
    logo: '',
    primaryColor: '#0052ff',
  },
};