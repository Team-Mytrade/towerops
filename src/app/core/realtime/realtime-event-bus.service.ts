import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

import {
  AppNotificationEvent,
  TicketUpdateEvent,
  TowerAlertEvent,
  TowerTelemetryEvent,
} from './realtime.models';

@Injectable({
  providedIn: 'root',
})
export class RealtimeEventBusService {
  private readonly towerTelemetrySubject = new Subject<TowerTelemetryEvent>();
  private readonly towerAlertSubject = new Subject<TowerAlertEvent>();
  private readonly ticketUpdateSubject = new Subject<TicketUpdateEvent>();
  private readonly notificationSubject = new Subject<AppNotificationEvent>();

  readonly towerTelemetry$ = this.towerTelemetrySubject.asObservable();
  readonly towerAlerts$ = this.towerAlertSubject.asObservable();
  readonly ticketUpdates$ = this.ticketUpdateSubject.asObservable();
  readonly notifications$ = this.notificationSubject.asObservable();

  readonly latestTelemetry = signal<TowerTelemetryEvent | null>(null);
  readonly latestAlert = signal<TowerAlertEvent | null>(null);

  emitTowerTelemetry(event: TowerTelemetryEvent): void {
    this.latestTelemetry.set(event);
    this.towerTelemetrySubject.next(event);
  }

  emitTowerAlert(event: TowerAlertEvent): void {
    this.latestAlert.set(event);
    this.towerAlertSubject.next(event);
  }

  emitTicketUpdate(event: TicketUpdateEvent): void {
    this.ticketUpdateSubject.next(event);
  }

  emitNotification(event: AppNotificationEvent): void {
    this.notificationSubject.next(event);
  }
}