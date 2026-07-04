import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TenantContextService {
  private readonly _tenantId = signal<string | null>(null);
  private readonly _tenantName = signal<string | null>(null);

  readonly tenantId = computed(() => this._tenantId());
  readonly tenantName = computed(() => this._tenantName());

  setTenant(id: string, name: string): void {
    this._tenantId.set(id);
    this._tenantName.set(name);
  }

  clear(): void {
    this._tenantId.set(null);
    this._tenantName.set(null);
  }

  hasTenant(): boolean {
    return !!this._tenantId();
  }
}