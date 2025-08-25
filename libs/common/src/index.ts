export * from './decorators';
export * from './interfaces';
export * from './dto';
export * from './enums';
export * from './utils';
export * from './filters';
export * from './guards';
export * from './interceptors';
export * from './pipes';



export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: Date;
}

export interface EventPayload {
  eventType: string;
  organizationId: string;
  userId?: string;
  data: any;
  timestamp: Date;
  correlationId?: string;
}