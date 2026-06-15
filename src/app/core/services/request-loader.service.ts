import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RequestLoaderService {
  private readonly activeRequests = signal(0);

  readonly loading = computed(
    () => this.activeRequests() > 0
  );

  start(): void {
    this.activeRequests.update(
      (count) => count + 1
    );
  }

  stop(): void {
    this.activeRequests.update((count) =>
      count > 0 ? count - 1 : 0
    );
  }

  reset(): void {
    this.activeRequests.set(0);
  }
}