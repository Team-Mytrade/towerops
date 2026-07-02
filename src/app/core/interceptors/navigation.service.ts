import { Injectable, computed, signal } from '@angular/core';
import { NAVIGATION_GROUPS, NavigationGroup, NavigationItem } from '../constants/navigation.constants';


@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private readonly _search = signal('');

  readonly search = computed(() => this._search());

  readonly groups = computed<NavigationGroup[]>(() => NAVIGATION_GROUPS);

  readonly items = computed<NavigationItem[]>(() =>
    this.groups().flatMap((group) => group.items),
  );

  readonly filteredGroups = computed<NavigationGroup[]>(() => {
    const query = this._search().toLowerCase().trim();

    if (!query) {
      return this.groups();
    }

    return this.groups()
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          const haystack = [
            item.label,
            item.path,
            item.description,
            ...(item.keywords ?? []),
          ]
            .join(' ')
            .toLowerCase();

          return haystack.includes(query);
        }),
      }))
      .filter((group) => group.items.length > 0);
  });

  setSearch(value: string): void {
    this._search.set(value);
  }

  clearSearch(): void {
    this._search.set('');
  }

  getBreadcrumbs(url: string): string[] {
    const cleanUrl = url.split('?')[0].split('#')[0];

    const item = this.items().find(
      (nav) => cleanUrl === nav.path || cleanUrl.startsWith(`${nav.path}/`),
    );

    return ['TowerOps', item?.label ?? 'Dashboard'];
  }
}