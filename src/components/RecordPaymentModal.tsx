import React, { useState } from 'react';
import { X, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useDatabase } from '../database/dbStore';
import { InsuranceStatus } from '../types/database';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAppointmentId?: number;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  initialAppointmentId,
}) => {
  const { appointments, persons, recordPayment } = useDatabase();

  const [appointmentId, setAppointmentId] = useState<number>(() => {
    return initialAppointmentId || appointments[0]?.appointment_id || 21;
  });
  const [amount, setAmount] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [insuranceStatus, setInsuranceStatus] = useState<InsuranceStatus>('insured');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAppt = appointments.find((a) => a.appointment_id === appointmentId);
  const patPerson = persons.find((p) => p.person_id === currentAppt?.patient_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentAppt || !currentAppt.patient_id) {
      setError('Please select a valid appointment with an assigned patient.');
      return;
    }

    const res = recordPayment({
      patient_id: currentAppt.patient_id,
      appointment_id: currentAppt.appointment_id,
      amount: Number(amount),
      payment_method: paymentMethod,
      insurance_status: insuranceStatus,
      payment_date: paymentDate,
    });

    if (!res.success) {
      setError(res.error || 'Failed to record payment');
    } else {
      setSuccess(`Payment #${res.payment_id} recorded successfully! Confirmation status: Confirmed`);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Record Clinical Payment
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              INSERT INTO payment ... (enforces trg_prevent_cancelled_payment)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800 font-mono">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Trigger Error: </span>
                {error}
              </div>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Appointment
            </label>
            <select
              value={appointmentId}
              onChange={(e) => setAppointmentId(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {appointments.map((a) => {
                const patient = persons.find((p) => p.person_id === a.patient_id);
                return (
                  <option key={a.appointment_id} value={a.appointment_id}>
                    Appt #{a.appointment_id} · {a.appointment_date} @ {a.appointment_time} · Patient: {patient?.first_name} {patient?.last_name} ({a.status})
                  </option>
                );
              })}
            </select>
            {currentAppt && (
              <div className="mt-1.5 text-xs flex items-center gap-2 text-slate-600">
                <span>Status: <strong className={currentAppt.status === 'Cancelled' ? 'text-rose-600 font-bold' : 'text-emerald-700'}>{currentAppt.status}</strong></span>
                <span>·</span>
                <span>Patient: {patPerson?.first_name} {patPerson?.last_name}</span>
              </div>
            )}
            {currentAppt?.status === 'Cancelled' && (
              <p className="mt-1 text-xs text-rose-600 font-semibold">
                Warning: Attempting to pay for this appointment will trip `trg_prevent_cancelled_payment`.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount (UGX)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="Mobile Money">Mobile Money (MTN / Airtel)</option>
                <option value="Card">Bank Card</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Insurance Status
              </label>
              <select
                value={insuranceStatus}
                onChange={(e) => setInsuranceStatus(e.target.value as InsuranceStatus)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="insured">insured</option>
                <option value="Not insured">Not insured</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
