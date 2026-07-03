import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

type WorkOrderStatus = 'Pending' | 'In Progress' | 'Completed';

type TechnicianWorkOrder = {
  id: string;
  title: string;
  siteCode: string;
  siteName: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: WorkOrderStatus;
  assignedAt: string;
  description: string;
};

@Component({
  selector: 'to-technician-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule],
  templateUrl: './technician-dashboard.component.html',
  styleUrl: './technician-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnicianDashboardComponent {
  readonly selectedWorkOrder = signal<TechnicianWorkOrder | null>(null);

  readonly workOrders = signal<TechnicianWorkOrder[]>([
    {
      id: 'WO-10021',
      title: 'Signal transmitter inspection',
      siteCode: 'TW-003',
      siteName: 'Sharjah Industrial Tower',
      priority: 'Critical',
      status: 'Pending',
      assignedAt: 'Today, 09:30 AM',
      description: 'Signal strength dropped below configured threshold.',
    },
    {
      id: 'WO-10032',
      title: 'Battery backup replacement',
      siteCode: 'BL-001',
      siteName: 'Abu Dhabi Central Building',
      priority: 'High',
      status: 'In Progress',
      assignedAt: 'Today, 08:15 AM',
      description: 'Battery backup health is below acceptable limit.',
    },
    {
      id: 'WO-10041',
      title: 'Generator routine service',
      siteCode: 'TW-001',
      siteName: 'Dubai Marina Tower',
      priority: 'Medium',
      status: 'Completed',
      assignedAt: 'Yesterday, 04:20 PM',
      description: 'Scheduled generator service completed.',
    },
  ]);

  readonly stats = computed(() => {
    const orders = this.workOrders();

    return [
      {
        label: 'Pending',
        value: orders.filter((wo) => wo.status === 'Pending').length,
        icon: 'pi pi-clock',
        tone: 'warning',
      },
      {
        label: 'In Progress',
        value: orders.filter((wo) => wo.status === 'In Progress').length,
        icon: 'pi pi-spin pi-spinner',
        tone: 'info',
      },
      {
        label: 'Completed',
        value: orders.filter((wo) => wo.status === 'Completed').length,
        icon: 'pi pi-check-circle',
        tone: 'success',
      },
      {
        label: 'Total Assigned',
        value: orders.length,
        icon: 'pi pi-briefcase',
        tone: 'neutral',
      },
    ];
  });

  openWorkOrder(order: TechnicianWorkOrder): void {
    this.selectedWorkOrder.set(order);
  }

  closeDrawer(): void {
    this.selectedWorkOrder.set(null);
  }

  markInProgress(order: TechnicianWorkOrder): void {
    this.updateStatus(order.id, 'In Progress');
  }

  markCompleted(order: TechnicianWorkOrder): void {
    this.updateStatus(order.id, 'Completed');
  }

  private updateStatus(id: string, status: WorkOrderStatus): void {
    this.workOrders.update((orders) =>
      orders.map((order) =>
        order.id === id ? { ...order, status } : order,
      ),
    );

    const updated = this.workOrders().find((order) => order.id === id) ?? null;
    this.selectedWorkOrder.set(updated);
  }

  prioritySeverity(priority: TechnicianWorkOrder['priority']): 'success' | 'info' | 'warn' | 'danger' {
    if (priority === 'Critical') return 'danger';
    if (priority === 'High') return 'warn';
    if (priority === 'Medium') return 'info';
    return 'success';
  }

  statusSeverity(status: WorkOrderStatus): 'success' | 'info' | 'warn' {
    if (status === 'Completed') return 'success';
    if (status === 'In Progress') return 'info';
    return 'warn';
  }
}