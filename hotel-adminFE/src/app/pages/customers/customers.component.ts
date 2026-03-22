import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HeaderTopbarComponent } from '../../components/header-topbar/header-topbar.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { Customer } from '../../models/customer.model';
import { AuthService } from '../../services/auth.service';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, SidebarComponent, HeaderTopbarComponent, PaginationComponent],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css',
})
export class CustomersComponent implements OnInit {
  loading = false;
  exportLoading = false;
  customers: Customer[] = [];
  selectedCustomer: Customer | null = null;

  searchTerm = '';

  sortBy: 'recentlyCreated' | 'oldestCreated' | 'nameAsc' | 'nameDesc' = 'recentlyCreated';

  page = 1;
  pageSize = 8;
  totalItems = 0;
  totalPages = 1;


  userInfo = {
    name: 'Hotel Staff',
    role: 'receptionist',
    profileImage: 'assets/images/admin-profile.png',
  };

  constructor(
    private customerService: CustomerService,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.resolveUserInfo();
    this.loadCustomers();
  }

  get showingFrom(): number {
    if (this.totalItems === 0) {
      return 0;
    }
    return (this.page - 1) * this.pageSize + 1;
  }

  get showingTo(): number {
    return Math.min(this.page * this.pageSize, this.totalItems);
  }

  loadCustomers(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.customerService
      .getCustomers({
        search: this.searchTerm.trim(),
        sortBy: this.sortBy,
        page: this.page,
        limit: this.pageSize,
      })
      .subscribe({
        next: (response) => {
          this.ngZone.run(() => {
            this.customers = response.data || [];
            this.totalItems = response.pagination?.totalItems || this.customers.length;
            this.totalPages = response.pagination?.totalPages || 1;
            this.page = response.pagination?.page || 1;

            this.loading = false;
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.customers = [];
            this.totalItems = 0;
            this.totalPages = 1;
            this.page = 1;
            this.loading = false;
            this.cdr.detectChanges();
          });
        },
      });
  }

  applyFilters(): void {
    this.page = 1;
    this.loadCustomers();
  }

  goToPage(target: number): void {
    if (target < 1 || target > this.totalPages || target === this.page) {
      return;
    }

    this.page = target;
    this.loadCustomers();
  }

  onPageChange(page: number): void {
    this.goToPage(page);
  }

  openDetail(customer: Customer): void {
    this.selectedCustomer = customer;
  }

  onExportFile(): void {
    if (this.exportLoading) {
      return;
    }

    this.exportLoading = true;
    this.cdr.detectChanges();

    this.customerService
      .exportCustomers({
        search: this.searchTerm.trim(),
        sortBy: this.sortBy,
      })
      .subscribe({
        next: (blob) => {
          this.ngZone.run(() => {
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
            anchor.click();
            window.URL.revokeObjectURL(url);

            this.exportLoading = false;
            this.cdr.detectChanges();
          });
        },
        error: () => {
          this.ngZone.run(() => {
            this.exportLoading = false;
            this.cdr.detectChanges();
          });
        },
      });
  }

  closeDetail(): void {
    this.selectedCustomer = null;
  }

  formatDate(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '-';
    }

    return parsed.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  }

  initials(name: string): string {
    const parts = (name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return 'NA';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
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
