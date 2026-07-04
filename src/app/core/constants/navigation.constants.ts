export type NavigationItem = {
  label: string;
  path: string;
  icon: string;
  description: string;
  roles?: string[];
  keywords?: string[];
};

export type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

export const NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: 'pi pi-chart-line',
        description: 'Platform overview',
      },
      {
        label: 'Activity',
        path: '/activity',
        icon: 'pi pi-history',
        description: 'System activity logs',
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        label: 'Tenants',
        path: '/tenants',
        icon: 'pi pi-building',
        description: 'Manage tenant accounts',
        roles: ['SUPER_ADMIN'],
      },
      {
        label: 'Sites',
        path: '/sites',
        icon: 'pi pi-map-marker',
        description: 'Towers, buildings, warehouses',
      },
      {
        label: 'Devices',
        path: '/devices',
        icon: 'pi pi-microchip',
        description: 'Connected field devices',
      },
      {
        label: 'Network Map',
        path: '/map',
        icon: 'pi pi-map',
        description: 'Live map monitoring',
      },
      {
        label: 'Alerts',
        path: '/alerts',
        icon: 'pi pi-bell',
        description: 'Raised sensor events',
      },
      {
        label: 'Alarms',
        path: '/alarms',
        icon: 'pi pi-exclamation-triangle',
        description: 'Operational alarms',
      },
      {
        label: 'Tickets',
        path: '/tickets',
        icon: 'pi pi-ticket',
        description: 'Fault tickets',
      },
      {
        label: 'Work Orders',
        path: '/work-orders',
        icon: 'pi pi-clipboard',
        description: 'Technician workflow',
      },
      {
        label: 'Approvals',
        path: '/approvals',
        icon: 'pi pi-check-square',
        description: 'Closure approvals',
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        label: 'Users',
        path: '/users',
        icon: 'pi pi-users',
        description: 'User management',
      },
      {
        label: 'Technicians',
        path: '/technicians',
        icon: 'pi pi-wrench',
        description: 'Field workforce',
      },
      {
        label: 'Roles',
        path: '/roles',
        icon: 'pi pi-lock',
        description: 'Access control',
      },
      {
        label: 'Rule Engine',
        path: '/rules',
        icon: 'pi pi-sitemap',
        description: 'Sensor rules',
      },
      {
        label: 'Configurations',
        path: '/configurations',
        icon: 'pi pi-cog',
        description: 'Platform settings',
      },
      {
        label: 'Notifications',
        path: '/notifications',
        icon: 'pi pi-send',
        description: 'Email, SMS, WhatsApp',
      },
    ],
  },
];