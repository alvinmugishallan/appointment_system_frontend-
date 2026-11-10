import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Person,
  Patient,
  Doctor,
  Receptionist,
  Appointment,
  Availability,
  Payment,
  Confirmation,
  MasterAppointmentView,
  PaymentLedgerView,
  AuditTrailView,
  DoctorScheduleSlot,
  DoctorFinancialReportRow,
  AppointmentStatus,
  AvailabilityStatus,
  InsuranceStatus,
  Gender,
} from '../types/database';
import {
  INITIAL_PERSONS,
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_RECEPTIONISTS,
  INITIAL_APPOINTMENTS,
  INITIAL_AVAILABILITY,
  INITIAL_PAYMENTS,
  INITIAL_CONFIRMATIONS,
} from './initialData';

interface DatabaseContextType {
  // Raw Tables
  persons: Person[];
  patients: Patient[];
  doctors: Doctor[];
  receptionists: Receptionist[];
  appointments: Appointment[];
  availabilities: Availability[];
  payments: Payment[];
  confirmations: Confirmation[];

  // Views & Stored Procedures
  masterAppointments: MasterAppointmentView[];
  paymentLedger: PaymentLedgerView[];
  auditTrail: AuditTrailView[];
  getDoctorDailySchedule: (doctorId: number, date: string) => DoctorScheduleSlot[];
  getDoctorFinancialReport: (startDate: string, endDate: string) => DoctorFinancialReportRow[];

  // Stored Procedure: sp_book_appointment
  bookAppointment: (params: {
    patient_id: number;
    doctor_id: number | null;
    receptionist_id: number | null;
    appointment_date: string;
    appointment_time: string;
    amount: number;
    payment_method?: string;
    insurance_status?: InsuranceStatus;
  }) => { success: boolean; appointment_id?: number; error?: string };

  // Stored Procedure: sp_register_patient
  registerPatient: (params: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    dob: string;
    gender: Gender;
  }) => { success: boolean; person_id?: number; patient_id?: number; error?: string };

  // Trigger-guarded Payment Recording
  recordPayment: (params: {
    patient_id: number;
    appointment_id: number;
    amount: number;
    payment_method: string;
    insurance_status: InsuranceStatus;
    payment_date?: string;
  }) => { success: boolean; payment_id?: number; error?: string };

  // Appointment Status Updates
  updateAppointmentStatus: (appointmentId: number, status: AppointmentStatus) => { success: boolean; error?: string };

  // Availability Management
  addAvailability: (params: {
    doctor_id: number | null;
    available_date: string;
    start_time: string;
    end_time: string;
    availability_status: AvailabilityStatus;
  }) => { success: boolean; error?: string };
  updateAvailabilityStatus: (availabilityId: number, status: AvailabilityStatus) => void;

  // DB Utilities
  resetToDefault: () => void;
  exportDatabaseSQL: () => string;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

