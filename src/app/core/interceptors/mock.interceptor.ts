import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { UserType } from '../enums/user-type.enum';

export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;

  // Intercept Login
  if (url.includes('/auth/login')) {
    let body: any = {};
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    } catch (e) {}

    const username = (body.username || '').trim().toLowerCase();

    if (username === 'superadmin' || username === 'tenantadmin' || username === 'admin' || username === 'technician') {
      let userType = UserType.TENANT_ADMIN;
      let roles = ['TENANT_ADMIN'];
      let tenantId = 'TENANT-1';
      let userId = 2;

      if (username === 'superadmin') {
        userType = UserType.SUPER_ADMIN;
        roles = ['SUPER_ADMIN'];
        tenantId = 'DEFAULT';
        userId = 1;
      } else if (username === 'technician') {
        userType = UserType.TECHNICIAN;
        roles = ['TECHNICIAN'];
        tenantId = 'TENANT-1';
        userId = 3;
      } else if (username === 'admin') {
        userType = UserType.ADMIN;
        roles = ['ADMIN'];
        tenantId = 'TENANT-1';
        userId = 4;
      }

      const responseData = {
        token: `demo-${username}-token`,
        username: username,
        tenantId: tenantId,
        userId: userId,
        userType: userType,
        roles: roles,
        permissions: ['*'],
      };

      return of(
        new HttpResponse({
          status: 200,
          body: {
            timestamp: Date.now(),
            success: true,
            message: 'Mock login successful',
            data: responseData,
          },
        })
      );
    }
  }

  // Intercept other requests if we have a demo token active
  const token = localStorage.getItem('token');
  const isDemo = token?.startsWith('demo-') || req.headers.get('Authorization')?.includes('Bearer demo-');

  if (isDemo) {
    // Return mock data for general requests to keep the UI from throwing errors
    if (url.includes('/api/sites') || url.includes('/sites')) {
      const mockSites = [
        {
          id: 9001,
          siteCode: 'TW-UAE-001',
          siteName: 'Dubai Marina Tower',
          category: 'TOWER',
          address: {
            street: 'Dubai Marina',
            city: 'Dubai',
            state: 'Dubai',
            postalCode: '00000',
            country: 'UAE',
          },
          latitude: 25.08,
          longitude: 55.14,
          description: 'Demo telecom tower site in Dubai Marina.',
          enabled: true,
          active: true,
        },
        {
          id: 9002,
          siteCode: 'TW-UAE-002',
          siteName: 'Abu Dhabi Corniche Tower',
          category: 'TOWER',
          address: {
            street: 'Corniche Road',
            city: 'Abu Dhabi',
            state: 'Abu Dhabi',
            postalCode: '00000',
            country: 'UAE',
          },
          latitude: 24.4667,
          longitude: 54.3667,
          description: 'Demo tower site in Abu Dhabi.',
          enabled: true,
          active: true,
        },
        {
          id: 9003,
          siteCode: 'TW-UAE-003',
          siteName: 'Sharjah Industrial Tower',
          category: 'TOWER',
          address: {
            street: 'Industrial Area',
            city: 'Sharjah',
            state: 'Sharjah',
            postalCode: '00000',
            country: 'UAE',
          },
          latitude: 25.3463,
          longitude: 55.4209,
          description: 'Demo tower site in Sharjah.',
          enabled: true,
          active: true,
        },
        {
          id: 9101,
          siteCode: 'TW-QA-001',
          siteName: 'Doha West Bay Tower',
          category: 'TOWER',
          address: {
            street: 'West Bay',
            city: 'Doha',
            state: 'Doha',
            postalCode: '00000',
            country: 'Qatar',
          },
          latitude: 25.3284,
          longitude: 51.531,
          description: 'Demo telecom tower site in Doha.',
          enabled: true,
          active: false,
        },
        {
          id: 9102,
          siteCode: 'TW-QA-002',
          siteName: 'Lusail Marina Tower',
          category: 'TOWER',
          address: {
            street: 'Lusail Marina',
            city: 'Lusail',
            state: 'Al Daayen',
            postalCode: '00000',
            country: 'Qatar',
          },
          latitude: 25.4173,
          longitude: 51.5113,
          description: 'Demo tower site in Lusail.',
          enabled: true,
          active: true,
        },
        {
          id: 9201,
          siteCode: 'BL-UAE-001',
          siteName: 'Dubai Internet City Building',
          category: 'BUILDING',
          address: {
            street: 'DIC Road',
            city: 'Dubai',
            state: 'Dubai',
            postalCode: '00000',
            country: 'UAE',
          },
          latitude: 25.074,
          longitude: 55.152,
          description: 'Demo building site in Dubai.',
          enabled: true,
          active: true,
        },
        {
          id: 9301,
          siteCode: 'WH-UAE-001',
          siteName: 'Jebel Ali Logistics Warehouse',
          category: 'WAREHOUSE',
          address: {
            street: 'Jafza East',
            city: 'Dubai',
            state: 'Dubai',
            postalCode: '00000',
            country: 'UAE',
          },
          latitude: 24.983,
          longitude: 55.085,
          description: 'Demo warehouse site in Jebel Ali.',
          enabled: true,
          active: true,
        }
      ];

      // If it's a specific site detail request (e.g. /api/sites/9001)
      const matches = url.match(/\/sites\/(\d+)/);
      if (matches) {
        const id = parseInt(matches[1], 10);
        const site = mockSites.find(s => s.id === id) || mockSites[0];
        return of(new HttpResponse({
          status: 200,
          body: {
            timestamp: Date.now(),
            success: true,
            message: 'Success',
            data: site,
          }
        }));
      }

      // If it's a category request (e.g. /api/sites/category/TOWER)
      const catMatches = url.match(/\/category\/([A-Z_]+)/);
      if (catMatches) {
        const category = catMatches[1];
        const filtered = mockSites.filter(s => s.category === category);
        return of(new HttpResponse({
          status: 200,
          body: {
            timestamp: Date.now(),
            success: true,
            message: 'Success',
            data: filtered,
          }
        }));
      }

      return of(new HttpResponse({
        status: 200,
        body: {
          timestamp: Date.now(),
          success: true,
          message: 'Success',
          data: mockSites,
        }
      }));
    }

    // Default response structure for other endpoints
    let mockData: any = [];

    if (url.includes('/users')) {
      mockData = [
        { id: 1, userCode: 'USR-001', userType: 'SUPER_ADMIN', username: 'superadmin', email: 'superadmin@towerops.io', roleIds: [1], enabled: true, phoneNumber: '+1234567890', address: { street: 'Main St', city: 'Dubai', state: 'Dubai', postalCode: '00000', country: 'UAE' }, active: true },
        { id: 2, userCode: 'USR-002', userType: 'TENANT_ADMIN', username: 'tenantadmin', email: 'tenantadmin@towerops.io', roleIds: [2], enabled: true, phoneNumber: '+1234567891', address: { street: 'Sheikh Zayed Rd', city: 'Dubai', state: 'Dubai', postalCode: '00000', country: 'UAE' }, active: true },
        { id: 3, userCode: 'USR-003', userType: 'TECHNICIAN', username: 'technician', email: 'technician@towerops.io', roleIds: [3], enabled: true, phoneNumber: '+1234567892', address: { street: 'Industrial Area', city: 'Sharjah', state: 'Sharjah', postalCode: '00000', country: 'UAE' }, active: true }
      ];
    } else if (url.includes('/devices')) {
      mockData = [
        { id: 1, deviceId: 'DEV-001', deviceName: 'Transmitter Alpha', status: 'ACTIVE', serialNumber: 'SN-001', ipAddress: '192.168.1.10', macAddress: '00:11:22:33:44:55', siteId: 9001, deviceModelId: 1, enabled: true },
        { id: 2, deviceId: 'DEV-002', deviceName: 'Receiver Beta', status: 'ACTIVE', serialNumber: 'SN-002', ipAddress: '192.168.1.11', macAddress: '00:11:22:33:44:56', siteId: 9002, deviceModelId: 1, enabled: true },
        { id: 3, deviceId: 'DEV-003', deviceName: 'Gateway Gamma', status: 'OFFLINE', serialNumber: 'SN-003', ipAddress: '192.168.1.12', macAddress: '00:11:22:33:44:57', siteId: 9003, deviceModelId: 2, enabled: true }
      ];
    } else if (url.includes('/device-models')) {
      mockData = [
        { id: 1, modelCode: 'MDL-TX100', modelName: 'Transmitter Controller', category: 'CONTROLLER', description: 'Transmitter controller unit' },
        { id: 2, modelCode: 'MDL-GW500', modelName: 'Industrial Gateway', category: 'GATEWAY', description: 'Heavy duty gateway' }
      ];
    } else if (url.includes('/roles')) {
      mockData = [
        { id: 1, roleCode: 'SUPER_ADMIN', roleName: 'Super Administrator', description: 'Access to all platform settings', permissions: ['*'] },
        { id: 2, roleCode: 'TENANT_ADMIN', roleName: 'Tenant Admin', description: 'Manage NOC Operations', permissions: ['read:all', 'write:all'] },
        { id: 3, roleCode: 'TECHNICIAN', roleName: 'Technician', description: 'Field Technician Access', permissions: ['read:assigned', 'write:assigned'] }
      ];
    } else if (url.includes('/permissions')) {
      mockData = [
        { id: 1, permissionCode: '*', permissionName: 'Full Access', description: 'Wildcard permission' }
      ];
    }

    return of(
      new HttpResponse({
        status: 200,
        body: {
          timestamp: Date.now(),
          success: true,
          message: 'Success',
          data: mockData,
        },
      })
    );
  }

  return next(req);
};
