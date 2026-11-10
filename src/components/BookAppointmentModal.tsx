import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, UserPlus, Calendar, Clock, DollarSign, UserCheck } from 'lucide-react';
import { useDatabase } from '../database/dbStore';
import { InsuranceStatus, Gender } from '../types/database';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoctorId?: number | null;
  initialDate?: string;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  initialDoctorId,
  initialDate,
}) => {
  const {
    patients,
    persons,
    doctors,
    receptionists,
    bookAppointment,
    registerPatient,
  } = useDatabase();

  // Mode: existing patient vs quick new patient registration
  const [isQuickRegister, setIsQuickRegister] = useState(false);

  // Form Fields
  const [patientId, setPatientId] = useState<number>(() => {
    return patients[0]?.person_id || 2;
  });
  const [doctorId, setDoctorId] = useState<string>(() => {
    return initialDoctorId ? String(initialDoctorId) : '1';
  });
  const [receptionistId, setReceptionistId] = useState<number>(6); // Default Paul Musoke REC001
  const [appointmentDate, setAppointmentDate] = useState<string>(
    initialDate || '2025-09-08'
  );
  const [appointmentTime, setAppointmentTime] = useState<string>('09:00');
  const [amount, setAmount] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [insuranceStatus, setInsuranceStatus] = useState<InsuranceStatus>('insured');

  // Quick Registration Fields
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('07');
  const [regDob, setRegDob] = useState('2000-01-01');
  const [regGender, setRegGender] = useState<Gender>('Female');

  // Feedback State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    let targetPatientPersonId = patientId;

    // If quick registering patient first
    if (isQuickRegister) {
      if (!regFirstName.trim() || !regLastName.trim() || !regEmail.trim()) {
        setErrorMessage('Please fill in patient First Name, Last Name, and Email.');
        setIsSubmitting(false);
        return;
      }

      const regResult = registerPatient({
        first_name: regFirstName,
        last_name: regLastName,
        email: regEmail,
        phone: regPhone,
        dob: regDob,
        gender: regGender,
      });

      if (!regResult.success || !regResult.person_id) {
        setErrorMessage(`Registration Failed: ${regResult.error || 'Unknown error'}`);
        setIsSubmitting(false);
        return;
      }

      targetPatientPersonId = regResult.person_id;
    }

    const docVal = doctorId === 'null' || !doctorId ? null : Number(doctorId);

    // Call stored procedure sp_book_appointment
    const result = bookAppointment({
      patient_id: targetPatientPersonId,
      doctor_id: docVal,
      receptionist_id: receptionistId,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      amount: Number(amount) || 0,
      payment_method: paymentMethod,
      insurance_status: insuranceStatus,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to book appointment');
    } else {
      setSuccessMessage(
        `Appointment #${result.appointment_id} successfully created! Transaction committed with payment and confirmation records.`
      );
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  // Helper to get person name
  const getPersonName = (personId: number) => {
    const p = persons.find((item) => item.person_id === personId);
    return p ? `${p.first_name} ${p.last_name}` : `ID ${personId}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Book Medical Appointment
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              CALL sp_book_appointment(patient_id, doctor_id, date, time, amount)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* SQL Error Notification */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 text-rose-800 text-xs font-mono">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-900">SQL Trigger Exception / Validation:</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Success Notification */}
          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Patient Selection Segment */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                1. Patient Information
              </label>
              <button
                type="button"
                onClick={() => setIsQuickRegister(!isQuickRegister)}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1.5"
              >
                {isQuickRegister ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Choose Existing Patient</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Quick Register New Patient</span>
                  </>
                )}
              </button>
            </div>

            {!isQuickRegister ? (
              <div>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                >
                  {patients.map((pat) => {
                    const patPerson = persons.find((p) => p.person_id === pat.person_id);
                    return (
                      <option key={pat.patient_id} value={pat.person_id}>
                        {patPerson?.first_name} {patPerson?.last_name} · ({pat.gender}, DOB: {pat.date_of_birth}) · Phone: {patPerson?.phone_number || 'N/A'}
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">First Name</label>
                  <input
                    type="text"
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    placeholder="e.g. GRACE"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    placeholder="e.g. KICONCO"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Email (Unique)</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="grace@example.com"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="070..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={regDob}
                    onChange={(e) => setRegDob(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
                  <select
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value as Gender)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Doctor & Receptionist Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Attending Doctor
              </label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="null">-- Unassigned / General Triage --</option>
                {doctors.map((doc) => {
                  const docPerson = persons.find((p) => p.person_id === doc.person_id);
                  return (
                    <option key={doc.DOCTOR_ID} value={doc.person_id}>
                      Dr. {docPerson?.first_name} {docPerson?.last_name} ({doc.speciality})
                    </option>
                  );
                })}
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Trigger checks for double-booking on chosen doctor.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Booking Receptionist
              </label>
              <select
                value={receptionistId}
                onChange={(e) => setReceptionistId(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {receptionists.map((rec) => {
                  return (
                    <option key={rec.person_id} value={rec.person_id}>
                      {getPersonName(rec.person_id)} ({rec.employee_number})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Date & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                Appointment Date
              </label>
              <input
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
                Appointment Time (HH:MM)
              </label>
              <select
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              >
                <option value="08:00">08:00 AM</option>
                <option value="08:30">08:30 AM</option>
                <option value="09:00">09:00 AM</option>
                <option value="09:30">09:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="14:00">02:00 PM</option>
                <option value="14:30">02:30 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="15:30">03:30 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="16:30">04:30 PM</option>
              </select>
            </div>
          </div>

          {/* Payment Details (sp_book_appointment transaction step) */}
          <div className="border border-slate-200 rounded-lg p-4 bg-emerald-50/30">
            <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block mb-3">
              <DollarSign className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
              2. Consultation Fee & Payment Ledger
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Amount (UGX)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="Mobile Money">Mobile Money (MTN / Airtel)</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Bank Transfer">Bank Wire Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Insurance Status
                </label>
                <select
                  value={insuranceStatus}
                  onChange={(e) => setInsuranceStatus(e.target.value as InsuranceStatus)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="insured">Insured</option>
                  <option value="Not insured">Not insured</option>
                </select>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Note: This executes an atomic transaction inserting into `appointment`, `payment`, and `confirmation` tables simultaneously.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Executing sp_book_appointment...' : 'Confirm & Commit Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
