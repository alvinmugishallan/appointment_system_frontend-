import React, { useState } from 'react';
import {
  Database,
  Terminal,
  Table,
  Play,
  RotateCcw,
  Download,
  Copy,
  Check,
  Code2,
  FileCode,
  Shield,
  Layers,
} from 'lucide-react';
import { useDatabase } from '../database/dbStore';

type TableName =
  | 'person'
  | 'patient'
  | 'doctor'
  | 'receptionist'
  | 'appointment'
  | 'availability'
  | 'payment'
  | 'confirmation';

export const DatabaseExplorerView: React.FC = () => {
  const db = useDatabase();

  const [activeTable, setActiveTable] = useState<TableName>('appointment');
  const [activeQueryIndex, setActiveQueryIndex] = useState<number>(0);
  const [queryOutput, setQueryOutput] = useState<any[] | null>(null);
  const [queryTimeMs, setQueryTimeMs] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Table Schemas matching MySQL prompt
  const tableSchemas: Record<TableName, { columns: string; description: string }> = {
    person: {
      columns: 'person_id INT PK AUTO_INCREMENT, first_name VARCHAR(50), last_name VARCHAR(50), email VARCHAR(100) UNIQUE, phone_number VARCHAR(15), created_at TIMESTAMP, role ENUM(DOCTOR, PATIENT, Receptionist)',
      description: 'Base polymorphic identity table for all hospital personnel and patients.',
    },
    patient: {
      columns: 'patient_id INT PK AUTO_INCREMENT, person_id INT UNIQUE FK -> person(person_id), date_of_birth DATE, gender ENUM(Male, Female, Other)',
      description: 'Patient medical index linked 1:1 to base person profile.',
    },
    doctor: {
      columns: 'DOCTOR_ID INT PK AUTO_INCREMENT, person_id INT UNIQUE FK -> person(person_id), speciality VARCHAR(100), license_number VARCHAR(50) UNIQUE, years_experience INT >= 0, created_at TIMESTAMP',
      description: 'Medical doctor credentials, speciality division, and experience record.',
    },
    receptionist: {
      columns: 'person_id INT PK FK -> person(person_id), employee_number VARCHAR(20) UNIQUE',
      description: 'Front-desk administrative booking staff.',
    },
    appointment: {
      columns: 'appointment_id INT PK AUTO_INCREMENT, patient_id INT FK, doctor_id INT FK, receptionist_id INT FK, appointment_date DATE, appointment_time TIME, status ENUM(Pending, Confirmed, Cancelled, Completed)',
      description: 'Core consultation booking schedule with foreign keys to patient, doctor, and receptionist.',
    },
    availability: {
      columns: 'availability_id INT PK AUTO_INCREMENT, doctor_id INT FK, available_date DATE, start_time TIME, end_time TIME, availability_status ENUM(Available, Booked, Not Available), CHECK (end_time > start_time)',
      description: 'Doctor working shift windows with strict chronological check constraints.',
    },
    payment: {
      columns: 'payment_id INT PK AUTO_INCREMENT, patient_id INT FK, appointment_id INT FK, amount DECIMAL(10,2) >= 0, payment_method VARCHAR(30), payment_date DATE, insurance_status ENUM(insured, Not insured)',
      description: 'Financial ledger transactions linked to appointment sessions.',
    },
    confirmation: {
      columns: 'confirmation_id INT PK AUTO_INCREMENT, person_id INT FK, appointment_id INT FK, payment_id INT FK, confirmation_type VARCHAR(50), status ENUM(Pending, Confirmed, Cancelled), created_at TIMESTAMP',
      description: 'Audit trail and verification receipts linking person, appointment, and payment.',
    },
  };

  const tableData: Record<TableName, any[]> = {
    person: db.persons,
    patient: db.patients,
    doctor: db.doctors,
    receptionist: db.receptionists,
    appointment: db.appointments,
    availability: db.availabilities,
    payment: db.payments,
    confirmation: db.confirmations,
  };

  // Queries from prompt
  const predefinedQueries = [
    {
      title: '1. Master Appointment View (Wide Join)',
      sql: `SELECT 
    a.appointment_id,
    a.appointment_date,
    a.appointment_time,
    a.status AS appointment_status,
    p_pat.first_name AS patient_first_name,
    p_pat.last_name AS patient_last_name,
    pat.gender,
    p_doc.first_name AS doctor_first_name,
    p_doc.last_name AS doctor_last_name,
    doc.speciality,
    p_rec.first_name AS receptionist_first_name
FROM appointment a
LEFT JOIN patient pat ON a.patient_id = pat.person_id
LEFT JOIN person p_pat ON pat.person_id = p_pat.person_id
LEFT JOIN doctor doc ON a.doctor_id = doc.person_id
LEFT JOIN person p_doc ON doc.person_id = p_doc.person_id
LEFT JOIN receptionist rec ON a.receptionist_id = rec.person_id
LEFT JOIN person p_rec ON rec.person_id = p_rec.person_id;`,
      executor: () => db.masterAppointments,
    },
    {
      title: '2. Payment Ledger & Patient Contact View',
      sql: `SELECT 
    pay.payment_id,
    pay.amount,
    pay.payment_method,
    pay.payment_date,
    pay.insurance_status,
    a.appointment_date,
    a.status AS appointment_status,
    p.first_name AS patient_first_name,
    p.last_name AS patient_last_name,
    p.email
FROM payment pay
JOIN appointment a ON pay.appointment_id = a.appointment_id
JOIN patient pat ON pay.patient_id = pat.person_id
JOIN person p ON pat.person_id = p.person_id;`,
      executor: () => db.paymentLedger,
    },
    {
      title: '3. Complete Audit Trail View (7-Table Pipeline Join)',
      sql: `SELECT 
    c.confirmation_id,
    c.confirmation_type,
    c.status AS confirmation_status,
    a.appointment_id,
    a.appointment_date,
    a.appointment_time,
    p_pat.first_name AS patient_first_name,
    p_doc.first_name AS doctor_first_name,
    doc.speciality,
    pay.amount,
    pay.insurance_status
FROM confirmation c
JOIN appointment a ON c.appointment_id = a.appointment_id
JOIN payment pay ON c.payment_id = pay.payment_id
LEFT JOIN patient pat ON a.patient_id = pat.person_id
LEFT JOIN person p_pat ON pat.person_id = p_pat.person_id
LEFT JOIN doctor doc ON a.doctor_id = doc.person_id
LEFT JOIN person p_doc ON doc.person_id = p_doc.person_id;`,
      executor: () => db.auditTrail,
    },
    {
      title: "4. CALL sp_get_doctor_financial_report('2025-09-01', '2025-09-30')",
      sql: `CALL sp_get_doctor_financial_report('2025-09-01', '2025-09-30');`,
      executor: () => db.getDoctorFinancialReport('2025-09-01', '2025-09-30'),
    },
    {
      title: "5. CALL sp_get_doctor_daily_schedule(1, '2025-09-08')",
      sql: `CALL sp_get_doctor_daily_schedule(1, '2025-09-08');`,
      executor: () => db.getDoctorDailySchedule(1, '2025-09-08'),
    },
    {
      title: '6. SHOW TRIGGERS IN Project',
      sql: `-- Active Data Integrity Triggers:
-- 1. trg_prevent_double_booking (BEFORE INSERT ON appointment)
--    Enforces that a doctor cannot be booked for overlapping date & time unless Cancelled.
-- 2. trg_prevent_cancelled_payment (BEFORE INSERT ON payment)
--    Enforces that payments cannot be posted for Cancelled appointments.`,
      executor: () => [
        {
          Trigger: 'trg_prevent_double_booking',
          Event: 'INSERT',
          Table: 'appointment',
          Timing: 'BEFORE',
          Statement: 'SIGNAL SQLSTATE 45000: Doctor is already booked for this specific time slot.',
          Status: 'ACTIVE & ENFORCED IN UI',
        },
        {
          Trigger: 'trg_prevent_cancelled_payment',
          Event: 'INSERT',
          Table: 'payment',
          Timing: 'BEFORE',
          Statement: 'SIGNAL SQLSTATE 45000: Cannot record payment for a cancelled appointment.',
          Status: 'ACTIVE & ENFORCED IN UI',
        },
      ],
    },
  ];

  const handleRunQuery = (index: number) => {
    setActiveQueryIndex(index);
    const start = performance.now();
    const result = predefinedQueries[index].executor();
    const duration = Math.round((performance.now() - start) * 100) / 100;
    setQueryOutput(result);
    setQueryTimeMs(duration);
  };

  const handleCopySQL = () => {
    const sql = db.exportDatabaseSQL();
    navigator.clipboard.writeText(sql);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadSQL = () => {
    const sql = db.exportDatabaseSQL();
    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrocare_project_database_${new Date().toISOString().slice(0, 10)}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentRows = tableData[activeTable] || [];
  const currentColumns = currentRows.length > 0 ? Object.keys(currentRows[0]) : [];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            MySQL Relational Schema & Query Explorer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Database: <code className="font-mono text-emerald-700">Project</code> (InnoDB, utf8mb4_0900_ai_ci)
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleCopySQL}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied Dump' : 'Copy SQL'}</span>
          </button>
          <button
            onClick={handleDownloadSQL}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .sql</span>
          </button>
        </div>
      </div>

      {/* 8 Tables Tab Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2 px-1">
          Explore Database Tables (8 Tables in Project DB)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {(Object.keys(tableSchemas) as TableName[]).map((tbl) => {
            const isActive = activeTable === tbl;
            const count = tableData[tbl]?.length || 0;
            return (
              <button
                key={tbl}
                onClick={() => setActiveTable(tbl)}
                className={`p-2.5 rounded-lg text-left transition-colors border ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium truncate">{tbl}</span>
                  <span className="text-[10px] font-mono tabular-nums px-1.5 py-0.2 bg-white rounded border border-slate-200 text-slate-600">
                    {count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Table Schema Information */}
        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono font-bold text-slate-900">
              TABLE: {activeTable}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              ENGINE=InnoDB CHARSET=utf8mb4
            </span>
          </div>
          <p className="text-slate-600 text-[11px] mb-1.5">{tableSchemas[activeTable].description}</p>
          <div className="font-mono text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-200/80 overflow-x-auto">
            {tableSchemas[activeTable].columns}
          </div>
        </div>
      </div>

      {/* Table Records Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Live Rows in <code className="font-mono">{activeTable}</code>
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {currentRows.length} record(s)
          </span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-xs text-slate-700 font-mono font-semibold border-b border-slate-200">
              <tr>
                {currentColumns.map((col) => (
                  <th key={col} className="py-2.5 px-3.5 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {currentRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  {currentColumns.map((col) => (
                    <td key={col} className="py-2.5 px-3.5 whitespace-nowrap text-slate-800">
                      {row[col] === null ? (
                        <span className="text-slate-400 italic">NULL</span>
                      ) : typeof row[col] === 'number' ? (
                        <span className="tabular-nums font-semibold text-slate-900">{row[col]}</span>
                      ) : (
                        String(row[col])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive SQL Sandbox & Stored Procedure Runner */}
      <div className="bg-slate-950 text-slate-200 rounded-xl border border-slate-800 shadow-md p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Clinical Query Sandbox & Stored Procedure Verification
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Executed client-side in reactive MySQL emulation
          </span>
        </div>

        {/* Query Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {predefinedQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleRunQuery(idx)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 ${
                activeQueryIndex === idx
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Play className="w-3 h-3 text-emerald-400" />
              <span>{q.title}</span>
            </button>
          ))}
        </div>

        {/* SQL Code View */}
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
          {predefinedQueries[activeQueryIndex].sql}
        </div>

        {/* Query Output Display */}
        {queryOutput && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400">
                Query Result ({queryOutput.length} rows returned in {queryTimeMs || 0}ms)
              </span>
            </div>

            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead className="bg-slate-800/80 text-slate-300 sticky top-0 border-b border-slate-700">
                  <tr>
                    {queryOutput.length > 0 &&
                      Object.keys(queryOutput[0]).map((key) => (
                        <th key={key} className="py-2 px-3 whitespace-nowrap">
                          {key}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-[11px]">
                  {queryOutput.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/40">
                      {Object.keys(queryOutput[0]).map((col) => (
                        <td key={col} className="py-2 px-3 whitespace-nowrap text-slate-200">
                          {row[col] === null ? (
                            <span className="text-slate-500 italic">NULL</span>
                          ) : (
                            String(row[col])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
