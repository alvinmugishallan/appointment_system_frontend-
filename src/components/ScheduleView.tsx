import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  User,
  Plus,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useDatabase } from '../database/dbStore';
import { AvailabilityStatus } from '../types/database';

interface ScheduleViewProps {
  onBookWithDoctor: (doctorId: number, date: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ onBookWithDoctor }) => {
  const {
    doctors,
    persons,
    availabilities,
    getDoctorDailySchedule,
    addAvailability,
    updateAvailabilityStatus,
  } = useDatabase();

  // Schedule Filter
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(1); // Dr. Ogwang David
  const [selectedDate, setSelectedDate] = useState<string>('2025-09-08');

  // Add Availability State
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlotDoctorId, setNewSlotDoctorId] = useState<string>('1');
  const [newSlotDate, setNewSlotDate] = useState<string>('2025-09-08');
  const [newSlotStartTime, setNewSlotStartTime] = useState<string>('08:00');
  const [newSlotEndTime, setNewSlotEndTime] = useState<string>('12:00');
  const [newSlotStatus, setNewSlotStatus] = useState<AvailabilityStatus>('Available');
  const [slotError, setSlotError] = useState<string | null>(null);
  const [slotSuccess, setSlotSuccess] = useState<string | null>(null);

  // Execute sp_get_doctor_daily_schedule
  const dailySchedule = useMemo(() => {
    return getDoctorDailySchedule(selectedDoctorId, selectedDate);
  }, [selectedDoctorId, selectedDate, getDoctorDailySchedule]);

  const currentDoctor = doctors.find((d) => d.person_id === selectedDoctorId);
  const currentDoctorPerson = persons.find((p) => p.person_id === selectedDoctorId);

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setSlotError(null);
    setSlotSuccess(null);

    const docId = newSlotDoctorId === 'null' ? null : Number(newSlotDoctorId);

    const res = addAvailability({
      doctor_id: docId,
      available_date: newSlotDate,
      start_time: newSlotStartTime,
      end_time: newSlotEndTime,
      availability_status: newSlotStatus,
    });

    if (!res.success) {
      setSlotError(res.error || 'Failed to add slot');
    } else {
      setSlotSuccess('Availability slot recorded in table availability.');
      setTimeout(() => {
        setIsAddingSlot(false);
        setSlotSuccess(null);
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Doctor Daily Schedule & Availability Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time execution of <code className="font-mono text-emerald-700">CALL sp_get_doctor_daily_schedule(p_doctor_id, p_date)</code>
          </p>
        </div>
        <button
          onClick={() => setIsAddingSlot(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-600" />
          <span>New Availability Window</span>
        </button>
      </div>

      {/* Procedure Control Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
          Stored Procedure Parameters
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Attending Doctor
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
            >
              {doctors.map((d) => {
                const docP = persons.find((p) => p.person_id === d.person_id);
                return (
                  <option key={d.DOCTOR_ID} value={d.person_id}>
                    Dr. {docP?.first_name} {docP?.last_name} — {d.speciality} (Exp: {d.years_experience} yrs)
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Consultation Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => onBookWithDoctor(selectedDoctorId, selectedDate)}
              className="w-full px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-2xs"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Book Dr. {currentDoctorPerson?.last_name || ''} on this Date</span>
            </button>
          </div>
        </div>

        {/* Doctor Identity Strip */}
        {currentDoctor && currentDoctorPerson && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-900">
                Dr. {currentDoctorPerson.first_name} {currentDoctorPerson.last_name}
              </span>
              <span>·</span>
              <span>Speciality: <strong className="text-slate-800">{currentDoctor.speciality}</strong></span>
              <span>·</span>
              <span>License: <code className="font-mono text-slate-700">{currentDoctor.license_number}</code></span>
              <span>·</span>
              <span>Phone: <code className="font-mono text-slate-700">{currentDoctorPerson.phone_number}</code></span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              DOCTOR_ID: {currentDoctor.DOCTOR_ID} | person_id: {currentDoctor.person_id}
            </div>
          </div>
        )}
      </div>

      {/* Procedure Output: Daily Schedule Slots */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Daily Schedule Roster for {selectedDate}
            </h2>
            <p className="text-[11px] text-slate-500 font-mono">
              Output of CALL sp_get_doctor_daily_schedule({selectedDoctorId}, '{selectedDate}')
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {dailySchedule.length} booked consultation(s)
          </span>
        </div>

        {dailySchedule.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Clock className="w-6 h-6 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium text-slate-700">
              No appointments booked for this doctor on {selectedDate}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Doctor time slots may still be available below in the availability roster.
            </p>
            <button
              onClick={() => onBookWithDoctor(selectedDoctorId, selectedDate)}
              className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
            >
              Book an Appointment Slot
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Slot Time</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Gender</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Consultation Status</th>
                  <th className="py-3 px-4 text-right">Fee (UGX)</th>
                  <th className="py-3 px-4 text-right">Insurance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailySchedule.map((slot) => (
                  <tr key={slot.appointment_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {slot.appointment_time}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {slot.patient_name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {slot.gender}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {slot.patient_phone}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        slot.appointment_status === 'Confirmed' ? 'text-emerald-700' :
                        slot.appointment_status === 'Cancelled' ? 'text-rose-700' : 'text-amber-700'
                      }`}>
                        {slot.appointment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {slot.amount !== null ? `${slot.amount.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right capitalize text-slate-600">
                      {slot.insurance_status || 'Unrecorded'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Doctor Availability Windows (table: availability) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Doctor Availability Roster (<code className="font-mono text-slate-600">table: availability</code>)
            </h2>
            <p className="text-[11px] text-slate-500">
              Enforces <code className="font-mono">CONSTRAINT chk_time_range CHECK (end_time &gt; start_time)</code>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Time Window</th>
                <th className="py-3 px-4">Availability Status</th>
                <th className="py-3 px-4 text-right">Quick Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {availabilities.map((avail) => {
                const docP = persons.find((p) => p.person_id === avail.doctor_id);
                const docR = doctors.find((d) => d.person_id === avail.doctor_id);
                return (
                  <tr key={avail.availability_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500">#{avail.availability_id}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {avail.doctor_id ? (
                        <span>
                          Dr. {docP?.first_name} {docP?.last_name} ({docR?.speciality})
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Hospital Float Window (Any Doctor)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{avail.available_date}</td>
                    <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {avail.start_time} — {avail.end_time}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`font-semibold ${
                        avail.availability_status === 'Available' ? 'text-emerald-700' :
                        avail.availability_status === 'Booked' ? 'text-blue-700' : 'text-slate-500'
                      }`}>
                        {avail.availability_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => updateAvailabilityStatus(avail.availability_id, 'Available')}
                          className={`px-2 py-1 text-[11px] rounded transition-colors ${
                            avail.availability_status === 'Available'
                              ? 'bg-emerald-100 text-emerald-800 font-semibold'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Available
                        </button>
                        <button
                          onClick={() => updateAvailabilityStatus(avail.availability_id, 'Booked')}
                          className={`px-2 py-1 text-[11px] rounded transition-colors ${
                            avail.availability_status === 'Booked'
                              ? 'bg-blue-100 text-blue-800 font-semibold'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Booked
                        </button>
                        <button
                          onClick={() => updateAvailabilityStatus(avail.availability_id, 'Not Available')}
                          className={`px-2 py-1 text-[11px] rounded transition-colors ${
                            avail.availability_status === 'Not Available'
                              ? 'bg-slate-200 text-slate-800 font-semibold'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Not Available
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Availability Modal */}
      {isAddingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Add Doctor Availability Window
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">
              INSERT INTO availability ...
            </p>

            {slotError && (
              <div className="p-3 mb-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-mono flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{slotError}</span>
              </div>
            )}

            {slotSuccess && (
              <div className="p-3 mb-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{slotSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddSlot} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doctor</label>
                <select
                  value={newSlotDoctorId}
                  onChange={(e) => setNewSlotDoctorId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="null">-- General Float Window (Any Doctor) --</option>
                  {doctors.map((d) => {
                    const docP = persons.find((p) => p.person_id === d.person_id);
                    return (
                      <option key={d.DOCTOR_ID} value={d.person_id}>
                        Dr. {docP?.first_name} {docP?.last_name} ({d.speciality})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newSlotDate}
                  onChange={(e) => setNewSlotDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newSlotStartTime}
                    onChange={(e) => setNewSlotStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newSlotEndTime}
                    onChange={(e) => setNewSlotEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={newSlotStatus}
                  onChange={(e) => setNewSlotStatus(e.target.value as AvailabilityStatus)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="Booked">Booked</option>
                  <option value="Not Available">Not Available</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingSlot(false)}
                  className="px-3.5 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-2xs"
                >
                  Save Availability
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
