import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck } from 'lucide-react';
import { MasterAppointmentView } from '../types/database';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: MasterAppointmentView | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, appointment }) => {
  if (!isOpen || !appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Printable Card */}
        <div className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-700">Official Clinical Confirmation</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">MetroCare Hospital</h3>
              <p className="text-xs text-slate-500">Outpatient & Consultation Services</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="my-5 p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Appointment Ref:</span>
              <span className="font-mono font-bold text-slate-900">#APPT-{appointment.appointment_id}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Date & Slot:</span>
              <span className="font-semibold text-slate-800">
                {appointment.appointment_date} · {appointment.appointment_time}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Patient:</span>
              <span className="font-semibold text-slate-800">
                {appointment.patient_first_name} {appointment.patient_last_name} ({appointment.gender})
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Patient Phone:</span>
              <span className="font-mono text-slate-800">{appointment.patient_phone}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Attending Doctor:</span>
              <span className="font-semibold text-slate-800">
                Dr. {appointment.doctor_first_name} {appointment.doctor_last_name}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Speciality:</span>
              <span className="text-slate-800 font-medium">{appointment.speciality}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Booking Officer:</span>
              <span className="text-slate-800">
                {appointment.receptionist_first_name} {appointment.receptionist_last_name}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-slate-600 font-semibold">Consultation Amount:</span>
              <span className="font-mono font-bold text-sm text-slate-900">
                {appointment.payment_amount !== null
                  ? `${Number(appointment.payment_amount).toLocaleString()} UGX`
                  : 'Pending'}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Payment Method:</span>
              <span>{appointment.payment_method || 'Unpaid'}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Insurance Status:</span>
              <span className="capitalize">{appointment.insurance_status || 'Not insured'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Verified in MySQL <code className="font-mono">confirmation</code> and <code className="font-mono">payment</code> tables.
            </span>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
