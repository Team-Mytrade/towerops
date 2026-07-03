import { Injectable, inject } from '@angular/core';

import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export type RuleSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RuleCategory = 'CONDITION';
export type RuleScope = 'GLOBAL' | 'TENANT' | 'SITE' | 'DEVICE';
export type RuleActionType = 'ALERT' | 'TICKET' | 'NOTIFICATION';

export type RuleCondition = {
  field: string;
  operator: string;
  value: string;
  logicalOperator: 'AND' | 'OR';
};

export type RulePayload = {
  ruleCode: string;
  name: string;
  description: string;
  category: RuleCategory;
  scope: RuleScope;
  tenantId: string;
  siteCode: string;
  deviceId: string;
  actionType: RuleActionType;
  actionTarget: string;
  severity: RuleSeverity;
  priority: number;
  enabled: boolean;
  definition: {
    conditions: RuleCondition[];
  };
};

export type Rule = RulePayload & {
  id: number;
};

@Injectable({
  providedIn: 'root',
})
export class RuleService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  private readonly endpoint = '/v1/rules';

  create(payload: RulePayload) {
    return this.api.post<Rule>(this.endpoint, payload);
  }

  getByDevice(params: {
    tenantId?: string;
    siteCode: string;
    deviceId: string;
  }) {
    return this.api.get<Rule[]>(`${this.endpoint}/device`, {
      params: {
        tenantId: params.tenantId || this.auth.getTenantId() || 'DEFAULT',
        siteCode: params.siteCode,
        deviceId: params.deviceId,
      },
    });
  }
}