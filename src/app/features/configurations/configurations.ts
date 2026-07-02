import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { Drawer } from '../../shared/ui/drawer/drawer';

type ConfigSection =
  | 'General'
  | 'Thresholds'
  | 'Alarm Rules'
  | 'Maintenance'
  | 'Notifications'
  | 'Sites'
  | 'Devices'
  | 'Integrations'
  | 'Security'
  | 'System';

type DrawerMode = 'edit';

@Component({
  selector: 'to-configurations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    SelectModule,
    Drawer,
  ],
  templateUrl: './configurations.html',
  styleUrl: './configurations.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Configurations {

  readonly drawerOpen = signal(false);

  readonly drawerMode = signal<DrawerMode>('edit');

  readonly activeSection =
    signal<ConfigSection>('General');

  readonly sections: ConfigSection[] = [
    'General',
    'Thresholds',
    'Alarm Rules',
    'Maintenance',
    'Notifications',
    'Sites',
    'Devices',
    'Integrations',
    'Security',
    'System',
  ];

  configuration = {

    /* ---------------- General ---------------- */

    tenantName: 'du Telecom',

    language: 'English',

    timezone: 'Asia/Dubai',

    currency: 'AED',

    dateFormat: 'DD/MM/YYYY',

    /* ---------------- Thresholds ---------------- */

    fuelThreshold: 20,

    batteryVoltage: 42,

    temperature: 65,

    signalStrength: -90,

    generatorRuntime: 8,

    /* ---------------- Alarm Rules ---------------- */

    autoTicket: true,

    duplicateWindow: '10 mins',

    criticalEscalation: '5 mins',

    highEscalation: '15 mins',

    autoResolve: '30 mins',

    /* ---------------- Maintenance ---------------- */

    preventiveMaintenance: '30 Days',

    checklistRequired: true,

    photosRequired: true,

    sensorValidation: true,

    approvalRequired: true,

    /* ---------------- Notifications ---------------- */

    email: true,

    sms: true,

    whatsapp: true,

    teams: true,

    slack: false,

    /* ---------------- Sites ---------------- */

    defaultRegion: 'Dubai',

    defaultSiteType: 'Tower',

    defaultTimezone: 'Asia/Dubai',

    /* ---------------- Devices ---------------- */

    pollingInterval: '30 sec',

    heartbeat: '60 sec',

    offlineTimeout: '3 mins',

    /* ---------------- Integrations ---------------- */

    smtp: true,

    mqtt: true,

    azure: true,

    twilio: false,

    webhook: true,

    /* ---------------- Security ---------------- */

    mfa: true,

    passwordPolicy: 'Strong',

    sessionTimeout: '30 mins',

    maxLoginAttempts: 5,

    auditLogs: true,

    /* ---------------- System ---------------- */

    version: 'v1.0.0',

    license: 'Enterprise',

    database: 'Healthy',

    storage: '81% Used',

    backups: 'Daily',

    logs: 'Enabled',

  };

  readonly title = computed(() => this.activeSection());

  readonly description = computed(() => {

    switch (this.activeSection()) {

      case 'General':
        return 'General tenant preferences.';

      case 'Thresholds':
        return 'Operational alarm thresholds.';

      case 'Alarm Rules':
        return 'Alarm conversion and escalation rules.';

      case 'Maintenance':
        return 'Maintenance workflow defaults.';

      case 'Notifications':
        return 'Notification channels and delivery.';

      case 'Sites':
        return 'Default site configuration.';

      case 'Devices':
        return 'IoT polling and heartbeat settings.';

      case 'Integrations':
        return 'External service configuration.';

      case 'Security':
        return 'Authentication and security policies.';

      case 'System':
        return 'System information and health.';

      default:
        return '';
    }

  });
  selectSection(section: ConfigSection): void {
    this.activeSection.set(section);
  }

  openEditDrawer(): void {
    this.drawerMode.set('edit');
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  saveChanges(): void {
    this.closeDrawer();
  }

  resetCurrentSection(): void {
    const section = this.activeSection();

    if (section === 'Thresholds') {
      this.configuration.fuelThreshold = 20;
      this.configuration.batteryVoltage = 42;
      this.configuration.temperature = 65;
      this.configuration.signalStrength = -90;
      this.configuration.generatorRuntime = 8;
    }

    if (section === 'Alarm Rules') {
      this.configuration.autoTicket = true;
      this.configuration.duplicateWindow = '10 mins';
      this.configuration.criticalEscalation = '5 mins';
      this.configuration.highEscalation = '15 mins';
      this.configuration.autoResolve = '30 mins';
    }

    if (section === 'Maintenance') {
      this.configuration.preventiveMaintenance = '30 Days';
      this.configuration.checklistRequired = true;
      this.configuration.photosRequired = true;
      this.configuration.sensorValidation = true;
      this.configuration.approvalRequired = true;
    }
  }

  integrationStatus(enabled: boolean): string {
    return enabled ? 'Configured' : 'Not Configured';
  }

  integrationClass(enabled: boolean): string {
    return enabled ? 'connected' : 'disconnected';
  }
}