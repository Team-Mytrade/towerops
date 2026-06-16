import { Injectable, NgZone, inject, signal } from '@angular/core';
import mqtt, { MqttClient } from 'mqtt';

import { REALTIME_CONFIG } from './realtime.config';
import {
  RealtimeConnectionStatus,
  TowerTelemetryEvent,
} from './realtime.models';
import { RealtimeEventBusService } from './realtime-event-bus.service';

@Injectable({
  providedIn: 'root',
})
export class MqttService {
  private readonly zone = inject(NgZone);
  private readonly eventBus = inject(RealtimeEventBusService);

  private client: MqttClient | null = null;

  readonly status = signal<RealtimeConnectionStatus>('idle');

  connect(): void {
    if (this.client?.connected) return;

    this.status.set('connecting');

    const clientId = `${REALTIME_CONFIG.mqtt.clientIdPrefix}-${crypto.randomUUID()}`;

    this.client = mqtt.connect(REALTIME_CONFIG.mqtt.brokerUrl, {
      clientId,
      username: REALTIME_CONFIG.mqtt.username || undefined,
      password: REALTIME_CONFIG.mqtt.password || undefined,
      clean: true,
      reconnectPeriod: 3000,
      connectTimeout: 10000,
    });

    this.client.on('connect', () => {
      this.zone.run(() => {
        this.status.set('connected');
        this.subscribeToTopics();
      });
    });

    this.client.on('reconnect', () => {
      this.zone.run(() => {
        this.status.set('connecting');
      });
    });

    this.client.on('close', () => {
      this.zone.run(() => {
        this.status.set('disconnected');
      });
    });

    this.client.on('error', () => {
      this.zone.run(() => {
        this.status.set('error');
      });
    });

    this.client.on('message', (topic, payload) => {
      this.zone.run(() => {
        this.handleMessage(topic, payload.toString());
      });
    });
  }

  disconnect(): void {
    this.client?.end(true);
    this.client = null;
    this.status.set('disconnected');
  }

  publish<T>(topic: string, payload: T): void {
    if (!this.client?.connected) return;

    this.client.publish(topic, JSON.stringify(payload), {
      qos: 1,
      retain: false,
    });
  }

  private subscribeToTopics(): void {
    this.client?.subscribe(
      [
        'tower/+/telemetry',
        'tower/+/alert',
        'tower/+/status',
      ],
      {
        qos: 1,
      }
    );
  }

  private handleMessage(topic: string, rawPayload: string): void {
    try {
      const payload = JSON.parse(rawPayload);

      if (topic.includes('/telemetry')) {
        this.eventBus.emitTowerTelemetry(payload as TowerTelemetryEvent);
      }

      if (topic.includes('/alert')) {
        this.eventBus.emitTowerAlert(payload);
      }
    } catch {
      console.warn('Invalid MQTT payload', topic, rawPayload);
    }
  }
}