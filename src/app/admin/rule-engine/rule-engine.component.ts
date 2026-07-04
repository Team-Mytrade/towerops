import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type RuleStatus = 'Active' | 'Inactive';
type RuleSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
type RuleAction = 'Create Alarm' | 'Create Ticket';

type Rule = {
  id: string;
  name: string;
  module: 'Sensor' | 'Tower' | 'Alert';
  field: string;
  operator: '<' | '>' | '<=' | '>=' | '==' | '!=';
  value: string | number;
  action: RuleAction;
  severity: RuleSeverity;
  status: RuleStatus;
  lastTriggered: string;
};

@Component({
  selector: 'to-rule-engine',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rule-engine.component.html',
  styleUrls: ['./rule-engine.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleEngineComponent {
  readonly search = signal('');
  readonly statusFilter = signal('All');
  readonly actionFilter = signal('All');

  readonly drawerMode = signal<'create' | 'view' | null>(null);
  readonly selectedRule = signal<Rule | null>(null);

  readonly statuses = ['All', 'Active', 'Inactive'];
  readonly actions = ['All', 'Create Alarm', 'Create Ticket'];

  readonly rules = signal<Rule[]>([
    {
      id: 'RULE-001',
      name: 'Signal Drop Alarm',
      module: 'Sensor',
      field: 'signalStrength',
      operator: '<',
      value: 40,
      action: 'Create Alarm',
      severity: 'High',
      status: 'Active',
      lastTriggered: 'Today, 10:42 AM',
    },
    {
      id: 'RULE-002',
      name: 'Fuel Low Alarm',
      module: 'Sensor',
      field: 'fuelLevel',
      operator: '<=',
      value: 20,
      action: 'Create Alarm',
      severity: 'Medium',
      status: 'Active',
      lastTriggered: 'Yesterday, 04:18 PM',
    },
    {
      id: 'RULE-003',
      name: 'Critical Temperature Ticket',
      module: 'Sensor',
      field: 'temperature',
      operator: '>',
      value: 70,
      action: 'Create Ticket',
      severity: 'Critical',
      status: 'Inactive',
      lastTriggered: 'Never',
    },
  ]);

  readonly filteredRules = computed(() => {
    const query = this.search().toLowerCase().trim();
    const status = this.statusFilter();
    const action = this.actionFilter();

    return this.rules().filter((rule) => {
      const matchesSearch =
        !query ||
        rule.name.toLowerCase().includes(query) ||
        rule.id.toLowerCase().includes(query) ||
        rule.field.toLowerCase().includes(query);

      const matchesStatus = status === 'All' || rule.status === status;
      const matchesAction = action === 'All' || rule.action === action;

      return matchesSearch && matchesStatus && matchesAction;
    });
  });

  readonly activeRules = computed(() =>
    this.rules().filter((rule) => rule.status === 'Active').length,
  );

  readonly inactiveRules = computed(() =>
    this.rules().filter((rule) => rule.status === 'Inactive').length,
  );

  readonly alarmRules = computed(() =>
    this.rules().filter((rule) => rule.action === 'Create Alarm').length,
  );

  readonly ticketRules = computed(() =>
    this.rules().filter((rule) => rule.action === 'Create Ticket').length,
  );

  openCreateDrawer(): void {
    this.selectedRule.set(null);
    this.drawerMode.set('create');
  }

  openRule(rule: Rule): void {
    this.selectedRule.set(rule);
    this.drawerMode.set('view');
  }

  closeDrawer(): void {
    this.drawerMode.set(null);
    this.selectedRule.set(null);
  }

  ruleSentence(rule: Rule): string {
    return `IF ${rule.field} ${rule.operator} ${rule.value} THEN ${rule.action.toLowerCase()} with ${rule.severity.toLowerCase()} severity`;
  }
}