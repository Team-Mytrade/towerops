import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

import { Device } from '../../core/services/device.service';
import { Rule, RuleCategory, RulePayload } from '../../core/services/rule.service';
import { Site } from '../../core/services/site.service';
import { AuthService } from '../../core/services/auth.service';

import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';

type DrawerMode = 'view' | 'create';


type RuleScope = 'GLOBAL' | 'TENANT' | 'SITE' | 'DEVICE';
type RuleActionType = 'ALERT' | 'TICKET' | 'NOTIFICATION';
type RuleSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

type RuleDraft = Omit<RulePayload, 'category' | 'definition' | 'deviceId'> & {
  category: RuleCategory;
  scope: RuleScope;
  actionType: RuleActionType;
  severity: RuleSeverity;
  deviceId: string | null;
  definition: any;
};

const STORAGE_KEYS = {
  rules: 'towerops_rules',
  devices: 'towerops_devices',
  sites: 'towerops_sites',
};

@Component({
  selector: 'to-rules',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TableModule,
    Drawer,
    DetailField,
    StatusBadge,
  ],
  templateUrl: './rules.html',
  styleUrl: './rules.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Rules implements OnInit {
  private readonly auth = inject(AuthService);

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly search = signal('');
  readonly enabledFilter = signal<'All' | boolean>('All');

  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<DrawerMode>('view');
  readonly selectedRule = signal<Rule | null>(null);

  readonly rules = signal<Rule[]>([]);
  readonly devices = signal<Device[]>([]);
  readonly sites = signal<Site[]>([]);

  newRule: RuleDraft = this.emptyRuleDraft();

  readonly enabledOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  readonly activeOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  readonly categoryOptions = [
    { label: 'Condition', value: 'CONDITION' },
    { label: 'Regex', value: 'REGEX' },
    { label: 'Threshold', value: 'THRESHOLD' },
    { label: 'Range', value: 'RANGE' },
    { label: 'State Change', value: 'STATE_CHANGE' },
    { label: 'Absence', value: 'ABSENCE' },
    { label: 'Aggregation', value: 'AGGREGATION' },
    { label: 'Schedule', value: 'SCHEDULE' },
    { label: 'Geo Fence', value: 'GEO_FENCE' },
    { label: 'Duplicate', value: 'DUPLICATE' },
    { label: 'Script', value: 'SCRIPT' },
  ];

  readonly severityOptions = [
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
    { label: 'Critical', value: 'CRITICAL' },
  ];

  readonly scopeOptions = [
    { label: 'Global', value: 'GLOBAL' },
    { label: 'Tenant', value: 'TENANT' },
    { label: 'Site', value: 'SITE' },
    { label: 'Device', value: 'DEVICE' },
  ];

  readonly actionTypeOptions = [
    { label: 'Alert', value: 'ALERT' },
    { label: 'Ticket', value: 'TICKET' },
    { label: 'Notification', value: 'NOTIFICATION' },
  ];

  readonly actionTargetOptions = [
    { label: 'Email', value: 'EMAIL' },
    { label: 'SMS', value: 'SMS' },
    { label: 'Log', value: 'LOG' },
    { label: 'System', value: 'SYSTEM' },
    { label: 'Dashboard', value: 'DASHBOARD' },
  ];

  readonly fieldOptions = [
    { label: 'Temperature', value: 'temperature' },
    { label: 'Humidity', value: 'humidity' },
    { label: 'CPU Usage', value: 'cpuUsage' },
    { label: 'Device ID', value: 'deviceId' },
    { label: 'Status', value: 'status' },
    { label: 'Heartbeat', value: 'heartbeat' },
    { label: 'Transaction ID', value: 'transactionId' },
    { label: 'Signal Strength', value: 'signalStrength' },
    { label: 'Fuel Level', value: 'fuelLevel' },
    { label: 'Battery Backup', value: 'batteryBackup' },
    { label: 'Power Status', value: 'powerStatus' },
    { label: 'Generator Status', value: 'generatorStatus' },
  ];

  readonly operatorOptions = [
    { label: 'Equals', value: 'EQ' },
    { label: 'Not Equals', value: 'NE' },
    { label: 'Greater Than', value: 'GT' },
    { label: 'Greater Than / Equal', value: 'GTE' },
    { label: 'Less Than', value: 'LT' },
    { label: 'Less Than / Equal', value: 'LTE' },
  ];

  readonly logicalOperatorOptions = [
    { label: 'AND', value: 'AND' },
    { label: 'OR', value: 'OR' },
  ];

  readonly aggregationTypeOptions = [
    { label: 'Average', value: 'AVG' },
    { label: 'Sum', value: 'SUM' },
    { label: 'Minimum', value: 'MIN' },
    { label: 'Maximum', value: 'MAX' },
    { label: 'Count', value: 'COUNT' },
  ];

  readonly geoEventOptions = [
    { label: 'Enter', value: 'ENTER' },
    { label: 'Exit', value: 'EXIT' },
  ];

  readonly scriptLanguageOptions = [
    { label: 'JavaScript', value: 'javascript' },
    { label: 'Expression', value: 'expression' },
  ];

  readonly siteOptions = computed(() =>
    this.sites().map((site) => ({
      label: `${site.siteCode} · ${site.siteName}`,
      value: site.siteCode,
    })),
  );

  readonly deviceOptions = computed(() =>
    this.devices().map((device) => ({
      label: `${device.deviceId} · ${device.deviceName}`,
      value: device.deviceId,
      siteId: device.siteId,
    })),
  );

  readonly filteredRules = computed(() => {
    const query = this.search().toLowerCase().trim();
    const enabled = this.enabledFilter();

    return this.rules().filter((rule) => {
      const matchesSearch =
        !query ||
        rule.ruleCode?.toLowerCase().includes(query) ||
        rule.name?.toLowerCase().includes(query) ||
        rule.category?.toLowerCase().includes(query) ||
        rule.siteCode?.toLowerCase().includes(query) ||
        String(rule.deviceId ?? '').toLowerCase().includes(query) ||
        rule.actionTarget?.toLowerCase().includes(query);

      const matchesStatus = enabled === 'All' || rule.enabled === enabled;

      return matchesSearch && matchesStatus;
    });
  });

  get drawerTitle(): string {
    if (this.drawerMode() === 'create') return 'Create Rule';
    return this.selectedRule()?.name ?? 'Rule Details';
  }

  get drawerEyebrow(): string {
    if (this.drawerMode() === 'create') return 'Rule Engine';
    return this.selectedRule()?.ruleCode ?? '';
  }

  get drawerSize(): 'compact' | 'wide' {
    return 'wide';
  }

  ngOnInit(): void {
    this.loadMasterData();
  }

  loadMasterData(): void {
    this.loading.set(true);
    this.seedLocalStorageIfEmpty();

    this.devices.set(this.readStorage<Device[]>(STORAGE_KEYS.devices, []));
    this.sites.set(this.readStorage<Site[]>(STORAGE_KEYS.sites, []));
    this.rules.set(this.readStorage<Rule[]>(STORAGE_KEYS.rules, []));

    this.loading.set(false);
  }

  loadRulesForDevice(): void {
    const siteCode = this.newRule.siteCode;
    const deviceId = this.newRule.deviceId;
    const allRules = this.readStorage<Rule[]>(STORAGE_KEYS.rules, []);

    if (!siteCode && !deviceId) {
      this.rules.set(allRules);
      return;
    }

    this.rules.set(
      allRules.filter((rule) => {
        const matchesSite = !siteCode || rule.siteCode === siteCode;
        const matchesDevice = !deviceId || rule.deviceId === deviceId;
        return matchesSite && matchesDevice;
      }),
    );
  }

  openCreateRule(): void {
    this.newRule = this.emptyRuleDraft();
    this.drawerMode.set('create');
    this.selectedRule.set(null);
    this.drawerOpen.set(true);
  }

  openRule(rule: Rule): void {
    this.selectedRule.set(rule);
    this.drawerMode.set('view');
    this.drawerOpen.set(true);
  }

  saveRule(): void {
    if (this.saving()) return;

    const payload = this.normalizePayload();

    if (!payload.ruleCode || !payload.name || !payload.siteCode) return;
    if (payload.scope === 'DEVICE' && !payload.deviceId) return;

    this.saving.set(true);

    const allRules = this.readStorage<Rule[]>(STORAGE_KEYS.rules, []);

    const rule = {
      id: this.nextId(allRules),
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Rule;

    const updatedRules = [rule, ...allRules];

    this.writeStorage(STORAGE_KEYS.rules, updatedRules);
    this.rules.set(updatedRules);

    this.saving.set(false);
    this.closeDrawer();
  }

  addCondition(): void {
    if (!this.newRule.definition.conditions) {
      this.newRule.definition.conditions = [];
    }

    this.newRule.definition.conditions.push({
      field: 'temperature',
      operator: 'GT',
      value: '',
      logicalOperator: 'AND',
    });
  }

  removeCondition(index: number): void {
    this.newRule.definition.conditions.splice(index, 1);
  }

  deleteRule(): void {
    const rule = this.selectedRule();
    if (!rule || this.saving()) return;

    this.saving.set(true);

    const updatedRules = this.readStorage<Rule[]>(STORAGE_KEYS.rules, []).filter(
      (item) => item.id !== rule.id,
    );

    this.writeStorage(STORAGE_KEYS.rules, updatedRules);
    this.rules.set(updatedRules);

    this.saving.set(false);
    this.closeDrawer();
  }

  toggleRuleStatus(): void {
    const rule = this.selectedRule();
    if (!rule || this.saving()) return;

    this.saving.set(true);

    const updated = {
      ...rule,
      enabled: !rule.enabled,
      updatedAt: new Date().toISOString(),
    } as Rule;

    const updatedRules = this.readStorage<Rule[]>(STORAGE_KEYS.rules, []).map(
      (item) => (item.id === updated.id ? updated : item),
    );

    this.writeStorage(STORAGE_KEYS.rules, updatedRules);
    this.rules.set(updatedRules);
    this.selectedRule.set(updated);

    this.saving.set(false);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.drawerMode.set('view');
    this.selectedRule.set(null);
    this.newRule = this.emptyRuleDraft();
  }

  onCategoryChange(category: RuleCategory): void {
    this.newRule.category = category;
    this.newRule.ruleCode = this.generateRuleCode(category);
    this.newRule.definition = this.defaultDefinition(category);

    if (category === 'AGGREGATION' || category === 'SCHEDULE' || category === 'DUPLICATE') {
      this.newRule.scope = 'SITE';
      this.newRule.deviceId = null;
    } else {
      this.newRule.scope = 'DEVICE';
      this.newRule.deviceId = this.newRule.deviceId || '';
    }
  }

  onScopeChange(scope: RuleScope): void {
    this.newRule.scope = scope;

    if (scope !== 'DEVICE') {
      this.newRule.deviceId = null;
    } else {
      this.newRule.deviceId = this.newRule.deviceId || '';
    }
  }

  siteLabel(siteCode: string): string {
    if (!siteCode) return '-';

    const site = this.sites().find((item) => item.siteCode === siteCode);
    return site ? `${site.siteCode} · ${site.siteName}` : siteCode;
  }

  deviceLabel(deviceId: string | null): string {
    if (!deviceId) return '-';

    const device = this.devices().find((item) => item.deviceId === deviceId);
    return device ? `${device.deviceId} · ${device.deviceName}` : deviceId;
  }

  statusLabel(enabled: boolean): string {
    return enabled ? 'Active' : 'Inactive';
  }

  statusTone(enabled: boolean): 'success' | 'muted' {
    return enabled ? 'success' : 'muted';
  }

  severityTone(severity: string): 'danger' | 'warning' | 'info' {
    if (severity === 'CRITICAL' || severity === 'HIGH') return 'danger';
    if (severity === 'MEDIUM') return 'warning';
    return 'info';
  }

  definitionPreview(rule: Rule): string {
    return JSON.stringify(rule.definition ?? {}, null, 2);
  }

  private normalizePayload(): RulePayload {
    return {
      ruleCode: this.newRule.ruleCode.trim(),
      name: this.newRule.name.trim(),
      description: this.newRule.description.trim(),
      category: this.newRule.category,
      scope: this.newRule.scope,
      tenantId: this.newRule.tenantId || this.auth.getTenantId() || 'DEFAULT',
      siteCode: this.newRule.siteCode,
      deviceId: this.newRule.deviceId,
      actionType: this.newRule.actionType,
      actionTarget: this.newRule.actionTarget.trim(),
      severity: this.newRule.severity,
      priority: Number(this.newRule.priority || 1),
      enabled: this.newRule.enabled,
      definition: this.cleanDefinition(this.newRule.category, this.newRule.definition),
    } as RulePayload;
  }

  private emptyRuleDraft(): RuleDraft {
    return {
      ruleCode: this.generateRuleCode('CONDITION'),
      name: '',
      description: '',
      category: 'CONDITION',
      scope: 'DEVICE',
      tenantId: this.auth.getTenantId() || 'DEFAULT',
      siteCode: 'SITE-DOHA-001',
      deviceId: 'DEV-DOHA-001',
      actionType: 'ALERT',
      actionTarget: 'EMAIL',
      severity: 'LOW',
      priority: 1,
      enabled: true,
      definition: this.defaultDefinition('CONDITION'),
    };
  }

  private defaultDefinition(category: RuleCategory): any {
    switch (category) {
      case 'CONDITION':
        return {
          conditions: [
            {
              field: 'temperature',
              operator: 'GT',
              value: '75',
              logicalOperator: 'AND',
            },
            {
              field: 'humidity',
              operator: 'LT',
              value: '60',
              logicalOperator: 'AND',
            },
          ],
        };

      case 'REGEX':
        return {
          field: 'deviceId',
          pattern: '^DEV-[0-9A-Z-]+$',
        };

      case 'THRESHOLD':
        return {
          field: 'cpuUsage',
          operator: 'GT',
          threshold: 85,
          duration: '5m',
        };

      case 'RANGE':
        return {
          field: 'temperature',
          minValue: 20,
          maxValue: 80,
        };

      case 'STATE_CHANGE':
        return {
          field: 'status',
          fromValue: 'RUNNING',
          toValue: 'STOPPED',
        };

      case 'ABSENCE':
        return {
          field: 'heartbeat',
          duration: '10m',
        };

      case 'AGGREGATION':
        return {
          aggregationType: 'AVG',
          field: 'temperature',
          window: '15m',
          operator: 'GT',
          value: 78,
        };

      case 'SCHEDULE':
        return {
          cronExpression: '0 0 9 * * MON-FRI',
        };

      case 'GEO_FENCE':
        return {
          latitude: 25.2854,
          longitude: 51.531,
          radiusMeters: 500,
          event: 'ENTER',
        };

      case 'DUPLICATE':
        return {
          field: 'transactionId',
          window: '1m',
        };

      case 'SCRIPT':
        return {
          language: 'javascript',
          expression: "temperature > 75 && humidity < 60 && status === 'ACTIVE'",
        };
    }
  }

  private cleanDefinition(category: RuleCategory, definition: any): any {
    if (category === 'CONDITION') {
      return {
        conditions: (definition.conditions ?? []).map((condition: any) => ({
          field: condition.field,
          operator: condition.operator,
          value: String(condition.value),
          logicalOperator: condition.logicalOperator || 'AND',
        })),
      };
    }

    if (category === 'THRESHOLD') {
      return {
        field: definition.field,
        operator: definition.operator,
        threshold: Number(definition.threshold || 0),
        duration: definition.duration,
      };
    }

    if (category === 'RANGE') {
      return {
        field: definition.field,
        minValue: Number(definition.minValue || 0),
        maxValue: Number(definition.maxValue || 0),
      };
    }

    if (category === 'AGGREGATION') {
      return {
        aggregationType: definition.aggregationType,
        field: definition.field,
        window: definition.window,
        operator: definition.operator,
        value: Number(definition.value || 0),
      };
    }

    if (category === 'GEO_FENCE') {
      return {
        latitude: Number(definition.latitude || 0),
        longitude: Number(definition.longitude || 0),
        radiusMeters: Number(definition.radiusMeters || 0),
        event: definition.event,
      };
    }

    return { ...definition };
  }

  private seedLocalStorageIfEmpty(): void {
    if (!localStorage.getItem(STORAGE_KEYS.sites)) {
      this.writeStorage(STORAGE_KEYS.sites, this.mockSites());
    }

    if (!localStorage.getItem(STORAGE_KEYS.devices)) {
      this.writeStorage(STORAGE_KEYS.devices, this.mockDevices());
    }

    if (!localStorage.getItem(STORAGE_KEYS.rules)) {
      this.writeStorage(STORAGE_KEYS.rules, this.mockRules());
    }
  }

  private mockSites(): Site[] {
    return [
      {
        id: 1,
        siteCode: 'SITE-DOHA-001',
        siteName: 'Doha Core Telecom Site',
      } as Site,
      {
        id: 2,
        siteCode: 'TW-001',
        siteName: 'Dubai Marina Tower',
      } as Site,
      {
        id: 3,
        siteCode: 'TW-002',
        siteName: 'Business Bay Tower',
      } as Site,
      {
        id: 4,
        siteCode: 'BL-001',
        siteName: 'Abu Dhabi Central Building',
      } as Site,
    ];
  }

  private mockDevices(): Device[] {
    return [
      {
        id: 1,
        deviceId: 'DEV-DOHA-001',
        deviceName: 'Doha Gateway Controller',
        serialNumber: 'SN-DOHA-0001',
        status: 'ACTIVE',
        siteId: 1,
        deviceModelId: 3,
        messageType: 'TELEMETRY',
        firmwareVersion: 'v4.0.2',
        ipAddress: '192.168.10.10',
        macAddress: '00:11:22:33:44:10',
        lastSeen: new Date().toISOString(),
      } as Device,
      {
        id: 2,
        deviceId: 'VEHICLE-001',
        deviceName: 'Restricted Zone Vehicle Tracker',
        serialNumber: 'SN-GEO-0001',
        status: 'ACTIVE',
        siteId: 1,
        deviceModelId: 1,
        messageType: 'TELEMETRY',
        firmwareVersion: 'v1.2.0',
        ipAddress: '192.168.10.12',
        macAddress: '00:11:22:33:44:12',
        lastSeen: new Date().toISOString(),
      } as Device,
      {
        id: 3,
        deviceId: 'DEV-0001',
        deviceName: 'Dubai Marina Gateway',
        serialNumber: 'SN-DXB-0001',
        status: 'ACTIVE',
        siteId: 2,
        deviceModelId: 3,
        messageType: 'TELEMETRY',
        firmwareVersion: 'v4.0.2',
        ipAddress: '192.168.1.10',
        macAddress: '00:11:22:33:44:01',
        lastSeen: new Date().toISOString(),
      } as Device,
      {
        id: 4,
        deviceId: 'DEV-0003',
        deviceName: 'Business Bay Signal Receiver',
        serialNumber: 'SN-BB-0003',
        status: 'MAINTENANCE',
        siteId: 3,
        deviceModelId: 1,
        messageType: 'EVENT',
        firmwareVersion: 'v2.4.1',
        ipAddress: '192.168.2.20',
        macAddress: '00:11:22:33:44:03',
        lastSeen: new Date().toISOString(),
      } as Device,
    ];
  }

  private mockRules(): Rule[] {
    const tenantId = this.auth.getTenantId() || 'DEFAULT';
    const now = new Date().toISOString();

    return [
      {
        id: 1,
        ruleCode: 'TEMP_HIGH_ALERT',
        name: 'High Temperature Alert',
        description: 'Triggers when temperature exceeds threshold and humidity is low.',
        category: 'CONDITION',
        scope: 'DEVICE',
        tenantId,
        siteCode: 'SITE-DOHA-001',
        deviceId: 'DEV-DOHA-001',
        actionType: 'ALERT',
        actionTarget: 'EMAIL',
        severity: 'HIGH',
        priority: 1,
        enabled: true,
        definition: {
          conditions: [
            { field: 'temperature', operator: 'GT', value: '75', logicalOperator: 'AND' },
            { field: 'humidity', operator: 'LT', value: '60', logicalOperator: 'AND' },
          ],
        },
        createdAt: now,
        updatedAt: now,
      } as Rule,
      {
        id: 2,
        ruleCode: 'DEVICE_ID_REGEX',
        name: 'Device ID Validation',
        description: 'Validate device ID format before processing events.',
        category: 'REGEX',
        scope: 'DEVICE',
        tenantId,
        siteCode: 'SITE-DOHA-001',
        deviceId: 'DEV-DOHA-001',
        actionType: 'ALERT',
        actionTarget: 'LOG',
        severity: 'MEDIUM',
        priority: 2,
        enabled: true,
        definition: { field: 'deviceId', pattern: '^DEV-[0-9A-Z-]+$' },
        createdAt: now,
        updatedAt: now,
      } as Rule,
      {
        id: 3,
        ruleCode: 'CPU_THRESHOLD',
        name: 'CPU High Usage',
        description: 'Trigger when CPU usage stays above limit.',
        category: 'THRESHOLD',
        scope: 'DEVICE',
        tenantId,
        siteCode: 'SITE-DOHA-001',
        deviceId: 'DEV-DOHA-001',
        actionType: 'ALERT',
        actionTarget: 'SYSTEM',
        severity: 'HIGH',
        priority: 1,
        enabled: true,
        definition: { field: 'cpuUsage', operator: 'GT', threshold: 85, duration: '5m' },
        createdAt: now,
        updatedAt: now,
      } as Rule,
      {
        id: 4,
        ruleCode: 'TEMP_RANGE_CHECK',
        name: 'Temperature Safe Range',
        description: 'Monitor whether temperature is within safe range.',
        category: 'RANGE',
        scope: 'DEVICE',
        tenantId,
        siteCode: 'SITE-DOHA-001',
        deviceId: 'DEV-DOHA-001',
        actionType: 'ALERT',
        actionTarget: 'EMAIL',
        severity: 'LOW',
        priority: 3,
        enabled: true,
        definition: { field: 'temperature', minValue: 20, maxValue: 80 },
        createdAt: now,
        updatedAt: now,
      } as Rule,
      {
        id: 5,
        ruleCode: 'MACHINE_STOP',
        name: 'Machine Stop Detection',
        description: 'Detect state transition from running to stopped.',
        category: 'STATE_CHANGE',
        scope: 'DEVICE',
        tenantId,
        siteCode: 'SITE-DOHA-001',
        deviceId: 'DEV-DOHA-001',
        actionType: 'ALERT',
        actionTarget: 'SMS',
        severity: 'CRITICAL',
        priority: 1,
        enabled: true,
        definition: { field: 'status', fromValue: 'RUNNING', toValue: 'STOPPED' },
        createdAt: now,
        updatedAt: now,
      } as Rule,
      {
        id: 6,
        ruleCode: 'HEARTBEAT_MISSING',
        name: 'Device Offline Detection',
        description: 'Detect missing heartbeat for a configured duration.',
        category: 'ABSENCE',
        scope: 'DEVICE',
        tenantId,
        siteCode: 'SITE-DOHA-001',
        deviceId: 'DEV-DOHA-001',
        actionType: 'ALERT',
        actionTarget: 'EMAIL',
        severity: 'CRITICAL',
        priority: 1,
        enabled: true,
        definition: { field: 'heartbeat', duration: '10m' },
        createdAt: now,
        updatedAt: now,
      } as Rule,
      {
        id: 7,
        ruleCode: 'AVG_TEMP_15M',
        name: 'Average Temperature Alert',
        description: 'Trigger when average temperature exceeds threshold.',
        category: 'AGGREGATION',
        scope: 'SITE',
        tenantId,
        siteCode: 'SITE-DOHA-001',
        deviceId: null,
        actionType: 'ALERT',
        actionTarget: 'DASHBOARD',
        severity: 'HIGH',
        priority: 2,
        enabled: true,
        definition: { aggregationType: 'AVG', field: 'temperature', window: '15m', operator: 'GT', value: 78 },
        createdAt: now,
        updatedAt: now,
      } as Rule,
      {
        id: 8,
        ruleCode: 'DAILY_REPORT',
        name: 'Daily Report Trigger',
        description: 'Trigger daily operations report on weekdays.',
        category: 'SCHEDULE',
        scope: 'SITE',
        tenantId,
        siteCode: 'SITE-DOHA-001',
        deviceId: null,
        actionType: 'NOTIFICATION',
        actionTarget: 'EMAIL',
        severity: 'LOW',
        priority: 5,
        enabled: true,
        definition: { cronExpression: '0 0 9 * * MON-FRI' },
        createdAt: now,
        updatedAt: now,
      } as Rule,
      {
        id: 9,
        ruleCode: 'GEOFENCE_ENTRY',
        name: 'Restricted Zone Entry',
        description: 'Trigger when tracked asset enters restricted area.',
        category: 'GEO_FENCE',
        scope: 'DEVICE',
        tenantId,
        siteCode: 'SITE-DOHA-001',
        deviceId: 'VEHICLE-001',
        actionType: 'ALERT',
        actionTarget: 'SYSTEM',
        severity: 'HIGH',
        priority: 1,
        enabled: true,
        definition: { latitude: 25.2854, longitude: 51.531, radiusMeters: 500, event: 'ENTER' },
        createdAt: now,
        updatedAt: now,
      } as Rule,
      {
        id: 10,
        ruleCode: 'DUPLICATE_TXN',
        name: 'Duplicate Transaction Detection',
        description: 'Detect duplicate transaction identifiers within a time window.',
        category: 'DUPLICATE',
        scope: 'SITE',
        tenantId,
        siteCode: 'SITE-DOHA-001',
        deviceId: null,
        actionType: 'ALERT',
        actionTarget: 'LOG',
        severity: 'MEDIUM',
        priority: 2,
        enabled: true,
        definition: { field: 'transactionId', window: '1m' },
        createdAt: now,
        updatedAt: now,
      } as Rule,
      {
        id: 11,
        ruleCode: 'CUSTOM_SCRIPT_RULE',
        name: 'Custom Business Logic',
        description: 'Evaluate a custom JavaScript expression.',
        category: 'SCRIPT',
        scope: 'DEVICE',
        tenantId,
        siteCode: 'SITE-DOHA-001',
        deviceId: 'DEV-DOHA-001',
        actionType: 'ALERT',
        actionTarget: 'SYSTEM',
        severity: 'HIGH',
        priority: 1,
        enabled: true,
        definition: { language: 'javascript', expression: "temperature > 75 && humidity < 60 && status === 'ACTIVE'" },
        createdAt: now,
        updatedAt: now,
      } as Rule,
    ];
  }

  private generateRuleCode(category: RuleCategory = 'CONDITION'): string {
    const rules = this.readStorage<Rule[]>(STORAGE_KEYS.rules, []);
    const nextNumber = rules.length + 1;

    const prefixMap: Record<RuleCategory, string> = {
      CONDITION: 'COND',
      REGEX: 'REGEX',
      THRESHOLD: 'THR',
      RANGE: 'RANGE',
      STATE_CHANGE: 'STATE',
      ABSENCE: 'ABS',
      AGGREGATION: 'AGG',
      SCHEDULE: 'SCH',
      GEO_FENCE: 'GEO',
      DUPLICATE: 'DUP',
      SCRIPT: 'SCRIPT',
    };

    return `${prefixMap[category]}-${String(nextNumber).padStart(3, '0')}`;
  }

  private nextId<T extends { id?: number }>(items: T[]): number {
    const maxId = items.reduce(
      (max, item) => Math.max(max, Number(item.id) || 0),
      0,
    );

    return maxId + 1;
  }

  private readStorage<T>(key: string, fallback: T): T {
    try {
      const value = localStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private writeStorage<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
