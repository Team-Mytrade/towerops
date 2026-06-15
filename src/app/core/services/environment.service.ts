import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  readonly production = environment.production;

  readonly apiUrl = environment.apiUrl;

  readonly appName = environment.appName;
}