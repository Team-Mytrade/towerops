import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';

interface Tenant {
  id: string;
  name: string;
  type: string;
  location: string;
  active: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToggleSwitchModule,
    TagModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  tenantName = signal('du Telecom NOC');
  logoUrl = signal('');

  darkMode = signal(false);

  tenants = signal<Tenant[]>([
    {
      id: 'tenant-001',
      name: 'du Telecom NOC',
      type: 'Primary NOC',
      location: 'Dubai',
      active: true,
    },
    {
      id: 'tenant-002',
      name: 'Etisalat Ops',
      type: 'Regional NOC',
      location: 'Abu Dhabi',
      active: false,
    },
    {
      id: 'tenant-003',
      name: 'Sharjah Tower Grid',
      type: 'Field Unit',
      location: 'Sharjah',
      active: false,
    },
  ]);

  profile = {
    name: 'Hassan Al Mansoori',
    email: 'admin@towerops.ae',
    role: 'Super Admin',
    access: 'Tower, Building, Warehouse',
  };

  saveBranding(): void {
    console.log('Saved branding', {
      tenantName: this.tenantName(),
      logoUrl: this.logoUrl(),
    });
  }

  selectTenant(id: string): void {
    this.tenants.update((items) =>
      items.map((tenant) => ({
        ...tenant,
        active: tenant.id === id,
      }))
    );

    const selected = this.tenants().find((tenant) => tenant.id === id);

    if (selected) {
      this.tenantName.set(selected.name);
    }
  }
}