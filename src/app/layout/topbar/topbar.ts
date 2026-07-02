import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { NavigationService } from '../../core/interceptors/navigation.service';

@Component({
  selector: 'to-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Topbar implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  readonly navigation = inject(NavigationService);

  @Output() readonly mobileMenu = new EventEmitter<void>();

  private routerSub?: Subscription;

  readonly navigatorOpen = signal(false);
  readonly breadcrumbs = signal<string[]>(['TowerOps', 'Dashboard']);

  readonly filteredGroups = this.navigation.filteredGroups;

  ngOnInit(): void {
    this.setBreadcrumbs();

    this.routerSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeNavigator();
        this.setBreadcrumbs();
      });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeNavigator();
  }

  toggleNavigator(event?: MouseEvent): void {
    event?.stopPropagation();
    this.navigatorOpen.update((open) => !open);
  }

  openMobileMenu(): void {
    this.mobileMenu.emit();
  }

  closeNavigator(): void {
    this.navigatorOpen.set(false);
    this.navigation.clearSearch();
  }

  onSearch(value: string): void {
    this.navigation.setSearch(value);
  }

  navigate(path: string): void {
    this.closeNavigator();
    this.router.navigateByUrl(path);
  }

  private setBreadcrumbs(): void {
    this.breadcrumbs.set(this.navigation.getBreadcrumbs(this.router.url));
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }
}
