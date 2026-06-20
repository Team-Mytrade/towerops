import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  readonly production = environment.production;
  readonly appName = environment.appName;
  readonly apiUrl = environment.apiUrl;
  readonly useMockApi = environment.useMockApi;
  readonly realtime = environment.realtime;
  readonly useMockAuth = environment.useMockAuth;
}