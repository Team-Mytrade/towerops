import { Observable, delay, of } from 'rxjs';

export function mockDelay<T>(data: T, time = 500): Observable<T> {
  return of(data).pipe(delay(time));
}