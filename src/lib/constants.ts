export const FIELD_TRANSLATIONS: Record<string, string> = {
    is_active: "Estado",
    comments: "Comentario",
    name: "Nombre",
    email: "Correo",
    role_id: "Rol",
    employee_id: "Empleado",
    device_id: "Equipo",
    unit_id: "Unidad",
    inventory_code: "N° Inventario",
    brand: "Marca",
    model: "Modelo",
    serial_number: "Serie",
    status: "Estado",
    provider: "Proveedor",
    invoice_number: "Factura",
    total_amount: "Monto",
    note: "Nota",
    job_title: "Cargo",
    purchase_date: "Fecha de Compra",
    created_at: "Fecha de Creación",
    updated_at: "Última Actualización",
};

export const MODULE_CONFIG: Record<string, string[]> = {
    'Dispositivo': ['inventory_code', 'status', 'brand', 'model', 'comments'],
    'Usuario': ['name', 'email', 'is_active'],
    'Empleado': ['name', 'status', 'job_title'],
    'Compra': ['provider', 'invoice_number', 'total_amount'],
    'Unidad': ['name'],
    'Rol': ['name'],
    'Categoría': ['name'],
    'Asignación': ['note', 'status'],
    'default': ['name', 'inventory_code']
};

export const MODEL_TRANSLATIONS: Record<string, string> = {
    'Device': 'Dispositivo',
    'Assignment': 'Asignación',
    'User': 'Usuario',
    'Role': 'Rol',
    'Employee': 'Empleado',
    'Unit': 'Unidad',
    'Category': 'Categoría',
    'Purchase': 'Compra'
};

export const SUPER_ROLES = ['admin', 'administrador', 'developer'];

export const DEVICE_STATUS_OPTIONS = [
    { value: 'disponible', label: 'Disponible', color: 'green' },
    { value: 'asignado', label: 'Asignado', color: 'blue' },
    { value: 'mantenimiento', label: 'Mantenimiento', color: 'orange' },
    { value: 'baja', label: 'Baja', color: 'red' },
];
