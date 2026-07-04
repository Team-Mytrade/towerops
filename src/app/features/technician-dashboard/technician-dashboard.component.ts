import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';

type WorkOrderStatus =
  | 'Pending'
  | 'Accepted'
  | 'In Progress'
  | 'Completed';

type Priority =
  | 'Low'
  | 'Medium'
  | 'High'
  | 'Critical';

type TechnicianWorkOrder = {
  id: string;
  title: string;

  siteCode: string;
  siteName: string;
  location: string;

  priority: Priority;
  status: WorkOrderStatus;

  assignedAt: string;
  completedAt?: string;
  duration?: string;

  description: string;

  remarks?: string;
};

type TechnicianNotification = {
  id: number;

  title: string;
  message: string;

  type:
  | 'Critical'
  | 'Assignment'
  | 'Approval'
  | 'System';

  time: string;

  read: boolean;

  workOrderId?: string;
};

type ChecklistItem = {
  id: number;
  label: string;
  done: boolean;
};

type TimelineItem = {
  title: string;
  time: string;
};

type DeviceInfo = {
  name: string;
  serial: string;
  status: 'Healthy' | 'Warning' | 'Critical';
};

@Component({
  selector: 'to-technician-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TagModule,
    TabsModule,
    ChartModule,
    TextareaModule,
    CheckboxModule,
  ],
  templateUrl: './technician-dashboard.component.html',
  styleUrl: './technician-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnicianDashboardComponent {

  readonly activeTab = signal(0);

  readonly selectedWorkOrder =
    signal<TechnicianWorkOrder | null>(null);

  readonly remarks = signal('');

  readonly beforeUploaded = signal(false);

  readonly afterUploaded = signal(false);

  readonly workOrders = signal<TechnicianWorkOrder[]>([
    {
      id: 'WO-10021',
      title: 'Signal transmitter inspection',

      siteCode: 'TW-003',
      siteName: 'Sharjah Industrial Tower',
      location: 'Sharjah, UAE',

      priority: 'Critical',
      status: 'Pending',

      assignedAt: 'Today, 09:30 AM',

      description:
        'Signal strength dropped below configured threshold. Inspect transmitter and gateway connectivity.',
    },

    {
      id: 'WO-10032',

      title: 'Battery backup replacement',

      siteCode: 'BL-001',
      siteName: 'Abu Dhabi Central Building',
      location: 'Abu Dhabi, UAE',

      priority: 'High',

      status: 'In Progress',

      assignedAt: 'Today, 08:15 AM',

      description:
        'Battery backup health is below acceptable limit. Replace battery pack and validate backup duration.',

      remarks:
        'Reached site and started inspection.',
    },

    {
      id: 'WO-10041',

      title: 'Generator routine service',

      siteCode: 'TW-001',
      siteName: 'Dubai Marina Tower',
      location: 'Dubai, UAE',

      priority: 'Medium',

      status: 'Completed',

      assignedAt: 'Yesterday, 04:20 PM',

      completedAt: 'Yesterday, 06:10 PM',

      duration: '1h 50m',

      description:
        'Scheduled generator service completed.',

      remarks:
        'Oil level checked, filters cleaned and generator tested.',
    },
  ]);

  // ------------------------------
  // Notifications
  // ------------------------------

  readonly notifications = signal<TechnicianNotification[]>([
    {
      id: 1,
      title: 'Critical Work Order Assigned',
      message: 'WO-10021 assigned for Sharjah Industrial Tower.',
      type: 'Critical',
      time: '2 min ago',
      read: false,
      workOrderId: 'WO-10021',
    },
    {
      id: 2,
      title: 'Battery Replacement Started',
      message: 'Battery replacement is in progress.',
      type: 'Assignment',
      time: '18 min ago',
      read: false,
      workOrderId: 'WO-10032',
    },
    {
      id: 3,
      title: 'Generator Service Approved',
      message: 'Supervisor approved completed work.',
      type: 'Approval',
      time: 'Yesterday',
      read: true,
      workOrderId: 'WO-10041',
    },
  ]);

  // ------------------------------
  // Demo Checklist
  // ------------------------------

  readonly checklist = signal<ChecklistItem[]>([{
    id: 1,
    label: 'Reached Site',
    done: false,
  },
  {
    id: 2,
    label: 'Safety Checklist Completed',
    done: false,
  },
  {
    id: 3,
    label: 'Power Source Verified',
    done: false,
  },
  {
    id: 4,
    label: 'Device Inspected',
    done: false,
  },
  {
    id: 5,
    label: 'Signal Tested',
    done: false,
  },
  {
    id: 6,
    label: 'Customer Informed',
    done: false,
  },
  ]);

  // ------------------------------
  // Affected Devices
  // ------------------------------

  readonly affectedDevices: DeviceInfo[] = [
    {
      name: 'Gateway Controller',
      serial: 'GW-00192',
      status: 'Healthy',
    },
    {
      name: 'Signal Transmitter',
      serial: 'TX-33882',
      status: 'Critical',
    },
    {
      name: 'Battery Backup Unit',
      serial: 'BAT-11391',
      status: 'Warning',
    },
  ];

  // ------------------------------
  // Timeline
  // ------------------------------

  readonly timeline = computed<TimelineItem[]>(() => {

    const order = this.selectedWorkOrder();

    if (!order) {
      return [];
    }

    const items: TimelineItem[] = [
      {
        title: 'Work Order Assigned',
        time: order.assignedAt,
      },
    ];

    if (
      order.status === 'Accepted' ||
      order.status === 'In Progress' ||
      order.status === 'Completed'
    ) {
      items.push({
        title: 'Accepted by Technician',
        time: 'Today • 09:42 AM',
      });
    }

    if (
      order.status === 'In Progress' ||
      order.status === 'Completed'
    ) {
      items.push({
        title: 'Work Started',
        time: 'Today • 09:55 AM',
      });
    }

    if (order.status === 'Completed') {
      items.push({
        title: 'Work Completed',
        time: order.completedAt ?? 'Just now',
      });
    }

    return items;
  });

  // ------------------------------
  // Computed
  // ------------------------------

  readonly assignedOrders = computed(() =>
    this.workOrders().filter(
      x => x.status !== 'Completed'
    )
  );

  readonly workHistory = computed(() =>
    this.workOrders().filter(
      x => x.status === 'Completed'
    )
  );

  readonly unreadNotifications = computed(() =>
    this.notifications().filter(
      x => !x.read
    ).length
  );

  readonly stats = computed(() => {

    const orders = this.workOrders();

    return [
      {
        label: 'Pending',
        value: orders.filter(x => x.status === 'Pending').length,
        icon: 'pi pi-clock',
        tone: 'warning',
      },
      {
        label: 'In Progress',
        value: orders.filter(x => x.status === 'In Progress').length,
        icon: 'pi pi-spin pi-spinner',
        tone: 'info',
      },
      {
        label: 'Completed',
        value: orders.filter(x => x.status === 'Completed').length,
        icon: 'pi pi-check-circle',
        tone: 'success',
      },
      {
        label: 'Unread Alerts',
        value: this.unreadNotifications(),
        icon: 'pi pi-bell',
        tone: 'danger',
      },
    ];
  });

  // ------------------------------
  // Performance Chart
  // ------------------------------

  readonly performanceChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

    datasets: [
      {
        label: 'Completed',

        data: [2, 4, 3, 5, 4, 2],

        backgroundColor: '#2563eb',

        borderRadius: 5,
      },
    ],
  };

  readonly performanceChartOptions = {

    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
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
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // ------------------------------
  // Drawer
  // ------------------------------

  openWorkOrder(order: TechnicianWorkOrder): void {
    this.selectedWorkOrder.set(order);
    this.remarks.set(order.remarks ?? '');

    this.beforeUploaded.set(order.status === 'Completed');
    this.afterUploaded.set(order.status === 'Completed');

    this.resetChecklist(order.status === 'Completed');
  }

  closeDrawer(): void {
    this.selectedWorkOrder.set(null);
    this.remarks.set('');
    this.beforeUploaded.set(false);
    this.afterUploaded.set(false);
    this.resetChecklist(false);
  }

  // ------------------------------
  // Work Order Actions
  // ------------------------------

  acceptWork(order: TechnicianWorkOrder): void {
    this.updateStatus(order.id, 'Accepted');

    this.pushNotification(
      'Work Order Accepted',
      `${order.id} accepted successfully.`,
      'System',
      order.id,
    );
  }

  markInProgress(order: TechnicianWorkOrder): void {
    this.updateStatus(order.id, 'In Progress');

    this.pushNotification(
      'Work Started',
      `${order.id} moved to In Progress.`,
      'Assignment',
      order.id,
    );
  }

  markCompleted(order: TechnicianWorkOrder): void {
    const checklistDone = this.checklist().every((item) => item.done);
    const hasAfterPhoto = this.afterUploaded();
    const hasRemarks = !!this.remarks().trim();

    if (!checklistDone || !hasAfterPhoto || !hasRemarks) {
      this.pushNotification(
        'Completion Blocked',
        'Complete checklist, upload after photo, and add technician notes.',
        'System',
        order.id,
      );

      return;
    }

    this.workOrders.update((orders) =>
      orders.map((item) =>
        item.id === order.id
          ? {
            ...item,
            status: 'Completed',
            completedAt: 'Just now',
            duration: item.duration ?? '1h 20m',
            remarks: this.remarks().trim(),
          }
          : item,
      ),
    );

    const updated = this.workOrders().find((item) => item.id === order.id) ?? null;

    this.selectedWorkOrder.set(updated);

    this.pushNotification(
      'Work Completed',
      `${order.id} marked as completed.`,
      'Approval',
      order.id,
    );
  }

  private updateStatus(id: string, status: WorkOrderStatus): void {
    this.workOrders.update((orders) =>
      orders.map((order) =>
        order.id === id
          ? {
            ...order,
            status,
            remarks: this.remarks().trim() || order.remarks,
          }
          : order,
      ),
    );

    const updated = this.workOrders().find((order) => order.id === id) ?? null;

    this.selectedWorkOrder.set(updated);
  }

  // ------------------------------
  // Checklist
  // ------------------------------

  toggleChecklist(id: number): void {
    this.checklist.update((items) =>
      items.map((item) =>
        item.id === id
          ? {
            ...item,
            done: !item.done,
          }
          : item,
      ),
    );
  }

  resetChecklist(done: boolean): void {
    this.checklist.update((items) =>
      items.map((item) => ({
        ...item,
        done,
      })),
    );
  }

  readonly checklistProgress = computed(() => {
    const items = this.checklist();

    if (!items.length) {
      return 0;
    }

    const completed = items.filter((item) => item.done).length;

    return Math.round((completed / items.length) * 100);
  });

  // ------------------------------
  // Evidence
  // ------------------------------

  markBeforeUploaded(): void {
    this.beforeUploaded.set(true);

    const order = this.selectedWorkOrder();

    if (order) {
      this.pushNotification(
        'Before Photo Uploaded',
        `Before photo added for ${order.id}.`,
        'System',
        order.id,
      );
    }
  }

  markAfterUploaded(): void {
    this.afterUploaded.set(true);

    const order = this.selectedWorkOrder();

    if (order) {
      this.pushNotification(
        'After Photo Uploaded',
        `After photo added for ${order.id}.`,
        'System',
        order.id,
      );
    }
  }

  // ------------------------------
  // Notifications
  // ------------------------------

  openNotification(notification: TechnicianNotification): void {
    this.notifications.update((items) =>
      items.map((item) =>
        item.id === notification.id
          ? {
            ...item,
            read: true,
          }
          : item,
      ),
    );

    if (!notification.workOrderId) {
      return;
    }

    const order = this.workOrders().find(
      (item) => item.id === notification.workOrderId,
    );

    if (order) {
      this.openWorkOrder(order);
    }
  }

  markAllRead(): void {
    this.notifications.update((items) =>
      items.map((item) => ({
        ...item,
        read: true,
      })),
    );
  }

  private pushNotification(
    title: string,
    message: string,
    type: TechnicianNotification['type'],
    workOrderId?: string,
  ): void {
    this.notifications.update((items) => [
      {
        id: Date.now(),
        title,
        message,
        type,
        time: 'Just now',
        read: false,
        workOrderId,
      },
      ...items,
    ]);
  }

  // ------------------------------
  // Severity Helpers
  // ------------------------------

  prioritySeverity(priority: Priority): 'success' | 'info' | 'warn' | 'danger' {
    if (priority === 'Critical') {
      return 'danger';
    }

    if (priority === 'High') {
      return 'warn';
    }

    if (priority === 'Medium') {
      return 'info';
    }

    return 'success';
  }

  statusSeverity(
    status: WorkOrderStatus,
  ): 'success' | 'info' | 'warn' | 'secondary' {
    if (status === 'Completed') {
      return 'success';
    }

    if (status === 'In Progress') {
      return 'info';
    }

    if (status === 'Accepted') {
      return 'secondary';
    }

    return 'warn';
  }

  notificationSeverity(
    type: TechnicianNotification['type'],
  ): 'danger' | 'warn' | 'success' | 'info' {
    if (type === 'Critical') {
      return 'danger';
    }

    if (type === 'Assignment') {
      return 'warn';
    }

    if (type === 'Approval') {
      return 'success';
    }

    return 'info';
  }
}