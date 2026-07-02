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
import { firstValueFrom } from 'rxjs';

import { Device, DeviceService } from '../../core/services/device.service';
import { Rule, RulePayload, RuleService } from '../../core/services/rule.service';
import { Site, SiteService } from '../../core/services/site.service';
import { AuthService } from '../../core/services/auth.service';

import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';

type DrawerMode = 'view' | 'create';

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
  private readonly ruleService = inject(RuleService);
  private readonly deviceService = inject(DeviceService);
  private readonly siteService = inject(SiteService);
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

  newRule: RulePayload = this.emptyRuleDraft();

  readonly enabledOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
  ];

  readonly activeOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false },
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

  readonly fieldOptions = [
    { label: 'Signal Strength', value: 'signalStrength' },
    { label: 'Fuel Level', value: 'fuelLevel' },
    { label: 'Temperature', value: 'temperature' },
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
        rule.siteCode?.toLowerCase().includes(query) ||
        rule.deviceId?.toLowerCase().includes(query) ||
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
    if (this.drawerMode() === 'create') return 'New Rule';
    return this.selectedRule()?.ruleCode ?? '';
  }

  get drawerSize(): 'compact' | 'wide' {
    return this.drawerMode() === 'view' ? 'compact' : 'wide';
  }

  ngOnInit(): void {
    this.loadMasterData();
  }

  async loadMasterData(): Promise<void> {
    try {
      this.loading.set(true);

      const [devicesRes, sitesRes] = await Promise.all([
        firstValueFrom(this.deviceService.getAll()),
        firstValueFrom(this.siteService.getAll()),
      ]);

      this.devices.set(devicesRes.data ?? []);
      this.sites.set(sitesRes.data ?? []);
    } catch (error) {
      console.error('Failed to load rule master data:', error);
      this.devices.set([]);
      this.sites.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async loadRulesForDevice(): Promise<void> {
    if (!this.newRule.siteCode || !this.newRule.deviceId) {
      this.rules.set([]);
      return;
    }

    try {
      this.loading.set(true);

      const response = await firstValueFrom(
        this.ruleService.getByDevice({
          siteCode: this.newRule.siteCode,
          deviceId: this.newRule.deviceId,
        }),
      );

      this.rules.set(response ?? []);
    } catch (error) {
      console.error('Failed to load rules:', error);
      this.rules.set([]);
    } finally {
      this.loading.set(false);
    }
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

  async saveRule(): Promise<void> {
    if (this.saving()) return;

    const payload = this.normalizePayload();

    if (!payload.ruleCode || !payload.name || !payload.siteCode || !payload.deviceId) {
      return;
    }

    try {
      this.saving.set(true);

      await firstValueFrom(this.ruleService.create(payload));

      this.newRule.siteCode = payload.siteCode;
      this.newRule.deviceId = payload.deviceId;

      await this.loadRulesForDevice();
      this.closeDrawer();
    } catch (error) {
      console.error('Failed to save rule:', error);
    } finally {
      this.saving.set(false);
    }
  }

  addCondition(): void {
    this.newRule.definition.conditions.push({
      field: '',
      operator: 'EQ',
      value: '',
      logicalOperator: 'AND',
    });
  }

  removeCondition(index: number): void {
    this.newRule.definition.conditions.splice(index, 1);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.drawerMode.set('view');
    this.selectedRule.set(null);
    this.newRule = this.emptyRuleDraft();
  }

  siteLabel(siteCode: string): string {
    if (!siteCode) return '-';

    const site = this.sites().find((item) => item.siteCode === siteCode);
    return site ? `${site.siteCode} · ${site.siteName}` : siteCode;
  }

  deviceLabel(deviceId: string): string {
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

  private normalizePayload(): RulePayload {
    return {
      ruleCode: this.newRule.ruleCode.trim(),
      name: this.newRule.name.trim(),
      description: this.newRule.description.trim(),
      category: 'CONDITION',
      scope: this.newRule.scope,
      tenantId: this.newRule.tenantId || this.auth.getTenantId() || 'DEFAULT',
      siteCode: this.newRule.siteCode,
      deviceId: this.newRule.deviceId,
      actionType: this.newRule.actionType,
      actionTarget: this.newRule.actionTarget.trim(),
      severity: this.newRule.severity,
      priority: Number(this.newRule.priority || 1),
      enabled: this.newRule.enabled,
      definition: {
        conditions: this.newRule.definition.conditions.map((condition) => ({
          field: condition.field,
          operator: condition.operator,
          value: String(condition.value),
          logicalOperator: condition.logicalOperator,
        })),
      },
    };
  }

  private emptyRuleDraft(): RulePayload {
    return {
      ruleCode: '',
      name: '',
      description: '',
      category: 'CONDITION',
      scope: 'GLOBAL',
      tenantId: this.auth.getTenantId() || 'DEFAULT',
      siteCode: '',
      deviceId: '',
      actionType: 'ALERT',
      actionTarget: '',
      severity: 'LOW',
      priority: 1,
      enabled: true,
      definition: {
        conditions: [],
      },
    };
  }
}