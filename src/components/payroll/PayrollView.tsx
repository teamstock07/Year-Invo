import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Employee,
  SalaryType,
  EmployeeStatus,
  PayrollPayment,
  SalaryAdjustment,
  Expense,
} from '../../types';
import {
  DollarSign,
  Users,
  UserPlus,
  Calendar,
  CreditCard,
  Plus,
  FileText,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Filter,
  Search,
  Printer,
  Download,
  Trash2,
  Edit2,
  Receipt,
  X,
  ChevronRight,
  Calculator,
  Percent,
  Briefcase,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export const PayrollView: React.FC = () => {
  const {
    user,
    expenses,
    addExpense,
    formatMoney,
    formatCurrency,
    displayCurrency,
    language,
    t,
    employees: contextEmployees,
    saveEmployees: contextSaveEmployees,
    payrollPayments: contextPayrollPayments,
    savePayrollPayments: contextSavePayrollPayments,
    salaryAdjustments: contextSalaryAdjustments,
    saveSalaryAdjustments: contextSaveSalaryAdjustments,
  } = useApp();

  // Connected to real-time cloud Firestore synchronized state
  const employees = contextEmployees || [];
  const saveEmployees = (updated: Employee[]) => {
    if (contextSaveEmployees) {
      contextSaveEmployees(updated);
    }
    try {
      localStorage.setItem(`biz_employees_${user?.id || 'default'}`, JSON.stringify(updated));
    } catch (e) {}
  };

  const payrollPayments = contextPayrollPayments || [];
  const savePayrollPayments = (updated: PayrollPayment[]) => {
    if (contextSavePayrollPayments) {
      contextSavePayrollPayments(updated);
    }
    try {
      localStorage.setItem(`biz_payroll_payments_${user?.id || 'default'}`, JSON.stringify(updated));
    } catch (e) {}
  };

  const salaryAdjustments = contextSalaryAdjustments || [];
  const saveSalaryAdjustments = (updated: SalaryAdjustment[]) => {
    if (contextSaveSalaryAdjustments) {
      contextSaveSalaryAdjustments(updated);
    }
    try {
      localStorage.setItem(`biz_salary_adjustments_${user?.id || 'default'}`, JSON.stringify(updated));
    } catch (e) {}
  };

  // Navigation Tabs inside Payroll
  const [activePayrollTab, setActivePayrollTab] = useState<'dashboard' | 'employees' | 'process' | 'advances' | 'reports'>('dashboard');

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Modal States
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedEmployeeForPay, setSelectedEmployeeForPay] = useState<Employee | null>(null);
  const [existingPaymentRecord, setExistingPaymentRecord] = useState<PayrollPayment | null>(null);

  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  // Payslip Print Modal
  const [printPayslipRecord, setPrintPayslipRecord] = useState<PayrollPayment | null>(null);

  // Employee Form State
  const [empId, setEmpId] = useState('');
  const [empFullName, setEmpFullName] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empJobTitle, setEmpJobTitle] = useState('');
  const [empDepartment, setEmpDepartment] = useState('Sales & POS');
  const [empRole, setEmpRole] = useState('Cashier');
  const [empJoiningDate, setEmpJoiningDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [empSalaryType, setEmpSalaryType] = useState<SalaryType>('Monthly');
  const [empBaseSalary, setEmpBaseSalary] = useState<number>(15000);
  const [empStatus, setEmpStatus] = useState<EmployeeStatus>('Active');
  const [empNotes, setEmpNotes] = useState('');

  // Payment Processing Form State
  const [payPeriod, setPayPeriod] = useState(selectedMonth);
  const [payBaseSalary, setPayBaseSalary] = useState<number>(0);
  const [payBonus, setPayBonus] = useState<number>(0);
  const [payOvertimeHours, setPayOvertimeHours] = useState<number>(0);
  const [payOvertimeRate, setPayOvertimeRate] = useState<number>(150);
  const [payDeduction, setPayDeduction] = useState<number>(0);
  const [payAdvanceDeduction, setPayAdvanceDeduction] = useState<number>(0);
  const [payPaidAmount, setPayPaidAmount] = useState<number>(0);
  const [payPaymentMethod, setPayPaymentMethod] = useState('Cash');
  const [payNotes, setPayNotes] = useState('');
  const [paySyncExpense, setPaySyncExpense] = useState(true);

  // Adjustment Form State
  const [adjEmployeeId, setAdjEmployeeId] = useState('');
  const [adjType, setAdjType] = useState<'advance' | 'bonus' | 'commission' | 'overtime' | 'deduction'>('advance');
  const [adjAmount, setAdjAmount] = useState<number>(1000);
  const [adjReason, setAdjReason] = useState('');
  const [adjDate, setAdjDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Tenure calculation helper
  const calculateTenure = (joiningDateStr: string) => {
    if (!joiningDateStr) return 'N/A';
    const start = new Date(joiningDateStr);
    const now = new Date();
    const diffMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (diffMonths <= 0) return 'Joined this month';
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    if (years === 0) return `${months} month${months > 1 ? 's' : ''}`;
    return `${years} yr${years > 1 ? 's' : ''} ${months} mo${months > 1 ? 's' : ''}`;
  };

  // Open Employee Modal
  const openAddEmployeeModal = () => {
    setEditingEmployee(null);
    setEmpId(`EMP-${String(employees.length + 1).padStart(3, '0')}`);
    setEmpFullName('');
    setEmpPhone('');
    setEmpEmail('');
    setEmpJobTitle('');
    setEmpDepartment('Sales & POS');
    setEmpRole('Cashier');
    setEmpJoiningDate(new Date().toISOString().split('T')[0]);
    setEmpSalaryType('Monthly');
    setEmpBaseSalary(15000);
    setEmpStatus('Active');
    setEmpNotes('');
    setIsEmployeeModalOpen(true);
  };

  const openEditEmployeeModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpId(emp.employeeId);
    setEmpFullName(emp.fullName);
    setEmpPhone(emp.phone);
    setEmpEmail(emp.email || '');
    setEmpJobTitle(emp.jobTitle);
    setEmpDepartment(emp.department);
    setEmpRole(emp.role);
    setEmpJoiningDate(emp.joiningDate);
    setEmpSalaryType(emp.salaryType);
    setEmpBaseSalary(emp.baseSalary);
    setEmpStatus(emp.status);
    setEmpNotes(emp.notes || '');
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empFullName.trim() || !empPhone.trim()) {
      alert('Please enter employee name and phone number.');
      return;
    }

    if (editingEmployee) {
      const updated = employees.map((emp) =>
        emp.id === editingEmployee.id
          ? {
              ...emp,
              employeeId: empId.trim(),
              fullName: empFullName.trim(),
              phone: empPhone.trim(),
              email: empEmail.trim(),
              jobTitle: empJobTitle.trim(),
              department: empDepartment,
              role: empRole,
              joiningDate: empJoiningDate,
              salaryType: empSalaryType,
              baseSalary: Number(empBaseSalary) || 0,
              status: empStatus,
              notes: empNotes.trim(),
            }
          : emp
      );
      saveEmployees(updated);
    } else {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        employeeId: empId.trim() || `EMP-${String(employees.length + 1).padStart(3, '0')}`,
        fullName: empFullName.trim(),
        phone: empPhone.trim(),
        email: empEmail.trim(),
        jobTitle: empJobTitle.trim() || 'Staff',
        department: empDepartment,
        role: empRole,
        joiningDate: empJoiningDate,
        salaryType: empSalaryType,
        baseSalary: Number(empBaseSalary) || 0,
        status: empStatus,
        notes: empNotes.trim(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      saveEmployees([...employees, newEmp]);
    }

    setIsEmployeeModalOpen(false);
  };

  const handleDeleteEmployee = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove employee "${name}"?`)) {
      saveEmployees(employees.filter((e) => e.id !== id));
    }
  };

  // Open Salary Payment Modal
  const openPaySalaryModal = (emp: Employee, existingRecord?: PayrollPayment) => {
    setSelectedEmployeeForPay(emp);
    setExistingPaymentRecord(existingRecord || null);
    setPayPeriod(selectedMonth);

    // Calculate un-deducted advances for this employee
    const employeeAdvances = salaryAdjustments
      .filter((a) => a.employeeId === emp.id && a.type === 'advance')
      .reduce((sum, a) => sum + a.amount, 0);

    if (existingRecord) {
      setPayBaseSalary(existingRecord.baseSalary);
      setPayBonus(existingRecord.bonus);
      setPayOvertimeHours(0);
      setPayOvertimeRate(0);
      setPayDeduction(existingRecord.deduction);
      setPayAdvanceDeduction(existingRecord.advance);
      setPayPaidAmount(existingRecord.remainingAmount);
      setPayPaymentMethod(existingRecord.paymentMethod || 'Cash');
      setPayNotes(existingRecord.notes || '');
    } else {
      setPayBaseSalary(emp.baseSalary);
      setPayBonus(0);
      setPayOvertimeHours(0);
      setPayOvertimeRate(150);
      setPayDeduction(0);
      setPayAdvanceDeduction(employeeAdvances > 0 ? Math.min(employeeAdvances, emp.baseSalary / 2) : 0);
      const calculatedNet = emp.baseSalary - (employeeAdvances > 0 ? Math.min(employeeAdvances, emp.baseSalary / 2) : 0);
      setPayPaidAmount(Math.max(0, calculatedNet));
      setPayPaymentMethod('Cash');
      setPayNotes('');
    }

    setIsPayModalOpen(true);
  };

  // Compute calculated net salary dynamically
  const calculatedOvertime = payOvertimeHours * payOvertimeRate;
  const calculatedNetSalary = Math.max(
    0,
    payBaseSalary + payBonus + calculatedOvertime - payDeduction - payAdvanceDeduction
  );
  const remainingDue = Math.max(0, calculatedNetSalary - payPaidAmount);

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeForPay) return;

    const paymentId = existingPaymentRecord ? existingPaymentRecord.id : `pay-${Date.now()}`;
    const paymentDateStr = new Date().toISOString().split('T')[0];

    let newStatus: 'Pending' | 'Paid' | 'Partially Paid' = 'Paid';
    if (payPaidAmount <= 0) {
      newStatus = 'Pending';
    } else if (remainingDue > 0) {
      newStatus = 'Partially Paid';
    }

    const paymentHistoryEntry = {
      id: `pay-hist-${Date.now()}`,
      amount: payPaidAmount,
      date: paymentDateStr,
      method: payPaymentMethod,
      note: payNotes,
      paidBy: user?.ownerName || 'Owner',
    };

    let updatedPayment: PayrollPayment;

    if (existingPaymentRecord) {
      const prevPaid = existingPaymentRecord.paidAmount;
      const totalPaid = prevPaid + payPaidAmount;
      const newRemaining = Math.max(0, existingPaymentRecord.netSalary - totalPaid);

      updatedPayment = {
        ...existingPaymentRecord,
        paidAmount: totalPaid,
        remainingAmount: newRemaining,
        status: newRemaining === 0 ? 'Paid' : 'Partially Paid',
        paymentHistory: [...(existingPaymentRecord.paymentHistory || []), paymentHistoryEntry],
      };

      savePayrollPayments(
        payrollPayments.map((p) => (p.id === existingPaymentRecord.id ? updatedPayment : p))
      );
    } else {
      updatedPayment = {
        id: paymentId,
        employeeId: selectedEmployeeForPay.id,
        employeeName: selectedEmployeeForPay.fullName,
        period: payPeriod,
        baseSalary: payBaseSalary,
        bonus: payBonus,
        overtime: calculatedOvertime,
        deduction: payDeduction,
        advance: payAdvanceDeduction,
        netSalary: calculatedNetSalary,
        paidAmount: payPaidAmount,
        remainingAmount: remainingDue,
        status: newStatus,
        paymentDate: paymentDateStr,
        paymentMethod: payPaymentMethod,
        notes: payNotes,
        currency: displayCurrency,
        expenseReferenceId: paymentId,
        paymentHistory: [paymentHistoryEntry],
        createdAt: new Date().toISOString(),
      };

      savePayrollPayments([updatedPayment, ...payrollPayments]);
    }

    // Automatically sync as Business Expense (Category: Salary) if checked and money was paid
    if (paySyncExpense && payPaidAmount > 0) {
      addExpense({
        title: `Salary Payment - ${selectedEmployeeForPay.fullName} (${payPeriod})`,
        category: 'Salary',
        amount: payPaidAmount,
        currency: displayCurrency,
        date: paymentDateStr,
        note: `Payroll disbursement for ${selectedEmployeeForPay.fullName} (${payPeriod}). Method: ${payPaymentMethod}`,
        paymentMethod: payPaymentMethod,
        expenseReferenceId: paymentId,
      });
    }

    setIsPayModalOpen(false);
  };

  // Handle Adjustment Save
  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjEmployeeId || adjAmount <= 0) {
      alert('Please select an employee and enter a valid amount.');
      return;
    }

    const newAdj: SalaryAdjustment = {
      id: `adj-${Date.now()}`,
      employeeId: adjEmployeeId,
      type: adjType,
      amount: adjAmount,
      currency: displayCurrency,
      reason: adjReason.trim() || `${adjType.toUpperCase()} Record`,
      date: adjDate,
      period: selectedMonth,
    };

    saveSalaryAdjustments([newAdj, ...salaryAdjustments]);

    // If it's a salary advance paid out, optionally record in expenses
    if (adjType === 'advance') {
      const emp = employees.find((e) => e.id === adjEmployeeId);
      addExpense({
        title: `Salary Advance - ${emp?.fullName || 'Staff'}`,
        category: 'Salary',
        amount: adjAmount,
        currency: displayCurrency,
        date: adjDate,
        note: `Salary advance paid to ${emp?.fullName || 'Staff'}. Reason: ${adjReason}`,
        paymentMethod: 'Cash',
        expenseReferenceId: newAdj.id,
      });
    }

    setIsAdjustmentModalOpen(false);
  };

  // Metrics Calculations
  const currentMonthPayments = useMemo(() => {
    return payrollPayments.filter((p) => p.period === selectedMonth);
  }, [payrollPayments, selectedMonth]);

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === 'Active').length;

  const totalMonthlyPayrollExpected = employees
    .filter((e) => e.status === 'Active')
    .reduce((sum, e) => sum + e.baseSalary, 0);

  const totalPaidThisMonth = currentMonthPayments.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalPendingThisMonth = currentMonthPayments.reduce((sum, p) => sum + p.remainingAmount, 0);

  const totalAdvancesThisMonth = salaryAdjustments
    .filter((a) => a.type === 'advance' && (!a.period || a.period === selectedMonth))
    .reduce((sum, a) => sum + a.amount, 0);

  const totalBonusesThisMonth = currentMonthPayments.reduce((sum, p) => sum + p.bonus, 0);
  const totalDeductionsThisMonth = currentMonthPayments.reduce((sum, p) => sum + p.deduction, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Workforce Compensation
              </span>
            </div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              <span>Employee Salary & Payroll</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Track staff compensation, base salaries, overtime calculations, advances, partial disbursements, and detailed payslips.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => setIsAdjustmentModalOpen(true)}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>Record Advance / Bonus</span>
            </button>

            <button
              onClick={openAddEmployeeModal}
              className="px-4 py-2.5 bg-[#ff5c01] hover:bg-[#e05100] text-white text-xs font-bold rounded-xl shadow-md shadow-[#ff5c01]/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          </div>
        </div>

        {/* Month Selector Bar */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-300">Select Payroll Period:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#ff5c01] cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActivePayrollTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePayrollTab === 'dashboard'
                  ? 'bg-[#ff5c01] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActivePayrollTab('employees')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePayrollTab === 'employees'
                  ? 'bg-[#ff5c01] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Employees ({employees.length})
            </button>
            <button
              onClick={() => setActivePayrollTab('process')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePayrollTab === 'process'
                  ? 'bg-[#ff5c01] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Disburse Salary
            </button>
            <button
              onClick={() => setActivePayrollTab('advances')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePayrollTab === 'advances'
                  ? 'bg-[#ff5c01] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Advances & Bonuses
            </button>
            <button
              onClick={() => setActivePayrollTab('reports')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activePayrollTab === 'reports'
                  ? 'bg-[#ff5c01] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              History & Payslips
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Monthly Payroll</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-bold text-white mt-1">
            {formatMoney(totalMonthlyPayrollExpected)}
          </p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {activeEmployees} active employees
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold text-emerald-400">Paid This Month</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400 mt-1">
            {formatMoney(totalPaidThisMonth)}
          </p>
          <span className="text-[11px] text-emerald-500/80 mt-0.5 block">
            Disbursed in {selectedMonth}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold text-amber-400">Pending Salary</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold text-amber-400 mt-1">
            {formatMoney(Math.max(0, totalMonthlyPayrollExpected - totalPaidThisMonth))}
          </p>
          <span className="text-[11px] text-amber-500/80 mt-0.5 block">
            Pending disbursements
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold text-purple-400">Total Advances</span>
            <Receipt className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-purple-400 mt-1">
            {formatMoney(totalAdvancesThisMonth)}
          </p>
          <span className="text-[11px] text-purple-400/80 mt-0.5 block">
            Unsettled advances
          </span>
        </div>
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activePayrollTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Payroll Processing List */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#ff5c01]" />
                <span>Current Month Payroll Status ({selectedMonth})</span>
              </h3>
              <button
                onClick={() => setActivePayrollTab('process')}
                className="text-xs font-bold text-[#ff5c01] hover:underline"
              >
                Disburse All →
              </button>
            </div>

            <div className="divide-y divide-slate-800">
              {employees.map((emp) => {
                const payment = currentMonthPayments.find((p) => p.employeeId === emp.id);
                const isPaid = payment && payment.status === 'Paid';
                const isPartial = payment && payment.status === 'Partially Paid';

                return (
                  <div key={emp.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                        {emp.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{emp.fullName}</h4>
                        <p className="text-[11px] text-slate-400">
                          {emp.jobTitle} • {emp.department} • Base: {formatMoney(emp.baseSalary)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPaid
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isPartial
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isPaid ? 'PAID' : isPartial ? 'PARTIAL' : 'PENDING'}
                      </span>

                      {payment ? (
                        <div className="text-right">
                          <p className="text-xs font-bold text-emerald-400">
                            {formatMoney(payment.paidAmount)}
                          </p>
                          {payment.remainingAmount > 0 && (
                            <p className="text-[10px] text-amber-400">
                              Due: {formatMoney(payment.remainingAmount)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => openPaySalaryModal(emp)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          Pay Salary
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Quick Payroll Summary */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Monthly Compensation Breakdown</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-300 py-1.5 border-b border-slate-800">
                  <span>Gross Base Salaries:</span>
                  <span className="font-bold text-white">{formatMoney(totalMonthlyPayrollExpected)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 py-1.5 border-b border-slate-800">
                  <span>Total Bonuses:</span>
                  <span className="font-bold text-emerald-400">+{formatMoney(totalBonusesThisMonth)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 py-1.5 border-b border-slate-800">
                  <span>Total Advances / Deductions:</span>
                  <span className="font-bold text-rose-400">-{formatMoney(totalDeductionsThisMonth + totalAdvancesThisMonth)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-200 py-2 font-bold text-sm bg-slate-850 px-2 rounded-lg mt-2">
                  <span>Total Net Paid:</span>
                  <span className="text-emerald-400">{formatMoney(totalPaidThisMonth)}</span>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 rounded-2xl p-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Smart Payroll Actions
              </h4>
              <div className="space-y-2">
                <button
                  onClick={openAddEmployeeModal}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-white flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[#ff5c01]" />
                    <span>Add New Staff Employee</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  onClick={() => setIsAdjustmentModalOpen(true)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-white flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-amber-400" />
                    <span>Disburse Salary Advance</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYEES DIRECTORY */}
      {activePayrollTab === 'employees' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee by name, ID or phone..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#ff5c01]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#ff5c01] cursor-pointer"
              >
                <option value="all">All Departments</option>
                <option value="Sales & POS">Sales & POS</option>
                <option value="Operations">Operations</option>
                <option value="Inventory">Inventory</option>
                <option value="Accounts">Accounts</option>
                <option value="Kitchen / Service">Kitchen / Service</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#ff5c01] cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          </div>

          {/* Employees Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-bold border-y border-slate-700/60">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Job Title & Dept</th>
                  <th className="py-3 px-4">Salary Structure</th>
                  <th className="py-3 px-4">Joining & Tenure</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <span className="text-[10px] font-bold text-[#ff5c01] uppercase">
                          {emp.employeeId}
                        </span>
                        <p className="font-bold text-white text-sm">{emp.fullName}</p>
                        <p className="text-[11px] text-slate-400">{emp.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{emp.jobTitle}</p>
                      <p className="text-slate-400 text-[11px]">{emp.department}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-emerald-400 text-sm">
                        {formatMoney(emp.baseSalary)}
                      </p>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {emp.salaryType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-white">{emp.joiningDate}</p>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {calculateTenure(emp.joiningDate)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          emp.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : emp.status === 'On Leave'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openPaySalaryModal(emp)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                        >
                          Disburse
                        </button>
                        <button
                          onClick={() => openEditEmployeeModal(emp)}
                          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id, emp.fullName)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DISBURSE SALARY */}
      {activePayrollTab === 'process' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-white">
                Salary Disbursement Sheet ({selectedMonth})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Process monthly payouts, compute overtime and deduct advances with automatic expense logging.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => {
              const payment = currentMonthPayments.find((p) => p.employeeId === emp.id);
              const isPaid = payment && payment.status === 'Paid';
              const isPartial = payment && payment.status === 'Partially Paid';

              return (
                <div
                  key={emp.id}
                  className="bg-slate-850 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold text-[#ff5c01] uppercase">
                          {emp.employeeId}
                        </span>
                        <h4 className="text-sm font-bold text-white">{emp.fullName}</h4>
                        <p className="text-xs text-slate-400">{emp.jobTitle}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPaid
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isPartial
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {isPaid ? 'PAID' : isPartial ? 'PARTIAL' : 'PENDING'}
                      </span>
                    </div>

                    <div className="space-y-1.5 py-2.5 border-y border-slate-800 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Base Salary:</span>
                        <span className="font-bold text-white">{formatMoney(emp.baseSalary)}</span>
                      </div>
                      {payment && (
                        <>
                          <div className="flex justify-between text-emerald-400">
                            <span>Paid Amount:</span>
                            <span className="font-bold">{formatMoney(payment.paidAmount)}</span>
                          </div>
                          {payment.remainingAmount > 0 && (
                            <div className="flex justify-between text-amber-400">
                              <span>Remaining Due:</span>
                              <span className="font-bold">{formatMoney(payment.remainingAmount)}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 flex items-center justify-between gap-2">
                    {payment ? (
                      <button
                        onClick={() => setPrintPayslipRecord(payment)}
                        className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-400" />
                        <span>Print Payslip</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No disbursement yet</span>
                    )}

                    <button
                      onClick={() => openPaySalaryModal(emp, payment)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#ff5c01] hover:bg-[#e05100] text-xs font-bold text-white shadow-xs cursor-pointer"
                    >
                      {isPaid ? 'Add Adjustment' : isPartial ? 'Pay Remaining' : 'Disburse Salary'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: ADVANCES & BONUSES */}
      {activePayrollTab === 'advances' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Staff Advances & Adjustments</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Record salary advances, festival bonuses, commissions, or disciplinary deductions.
              </p>
            </div>
            <button
              onClick={() => setIsAdjustmentModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Advance</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-bold border-y border-slate-700/60">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {salaryAdjustments.map((adj) => {
                  const emp = employees.find((e) => e.id === adj.employeeId);
                  return (
                    <tr key={adj.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400">{adj.date}</td>
                      <td className="py-3 px-4 font-bold text-white">
                        {emp?.fullName || 'Unknown Employee'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            adj.type === 'bonus' || adj.type === 'commission'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : adj.type === 'advance'
                              ? 'bg-purple-500/10 text-purple-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {adj.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{adj.reason}</td>
                      <td className="py-3 px-4 font-bold text-white text-sm">
                        {formatMoney(adj.amount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm('Delete this adjustment record?')) {
                              saveSalaryAdjustments(salaryAdjustments.filter((a) => a.id !== adj.id));
                            }
                          }}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS & PAYSLIPS */}
      {activePayrollTab === 'reports' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Disbursement Archive & Payslips</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Past transaction receipts and official employee payslip generator.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-bold border-y border-slate-700/60">
                <tr>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Base Salary</th>
                  <th className="py-3 px-4">Bonus / OT</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Net Salary</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {payrollPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">{pay.period}</td>
                    <td className="py-3 px-4 font-bold text-white">{pay.employeeName}</td>
                    <td className="py-3 px-4 text-slate-300">{formatMoney(pay.baseSalary)}</td>
                    <td className="py-3 px-4 text-emerald-400">
                      +{formatMoney(pay.bonus + (pay.overtime || 0))}
                    </td>
                    <td className="py-3 px-4 text-rose-400">
                      -{formatMoney(pay.deduction + (pay.advance || 0))}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{formatMoney(pay.netSalary)}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">{formatMoney(pay.paidAmount)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          pay.status === 'Paid'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setPrintPayslipRecord(pay)}
                        className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Payslip</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT EMPLOYEE */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto text-slate-200">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#ff5c01]" />
                <span>{editingEmployee ? 'Edit Employee Profile' : 'Add New Staff Employee'}</span>
              </h2>
              <button
                onClick={() => setIsEmployeeModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee}>
              <div className="p-6 max-h-[65vh] overflow-y-auto custom-scrollbar space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={empId}
                      onChange={(e) => setEmpId(e.target.value)}
                      placeholder="e.g. EMP-001"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5c01]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={empFullName}
                      onChange={(e) => setEmpFullName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5c01]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={empPhone}
                      onChange={(e) => setEmpPhone(e.target.value)}
                      placeholder="+880 1700 000000"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5c01]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      placeholder="staff@store.com"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5c01]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Job Title / Designation *
                    </label>
                    <input
                      type="text"
                      required
                      value={empJobTitle}
                      onChange={(e) => setEmpJobTitle(e.target.value)}
                      placeholder="e.g. Store Manager, Cashier"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5c01]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Department
                    </label>
                    <select
                      value={empDepartment}
                      onChange={(e) => setEmpDepartment(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5c01] cursor-pointer"
                    >
                      <option value="Sales & POS">Sales & POS</option>
                      <option value="Operations">Operations</option>
                      <option value="Inventory">Inventory</option>
                      <option value="Accounts">Accounts</option>
                      <option value="Kitchen / Service">Kitchen / Service</option>
                      <option value="General Staff">General Staff</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Joining Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={empJoiningDate}
                      onChange={(e) => setEmpJoiningDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5c01]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Salary Structure Type
                    </label>
                    <select
                      value={empSalaryType}
                      onChange={(e) => setEmpSalaryType(e.target.value as SalaryType)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5c01] cursor-pointer"
                    >
                      <option value="Monthly">Monthly Salary</option>
                      <option value="Weekly">Weekly Wage</option>
                      <option value="Daily">Daily Rate</option>
                      <option value="Hourly">Hourly Rate</option>
                      <option value="Custom">Custom / Commission</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Base Salary Amount ({displayCurrency}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={empBaseSalary}
                      onChange={(e) => setEmpBaseSalary(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5c01]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Employee Status
                    </label>
                    <select
                      value={empStatus}
                      onChange={(e) => setEmpStatus(e.target.value as EmployeeStatus)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5c01] cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Terminated">Terminated / Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Notes / Comments
                  </label>
                  <textarea
                    rows={2}
                    value={empNotes}
                    onChange={(e) => setEmpNotes(e.target.value)}
                    placeholder="Additional details, emergency contacts..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#ff5c01]"
                  />
                </div>
              </div>

              <div className="p-5 border-t border-slate-800 bg-slate-900 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ff5c01] hover:bg-[#e05100] text-xs font-bold text-white shadow-md shadow-[#ff5c01]/20 cursor-pointer"
                >
                  {editingEmployee ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DISBURSE SALARY PAYMENT */}
      {isPayModalOpen && selectedEmployeeForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-auto text-slate-200">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>Salary Payment — {selectedEmployeeForPay.fullName}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Period: {payPeriod} • Designation: {selectedEmployeeForPay.jobTitle}
                </p>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessPayment}>
              <div className="p-6 max-h-[65vh] overflow-y-auto custom-scrollbar space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Base Salary ({displayCurrency})
                    </label>
                    <input
                      type="number"
                      value={payBaseSalary}
                      onChange={(e) => setPayBaseSalary(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Bonus / Festival ({displayCurrency})
                    </label>
                    <input
                      type="number"
                      value={payBonus}
                      onChange={(e) => setPayBonus(Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Overtime Hours
                    </label>
                    <input
                      type="number"
                      value={payOvertimeHours}
                      onChange={(e) => setPayOvertimeHours(Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Overtime Rate / Hour
                    </label>
                    <input
                      type="number"
                      value={payOvertimeRate}
                      onChange={(e) => setPayOvertimeRate(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Advance Deduction ({displayCurrency})
                    </label>
                    <input
                      type="number"
                      value={payAdvanceDeduction}
                      onChange={(e) => setPayAdvanceDeduction(Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-rose-400 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Other Deductions ({displayCurrency})
                    </label>
                    <input
                      type="number"
                      value={payDeduction}
                      onChange={(e) => setPayDeduction(Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-rose-400 font-bold"
                    />
                  </div>
                </div>

                {/* Net Salary Calculation Box */}
                <div className="bg-slate-850 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Base ({formatMoney(payBaseSalary)}) + Bonus ({formatMoney(payBonus)}) + Overtime ({formatMoney(calculatedOvertime)})</span>
                    <span>{formatMoney(payBaseSalary + payBonus + calculatedOvertime)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-rose-400">
                    <span>Less Advances ({formatMoney(payAdvanceDeduction)}) + Deductions ({formatMoney(payDeduction)})</span>
                    <span>-{formatMoney(payAdvanceDeduction + payDeduction)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-700">
                    <span>Net Payable Salary:</span>
                    <span className="text-emerald-400">{formatMoney(calculatedNetSalary)}</span>
                  </div>
                </div>

                {/* Payment Amount & Method */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Amount Paying Now ({displayCurrency}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max={calculatedNetSalary}
                      value={payPaidAmount}
                      onChange={(e) => setPayPaidAmount(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-emerald-600/60 rounded-xl px-3 py-2 text-xs text-emerald-400 font-black text-base"
                    />
                    {remainingDue > 0 && (
                      <span className="text-[11px] text-amber-400 mt-1 block">
                        Remaining balance of {formatMoney(remainingDue)} will be tracked as Partial.
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={payPaymentMethod}
                      onChange={(e) => setPayPaymentMethod(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5c01] cursor-pointer"
                    >
                      <option value="Cash">Cash In Hand</option>
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Rocket">Rocket</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                {/* Expense Sync Checkbox */}
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-850 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paySyncExpense}
                    onChange={(e) => setPaySyncExpense(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-white">Record as Business Expense (Salary)</p>
                    <p className="text-slate-400 text-[11px]">
                      Automatically deducts from Net Profit report without double-counting.
                    </p>
                  </div>
                </label>
              </div>

              <div className="p-5 border-t border-slate-800 bg-slate-900 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Confirm Disbursement ({formatMoney(payPaidAmount)})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECORD ADJUSTMENT / ADVANCE */}
      {isAdjustmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-auto text-slate-200">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                <span>Record Advance / Adjustment</span>
              </h2>
              <button
                onClick={() => setIsAdjustmentModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Select Employee *
                  </label>
                  <select
                    required
                    value={adjEmployeeId}
                    onChange={(e) => setAdjEmployeeId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5c01] cursor-pointer"
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.fullName} ({e.employeeId} - {e.jobTitle})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Adjustment Type
                    </label>
                    <select
                      value={adjType}
                      onChange={(e) => setAdjType(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5c01] cursor-pointer"
                    >
                      <option value="advance">Salary Advance</option>
                      <option value="bonus">Festival / Performance Bonus</option>
                      <option value="commission">Sales Commission</option>
                      <option value="deduction">Disciplinary Deduction</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Amount ({displayCurrency}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={adjAmount}
                      onChange={(e) => setAdjAmount(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={adjDate}
                    onChange={(e) => setAdjDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Reason / Description
                  </label>
                  <textarea
                    rows={2}
                    value={adjReason}
                    onChange={(e) => setAdjReason(e.target.value)}
                    placeholder="e.g. Emergency advance for family medical expenses..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white"
                  />
                </div>
              </div>

              <div className="p-5 border-t border-slate-800 bg-slate-900 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAdjustmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow-md shadow-amber-600/20 cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT PAYSLIP MODAL */}
      {printPayslipRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
                  {user?.brandName || 'YearInvo Store'}
                </h2>
                <p className="text-xs text-slate-500">Official Salary Payslip</p>
              </div>
              <button
                onClick={() => setPrintPayslipRecord(null)}
                className="p-1 text-slate-400 hover:text-slate-700 print:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs py-2 border-b">
              <div>
                <span className="text-slate-500">Employee Name:</span>
                <p className="font-bold">{printPayslipRecord.employeeName}</p>
              </div>
              <div>
                <span className="text-slate-500">Pay Period:</span>
                <p className="font-bold">{printPayslipRecord.period}</p>
              </div>
              <div>
                <span className="text-slate-500">Payment Date:</span>
                <p className="font-bold">{printPayslipRecord.paymentDate || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-500">Payment Method:</span>
                <p className="font-bold">{printPayslipRecord.paymentMethod}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs py-2">
              <div className="flex justify-between">
                <span>Base Salary:</span>
                <span className="font-semibold">{formatMoney(printPayslipRecord.baseSalary)}</span>
              </div>
              {printPayslipRecord.bonus > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Bonus / Incentives:</span>
                  <span className="font-semibold">+{formatMoney(printPayslipRecord.bonus)}</span>
                </div>
              )}
              {printPayslipRecord.overtime > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Overtime:</span>
                  <span className="font-semibold">+{formatMoney(printPayslipRecord.overtime)}</span>
                </div>
              )}
              {printPayslipRecord.advance > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Advance Deducted:</span>
                  <span className="font-semibold">-{formatMoney(printPayslipRecord.advance)}</span>
                </div>
              )}
              {printPayslipRecord.deduction > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Other Deductions:</span>
                  <span className="font-semibold">-{formatMoney(printPayslipRecord.deduction)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black border-t pt-2 mt-2">
                <span>Net Salary Payable:</span>
                <span>{formatMoney(printPayslipRecord.netSalary)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-emerald-700">
                <span>Amount Paid:</span>
                <span>{formatMoney(printPayslipRecord.paidAmount)}</span>
              </div>
              {printPayslipRecord.remainingAmount > 0 && (
                <div className="flex justify-between text-xs font-bold text-amber-700">
                  <span>Remaining Balance:</span>
                  <span>{formatMoney(printPayslipRecord.remainingAmount)}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4 flex items-center justify-between text-xs print:hidden">
              <span className="text-slate-400">System generated via YearInvo</span>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
