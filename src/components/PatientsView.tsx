import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Calendar, Phone, Mail, User, AlertCircle } from 'lucide-react';
import { useDatabase } from '../database/dbStore';
import { Gender } from '../types/database';

interface PatientsViewProps {
  onOpenRegisterModal: () => void;
  onBookForPatient: (patientPersonId: number) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  onOpenRegisterModal,
  onBookForPatient,
}) => {
  const { patients, persons, appointments } = useDatabase();

  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | Gender>('All');

  const joinedPatients = useMemo(() => {
    return patients.map((pat) => {
      const person = persons.find((p) => p.person_id === pat.person_id);
      const patAppointments = appointments.filter((a) => a.patient_id === pat.person_id);

      // Calculate age
      let age: number | null = null;
      if (pat.date_of_birth) {
        const birthDate = new Date(pat.date_of_birth);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      return {
        patient_id: pat.patient_id,
        person_id: pat.person_id,
        first_name: person?.first_name || 'UNKNOWN',
        last_name: person?.last_name || 'PATIENT',
        email: person?.email || '',
        phone: person?.phone_number || 'N/A',
        dob: pat.date_of_birth || 'N/A',
        gender: pat.gender || 'N/A',
        age,
        appointmentCount: patAppointments.length,
        created_at: person?.created_at || 'N/A',
      };
    });
  }, [patients, persons, appointments]);

  const filtered = useMemo(() => {
    return joinedPatients.filter((pat) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const nameMatch = `${pat.first_name} ${pat.last_name}`.toLowerCase().includes(q);
        const emailMatch = pat.email.toLowerCase().includes(q);
        const phoneMatch = pat.phone.includes(q);
        if (!nameMatch && !emailMatch && !phoneMatch) return false;
      }

      if (genderFilter !== 'All' && pat.gender !== genderFilter) {
        return false;
      }

      return true;
    });
  }, [joinedPatients, search, genderFilter]);

  const maleCount = joinedPatients.filter((p) => p.gender === 'Male').length;
  const femaleCount = joinedPatients.filter((p) => p.gender === 'Female').length;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Patient Registry & Medical Index
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized relational table: <code className="font-mono text-emerald-700">patient</code> + <code className="font-mono text-emerald-700">person</code> (role: 'PATIENT')
          </p>
        </div>
        <button
          onClick={onOpenRegisterModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Patients</span>
          <p className="text-2xl font-bold text-slate-900 tabular-nums mt-1">{joinedPatients.length}</p>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">table: patient</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-600">Female Patients</span>
          <p className="text-2xl font-bold text-slate-800 tabular-nums mt-1">{femaleCount}</p>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">gender: 'Female'</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-600">Male Patients</span>
          <p className="text-2xl font-bold text-slate-800 tabular-nums mt-1">{maleCount}</p>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">gender: 'Male'</div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-emerald-700">Active Bookings</span>
          <p className="text-2xl font-bold text-emerald-800 tabular-nums mt-1">{appointments.length}</p>
          <div className="mt-1 text-[11px] text-emerald-600">Total appointments on file</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient by name, email, or telephone number..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          {(['All', 'Female', 'Male', 'Other'] as const).map((gender) => {
            const isActive = genderFilter === gender;
            return (
              <button
                key={gender}
                onClick={() => setGenderFilter(gender)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  isActive ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {gender}
              </button>
            );
          })}
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Registered Patients Roster
            </h2>
            <p className="text-[11px] text-slate-500">
              Foreign key: <code className="font-mono">patient.person_id -&gt; person.person_id</code>
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">{filtered.length} patients</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-4">Patient Ref</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Gender & Age</th>
                <th className="py-3 px-4">Date of Birth</th>
                <th className="py-3 px-4">Telephone</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4 text-center">Appointments</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-700">No patients found</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the search criteria.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((pat) => (
                  <tr key={pat.patient_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600">
                      #{pat.patient_id} <span className="text-[10px] text-slate-400">(PID: {pat.person_id})</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {pat.first_name} {pat.last_name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800">{pat.gender}</span>
                      {pat.age !== null && (
                        <span className="text-slate-500 ml-1.5 font-mono">({pat.age} yrs)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {pat.dob}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {pat.phone}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {pat.email}
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums font-semibold text-slate-800">
                      {pat.appointmentCount}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onBookForPatient(pat.person_id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors whitespace-nowrap"
                      >
                        Book Appointment
                      </button>
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
