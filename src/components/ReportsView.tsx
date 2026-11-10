import React, { useState, useMemo } from 'react';
import { BarChart3, Calendar, ShieldCheck, Download, Award, TrendingUp } from 'lucide-react';
import { useDatabase } from '../database/dbStore';

export const ReportsView: React.FC = () => {
  const { getDoctorFinancialReport, auditTrail } = useDatabase();

  // Financial Report Parameters matching user prompt: CALL sp_get_doctor_financial_report('2025-09-01', '2025-09-30')
  const [startDate, setStartDate] = useState('2025-09-01');
  const [endDate, setEndDate] = useState('2025-09-30');

  const reportData = useMemo(() => {
    return getDoctorFinancialReport(startDate, endDate);
  }, [startDate, endDate, getDoctorFinancialReport]);

  const totalPeriodRevenue = useMemo(() => {
    return reportData.reduce((acc, row) => acc + row.total_revenue, 0);
  }, [reportData]);

  const totalPeriodAppointments = useMemo(() => {
    return reportData.reduce((acc, row) => acc + row.total_appointments, 0);
  }, [reportData]);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Financial Revenue Analytics & 7-Table Audit Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time execution of <code className="font-mono text-emerald-700">CALL sp_get_doctor_financial_report(p_start_date, p_end_date)</code>
          </p>
        </div>
      </div>

      {/* Date Range Selection Box */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Stored Procedure Date Range
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <span className="text-slate-400 text-xs mt-5">to</span>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Aggregated Revenue</span>
              <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {totalPeriodRevenue.toLocaleString()} UGX
              </span>
            </div>
            <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Consultations Count</span>
              <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {totalPeriodAppointments}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Report Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Doctor Financial Performance ({startDate} to {endDate})
            </h2>
            <p className="text-[11px] text-slate-500 font-mono">
              ORDER BY total_revenue DESC
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">{reportData.length} doctors ranked</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-4">Doctor ID</th>
                <th className="py-3 px-4">Doctor Name</th>
                <th className="py-3 px-4">Speciality</th>
                <th className="py-3 px-4 text-center">Total Appointments</th>
                <th className="py-3 px-4 text-right">Total Revenue (UGX)</th>
                <th className="py-3 px-4 text-right">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.map((doc, idx) => {
                const share = totalPeriodRevenue > 0 ? Math.round((doc.total_revenue / totalPeriodRevenue) * 100) : 0;
                return (
                  <tr key={doc.DOCTOR_ID} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600">
                      #{doc.DOCTOR_ID} <span className="text-[10px] text-slate-400">(PID: {doc.doctor_person_id})</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {doc.doctor_name}
                      {idx === 0 && doc.total_revenue > 0 && (
                        <span className="ml-2 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Top Earner
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {doc.speciality}
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums font-semibold text-slate-800">
                      {doc.total_appointments}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900">
                      {doc.total_revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {share}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7-Table Audit Trail View (View Query #5) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Complete Audit Trail View (7-Table Pipeline Join)
            </h2>
            <p className="text-[11px] text-slate-500">
              Joins <code className="font-mono">confirmation</code> + <code className="font-mono">appointment</code> + <code className="font-mono">payment</code> + <code className="font-mono">patient</code> + <code className="font-mono">doctor</code> + <code className="font-mono">receptionist</code> + <code className="font-mono">person</code>
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">{auditTrail.length} audit entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Confirmation Type</th>
                <th className="py-3 px-4">Audit Status</th>
                <th className="py-3 px-4">Appt Slot</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Attending Doctor</th>
                <th className="py-3 px-4">Officer (Emp #)</th>
                <th className="py-3 px-4 text-right">Amount (UGX)</th>
                <th className="py-3 px-4 text-right">Method & Insurance</th>
                <th className="py-3 px-4 text-right">Created Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditTrail.map((audit) => (
                <tr key={audit.confirmation_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">
                    #{audit.confirmation_id}
                  </td>
                  <td className="py-3 px-4 text-slate-800 font-medium">
                    {audit.confirmation_type}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${
                      audit.confirmation_status === 'Confirmed' ? 'text-emerald-700' :
                      audit.confirmation_status === 'Pending' ? 'text-amber-700' : 'text-rose-700'
                    }`}>
                      {audit.confirmation_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {audit.appointment_date} {audit.appointment_time}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {audit.patient_first_name} {audit.patient_last_name} ({audit.gender})
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <span className="font-medium text-slate-800">
                        Dr. {audit.doctor_first_name} {audit.doctor_last_name}
                      </span>
                      <div className="text-[10px] text-slate-400">{audit.speciality}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                    {audit.receptionist_first_name}{' '}
                    <span className="font-mono text-slate-500">({audit.employee_number})</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                    {audit.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div>{audit.payment_method}</div>
                    <div className="text-[10px] text-slate-500 capitalize">{audit.insurance_status}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {audit.created_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
