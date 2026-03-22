import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HeaderTopbarComponent } from '../../components/header-topbar/header-topbar.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AuthService } from '../../services/auth.service';
import { RoomStatus, RoomView, RoomService } from '../../services/room.service';

type ActiveFilter = 'all' | 'active' | 'inactive';
type SortOption = 'default' | 'roomAsc' | 'roomDesc' | 'priceHigh' | 'priceLow';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, SidebarComponent, HeaderTopbarComponent, PaginationComponent],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css',
})
export class RoomsComponent implements OnInit {
  loading = false;
  currentPage = 1;
  pageSize = 15;
  rooms: RoomView[] = [];
  filteredRooms: RoomView[] = [];
  pagedRooms: RoomView[] = [];
  roomTypeOptions: string[] = ['all'];

  searchTerm = '';
  statusFilter: 'all' | RoomStatus = 'all';
  activeFilter: ActiveFilter = 'all';
  roomTypeFilter = 'all';
  sortBy: SortOption = 'default';

  userInfo = {
    name: 'Hotel Staff',
    role: 'receptionist',
    profileImage: 'assets/images/admin-profile.png',
  };

  private readonly platformId = inject(PLATFORM_ID);
  private hasLoadedInitially = false;

  constructor(
    private roomService: RoomService,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.resolveUserInfo();

    // Room APIs require browser auth token, so skip SSR fetch to avoid cached empty results.
    if (isPlatformBrowser(this.platformId) && !this.hasLoadedInitially) {
      this.hasLoadedInitially = true;
      setTimeout(() => this.loadRooms(), 0);
    }
  }

  get totalRooms(): number {
    return this.rooms.length;
  }

  get availableRooms(): number {
    return this.rooms.filter((room) => room.status === 'available' && room.is_active).length;
  }

  get occupiedRooms(): number {
    return this.rooms.filter((room) => room.status === 'occupied' && room.is_active).length;
  }

  get maintenanceRooms(): number {
    return this.rooms.filter((room) => room.status === 'maintenance' && room.is_active).length;
  }

  get inactiveRooms(): number {
    return this.rooms.filter((room) => !room.is_active).length;
  }

  get availableRatio(): string {
    return this.toPercent(this.availableRooms, this.totalRooms);
  }

  get occupiedRatio(): string {
    return this.toPercent(this.occupiedRooms, this.totalRooms);
  }

  get maintenanceRatio(): string {
    return this.toPercent(this.maintenanceRooms, this.totalRooms);
  }

  get inactiveRatio(): string {
    return this.toPercent(this.inactiveRooms, this.totalRooms);
  }

  get showingFrom(): number {
    if (this.filteredRooms.length === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get showingTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredRooms.length);
  }

  get totalFilteredRooms(): number {
    return this.filteredRooms.length;
  }

  loadRooms(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.ngZone.run(() => {
          this.rooms = rooms;
          this.roomTypeOptions = this.buildRoomTypeOptions(rooms);
          this.applyFilters();
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.rooms = [];
          this.roomTypeOptions = ['all'];
          this.applyFilters();
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    const filtered = this.rooms.filter((room) => {
      if (search) {
        const haystack = `${room.room_number} ${room.room_type.name} ${room.floor}`.toLowerCase();
        if (!haystack.includes(search)) {
          return false;
        }
      }

      if (this.statusFilter !== 'all' && room.status !== this.statusFilter) {
        return false;
      }

      if (this.activeFilter === 'active' && !room.is_active) {
        return false;
      }

      if (this.activeFilter === 'inactive' && room.is_active) {
        return false;
      }

      if (this.roomTypeFilter !== 'all' && room.room_type.name !== this.roomTypeFilter) {
        return false;
      }

      return true;
    });

    this.filteredRooms = this.sortRooms(filtered);
    this.currentPage = 1;
    this.applyPagination();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyPagination();
  }

  formatCapacity(room: RoomView): string {
    return `${room.capacity.adults} adults, ${room.capacity.children} children`;
  }

  formatPrice(price: number): string {
    return `$${new Intl.NumberFormat('en-US').format(price)}`;
  }

  getStatusLabel(room: RoomView): string {
    if (!room.is_active) {
      return 'Inactive';
    }

    if (room.status === 'available') {
      return 'Available';
    }

    if (room.status === 'occupied') {
      return 'Occupied';
    }

    return 'Maintenance';
  }

  getStatusClass(room: RoomView): string {
    if (!room.is_active) {
      return 'bg-[#fce8e8] text-[#a84545]';
    }

    if (room.status === 'available') {
      return 'bg-[#e9f7ec] text-[#246a38]';
    }

    if (room.status === 'occupied') {
      return 'bg-[#e8f1fb] text-[#2c5f9f]';
    }

    return 'bg-[#ececec] text-[#565656]';
  }

  private sortRooms(rooms: RoomView[]): RoomView[] {
    const next = [...rooms];

    switch (this.sortBy) {
      case 'roomAsc':
        return next.sort((a, b) => Number(a.room_number) - Number(b.room_number));
      case 'roomDesc':
        return next.sort((a, b) => Number(b.room_number) - Number(a.room_number));
      case 'priceHigh':
        return next.sort((a, b) => b.price_per_night - a.price_per_night);
      case 'priceLow':
        return next.sort((a, b) => a.price_per_night - b.price_per_night);
      default:
        return next;
    }
  }

  private toPercent(value: number, total: number): string {
    if (!total) {
      return '0.0%';
    }

    return `${((value / total) * 100).toFixed(1)}%`;
  }

  private buildRoomTypeOptions(rooms: RoomView[]): string[] {
    const roomTypes = new Set(rooms.map((room) => room.room_type.name));
    return ['all', ...Array.from(roomTypes).sort()];
  }

  private applyPagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedRooms = this.filteredRooms.slice(start, end);
  }

  private resolveUserInfo(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return;
    }

    this.userInfo = {
      name: user.name || 'Hotel Staff',
      role: user.role,
      profileImage: user.profileImage || 'assets/images/admin-profile.png',
    };
  }
}
