import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  FileText,
  Calendar,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';
import { useDatabase } from '../database/dbStore';
import { MasterAppointmentView, AppointmentStatus } from '../types/database';

interface AppointmentsViewProps {
  onOpenBookModal: () => void;
  onOpenPaymentModal: (appointmentId: number) => void;
  onViewReceipt: (appointment: MasterAppointmentView) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  onOpenBookModal,
  onOpenPaymentModal,
  onViewReceipt,
}) => {
  const { masterAppointments, updateAppointmentStatus, doctors, persons } = useDatabase();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | AppointmentStatus>('All');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Metrics
  const metrics = useMemo(() => {
    const total = masterAppointments.length;
    const confirmed = masterAppointments.filter((a) => a.appointment_status === 'Confirmed').length;
    const pending = masterAppointments.filter((a) => a.appointment_status === 'Pending').length;
    const cancelled = masterAppointments.filter((a) => a.appointment_status === 'Cancelled').length;
    const totalPaid = masterAppointments.reduce((acc, a) => acc + (a.payment_amount || 0), 0);
    return { total, confirmed, pending, cancelled, totalPaid };
  }, [masterAppointments]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return masterAppointments.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const patientMatch = `${item.patient_first_name} ${item.patient_last_name}`.toLowerCase().includes(query);
        const doctorMatch = `${item.doctor_first_name} ${item.doctor_last_name}`.toLowerCase().includes(query);
        const phoneMatch = item.patient_phone.includes(query);
        const idMatch = String(item.appointment_id).includes(query);
        if (!patientMatch && !doctorMatch && !phoneMatch && !idMatch) return false;
      }

      // Status
      if (statusFilter !== 'All' && item.appointment_status !== statusFilter) {
        return false;
      }

      // Doctor
      if (selectedDoctorId !== 'all') {
        if (selectedDoctorId === 'unassigned') {
          if (item.doctor_person_id !== null) return false;
        } else if (item.doctor_person_id !== Number(selectedDoctorId)) {
          return false;
        }
      }

      // Date
      if (selectedDate && item.appointment_date !== selectedDate) {
        return false;
      }

      return true;
    });
  }, [masterAppointments, searchQuery, statusFilter, selectedDoctorId, selectedDate]);

  const handleStatusChange = (appointmentId: number, newStatus: AppointmentStatus) => {
    updateAppointmentStatus(appointmentId, newStatus);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Confirmed
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Cancelled
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Completed
          </span>
        );
      default:
        return <span className="text-xs text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Clinic Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 text-white shadow-xs">
        <div className="absolute inset-0 z-0 opacity-30 mix-blend-luminosity">
          <img
            src="/src/assets/images/hospital_clinic_header_1792993587512.jpg"
            alt="Hospital Consultation Suite"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
              <Stethoscope className="w-4 h-4" />
              <span>Hospital Master Appointment Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Patient Scheduling & Consultation Control
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Live relational dispatch synced with MySQL schema. Triggers active for double-booking prevention and cancelled payment guardrails.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenBookModal}
              className="px-4 py-2.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              Book New Appointment
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Bookings</span>
          <p className="text-2xl font-bold text-slate-900 tabular-nums mt-1">{metrics.total}</p>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">table: appointment</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-emerald-700">Confirmed Slots</span>
          <p className="text-2xl font-bold text-emerald-800 tabular-nums mt-1">{metrics.confirmed}</p>
          <div className="mt-1 text-[11px] text-emerald-600">Active consultations</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-amber-700">Pending Triage</span>
          <p className="text-2xl font-bold text-amber-800 tabular-nums mt-1">{metrics.pending}</p>
          <div className="mt-1 text-[11px] text-amber-600">Awaiting doctor assignment</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Revenue Recorded</span>
          <p className="text-2xl font-bold text-slate-900 tabular-nums mt-1 font-mono">
            {metrics.totalPaid.toLocaleString()} UGX
          </p>
          <div className="mt-1 text-[11px] text-slate-400">table: payment</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, doctor, phone, or appointment ID..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {/* Doctor Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Doctors</option>
              <option value="unassigned">Unassigned Only</option>
              {doctors.map((d) => {
                const docP = persons.find((p) => p.person_id === d.person_id);
                return (
                  <option key={d.DOCTOR_ID} value={d.person_id}>
                    Dr. {docP?.first_name} {docP?.last_name} ({d.speciality})
                  </option>
                );
              })}
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              title="Filter by appointment date"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Clear Date
              </button>
            )}
          </div>
        </div>

        {/* Status Segmented Control (Interactive Filter Buttons) */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto no-scrollbar">
          {(['All', 'Confirmed', 'Pending', 'Cancelled', 'Completed'] as const).map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* Master Appointment Table (Wide Join View) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Master Appointment View (7-Column Wide Join)
            </h2>
            <p className="text-[11px] text-slate-500">
              Query joins <code className="font-mono">appointment</code> + <code className="font-mono">patient</code> + <code className="font-mono">person</code> + <code className="font-mono">doctor</code> + <code className="font-mono">receptionist</code> + <code className="font-mono">payment</code>
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {filteredAppointments.length} matching rows
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-4">Appt Ref</th>
                <th className="py-3 px-4">Date & Slot</th>
                <th className="py-3 px-4">Patient Details</th>
                <th className="py-3 px-4">Doctor & Specialty</th>
                <th className="py-3 px-4">Receptionist</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Fee / Insurance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No appointments found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try clearing search filters or book a new appointment.
                    </p>
                    <button
                      onClick={onOpenBookModal}
                      className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                    >
                      Book First Slot
                    </button>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((item) => (
                  <tr key={item.appointment_id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Appt ID */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                      #{item.appointment_id}
                    </td>

                    {/* Date & Time */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{item.appointment_date}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{item.appointment_time}</div>
                    </td>

                    {/* Patient */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {item.patient_first_name} {item.patient_last_name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <span>{item.gender}</span>
                        <span>·</span>
                        <span className="font-mono">{item.patient_phone}</span>
                      </div>
                    </td>

                    {/* Doctor */}
                    <td className="py-3 px-4">
                      {item.doctor_person_id ? (
                        <div>
                          <div className="font-medium text-slate-900">
                            Dr. {item.doctor_first_name} {item.doctor_last_name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {item.speciality}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned (Triage)</span>
                      )}
                    </td>

                    {/* Receptionist */}
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                      {item.receptionist_first_name} {item.receptionist_last_name}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(item.appointment_status)}
                    </td>

                    {/* Fee / Insurance */}
                    <td className="py-3 px-4 text-right whitespace-nowrap font-mono tabular-nums">
                      {item.payment_amount !== null ? (
                        <div>
                          <span className="font-semibold text-slate-900">
                            {item.payment_amount.toLocaleString()} UGX
                          </span>
                          <div className="text-[11px] text-slate-500 capitalize">
                            {item.insurance_status} · {item.payment_method}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-amber-700 font-semibold text-[11px]">Unpaid</span>
                          <div className="text-[10px] text-slate-400">Needs Payment</div>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.payment_amount === null && item.appointment_status !== 'Cancelled' && (
                          <button
                            onClick={() => onOpenPaymentModal(item.appointment_id)}
                            title="Record Payment"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => onViewReceipt(item)}
                          title="View Official Receipt"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Status toggles */}
                        {item.appointment_status !== 'Confirmed' && item.appointment_status !== 'Completed' && (
                          <button
                            onClick={() => handleStatusChange(item.appointment_id, 'Confirmed')}
                            title="Mark as Confirmed"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {item.appointment_status === 'Confirmed' && (
                          <button
                            onClick={() => handleStatusChange(item.appointment_id, 'Completed')}
                            title="Mark as Completed"
                            className="px-2 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                          >
                            Complete
                          </button>
                        )}

                        {item.appointment_status !== 'Cancelled' && item.appointment_status !== 'Completed' && (
                          <button
                            onClick={() => handleStatusChange(item.appointment_id, 'Cancelled')}
                            title="Cancel Appointment"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
