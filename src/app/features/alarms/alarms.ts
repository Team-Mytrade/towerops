import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { Drawer } from '../../shared/ui/drawer/drawer';
import { DetailField } from '../../shared/ui/detail-field/detail-field';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import {
  Timeline,
  TimelineItem,
} from '../../shared/ui/timeline/timeline';

type AlarmSeverity =
  | 'Critical'
  | 'High'
  | 'Medium'
  | 'Low';

type AlarmStatus =
  | 'Open'
  | 'Acknowledged'
  | 'Suppressed'
  | 'Resolved';

type AlarmCategory =
  | 'Power'
  | 'Fuel'
  | 'Battery'
  | 'Temperature'
  | 'Signal'
  | 'Generator'
  | 'Security'
  | 'Network';

type DrawerMode =
  | 'view'
  | 'rule';

type Alarm = {
  id: string;

  site: string;
  device: string;

  title: string;
  description: string;

  category: AlarmCategory;

  severity: AlarmSeverity;
  status: AlarmStatus;

  rule: string;

  currentValue: string;
  threshold: string;

  ticket: string;
  workOrder: string;

  acknowledgedBy?: string;

  createdAt: string;
};

@Component({
  selector: 'to-alarms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    ButtonModule,
    CheckboxModule,
    InputTextModule,
    SelectModule,

    Drawer,
    DetailField,
    StatusBadge,
    Timeline,
  ],
  templateUrl: './alarms.html',
  styleUrl: './alarms.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Alarms {

  readonly search = signal('');

  readonly severityFilter =
    signal<'All' | AlarmSeverity>('All');

  readonly statusFilter =
    signal<'All' | AlarmStatus>('All');

  readonly categoryFilter =
    signal<'All' | AlarmCategory>('All');

  readonly selectedAlarmId =
    signal('ALM-1001');

  readonly drawerOpen =
    signal(false);

  readonly drawerMode =
    signal<DrawerMode>('view');

  readonly severityOptions = [
    { label:'All Severity', value:'All' },
    { label:'Critical', value:'Critical' },
    { label:'High', value:'High' },
    { label:'Medium', value:'Medium' },
    { label:'Low', value:'Low' },
  ];

  readonly statusOptions = [
    { label:'All Status', value:'All' },
    { label:'Open', value:'Open' },
    { label:'Acknowledged', value:'Acknowledged' },
    { label:'Suppressed', value:'Suppressed' },
    { label:'Resolved', value:'Resolved' },
  ];

  readonly categoryOptions = [
    { label:'All Categories', value:'All' },
    { label:'Power', value:'Power' },
    { label:'Fuel', value:'Fuel' },
    { label:'Battery', value:'Battery' },
    { label:'Temperature', value:'Temperature' },
    { label:'Signal', value:'Signal' },
    { label:'Generator', value:'Generator' },
    { label:'Security', value:'Security' },
    { label:'Network', value:'Network' },
  ];

  readonly alarms = signal<Alarm[]>([
    {
      id:'ALM-1001',
      site:'Dubai Marina Tower',
      device:'Fuel Sensor',

      title:'Fuel level below threshold',

      description:'Fuel level dropped below configured threshold.',

      category:'Fuel',

      severity:'Critical',

      status:'Open',

      rule:'Fuel < 20%',

      currentValue:'14%',
      threshold:'20%',

      ticket:'TCK-1002',
      workOrder:'WO-1002',

      createdAt:'2 mins ago',
    },

    {
      id:'ALM-1002',
      site:'Business Bay',

      device:'Battery Bank',

      title:'Battery voltage low',

      description:'Battery voltage below configured threshold.',

      category:'Battery',

      severity:'High',

      status:'Acknowledged',

      rule:'Voltage < 42V',

      currentValue:'39V',

      threshold:'42V',

      ticket:'TCK-1001',

      workOrder:'WO-1001',

      acknowledgedBy:'Ahmed Khan',

      createdAt:'12 mins ago',
    },

    {
      id:'ALM-1003',

      site:'Abu Dhabi HQ',

      device:'Generator',

      title:'Generator overload',

      description:'Generator exceeded configured load.',

      category:'Generator',

      severity:'Medium',

      status:'Suppressed',

      rule:'Load > 95%',

      currentValue:'98%',

      threshold:'95%',

      ticket:'-',

      workOrder:'-',

      createdAt:'Yesterday',
    },

    {
      id:'ALM-1004',

      site:'Sharjah Tower',

      device:'Transmitter',

      title:'Signal strength low',

      description:'Signal dropped below acceptable level.',

      category:'Signal',

      severity:'Critical',

      status:'Resolved',

      rule:'RSSI < -90',

      currentValue:'-96',

      threshold:'-90',

      ticket:'TCK-1008',

      workOrder:'WO-1008',

      createdAt:'2 days ago',
    },
  ]);

  readonly filteredAlarms = computed(() => {

    const search = this.search().toLowerCase();

    return this.alarms().filter(alarm => {

      const searchOk =
        !search ||

        alarm.title.toLowerCase().includes(search) ||

        alarm.site.toLowerCase().includes(search) ||

        alarm.device.toLowerCase().includes(search) ||

        alarm.id.toLowerCase().includes(search);

      const severityOk =
        this.severityFilter() === 'All' ||
        alarm.severity === this.severityFilter();

      const statusOk =
        this.statusFilter() === 'All' ||
        alarm.status === this.statusFilter();

      const categoryOk =
        this.categoryFilter() === 'All' ||
        alarm.category === this.categoryFilter();

      return (
        searchOk &&
        severityOk &&
        statusOk &&
        categoryOk
      );

    });

  });

  readonly selectedAlarm = computed(() =>
    this.alarms().find(
      x => x.id === this.selectedAlarmId()
    )!
  );

  readonly summary = computed(() => {

    const alarms = this.alarms();

    return {

      total: alarms.length,

      critical: alarms.filter(
        x => x.severity === 'Critical'
      ).length,

      open: alarms.filter(
        x => x.status === 'Open'
      ).length,

      acknowledged: alarms.filter(
        x => x.status === 'Acknowledged'
      ).length,

    };

  });

  readonly timeline = signal<TimelineItem[]>([
    {
      title:'Alarm generated',
      description:'Rule engine created alarm.',
      time:'11:18',
      tone:'danger',
    },
    {
      title:'Notification sent',
      description:'Delivered to NOC operators.',
      time:'11:19',
      tone:'info',
    },
    {
      title:'Ticket created',
      description:'Linked to TCK-1002.',
      time:'11:20',
      tone:'success',
    },
    {
      title:'Engineer assigned',
      description:'Assigned to Rashid Ali.',
      time:'11:21',
      tone:'success',
    },
  ]);

  selectAlarm(alarm: Alarm): void {
    this.selectedAlarmId.set(alarm.id);
  }

  acknowledgeAlarm(): void {
    const alarm = this.selectedAlarm();

    if (!alarm) return;

    this.updateAlarm(alarm.id, {
      status: 'Acknowledged',
      acknowledgedBy: 'Vikram Singh',
    });
  }

  suppressAlarm(): void {
    const alarm = this.selectedAlarm();

    if (!alarm) return;

    this.updateAlarm(alarm.id, {
      status: 'Suppressed',
    });
  }

  resolveAlarm(): void {
    const alarm = this.selectedAlarm();

    if (!alarm) return;

    this.updateAlarm(alarm.id, {
      status: 'Resolved',
    });
  }

  createTicket(): void {
    const alarm = this.selectedAlarm();

    if (!alarm) return;

    this.updateAlarm(alarm.id, {
      ticket: alarm.ticket === '-' ? 'TCK-NEW' : alarm.ticket,
      workOrder: alarm.workOrder === '-' ? 'WO-NEW' : alarm.workOrder,
      status: 'Acknowledged',
      acknowledgedBy: 'Vikram Singh',
    });
  }

  openRuleDrawer(): void {
    this.drawerMode.set('rule');
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
    this.drawerMode.set('view');
  }

  private updateAlarm(
    id: string,
    changes: Partial<Alarm>,
  ): void {
    this.alarms.update((items) =>
      items.map((alarm) =>
        alarm.id === id
          ? {
              ...alarm,
              ...changes,
            }
          : alarm,
      ),
    );
  }

  severityTone(
    severity: AlarmSeverity,
  ): 'danger' | 'warning' | 'info' {
    if (severity === 'Critical' || severity === 'High') {
      return 'danger';
    }

    if (severity === 'Medium') {
      return 'warning';
    }

    return 'info';
  }

  statusTone(
    status: AlarmStatus,
  ): 'success' | 'warning' | 'danger' | 'info' | 'muted' {
    if (status === 'Open') return 'danger';
    if (status === 'Acknowledged') return 'warning';
    if (status === 'Suppressed') return 'muted';
    if (status === 'Resolved') return 'success';

    return 'info';
  }
}