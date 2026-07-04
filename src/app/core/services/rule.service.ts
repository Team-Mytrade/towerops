import { Injectable, inject } from '@angular/core';

import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export type RuleSeverity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type RuleScope =
  | 'GLOBAL'
  | 'TENANT'
  | 'SITE'
  | 'DEVICE';

export type RuleActionType =
  | 'ALERT'
  | 'TICKET'
  | 'NOTIFICATION';

export type RuleCategory =
  | 'CONDITION'
  | 'REGEX'
  | 'THRESHOLD'
  | 'RANGE'
  | 'STATE_CHANGE'
  | 'ABSENCE'
  | 'AGGREGATION'
  | 'SCHEDULE'
  | 'GEO_FENCE'
  | 'DUPLICATE'
  | 'SCRIPT';

export type RuleLogicalOperator = 'AND' | 'OR';

export type RuleCondition = {
  field: string;
  operator: string;
  value: string;
  logicalOperator?: RuleLogicalOperator;
};

export type ConditionDefinition = {
  conditions: RuleCondition[];
};

export type RegexDefinition = {
  field: string;
  pattern: string;
};

export type ThresholdDefinition = {
  field: string;
  operator: string;
  threshold: number;
  duration: string;
};

export type RangeDefinition = {
  field: string;
  minValue: number;
  maxValue: number;
};

export type StateChangeDefinition = {
  field: string;
  fromValue: string;
  toValue: string;
};

export type AbsenceDefinition = {
  field: string;
  duration: string;
};

export type AggregationDefinition = {
  aggregationType: 'AVG' | 'SUM' | 'MIN' | 'MAX' | 'COUNT';
  field: string;
  window: string;
  operator: string;
  value: number;
};

export type ScheduleDefinition = {
  cronExpression: string;
};

export type GeoFenceDefinition = {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  event: 'ENTER' | 'EXIT';
};

export type DuplicateDefinition = {
  field: string;
  window: string;
};

export type ScriptDefinition = {
  language: string;
  expression: string;
};

export type RuleDefinition =
  | ConditionDefinition
  | RegexDefinition
  | ThresholdDefinition
  | RangeDefinition
  | StateChangeDefinition
  | AbsenceDefinition
  | AggregationDefinition
  | ScheduleDefinition
  | GeoFenceDefinition
  | DuplicateDefinition
  | ScriptDefinition;

export type RulePayload = {
  ruleCode: string;
  name: string;
  description: string;
  category: RuleCategory;

  scope: RuleScope;

  tenantId: string;
  siteCode: string;

  deviceId: string | null;

  actionType: RuleActionType;

  actionTarget: string;

  severity: RuleSeverity;

  priority: number;

  enabled: boolean;

  definition: RuleDefinition;
};

export type Rule = RulePayload & {
  id: number;
};

export type ApiResponse<T> = {
  timestamp: number;
  success: boolean;
  message: string;
  data: T;
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