const STORAGE_KEY = 'metrocare_hospital_database_v1';

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage if available, or fall back to initial SQL seeds
  const [persons, setPersons] = useState<Person[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_persons`);
      return saved ? JSON.parse(saved) : INITIAL_PERSONS;
    } catch {
      return INITIAL_PERSONS;
    }
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_patients`);
      return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
    } catch {
      return INITIAL_PATIENTS;
    }
  });

  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_doctors`);
      return saved ? JSON.parse(saved) : INITIAL_DOCTORS;
    } catch {
      return INITIAL_DOCTORS;
    }
  });

  const [receptionists, setReceptionists] = useState<Receptionist[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_receptionists`);
      return saved ? JSON.parse(saved) : INITIAL_RECEPTIONISTS;
    } catch {
      return INITIAL_RECEPTIONISTS;
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_appointments`);
      return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  });

  const [availabilities, setAvailabilities] = useState<Availability[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_availabilities`);
      return saved ? JSON.parse(saved) : INITIAL_AVAILABILITY;
    } catch {
      return INITIAL_AVAILABILITY;
    }
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
      return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
    } catch {
      return INITIAL_PAYMENTS;
    }
  });

  const [confirmations, setConfirmations] = useState<Confirmation[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_confirmations`);
      return saved ? JSON.parse(saved) : INITIAL_CONFIRMATIONS;
    } catch {
      return INITIAL_CONFIRMATIONS;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_persons`, JSON.stringify(persons));
      localStorage.setItem(`${STORAGE_KEY}_patients`, JSON.stringify(patients));
      localStorage.setItem(`${STORAGE_KEY}_doctors`, JSON.stringify(doctors));
      localStorage.setItem(`${STORAGE_KEY}_receptionists`, JSON.stringify(receptionists));
      localStorage.setItem(`${STORAGE_KEY}_appointments`, JSON.stringify(appointments));
      localStorage.setItem(`${STORAGE_KEY}_availabilities`, JSON.stringify(availabilities));
      localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
      localStorage.setItem(`${STORAGE_KEY}_confirmations`, JSON.stringify(confirmations));
    } catch {
      // storage quota or private browsing fallback
    }
  }, [persons, patients, doctors, receptionists, appointments, availabilities, payments, confirmations]);

  // Master Appointment View (Wide Join matching prompt's query #5)
  const masterAppointments: MasterAppointmentView[] = useMemo(() => {
    return appointments.map((appt) => {
      const patientRecord = patients.find((p) => p.person_id === appt.patient_id);
      const patientPerson = persons.find((p) => p.person_id === appt.patient_id);
      const doctorRecord = doctors.find((d) => d.person_id === appt.doctor_id);
      const doctorPerson = persons.find((p) => p.person_id === appt.doctor_id);
      const receptionistPerson = persons.find((p) => p.person_id === appt.receptionist_id);
      const paymentRecord = payments.find((pay) => pay.appointment_id === appt.appointment_id);

      return {
        appointment_id: appt.appointment_id,
        appointment_date: appt.appointment_date,
        appointment_time: appt.appointment_time,
        appointment_status: appt.status,
        patient_person_id: appt.patient_id,
        patient_first_name: patientPerson ? patientPerson.first_name : 'Walk-in',
        patient_last_name: patientPerson ? patientPerson.last_name : 'Patient',
        patient_phone: patientPerson?.phone_number || 'N/A',
        patient_email: patientPerson?.email || 'N/A',
        gender: patientRecord?.gender || 'N/A',
        doctor_person_id: appt.doctor_id,
        doctor_first_name: doctorPerson ? doctorPerson.first_name : 'Unassigned',
        doctor_last_name: doctorPerson ? doctorPerson.last_name : '',
        speciality: doctorRecord ? doctorRecord.speciality : 'General Care',
        receptionist_first_name: receptionistPerson ? receptionistPerson.first_name : 'Direct',
        receptionist_last_name: receptionistPerson ? receptionistPerson.last_name : 'Booking',
        payment_amount: paymentRecord ? paymentRecord.amount : null,
        payment_method: paymentRecord ? paymentRecord.payment_method : null,
        insurance_status: paymentRecord ? paymentRecord.insurance_status : null,
      };
    }).sort((a, b) => {
      // Sort desc by appointment_id
      return b.appointment_id - a.appointment_id;
    });
  }, [appointments, patients, persons, doctors, payments]);

  // Payment Ledger & Patient Contact View (matching prompt's query #5)
  const paymentLedger: PaymentLedgerView[] = useMemo(() => {
    return payments.map((pay) => {
      const appt = appointments.find((a) => a.appointment_id === pay.appointment_id);
      const patientPerson = persons.find((p) => p.person_id === pay.patient_id);

      return {
        payment_id: pay.payment_id,
        amount: pay.amount,
        payment_method: pay.payment_method,
        payment_date: pay.payment_date,
        insurance_status: pay.insurance_status,
        appointment_id: pay.appointment_id,
        appointment_date: appt?.appointment_date || 'N/A',
        appointment_status: appt?.status || 'Pending',
        patient_first_name: patientPerson ? patientPerson.first_name : 'Unknown',
        patient_last_name: patientPerson ? patientPerson.last_name : 'Patient',
        email: patientPerson ? patientPerson.email : 'N/A',
      };
    }).sort((a, b) => b.payment_id - a.payment_id);
  }, [payments, appointments, persons]);

  // Complete Audit Trail View (7-Table Pipeline Join matching prompt's query #5)
  const auditTrail: AuditTrailView[] = useMemo(() => {
    return confirmations.map((c) => {
      const appt = appointments.find((a) => a.appointment_id === c.appointment_id);
      const pay = payments.find((p) => p.payment_id === c.payment_id);
      const patientRecord = patients.find((p) => p.person_id === appt?.patient_id);
      const patientPerson = persons.find((p) => p.person_id === appt?.patient_id);
      const doctorRecord = doctors.find((d) => d.person_id === appt?.doctor_id);
      const doctorPerson = persons.find((p) => p.person_id === appt?.doctor_id);
      const rec = receptionists.find((r) => r.person_id === appt?.receptionist_id);
      const recPerson = persons.find((p) => p.person_id === appt?.receptionist_id);

      return {
        confirmation_id: c.confirmation_id,
        confirmation_type: c.confirmation_type,
        confirmation_status: c.status,
        appointment_id: c.appointment_id,
        appointment_date: appt?.appointment_date || 'N/A',
        appointment_time: appt?.appointment_time || 'N/A',
        appointment_status: appt?.status || 'Pending',
        patient_first_name: patientPerson?.first_name || 'N/A',
        patient_last_name: patientPerson?.last_name || 'N/A',
        gender: patientRecord?.gender || 'N/A',
        doctor_first_name: doctorPerson?.first_name || 'N/A',
        doctor_last_name: doctorPerson?.last_name || '',
        speciality: doctorRecord?.speciality || 'General',
        receptionist_first_name: recPerson?.first_name || 'Staff',
        employee_number: rec?.employee_number || 'REC-SYS',
        amount: pay?.amount || 0,
        payment_method: pay?.payment_method || 'Cash',
        insurance_status: pay?.insurance_status || 'Not insured',
        created_at: c.created_at,
      };
    }).sort((a, b) => b.confirmation_id - a.confirmation_id);
  }, [confirmations, appointments, payments, patients, persons, doctors, receptionists]);

  // Stored Procedure: sp_get_doctor_daily_schedule(p_doctor_id, p_date)
  const getDoctorDailySchedule = (doctorId: number, date: string): DoctorScheduleSlot[] => {
    const doctorAppts = appointments.filter(
      (a) => a.doctor_id === doctorId && a.appointment_date === date
    );

    return doctorAppts
      .map((a) => {
        const patPerson = persons.find((p) => p.person_id === a.patient_id);
        const pat = patients.find((p) => p.person_id === a.patient_id);
        const pay = payments.find((p) => p.appointment_id === a.appointment_id);

        return {
          appointment_id: a.appointment_id,
          appointment_time: a.appointment_time,
          appointment_status: a.status,
          patient_name: patPerson ? `${patPerson.first_name} ${patPerson.last_name}` : 'Unknown Patient',
          patient_phone: patPerson?.phone_number || 'N/A',
          gender: pat?.gender || 'N/A',
          amount: pay ? pay.amount : null,
          insurance_status: pay ? pay.insurance_status : null,
        };
      })
      .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  };

  // Stored Procedure: sp_get_doctor_financial_report(p_start_date, p_end_date)
  const getDoctorFinancialReport = (startDate: string, endDate: string): DoctorFinancialReportRow[] => {
    return doctors
      .map((d) => {
        const docPerson = persons.find((p) => p.person_id === d.person_id);
        const docName = docPerson ? `${docPerson.first_name} ${docPerson.last_name}` : `Doctor #${d.DOCTOR_ID}`;

        const docApptsInRange = appointments.filter((a) => {
          if (a.doctor_id !== d.person_id) return false;
          return a.appointment_date >= startDate && a.appointment_date <= endDate;
        });

        const apptIds = new Set(docApptsInRange.map((a) => a.appointment_id));
        const matchedPayments = payments.filter((pay) => pay.appointment_id && apptIds.has(pay.appointment_id));

        const totalRevenue = matchedPayments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

        return {
          DOCTOR_ID: d.DOCTOR_ID,
          doctor_person_id: d.person_id,
          doctor_name: docName,
          speciality: d.speciality,
          total_appointments: docApptsInRange.length,
          total_revenue: totalRevenue,
        };
      })
      .sort((a, b) => b.total_revenue - a.total_revenue);
  };

  // Stored Procedure: sp_book_appointment
  // With Trigger: trg_prevent_double_booking
  const bookAppointment = (params: {
    patient_id: number;
    doctor_id: number | null;
    receptionist_id: number | null;
    appointment_date: string;
    appointment_time: string;
    amount: number;
    payment_method?: string;
    insurance_status?: InsuranceStatus;
  }) => {
    // 1. TRIGGER CHECK: trg_prevent_double_booking
    if (params.doctor_id !== null) {
      const isDoubleBooked = appointments.some((a) => {
        return (
          a.doctor_id === params.doctor_id &&
          a.appointment_date === params.appointment_date &&
          a.appointment_time.slice(0, 5) === params.appointment_time.slice(0, 5) &&
          a.status !== 'Cancelled'
        );
      });

      if (isDoubleBooked) {
        return {
          success: false,
          error: 'SQL Error (45000) [trg_prevent_double_booking]: Doctor is already booked for this specific time slot.',
        };
      }
    }

    // 2. ATOMIC TRANSACTION:
    // Generate IDs
    const nextApptId = Math.max(0, ...appointments.map((a) => a.appointment_id)) + 1;
    const nextPayId = Math.max(0, ...payments.map((p) => p.payment_id)) + 1;
    const nextConfId = Math.max(0, ...confirmations.map((c) => c.confirmation_id)) + 1;

    const formattedTime = params.appointment_time.length === 5 ? `${params.appointment_time}:00` : params.appointment_time;

    const newAppointment: Appointment = {
      appointment_id: nextApptId,
      patient_id: params.patient_id,
      doctor_id: params.doctor_id,
      receptionist_id: params.receptionist_id || 6,
      appointment_date: params.appointment_date,
      appointment_time: formattedTime,
      status: 'Confirmed',
    };

    const newPayment: Payment = {
      payment_id: nextPayId,
      patient_id: params.patient_id,
      appointment_id: nextApptId,
      amount: Number(params.amount) || 0,
      payment_method: params.payment_method || 'Cash',
      payment_date: params.appointment_date,
      insurance_status: params.insurance_status || 'Not insured',
    };

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newConfirmation: Confirmation = {
      confirmation_id: nextConfId,
      person_id: params.patient_id,
      appointment_id: nextApptId,
      payment_id: nextPayId,
      confirmation_type: 'Appointment Confirmation',
      status: 'Confirmed',
      created_at: now,
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    setPayments((prev) => [newPayment, ...prev]);
    setConfirmations((prev) => [newConfirmation, ...prev]);

    return {
      success: true,
      appointment_id: nextApptId,
    };
  };

  // Stored Procedure: sp_register_patient
  const registerPatient = (params: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    dob: string;
    gender: Gender;
  }) => {
    // Check email uniqueness constraint: UNIQUE KEY email (email)
    const emailLower = params.email.trim().toLowerCase();
    const existingPerson = persons.find((p) => p.email.toLowerCase() === emailLower);
    if (existingPerson) {
      return {
        success: false,
        error: `Duplicate entry '${params.email}' for key 'person.email'`,
      };
    }

    const nextPersonId = Math.max(0, ...persons.map((p) => p.person_id)) + 1;
    const nextPatientId = Math.max(0, ...patients.map((p) => p.patient_id)) + 1;
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const newPerson: Person = {
      person_id: nextPersonId,
      first_name: params.first_name.trim().toUpperCase(),
      last_name: params.last_name.trim().toUpperCase(),
      email: emailLower,
      phone_number: params.phone.trim(),
      created_at: now,
      role: 'PATIENT',
    };

    const newPatient: Patient = {
      patient_id: nextPatientId,
      person_id: nextPersonId,
      date_of_birth: params.dob,
      gender: params.gender,
    };

    setPersons((prev) => [...prev, newPerson]);
    setPatients((prev) => [...prev, newPatient]);

    return {
      success: true,
      person_id: nextPersonId,
      patient_id: nextPatientId,
    };
  };

  // Trigger: trg_prevent_cancelled_payment
  const recordPayment = (params: {
    patient_id: number;
    appointment_id: number;
    amount: number;
    payment_method: string;
    insurance_status: InsuranceStatus;
    payment_date?: string;
  }) => {
    // Check appointment status
    const appt = appointments.find((a) => a.appointment_id === params.appointment_id);
    if (!appt) {
      return { success: false, error: `Appointment #${params.appointment_id} does not exist.` };
    }

    if (appt.status === 'Cancelled') {
      return {
        success: false,
        error: 'SQL Error (45000) [trg_prevent_cancelled_payment]: Cannot record payment for a cancelled appointment.',
      };
    }

    if (params.amount < 0) {
      return {
        success: false,
        error: 'Constraint violation: chk_amount CHECK (amount >= 0)',
      };
    }

    const nextPayId = Math.max(0, ...payments.map((p) => p.payment_id)) + 1;
    const nextConfId = Math.max(0, ...confirmations.map((c) => c.confirmation_id)) + 1;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const newPay: Payment = {
      payment_id: nextPayId,
      patient_id: params.patient_id,
      appointment_id: params.appointment_id,
      amount: Number(params.amount),
      payment_method: params.payment_method || 'Cash',
      payment_date: params.payment_date || today,
      insurance_status: params.insurance_status,
    };

    const newConf: Confirmation = {
      confirmation_id: nextConfId,
      person_id: params.patient_id,
      appointment_id: params.appointment_id,
      payment_id: nextPayId,
      confirmation_type: 'Payment Confirmation',
      status: 'Confirmed',
      created_at: now,
    };

    setPayments((prev) => [newPay, ...prev]);
    setConfirmations((prev) => [newConf, ...prev]);

    return { success: true, payment_id: nextPayId };
  };

  const updateAppointmentStatus = (appointmentId: number, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((a) => (a.appointment_id === appointmentId ? { ...a, status } : a))
    );
    return { success: true };
  };

  const addAvailability = (params: {
    doctor_id: number | null;
    available_date: string;
    start_time: string;
    end_time: string;
    availability_status: AvailabilityStatus;
  }) => {
    if (params.end_time <= params.start_time) {
      return {
        success: false,
        error: 'Constraint violation: chk_time_range CHECK (end_time > start_time)',
      };
    }

    const nextAvailId = Math.max(0, ...availabilities.map((a) => a.availability_id)) + 1;
    const formattedStart = params.start_time.length === 5 ? `${params.start_time}:00` : params.start_time;
    const formattedEnd = params.end_time.length === 5 ? `${params.end_time}:00` : params.end_time;

    const newAvail: Availability = {
      availability_id: nextAvailId,
      doctor_id: params.doctor_id,
      available_date: params.available_date,
      start_time: formattedStart,
      end_time: formattedEnd,
      availability_status: params.availability_status,
    };

    setAvailabilities((prev) => [...prev, newAvail]);
    return { success: true };
  };

  const updateAvailabilityStatus = (availabilityId: number, status: AvailabilityStatus) => {
    setAvailabilities((prev) =>
      prev.map((a) => (a.availability_id === availabilityId ? { ...a, availability_status: status } : a))
    );
  };

  const resetToDefault = () => {
    setPersons(INITIAL_PERSONS);
    setPatients(INITIAL_PATIENTS);
    setDoctors(INITIAL_DOCTORS);
    setReceptionists(INITIAL_RECEPTIONISTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setAvailabilities(INITIAL_AVAILABILITY);
    setPayments(INITIAL_PAYMENTS);
    setConfirmations(INITIAL_CONFIRMATIONS);
    localStorage.removeItem(`${STORAGE_KEY}_persons`);
    localStorage.removeItem(`${STORAGE_KEY}_patients`);
    localStorage.removeItem(`${STORAGE_KEY}_doctors`);
    localStorage.removeItem(`${STORAGE_KEY}_receptionists`);
    localStorage.removeItem(`${STORAGE_KEY}_appointments`);
    localStorage.removeItem(`${STORAGE_KEY}_availabilities`);
    localStorage.removeItem(`${STORAGE_KEY}_payments`);
    localStorage.removeItem(`${STORAGE_KEY}_confirmations`);
  };

  const exportDatabaseSQL = (): string => {
    let sql = `-- MetroCare Hospital Database Dump\n-- Generated on: ${new Date().toISOString()}\n\n`;

    sql += `-- Table: person\n`;
    persons.forEach((p) => {
      sql += `INSERT INTO person (person_id, first_name, last_name, email, phone_number, created_at, role) VALUES (${p.person_id}, '${p.first_name}', '${p.last_name}', '${p.email}', '${p.phone_number || ''}', '${p.created_at}', '${p.role}');\n`;
    });

    sql += `\n-- Table: patient\n`;
    patients.forEach((p) => {
      sql += `INSERT INTO patient (patient_id, person_id, date_of_birth, gender) VALUES (${p.patient_id}, ${p.person_id}, '${p.date_of_birth || ''}', '${p.gender || ''}');\n`;
    });

    sql += `\n-- Table: doctor\n`;
    doctors.forEach((d) => {
      sql += `INSERT INTO doctor (DOCTOR_ID, person_id, speciality, license_number, years_experience, created_at) VALUES (${d.DOCTOR_ID}, ${d.person_id}, '${d.speciality}', '${d.license_number}', ${d.years_experience}, '${d.created_at}');\n`;
    });

    sql += `\n-- Table: appointment\n`;
    appointments.forEach((a) => {
      sql += `INSERT INTO appointment (appointment_id, patient_id, doctor_id, receptionist_id, appointment_date, appointment_time, status) VALUES (${a.appointment_id}, ${a.patient_id || 'NULL'}, ${a.doctor_id || 'NULL'}, ${a.receptionist_id || 'NULL'}, '${a.appointment_date}', '${a.appointment_time}', '${a.status}');\n`;
    });

    sql += `\n-- Table: payment\n`;
    payments.forEach((pay) => {
      sql += `INSERT INTO payment (payment_id, patient_id, appointment_id, amount, payment_method, payment_date, insurance_status) VALUES (${pay.payment_id}, ${pay.patient_id || 'NULL'}, ${pay.appointment_id || 'NULL'}, ${pay.amount.toFixed(2)}, '${pay.payment_method}', '${pay.payment_date}', '${pay.insurance_status}');\n`;
    });

    return sql;
  };

  return (
    <DatabaseContext.Provider
      value={{
        persons,
        patients,
        doctors,
        receptionists,
        appointments,
        availabilities,
        payments,
        confirmations,
        masterAppointments,
        paymentLedger,
        auditTrail,
        getDoctorDailySchedule,
        getDoctorFinancialReport,
        bookAppointment,
        registerPatient,
        recordPayment,
        updateAppointmentStatus,
        addAvailability,
        updateAvailabilityStatus,
        resetToDefault,
        exportDatabaseSQL,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
