export const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERN', label: 'Intern' },
];

export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatMonth(month) {
  const num = Number(month);
  const found = MONTHS.find((m) => m.value === num);
  return found ? found.label : String(month ?? '-');
}

export function formatEmploymentType(type) {
  if (!type) return '-';
  const found = EMPLOYMENT_TYPES.find((t) => t.value === type);
  return found ? found.label : type.replace(/_/g, ' ');
}

export function getEmployeeUsername(employee) {
  if (!employee) return '-';
  return employee.user?.username || employee.username || `Employee #${employee.id}`;
}

export function getEmployeeEmail(employee) {
  if (!employee) return '-';
  return employee.user?.email || employee.email || '-';
}

export function getEmployeeRole(employee) {
  if (!employee) return 'EMPLOYEE';
  return employee.user?.role || employee.role || 'EMPLOYEE';
}

export function getDepartmentId(employee) {
  if (!employee) return '';
  if (employee.department && typeof employee.department === 'object') {
    return employee.department.id ?? '';
  }
  return employee.department_id ?? employee.department ?? '';
}

export function getDepartmentName(employee, departments = []) {
  if (!employee) return '-';
  if (employee.department && typeof employee.department === 'object') {
    return employee.department.name || '-';
  }
  if (employee.department_name) {
    return employee.department_name;
  }
  const deptId = employee.department_id ?? employee.department;
  if (deptId !== null && deptId !== undefined && deptId !== '') {
    const match = departments.find((d) => String(d.id) === String(deptId));
    return match ? match.name : `Department #${deptId}`;
  }
  return '-';
}

export function getPayrollEmployeeLabel(record, employees = []) {
  if (!record) return '-';
  if (record.employee_name) return record.employee_name;
  if (record.employee_username) return record.employee_username;
  if (record.employee && typeof record.employee === 'object') {
    return getEmployeeUsername(record.employee);
  }
  const emp = employees.find((e) => String(e.id) === String(record.employee));
  if (emp) return getEmployeeUsername(emp);
  return record.employee ? `Employee #${record.employee}` : '-';
}
