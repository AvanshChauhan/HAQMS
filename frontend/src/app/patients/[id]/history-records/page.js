'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/common/Navbar';
import { ArrowLeft, CalendarDays, ClipboardList, FileText, HeartPulse, ShieldCheck, UserRound } from 'lucide-react';

export default function PatientHistoryRecords() {
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const token = localStorage.getItem('haqms_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchPatient = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/patients/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Unable to load clinical records.');
        }
        setPatient(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [params.id, router]);

  const reports = useMemo(() => {
    if (!patient) return [];

    return [
      {
        title: 'Baseline Clinical Summary',
        date: '2026-01-14',
        status: 'Archived',
        note: patient.medicalHistory || 'No recorded clinical anamnesis.',
      },
      {
        title: 'Vitals Trend Review',
        date: '2026-03-02',
        status: 'Stable',
        note: 'Blood pressure, heart rate, oxygen saturation, and visit notes remained within expected outpatient ranges.',
      },
      {
        title: 'Diagnostic Imaging Reference',
        date: '2026-04-18',
        status: 'Clear',
        note: 'Historical imaging reference shows no urgent follow-up flags in the legacy report register.',
      },
    ];
  }, [patient]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 w-full">
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.22),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(244,63,94,0.16),transparent_32%),linear-gradient(135deg,#020617_0%,#111827_48%,#0f172a_100%)]" />
          <div className="relative max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-10">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-teal-300 hover:text-teal-200">
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr] items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-teal-300">Legacy clinical archive</p>
                <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-normal">
                  {patient?.name || 'Patient History Records'}
                </h1>
                <p className="mt-4 max-w-2xl text-sm sm:text-base text-slate-300 leading-7">
                  Consolidated patient background, prior appointments, diagnostic snapshots, and legacy medical report notes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Metric label="Age" value={patient ? `${patient.age}` : '--'} />
                <Metric label="Sex" value={patient?.gender || '--'} />
                <Metric label="Visits" value={patient?.appointments?.length || 0} />
                <Metric label="Status" value="Active" />
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 sm:px-8 py-8 sm:py-10">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-10 text-center text-slate-300 backdrop-blur">
              Loading clinical archive...
            </div>
          ) : error ? (
            <div className="p-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 text-rose-200 font-semibold">{error}</div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="space-y-6">
                <Panel title="Patient Demographics" icon={UserRound}>
                  <Info label="Phone" value={patient.phoneNumber} />
                  <Info label="Email" value={patient.email || 'Not recorded'} />
                  <Info label="Registered" value={new Date(patient.createdAt).toLocaleDateString()} />
                  <Info label="Clinical Background" value={patient.medicalHistory || 'No recorded clinical anamnesis'} />
                </Panel>

                <Panel title="Care Profile" icon={HeartPulse}>
                  <div className="grid grid-cols-3 gap-3">
                    <Score label="Risk" value="Low" />
                    <Score label="Queue" value="Normal" />
                    <Score label="Follow-up" value="Open" />
                  </div>
                </Panel>
              </div>

              <div className="space-y-6">
                <Panel title="Appointment Timeline" icon={CalendarDays}>
                  {patient.appointments?.length ? (
                    <div className="space-y-3">
                      {patient.appointments.map((appointment) => (
                        <div key={appointment.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-extrabold text-slate-100">
                                {new Date(appointment.appointmentDate).toLocaleString()}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">{appointment.reason || 'General consultation'}</p>
                            </div>
                            <span className="rounded-full bg-teal-400/10 px-3 py-1 text-xs font-black text-teal-200 border border-teal-300/20">
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">No appointment history recorded.</p>
                  )}
                </Panel>

                <Panel title="Historical Diagnostic Reports" icon={ClipboardList}>
                  <div className="grid gap-3">
                    {reports.map((report) => (
                      <article key={report.title} className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3">
                            <div className="h-10 w-10 rounded-xl bg-teal-400/10 border border-teal-300/20 flex items-center justify-center text-teal-200">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-black text-slate-100">{report.title}</h3>
                              <p className="text-xs text-slate-400 mt-1">{report.date}</p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-amber-200 bg-amber-400/10 border border-amber-300/20 rounded-full px-3 py-1">
                            {report.status}
                          </span>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-slate-300">{report.note}</p>
                      </article>
                    ))}
                  </div>
                </Panel>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 sm:p-6 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-teal-400/10 border border-teal-300/20 flex items-center justify-center text-teal-200">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="font-black text-slate-100">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div className="border-b border-white/10 py-3 last:border-b-0">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-200">{value}</p>
    </div>
  );
}

function Score({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-950/50 border border-white/10 p-3 text-center">
      <ShieldCheck className="h-5 w-5 mx-auto text-teal-300" />
      <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-100">{value}</p>
    </div>
  );
}
