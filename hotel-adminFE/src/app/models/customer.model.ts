export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  identityId: string;
  createdAt: string;
}

export interface CustomerListResponse {
  success: boolean;
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
