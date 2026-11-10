import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Plus,
  ShieldCheck,
  CreditCard,
  PhoneCall,
  Search,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useDatabase } from '../database/dbStore';
import { InsuranceStatus } from '../types/database';

interface BillingViewProps {
  onOpenRecordPayment: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ onOpenRecordPayment }) => {
  const { paymentLedger, payments } = useDatabase();

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<'All' | string>('All');
  const [insuranceFilter, setInsuranceFilter] = useState<'All' | InsuranceStatus>('All');

  const filtered = useMemo(() => {
    return paymentLedger.filter((item) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const nameMatch = `${item.patient_first_name} ${item.patient_last_name}`.toLowerCase().includes(q);
        const emailMatch = item.email.toLowerCase().includes(q);
        const payIdMatch = String(item.payment_id).includes(q);
        const apptIdMatch = String(item.appointment_id).includes(q);
        if (!nameMatch && !emailMatch && !payIdMatch && !apptIdMatch) return false;
      }

      if (methodFilter !== 'All' && item.payment_method !== methodFilter) {
        return false;
      }

      if (insuranceFilter !== 'All' && item.insurance_status !== insuranceFilter) {
        return false;
      }

      return true;
    });
  }, [paymentLedger, search, methodFilter, insuranceFilter]);

  // Statistics
  const totalRevenue = useMemo(() => {
    return payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  }, [payments]);

  const insuredRevenue = useMemo(() => {
    return payments
      .filter((p) => p.insurance_status === 'insured')
      .reduce((acc, p) => acc + Number(p.amount || 0), 0);
  }, [payments]);

  const cashRevenue = useMemo(() => {
    return payments
      .filter((p) => p.payment_method === 'Cash')
      .reduce((acc, p) => acc + Number(p.amount || 0), 0);
  }, [payments]);

  const momoRevenue = useMemo(() => {
    return payments
      .filter((p) => p.payment_method.toLowerCase().includes('mobile'))
      .reduce((acc, p) => acc + Number(p.amount || 0), 0);
  }, [payments]);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Payment Ledger & Billing Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            SQL View: <code className="font-mono text-emerald-700">payment JOIN appointment JOIN patient JOIN person</code>
          </p>
        </div>
        <button
          onClick={onOpenRecordPayment}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Gross Clinical Revenue</span>
          <p className="text-2xl font-bold text-slate-900 tabular-nums font-mono mt-1">
            {totalRevenue.toLocaleString()} <span className="text-xs text-slate-500 font-sans">UGX</span>
          </p>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">table: payment</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-emerald-700">Covered by Insurance</span>
          <p className="text-2xl font-bold text-emerald-800 tabular-nums font-mono mt-1">
            {insuredRevenue.toLocaleString()} <span className="text-xs text-emerald-600 font-sans">UGX</span>
          </p>
          <div className="mt-1 text-[11px] text-emerald-600">
            {totalRevenue > 0 ? Math.round((insuredRevenue / totalRevenue) * 100) : 0}% of collections
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-600">Cash Collections</span>
          <p className="text-2xl font-bold text-slate-800 tabular-nums font-mono mt-1">
            {cashRevenue.toLocaleString()} <span className="text-xs text-slate-500 font-sans">UGX</span>
          </p>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">method: 'Cash'</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-600">Mobile Money (MTN/Airtel)</span>
          <p className="text-2xl font-bold text-slate-800 tabular-nums font-mono mt-1">
            {momoRevenue.toLocaleString()} <span className="text-xs text-slate-500 font-sans">UGX</span>
          </p>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">method: 'Mobile Money'</div>
        </div>
      </div>

      {/* Trigger & Integrity Notice */}
      <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Database Integrity Trigger Active:</span>{' '}
          <code className="text-emerald-300 font-mono">trg_prevent_cancelled_payment</code> enforces that payments cannot be posted for appointments marked as <code className="text-rose-300 font-mono">'Cancelled'</code>. Check constraints enforce <code className="text-emerald-300 font-mono">amount &gt;= 0</code> and <code className="text-emerald-300 font-mono">insurance_status IN ('insured', 'Not insured')</code>.
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search payments by patient name, email, payment ID, or appointment ref..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Payment Methods</option>
              <option value="Cash">Cash</option>
              <option value="Mobile Money">Mobile Money</option>
            </select>

            <select
              value={insuranceFilter}
              onChange={(e) => setInsuranceFilter(e.target.value as any)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Insurance Tiers</option>
              <option value="insured">insured</option>
              <option value="Not insured">Not insured</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Payment Ledger & Patient Contact View
            </h2>
            <p className="text-[11px] text-slate-500">
              Corresponds exactly to View Query #5 in SQL Script
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">{filtered.length} transaction entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Amount (UGX)</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Insurance Status</th>
                <th className="py-3 px-4">Appt Date</th>
                <th className="py-3 px-4">Appt Status</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-700">No payment transactions recorded</p>
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.payment_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      #{item.payment_id}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900">
                      {item.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {item.payment_method}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {item.payment_date}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold capitalize ${
                        item.insurance_status === 'insured' ? 'text-emerald-700' : 'text-slate-600'
                      }`}>
                        {item.insurance_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {item.appointment_date} <span className="text-[10px] text-slate-400">(#{item.appointment_id})</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${
                        item.appointment_status === 'Confirmed' ? 'text-emerald-700' :
                        item.appointment_status === 'Cancelled' ? 'text-rose-700' : 'text-amber-700'
                      }`}>
                        {item.appointment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {item.patient_first_name} {item.patient_last_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                      {item.email}
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
