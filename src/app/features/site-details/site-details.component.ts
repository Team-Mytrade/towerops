import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';

type SiteStatus = 'Healthy' | 'Warning' | 'Critical' | 'Offline';
type DeviceStatus = 'Healthy' | 'Warning' | 'Critical' | 'Offline';
type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
type WorkOrderStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Completed';
type AlertSeverity = 'Info' | 'Warning' | 'Critical';

type SiteDetail = {
  id: number;
  siteCode: string;
  siteName: string;
  category: string;
  city: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  status: SiteStatus;
  lastSync: string;
};

type SiteDevice = {
  id: number;
  name: string;
  code: string;
  type: string;
  status: DeviceStatus;
  battery: number;
  signal: number;
  temperature: number;
  lastSeen: string;
};

type SiteAlert = {
  id: number;
  title: string;
  device: string;
  severity: AlertSeverity;
  status: 'Open' | 'Acknowledged' | 'Resolved';
  time: string;
  description: string;
};

type SiteWorkOrder = {
  id: string;
  title: string;
  priority: Priority;
  status: WorkOrderStatus;
  technician: string;
  createdAt: string;
};

type SiteMaintenance = {
  id: string;
  title: string;
  type: string;
  scheduledAt: string;
  status: 'Scheduled' | 'Assigned' | 'Completed';
};

type TimelineItem = {
  title: string;
  description: string;
  time: string;
};

