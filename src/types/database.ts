export type Role = 'DOCTOR' | 'PATIENT' | 'Receptionist';
export type Gender = 'Male' | 'Female' | 'Other';
export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
export type AvailabilityStatus = 'Available' | 'Booked' | 'Not Available';
export type InsuranceStatus = 'insured' | 'Not insured';
export type ConfirmationStatus = 'Pending' | 'Confirmed' | 'Cancelled';

export interface Person {
  person_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  created_at: string;
  role: Role;
}

export interface Patient {
  patient_id: number;
  person_id: number;
  date_of_birth: string | null;
  gender: Gender | null;
}

export interface Doctor {
  DOCTOR_ID: number;
  person_id: number;
  speciality: string;
  license_number: string;
  years_experience: number;
  created_at: string;
}

export interface Receptionist {
  person_id: number;
  employee_number: string;
}

export interface Appointment {
  appointment_id: number;
  patient_id: number | null; // references patient(person_id) per schema foreign key
  doctor_id: number | null;  // references doctor(person_id)
  receptionist_id: number | null; // references receptionist(person_id)
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
}

export interface Availability {
  availability_id: number;
  doctor_id: number | null;
  available_date: string;
  start_time: string;
  end_time: string;
  availability_status: AvailabilityStatus;
}

export interface Payment {
  payment_id: number;
  patient_id: number | null;
  appointment_id: number | null;
  amount: number;
  payment_method: string;
  payment_date: string;
  insurance_status: InsuranceStatus;
}

export interface Confirmation {
  confirmation_id: number;
  person_id: number;
  appointment_id: number;
  payment_id: number;
  confirmation_type: string;
  status: ConfirmationStatus;
  created_at: string;
}

// Joined Views corresponding to MySQL Queries in user's prompt
export interface MasterAppointmentView {
  appointment_id: number;
  appointment_date: string;
  appointment_time: string;
  appointment_status: AppointmentStatus;
  patient_person_id: number | null;
  patient_first_name: string;
  patient_last_name: string;
  patient_phone: string;
  patient_email: string;
  gender: Gender | string;
  doctor_person_id: number | null;
  doctor_first_name: string;
  doctor_last_name: string;
  speciality: string;
  receptionist_first_name: string;
  receptionist_last_name: string;
  payment_amount: number | null;
  payment_method: string | null;
  insurance_status: InsuranceStatus | null;
}

export interface PaymentLedgerView {
  payment_id: number;
  amount: number;
  payment_method: string;
  payment_date: string;
  insurance_status: InsuranceStatus;
  appointment_id: number | null;
  appointment_date: string;
  appointment_status: AppointmentStatus;
  patient_first_name: string;
  patient_last_name: string;
  email: string;
}

export interface AuditTrailView {
  confirmation_id: number;
  confirmation_type: string;
  confirmation_status: ConfirmationStatus;
  appointment_id: number;
  appointment_date: string;
  appointment_time: string;
  appointment_status: AppointmentStatus;
  patient_first_name: string;
  patient_last_name: string;
  gender: Gender | string;
  doctor_first_name: string;
  doctor_last_name: string;
  speciality: string;
  receptionist_first_name: string;
  employee_number: string;
  amount: number;
  payment_method: string;
  insurance_status: InsuranceStatus;
  created_at: string;
}

export interface DoctorScheduleSlot {
  appointment_id: number;
  appointment_time: string;
  appointment_status: AppointmentStatus;
  patient_name: string;
  patient_phone: string;
  gender: Gender | string;
  amount: number | null;
  insurance_status: InsuranceStatus | null;
}

export interface DoctorFinancialReportRow {
  DOCTOR_ID: number;
  doctor_person_id: number;
  doctor_name: string;
  speciality: string;
  total_appointments: number;
  total_revenue: number;
}
