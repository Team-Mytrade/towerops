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

import {
  DeviceCredential,
  DeviceCredentialService,
} from '../../core/services/device-credential.service';
import {
  DeviceModel,
  DeviceModelService,
} from '../../core/services/device-model.service';

import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';

type DrawerMode = 'modelDetails' | 'credentialDetails';

@Component({
  selector: 'to-device-models',
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
  templateUrl: './device-models.html',
  styleUrl: './device-models.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceModels implements OnInit {
  private readonly modelService = inject(DeviceModelService);
  private readonly credentialService = inject(DeviceCredentialService);

  readonly loading = signal(false);

  readonly search = signal('');
  readonly categoryFilter = signal<string | 'All'>('All');

  readonly drawerOpen = signal(false);
  readonly drawerMode = signal<DrawerMode>('modelDetails');

  readonly models = signal<DeviceModel[]>([]);
  readonly credentials = signal<DeviceCredential[]>([]);

  readonly selectedModel = signal<DeviceModel | null>(null);
  readonly selectedCredential = signal<DeviceCredential | null>(null);

  readonly categoryOptions = [
    { label: 'All Categories', value: 'All' },
    { label: 'Sensor', value: 'SENSOR' },
    { label: 'Gateway', value: 'GATEWAY' },
    { label: 'Controller', value: 'CONTROLLER' },
    { label: 'Network', value: 'NETWORK' },
  ];

  readonly filteredModels = computed(() => {
    const query = this.search().toLowerCase().trim();
    const category = this.categoryFilter();

    return this.models().filter((model) => {
      const matchesSearch =
        !query ||
        model.modelCode?.toLowerCase().includes(query) ||
        model.modelName?.toLowerCase().includes(query) ||
        model.manufacturer?.toLowerCase().includes(query) ||
        model.category?.toLowerCase().includes(query);

      const matchesCategory = category === 'All' || model.category === category;

      return matchesSearch && matchesCategory;
    });
  });

  readonly filteredCredentials = computed(() => {
    const model = this.selectedModel();

    if (!model) {
      return this.credentials();
    }

    return this.credentials().filter(
      (credential) =>
        credential.model === model.modelCode ||
        credential.model === model.modelName,
    );
  });

  get drawerTitle(): string {
    if (this.drawerMode() === 'credentialDetails') {
      return this.selectedCredential()?.deviceId ?? 'Credential Details';
    }

    return this.selectedModel()?.modelName ?? 'Device Model Details';
  }

  get drawerEyebrow(): string {
    if (this.drawerMode() === 'credentialDetails') {
      return 'Device Credential';
    }

    return this.selectedModel()?.modelCode ?? 'Device Model';
  }

  ngOnInit(): void {
    this.loadPageData();
  }

  async loadPageData(): Promise<void> {
    try {
      this.loading.set(true);

      const [modelsRes, credentialsRes] = await Promise.all([
        firstValueFrom(this.modelService.getAll()),
        firstValueFrom(this.credentialService.getAll()),
      ]);

      this.models.set(modelsRes.data ?? []);
      this.credentials.set(credentialsRes ?? []);
    } catch (error) {
      console.error('Failed to load device models:', error);
      this.models.set([]);
      this.credentials.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  openModel(model: DeviceModel): void {
    this.selectedModel.set(model);
    this.selectedCredential.set(null);
    this.drawerMode.set('modelDetails');
    this.drawerOpen.set(true);
  }

  openCredential(credential: DeviceCredential): void {
    this.selectedCredential.set(credential);
    this.drawerMode.set('credentialDetails');
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.drawerMode.set('modelDetails');
    this.selectedCredential.set(null);
  }

  credentialCount(model: DeviceModel): number {
    return this.credentials().filter(
      (credential) =>
        credential.model === model.modelCode ||
        credential.model === model.modelName,
    ).length;
  }

  statusLabel(enabled?: boolean): string {
    return enabled ? 'Active' : 'Inactive';
  }

  statusTone(enabled?: boolean): 'success' | 'danger' {
    return enabled ? 'success' : 'danger';
  }

  formatDate(value?: string): string {
    if (!value) return '-';

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
  }
}