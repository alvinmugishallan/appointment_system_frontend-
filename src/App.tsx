import React, { useState } from 'react';
import { DatabaseProvider } from './database/dbStore';
import { Navigation, ActiveTab } from './components/Navigation';
import { AppointmentsView } from './components/AppointmentsView';
import { ScheduleView } from './components/ScheduleView';
import { PatientsView } from './components/PatientsView';
import { BillingView } from './components/BillingView';
import { ReportsView } from './components/ReportsView';
import { DatabaseExplorerView } from './components/DatabaseExplorerView';
import { BookAppointmentModal } from './components/BookAppointmentModal';
import { RegisterPatientModal } from './components/RegisterPatientModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { MasterAppointmentView } from './types/database';

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('appointments');

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookDoctorId, setBookDoctorId] = useState<number | null>(null);
  const [bookDate, setBookDate] = useState<string | undefined>(undefined);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAppointmentId, setPaymentAppointmentId] = useState<number | undefined>(undefined);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptAppointment, setReceiptAppointment] = useState<MasterAppointmentView | null>(null);

  // Trigger Book Appointment from generic CTA
  const handleOpenBookModal = () => {
    setBookDoctorId(null);
    setBookDate(undefined);
    setIsBookModalOpen(true);
  };

  // Trigger Book Appointment for specific doctor & date (from Schedule view)
  const handleBookWithDoctor = (doctorId: number, date: string) => {
    setBookDoctorId(doctorId);
    setBookDate(date);
    setIsBookModalOpen(true);
  };

  // Trigger Book Appointment for specific patient (from Patients view)
  const handleBookForPatient = (patientPersonId: number) => {
    setBookDoctorId(null);
    setBookDate(undefined);
    setIsBookModalOpen(true);
  };

  // Trigger Record Payment for appointment
  const handleOpenPaymentModal = (appointmentId: number) => {
    setPaymentAppointmentId(appointmentId);
    setIsPaymentModalOpen(true);
  };

  // Trigger View Receipt
  const handleViewReceipt = (appointment: MasterAppointmentView) => {
    setReceiptAppointment(appointment);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* 3-Zone Top Navigation Contract */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBookModal={handleOpenBookModal}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'appointments' && (
          <AppointmentsView
            onOpenBookModal={handleOpenBookModal}
            onOpenPaymentModal={handleOpenPaymentModal}
            onViewReceipt={handleViewReceipt}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleView onBookWithDoctor={handleBookWithDoctor} />
        )}

        {activeTab === 'patients' && (
          <PatientsView
            onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
            onBookForPatient={handleBookForPatient}
          />
        )}

        {activeTab === 'billing' && (
          <BillingView onOpenRecordPayment={() => setIsPaymentModalOpen(true)} />
        )}

        {activeTab === 'reports' && <ReportsView />}

        {activeTab === 'database' && <DatabaseExplorerView />}
      </main>

      {/* Quiet Informational Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">MetroCare Health System</span>
            <span>·</span>
            <span>MySQL 8.0 InnoDB Database Architecture</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Triggers: <code className="font-mono text-slate-700">trg_prevent_double_booking</code> · <code className="font-mono text-slate-700">trg_prevent_cancelled_payment</code></span>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        initialDoctorId={bookDoctorId}
        initialDate={bookDate}
      />

      <RegisterPatientModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />

      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        initialAppointmentId={paymentAppointmentId}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        appointment={receiptAppointment}
      />
    </div>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <MainAppContent />
    </DatabaseProvider>
  );
}
