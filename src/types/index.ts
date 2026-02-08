export interface User {
    id: string;
    name: string;
    email: string;
    is_active: boolean;
    role_id?: string;
    role?: Role;
    created_at?: string;
    updated_at?: string;
}

export interface Role {
    id: string;
    name: string;
    users_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Employee {
    id: string;
    name: string;
    email?: string;
    job_title?: string;
    status: boolean;
    unit_id?: string;
    unit?: Unit;
    devices_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Unit {
    id: string;
    name: string;
    employees_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Device {
    id: string;
    inventory_code: string;
    brand?: string;
    model?: string;
    serial_number?: string;
    status: 'disponible' | 'asignado' | 'mantenimiento' | 'baja';
    comments?: string;
    category_id?: string;
    category?: Category;
    purchase_id?: string;
    purchase?: Purchase;
    employee_id?: string;
    employee?: Employee;
    created_at?: string;
    updated_at?: string;
}

export interface Category {
    id: string;
    name: string;
    devices_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Purchase {
    id: string;
    provider: string;
    invoice_number: string;
    total_amount: number;
    purchase_date: string;
    devices_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface AuditLog {
    id: string;
    user_id?: string;
    user?: User;
    event: 'created' | 'updated' | 'deleted';
    auditable_type: string;
    auditable_id: string;
    auditable_name?: string;
    old_values: Record<string, any>;
    new_values: Record<string, any>;
    created_at: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}
