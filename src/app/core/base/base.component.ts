import { Directive, signal } from '@angular/core';

import { BaseClass } from './base.class';

@Directive()
export abstract class BaseComponent extends BaseClass {
  readonly loading = signal(false);

  protected setLoading(value: boolean): void {
    this.loading.set(value);
  }

  protected startLoading(): void {
    this.loading.set(true);
  }

  protected stopLoading(): void {
    this.loading.set(false);
  }
}