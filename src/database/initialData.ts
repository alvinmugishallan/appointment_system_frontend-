import {
  Person,
  Patient,
  Doctor,
  Receptionist,
  Appointment,
  Availability,
  Payment,
  Confirmation,
} from '../types/database';

export const INITIAL_PERSONS: Person[] = [
  { person_id: 1, first_name: 'OGWANG', last_name: 'DAVID', email: 'david@gmail.com', phone_number: '0701234567', created_at: '2026-09-03 07:52:49', role: 'DOCTOR' },
  { person_id: 2, first_name: 'OKELLO', last_name: 'JOSHUA', email: 'joshua@gmail.com', phone_number: '0707654321', created_at: '2026-09-03 07:52:49', role: 'PATIENT' },
  { person_id: 5, first_name: 'NAKATO', last_name: 'JANE', email: 'jane@gmail.com', phone_number: '0709876543', created_at: '2026-09-03 08:36:38', role: 'PATIENT' },
  { person_id: 6, first_name: 'MUSOKE', last_name: 'PAUL', email: 'paul@gmail.com', phone_number: '0701111111', created_at: '2026-09-03 08:36:38', role: 'Receptionist' },
  { person_id: 7, first_name: 'KABAGAMBE', last_name: 'MARY', email: 'mary@gmail.com', phone_number: '0702222222', created_at: '2026-09-03 08:36:38', role: 'PATIENT' },
  { person_id: 8, first_name: 'KASIRYE', last_name: 'DAVID', email: 'david2@gmail.com', phone_number: '0703333333', created_at: '2026-09-03 08:36:38', role: 'DOCTOR' },
  { person_id: 9, first_name: 'KALIBO', last_name: 'ANNE', email: 'anne@gmail.com', phone_number: '0704444333', created_at: '2026-09-03 08:36:38', role: 'PATIENT' },
  { person_id: 10, first_name: 'KABAGAMBE', last_name: 'JAMES', email: 'james@gmail.com', phone_number: '0705555555', created_at: '2026-09-03 08:36:38', role: 'Receptionist' },
  { person_id: 11, first_name: 'SEMU', last_name: 'JOSHUA', email: 'joshua2@gmail.com', phone_number: '0706666666', created_at: '2026-09-03 08:36:38', role: 'DOCTOR' },
  { person_id: 12, first_name: 'MATOVU', last_name: 'MUSA', email: 'musa@gmail.com', phone_number: '0787867876', created_at: '2026-09-03 08:36:38', role: 'DOCTOR' },
  { person_id: 13, first_name: 'NALUDDE', last_name: 'GLORIA', email: 'gloria@gmail.com', phone_number: '078978904', created_at: '2026-09-03 08:36:38', role: 'DOCTOR' },
  { person_id: 14, first_name: 'NALUBEGA', last_name: 'RUTH', email: 'ruth@gmail.com', phone_number: '0787867876', created_at: '2026-09-03 08:36:38', role: 'PATIENT' },
  { person_id: 15, first_name: 'KASIRYE', last_name: 'JAMES', email: 'james2@gmail.com', phone_number: '0789098765', created_at: '2026-09-03 08:36:38', role: 'PATIENT' },
  { person_id: 16, first_name: 'MUKASA', last_name: 'MATHEW', email: 'mathew@gmail.com', phone_number: '0789098765', created_at: '2026-09-03 08:36:38', role: 'PATIENT' },
  { person_id: 17, first_name: 'ONEN', last_name: 'JUSTIN', email: 'justin@gmail.com', phone_number: '0795452314', created_at: '2026-09-03 08:36:38', role: 'PATIENT' },
];

export const INITIAL_PATIENTS: Patient[] = [
  { patient_id: 1, person_id: 2, date_of_birth: '2000-01-01', gender: 'Male' },
  { patient_id: 2, person_id: 5, date_of_birth: '1998-02-03', gender: 'Female' },
  { patient_id: 3, person_id: 7, date_of_birth: '2004-03-04', gender: 'Female' },
  { patient_id: 4, person_id: 9, date_of_birth: '1993-02-01', gender: 'Female' },
  { patient_id: 5, person_id: 14, date_of_birth: '2006-01-02', gender: 'Female' },
  { patient_id: 6, person_id: 15, date_of_birth: '2001-02-01', gender: 'Male' },
  { patient_id: 7, person_id: 16, date_of_birth: '2002-03-03', gender: 'Male' },
  { patient_id: 8, person_id: 17, date_of_birth: '1995-03-01', gender: 'Male' },
];

