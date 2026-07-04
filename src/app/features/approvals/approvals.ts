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

type ApprovalPriority =
  | 'Critical'
  | 'High'
  | 'Medium'
  | 'Low';

type ApprovalStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Returned';

type DrawerMode =
  | 'policy';

type Approval = {

  id:string;

  workOrder:string;

  ticket:string;

  site:string;

  technician:string;

  submitted:string;

  priority:ApprovalPriority;

  status:ApprovalStatus;

  notes:string;

  beforeImage:string;

  afterImage:string;

  sensorStatus:string;

  checklist:boolean[];

};

@Component({
  selector:'to-approvals',
  standalone:true,
  imports:[
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
  templateUrl:'./approvals.html',
  styleUrl:'./approvals.scss',
  changeDetection:ChangeDetectionStrategy.OnPush,
})
export class Approvals {

  readonly search =
    signal('');

  readonly statusFilter =
    signal<'All'|ApprovalStatus>('All');

  readonly priorityFilter =
    signal<'All'|ApprovalPriority>('All');

  readonly selectedApprovalId =
    signal('APR-1001');

  readonly drawerOpen =
    signal(false);

  readonly drawerMode =
    signal<DrawerMode>('policy');

  readonly statusOptions = [
    {label:'All Status',value:'All'},
    {label:'Pending',value:'Pending'},
    {label:'Approved',value:'Approved'},
    {label:'Rejected',value:'Rejected'},
    {label:'Returned',value:'Returned'},
  ];

  readonly priorityOptions = [
    {label:'All Priority',value:'All'},
    {label:'Critical',value:'Critical'},
    {label:'High',value:'High'},
    {label:'Medium',value:'Medium'},
    {label:'Low',value:'Low'},
  ];

  readonly approvals =
    signal<Approval[]>([
      {

        id:'APR-1001',

        workOrder:'WO-1002',

        ticket:'TCK-1002',

        site:'Dubai Marina Tower',

        technician:'Rashid Ali',

        submitted:'15 mins ago',

        priority:'Critical',

        status:'Pending',

        notes:'Fuel sensor replaced successfully. Readings stabilized.',

        beforeImage:'before.jpg',

        afterImage:'after.jpg',

        sensorStatus:'Fuel Level 54%',

        checklist:[
          true,
          true,
          true,
          false,
        ],
      },

      {

        id:'APR-1002',

        workOrder:'WO-1005',

        ticket:'TCK-1005',

        site:'Business Bay Tower',

        technician:'Ahmed Khan',

        submitted:'Today 09:40',

        priority:'Medium',

        status:'Approved',

        notes:'Battery replaced.',

        beforeImage:'before2.jpg',

        afterImage:'after2.jpg',

        sensorStatus:'Voltage 48V',

        checklist:[
          true,
          true,
          true,
          true,
        ],
      },

      {

        id:'APR-1003',

        workOrder:'WO-1011',

        ticket:'TCK-1011',

        site:'Ajman Warehouse',

        technician:'Naveen Kumar',

        submitted:'Yesterday',

        priority:'High',

        status:'Returned',

        notes:'Need additional site photographs.',

        beforeImage:'before3.jpg',

        afterImage:'after3.jpg',

        sensorStatus:'Offline',

        checklist:[
          true,
          false,
          false,
          false,
        ],
      },

    ]);

  readonly filteredApprovals =
    computed(()=>{

      const query =
        this.search().toLowerCase();

      return this.approvals().filter(item=>{

        const searchOk =
          !query ||

          item.id.toLowerCase().includes(query) ||

          item.site.toLowerCase().includes(query) ||

          item.technician.toLowerCase().includes(query) ||

          item.ticket.toLowerCase().includes(query);

        const statusOk =
          this.statusFilter()==='All' ||
          item.status===this.statusFilter();

        const priorityOk =
          this.priorityFilter()==='All' ||
          item.priority===this.priorityFilter();

        return (
          searchOk &&
          statusOk &&
          priorityOk
        );

      });

    });

  readonly selectedApproval =
    computed(()=>
      this.approvals().find(
        x=>x.id===this.selectedApprovalId()
      )!
    );

  readonly summary =
    computed(()=>{

      const approvals =
        this.approvals();

      return{

        total:
          approvals.length,

        pending:
          approvals.filter(
            x=>x.status==='Pending'
          ).length,

        approved:
          approvals.filter(
            x=>x.status==='Approved'
          ).length,

        rejected:
          approvals.filter(
            x=>x.status==='Rejected'
          ).length,

      };

    });

  readonly timeline =
    signal<TimelineItem[]>([
      {
        title:'Technician completed work',
        description:'Completion submitted.',
        time:'09:15',
        tone:'success',
      },
      {
        title:'Evidence uploaded',
        description:'Photos & notes uploaded.',
        time:'09:16',
        tone:'info',
      },
      {
        title:'Approval requested',
        description:'Waiting for Admin.',
        time:'09:17',
        tone:'warning',
      },
    ]);
  selectApproval(approval: Approval): void {
    this.selectedApprovalId.set(approval.id);
  }

  approveApproval(): void {
    const approval = this.selectedApproval();

    if (!approval) return;

    this.updateApproval(approval.id, {
      status: 'Approved',
    });
  }

  rejectApproval(): void {
    const approval = this.selectedApproval();

    if (!approval) return;

    this.updateApproval(approval.id, {
      status: 'Rejected',
    });
  }

  returnApproval(): void {
    const approval = this.selectedApproval();

    if (!approval) return;

    this.updateApproval(approval.id, {
      status: 'Returned',
    });
  }

  openPolicyDrawer(): void {
    this.drawerMode.set('policy');
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  checklistCompleted(approval: Approval): number {
    return approval.checklist.filter(Boolean).length;
  }

  checklistTotal(approval: Approval): number {
    return approval.checklist.length;
  }

  private updateApproval(
    id: string,
    changes: Partial<Approval>,
  ): void {
    this.approvals.update((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              ...changes,
            }
          : item,
      ),
    );
  }

  priorityTone(
    priority: ApprovalPriority,
  ): 'danger' | 'warning' | 'info' {
    if (priority === 'Critical' || priority === 'High') {
      return 'danger';
    }

    if (priority === 'Medium') {
      return 'warning';
    }

    return 'info';
  }

  statusTone(
    status: ApprovalStatus,
  ): 'success' | 'warning' | 'danger' | 'info' {
    if (status === 'Approved') return 'success';
    if (status === 'Pending') return 'warning';
    if (status === 'Rejected') return 'danger';
    return 'info';
  }
}