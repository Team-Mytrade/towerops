// import { Injectable, NgZone, inject, signal } from '@angular/core';

// import { REALTIME_CONFIG } from './realtime.config';
// import { RealtimeConnectionStatus } from './realtime.models';
// import { RealtimeEventBusService } from './realtime-event-bus.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class WebSocketService {
//   private readonly zone = inject(NgZone);
//   private readonly eventBus = inject(RealtimeEventBusService);

//   private socket: WebSocket | null = null;
//   private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
//   private reconnectAttempts = 0;

//   readonly status = signal<RealtimeConnectionStatus>('idle');

//   connect(): void {
//     if (
//       this.socket &&
//       (this.socket.readyState === WebSocket.OPEN ||
//         this.socket.readyState === WebSocket.CONNECTING)
//     ) {
//       return;
//     }

//     this.status.set('connecting');

//     this.socket = new WebSocket(REALTIME_CONFIG.websocketUrl);

//     this.socket.onopen = () => {
//       this.zone.run(() => {
//         this.reconnectAttempts = 0;
//         this.status.set('connected');
//       });
//     };

//     this.socket.onmessage = (message) => {
//       this.zone.run(() => {
//         this.handleMessage(message.data);
//       });
//     };

//     this.socket.onerror = () => {
//       this.zone.run(() => {
//         this.status.set('error');
//       });
//     };

//     this.socket.onclose = () => {
//       this.zone.run(() => {
//         this.status.set('disconnected');
//         this.scheduleReconnect();
//       });
//     };
//   }

//   disconnect(): void {
//     this.clearReconnectTimer();

//     if (this.socket) {
//       this.socket.close();
//       this.socket = null;
//     }

//     this.status.set('disconnected');
//   }

//   send<T>(type: string, payload: T): void {
//     if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
//       return;
//     }

//     this.socket.send(
//       JSON.stringify({
//         type,
//         payload,
//         timestamp: new Date().toISOString(),
//       })
//     );
//   }

//   private handleMessage(raw: string): void {
//     try {
//       const message = JSON.parse(raw);

//       switch (message.type) {
//         case 'ticket.update':
//           this.eventBus.emitTicketUpdate(message.payload);
//           break;

//         case 'notification':
//           this.eventBus.emitNotification(message.payload);
//           break;

//         case 'tower.alert':
//           this.eventBus.emitTowerAlert(message.payload);
//           break;
//       }
//     } catch {
//       console.warn('Invalid WebSocket message', raw);
//     }
//   }

//   private scheduleReconnect(): void {
//     this.clearReconnectTimer();

//     this.reconnectAttempts++;

//     const delay = Math.min(1000 * this.reconnectAttempts, 10000);

//     this.reconnectTimer = setTimeout(() => {
//       this.connect();
//     }, delay);
//   }

//   private clearReconnectTimer(): void {
//     if (this.reconnectTimer) {
//       clearTimeout(this.reconnectTimer);
//       this.reconnectTimer = null;
//     }
//   }
// }