@Component({
  selector: 'to-site-details',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    TabsModule,
    ChartModule,
  ],
  templateUrl: './site-details.component.html',
  styleUrl: './site-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly activeTab = signal('overview');
  readonly selectedDevice = signal<SiteDevice | null>(null);
  readonly selectedAlert = signal<SiteAlert | null>(null);
  readonly selectedWorkOrder = signal<SiteWorkOrder | null>(null);

  readonly siteId = computed(() => Number(this.route.snapshot.paramMap.get('id') ?? 0));

  readonly site = signal<SiteDetail>({
    id: 9003,
    siteCode: 'TW-UAE-003',
    siteName: 'Sharjah Industrial Tower',
    category: 'Tower',
    city: 'Sharjah',
    country: 'UAE',
    address: 'Industrial Area, Sharjah, UAE',
    latitude: 25.3463,
    longitude: 55.4209,
    status: 'Warning',
    lastSync: '18 sec ago',
  });

  readonly devices = signal<SiteDevice[]>([
    {
      id: 1,
      name: 'Gateway Controller',
      code: 'GW-001',
      type: 'Gateway',
      status: 'Healthy',
      battery: 94,
      signal: 91,
      temperature: 32,
      lastSeen: '12 sec ago',
    },
    {
      id: 2,
      name: 'Signal Transmitter',
      code: 'TX-5520',
      type: 'Transmitter',
      status: 'Critical',
      battery: 72,
      signal: 18,
      temperature: 41,
      lastSeen: '2 min ago',
    },
    {
      id: 3,
      name: 'Battery Backup Unit',
      code: 'BAT-9921',
      type: 'Power',
      status: 'Warning',
      battery: 38,
      signal: 88,
      temperature: 37,
      lastSeen: '40 sec ago',
    },
    {
      id: 4,
      name: 'Generator Sensor',
      code: 'GEN-004',
      type: 'Generator',
      status: 'Healthy',
      battery: 86,
      signal: 82,
      temperature: 35,
      lastSeen: '25 sec ago',
    },
  ]);

  readonly alerts = signal<SiteAlert[]>([
    {
      id: 101,
      title: 'Signal strength dropped',
      device: 'Signal Transmitter',
      severity: 'Critical',
      status: 'Open',
      time: '2 min ago',
      description: 'Signal strength dropped below configured threshold.',
    },
    {
      id: 102,
      title: 'Battery backup low',
      device: 'Battery Backup Unit',
      severity: 'Warning',
      status: 'Acknowledged',
      time: '18 min ago',
      description: 'Battery backup is below expected health limit.',
    },
    {
      id: 103,
      title: 'Generator service due',
      device: 'Generator Sensor',
      severity: 'Info',
      status: 'Open',
      time: '1 hr ago',
      description: 'Generator maintenance window is approaching.',
    },
  ]);

  readonly workOrders = signal<SiteWorkOrder[]>([
    {
      id: 'WO-10021',
      title: 'Signal transmitter inspection',
      priority: 'Critical',
      status: 'Assigned',
      technician: 'Ahmed Ali',
      createdAt: 'Today, 09:30 AM',
    },
    {
      id: 'WO-10032',
      title: 'Battery backup replacement',
      priority: 'High',
      status: 'In Progress',
      technician: 'Mohammed Khan',
      createdAt: 'Today, 08:15 AM',
    },
    {
      id: 'WO-10041',
      title: 'Generator routine service',
      priority: 'Medium',
      status: 'Pending',
      technician: 'Unassigned',
      createdAt: 'Yesterday, 04:20 PM',
    },
  ]);

  readonly maintenance = signal<SiteMaintenance[]>([
    {
      id: 'MT-9001',
      title: 'Monthly tower inspection',
      type: 'Preventive',
      scheduledAt: 'Tomorrow, 10:00 AM',
      status: 'Scheduled',
    },
    {
      id: 'MT-9002',
      title: 'Battery backup check',
      type: 'Preventive',
      scheduledAt: 'July 08, 2026',
      status: 'Assigned',
    },
    {
      id: 'MT-8991',
      title: 'Generator filter service',
      type: 'Corrective',
      scheduledAt: 'July 01, 2026',
      status: 'Completed',
    },
  ]);

  readonly timeline = signal<TimelineItem[]>([
    {
      title: 'Critical alert raised',
      description: 'Signal transmitter reported weak signal.',
      time: '2 min ago',
    },
    {
      title: 'Work order assigned',
      description: 'WO-10021 assigned to Ahmed Ali.',
      time: '10 min ago',
    },
    {
      title: 'Battery warning acknowledged',
      description: 'NOC acknowledged battery backup warning.',
      time: '18 min ago',
    },
    {
      title: 'Site heartbeat received',
      description: 'Gateway heartbeat received successfully.',
      time: '35 min ago',
    },
  ]);

  readonly kpis = computed(() => {
    const devices = this.devices();
    const alerts = this.alerts();
    const workOrders = this.workOrders();

    return [
      {
        label: 'Devices',
        value: devices.length,
        icon: 'pi pi-microchip',
        tone: 'info',
      },
      {
        label: 'Online',
        value: devices.filter((x) => x.status === 'Healthy').length,
        icon: 'pi pi-check-circle',
        tone: 'success',
      },
      {
        label: 'Alerts',
        value: alerts.filter((x) => x.status === 'Open').length,
        icon: 'pi pi-bell',
        tone: 'danger',
      },
      {
        label: 'Work Orders',
        value: workOrders.filter((x) => x.status !== 'Completed').length,
        icon: 'pi pi-wrench',
        tone: 'warning',
      },
      {
        label: 'Battery Avg',
        value: `${this.average(devices.map((x) => x.battery))}%`,
        icon: 'pi pi-bolt',
        tone: 'success',
      },
      {
        label: 'Signal Avg',
        value: `${this.average(devices.map((x) => x.signal))}%`,
        icon: 'pi pi-wifi',
        tone: 'info',
      },
    ];
  });

  readonly healthChartData = computed(() => {
    const devices = this.devices();

    return {
      labels: ['Healthy', 'Warning', 'Critical', 'Offline'],
      datasets: [
        {
          data: [
            devices.filter((x) => x.status === 'Healthy').length,
            devices.filter((x) => x.status === 'Warning').length,
            devices.filter((x) => x.status === 'Critical').length,
            devices.filter((x) => x.status === 'Offline').length,
          ],
          backgroundColor: ['#34c759', '#ff9500', '#ff3b30', '#8e8e93'],
          borderWidth: 0,
        },
      ],
    };
  });

  readonly healthChartOptions = {
    cutout: '68%',
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  };

  readonly telemetryChartData = {
    labels: ['09:00', '09:10', '09:20', '09:30', '09:40', '09:50'],
    datasets: [
      {
        label: 'Signal',
        data: [89, 84, 72, 51, 26, 18],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.1)',
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Temperature',
        data: [31, 32, 35, 38, 40, 41],
        borderColor: '#ff9500',
        backgroundColor: 'rgba(255,149,0,0.1)',
        tension: 0.35,
        fill: true,
      },
    ],
  };

  readonly telemetryChartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };

  back(): void {
    this.router.navigate(['/dashboard']);
  }

  openDevice(device: SiteDevice): void {
    this.selectedDevice.set(device);
  }

  closeDevice(): void {
    this.selectedDevice.set(null);
  }

  openAlert(alert: SiteAlert): void {
    this.selectedAlert.set(alert);
  }

  closeAlert(): void {
    this.selectedAlert.set(null);
  }

  openWorkOrder(order: SiteWorkOrder): void {
    this.selectedWorkOrder.set(order);
  }

  closeWorkOrder(): void {
    this.selectedWorkOrder.set(null);
  }

  goTo(path: string): void {
    this.router.navigateByUrl(path);
  }

  statusSeverity(status: SiteStatus | DeviceStatus): 'success' | 'warn' | 'danger' | 'secondary' {
    if (status === 'Healthy') return 'success';
    if (status === 'Warning') return 'warn';
    if (status === 'Critical') return 'danger';
    return 'secondary';
  }

  alertSeverity(severity: AlertSeverity): 'info' | 'warn' | 'danger' {
    if (severity === 'Critical') return 'danger';
    if (severity === 'Warning') return 'warn';
    return 'info';
  }

  prioritySeverity(priority: Priority): 'success' | 'info' | 'warn' | 'danger' {
    if (priority === 'Critical') return 'danger';
    if (priority === 'High') return 'warn';
    if (priority === 'Medium') return 'info';
    return 'success';
  }

  workOrderSeverity(status: WorkOrderStatus): 'success' | 'info' | 'warn' | 'secondary' {
    if (status === 'Completed') return 'success';
    if (status === 'In Progress') return 'info';
    if (status === 'Assigned') return 'secondary';
    return 'warn';
  }

  private average(values: number[]): number {
    if (!values.length) return 0;

    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  }
}