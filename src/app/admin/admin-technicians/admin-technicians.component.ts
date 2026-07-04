import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type TechnicianAvailability = 'Available' | 'Busy' | 'Offline';
type TechnicianStatus = 'Active' | 'Inactive';

type Technician = {
  id: string;
  name: string;
  email: string;
  userId?: string;
  zone: string;
  skills: string[];
  availability: TechnicianAvailability;
  currentJobs: number;
  status: TechnicianStatus;
};

@Component({
  selector: 'to-admin-technicians',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-technicians.component.html',
  styleUrls: ['./admin-technicians.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTechniciansComponent {
  readonly search = signal('');
  readonly zoneFilter = signal('All');
  readonly availabilityFilter = signal('All');

  readonly drawerMode = signal<'create' | 'view' | null>(null);
  readonly selectedTechnician = signal<Technician | null>(null);

  readonly zones = ['All', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'];
  readonly availabilityOptions = ['All', 'Available', 'Busy', 'Offline'];

  readonly technicians = signal<Technician[]>([
    {
      id: 'TEC-001',
      name: 'Imran Yusuf',
      email: 'imran.yusuf@towerops.ae',
      userId: 'USR-003',
      zone: 'Dubai',
      skills: ['Signal', 'Transmitter'],
      availability: 'Available',
      currentJobs: 1,
      status: 'Active',
    },
    {
      id: 'TEC-002',
      name: 'Omar Farooq',
      email: 'omar.farooq@towerops.ae',
      userId: 'USR-009',
      zone: 'Abu Dhabi',
      skills: ['Power', 'Generator'],
      availability: 'Busy',
      currentJobs: 3,
      status: 'Active',
    },
    {
      id: 'TEC-003',
      name: 'Nabeel Rahman',
      email: 'nabeel.rahman@towerops.ae',
      zone: 'Sharjah',
      skills: ['Battery', 'Fuel'],
      availability: 'Offline',
      currentJobs: 0,
      status: 'Inactive',
    },
  ]);

  readonly filteredTechnicians = computed(() => {
    const query = this.search().toLowerCase().trim();
    const zone = this.zoneFilter();
    const availability = this.availabilityFilter();

    return this.technicians().filter((tech) => {
      const matchesSearch =
        !query ||
        tech.name.toLowerCase().includes(query) ||
        tech.email.toLowerCase().includes(query) ||
        tech.id.toLowerCase().includes(query) ||
        tech.skills.some((skill) => skill.toLowerCase().includes(query));

      const matchesZone = zone === 'All' || tech.zone === zone;
      const matchesAvailability = availability === 'All' || tech.availability === availability;

      return matchesSearch && matchesZone && matchesAvailability;
    });
  });

  openCreateDrawer(): void {
    this.selectedTechnician.set(null);
    this.drawerMode.set('create');
  }

  openTechnician(technician: Technician): void {
    this.selectedTechnician.set(technician);
    this.drawerMode.set('view');
  }

  closeDrawer(): void {
    this.drawerMode.set(null);
    this.selectedTechnician.set(null);
  }
}