export const INITIAL_DOCTORS: Doctor[] = [
  { DOCTOR_ID: 11, person_id: 1, speciality: 'GENERAL DOCTOR', license_number: 'DOC2001', years_experience: 20, created_at: '2026-09-03 09:12:40' },
  { DOCTOR_ID: 2, person_id: 8, speciality: 'SURGEON', license_number: 'SUR3001', years_experience: 10, created_at: '2026-09-03 09:12:40' },
  { DOCTOR_ID: 3, person_id: 11, speciality: 'SURGEON', license_number: 'SUR5001', years_experience: 15, created_at: '2026-09-03 09:12:40' },
  { DOCTOR_ID: 4, person_id: 12, speciality: 'PEDIATRICS', license_number: 'PED6002', years_experience: 10, created_at: '2026-09-03 09:12:40' },
  { DOCTOR_ID: 5, person_id: 13, speciality: 'CARDIOLOGIST', license_number: 'CARD0095', years_experience: 12, created_at: '2026-09-03 09:12:40' },
];

export const INITIAL_RECEPTIONISTS: Receptionist[] = [
  { person_id: 6, employee_number: 'REC001' },
  { person_id: 10, employee_number: 'REC002' },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  { appointment_id: 21, patient_id: 2, doctor_id: 1, receptionist_id: 6, appointment_date: '2025-09-08', appointment_time: '09:00:00', status: 'Confirmed' },
  { appointment_id: 22, patient_id: 9, doctor_id: null, receptionist_id: 6, appointment_date: '2025-09-08', appointment_time: '10:00:00', status: 'Pending' },
  { appointment_id: 23, patient_id: 5, doctor_id: null, receptionist_id: 10, appointment_date: '2025-09-09', appointment_time: '14:30:00', status: 'Confirmed' },
  { appointment_id: 24, patient_id: 7, doctor_id: 1, receptionist_id: 10, appointment_date: '2025-09-10', appointment_time: '11:00:00', status: 'Cancelled' },
];

export const INITIAL_AVAILABILITY: Availability[] = [
  { availability_id: 16, doctor_id: 1, available_date: '2025-09-08', start_time: '08:00:00', end_time: '12:00:00', availability_status: 'Available' },
  { availability_id: 17, doctor_id: null, available_date: '2025-09-09', start_time: '14:00:00', end_time: '17:00:00', availability_status: 'Available' },
  { availability_id: 18, doctor_id: null, available_date: '2025-09-08', start_time: '09:00:00', end_time: '13:00:00', availability_status: 'Available' },
  { availability_id: 19, doctor_id: null, available_date: '2025-09-08', start_time: '08:00:00', end_time: '16:00:00', availability_status: 'Available' },
  { availability_id: 20, doctor_id: 11, available_date: '2025-09-10', start_time: '10:00:00', end_time: '15:00:00', availability_status: 'Not Available' },
];

export const INITIAL_PAYMENTS: Payment[] = [
  { payment_id: 7, patient_id: 2, appointment_id: 21, amount: 50000.0, payment_method: 'Cash', payment_date: '2025-09-08', insurance_status: 'insured' },
  { payment_id: 8, patient_id: 7, appointment_id: 22, amount: 75000.0, payment_method: 'Mobile Money', payment_date: '2025-09-08', insurance_status: 'Not insured' },
  { payment_id: 9, patient_id: 5, appointment_id: 23, amount: 60000.0, payment_method: 'Cash', payment_date: '2025-09-09', insurance_status: 'Not insured' },
];

export const INITIAL_CONFIRMATIONS: Confirmation[] = [
  { confirmation_id: 1, person_id: 2, appointment_id: 21, payment_id: 7, confirmation_type: 'Appointment Confirmation', status: 'Confirmed', created_at: '2026-09-04 10:46:15' },
  { confirmation_id: 2, person_id: 7, appointment_id: 22, payment_id: 8, confirmation_type: 'Payment Confirmation', status: 'Pending', created_at: '2026-09-04 10:46:15' },
  { confirmation_id: 3, person_id: 5, appointment_id: 23, payment_id: 9, confirmation_type: 'Appointment Confirmation', status: 'Confirmed', created_at: '2026-09-04 10:46:15' },
];
