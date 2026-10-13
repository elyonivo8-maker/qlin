'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'patient' | 'clinic'>('patient');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; title: string; detail?: string } | null>(null);
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);

  // Form states
  const [patientForm, setPatientForm] = useState({
    full_name: '',
    contact_info: '',
    city: '',
    preferred_clinic: '',
  });

  const [clinicForm, setClinicForm] = useState({
    clinic_name: '',
    contact_name: '',
    contact_role: '',
    email: '',
    phone: '',
    daily_patient_volume: '<50',
  });

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    setWaitlistPosition(null);

    try {
      // 1. Submit patient entry to Supabase
      const { data, error: insertError } = await supabase
        .from('patient_waitlist')
        .insert([patientForm])
        .select();

      if (insertError) {
        setLoading(false);
        // Check for Postgres Unique Constraint Error (Duplicate Email)
        if (insertError.code === '23505') {
          setStatusMessage({
            type: 'error',
            title: 'Already Registered',
            detail: 'You are already on the waitlist! Keep an eye on your inbox for updates.',
          });
        } else {
          setStatusMessage({
            type: 'error',
            title: 'Database Insert Failed',
            detail: `${insertError.message} (Code: ${insertError.code || 'UNKNOWN'})`,
          });
        }
        return;
      }

      // 2. Query exact total waitlist count to calculate standing position
      const { count, error: countError } = await supabase
        .from('patient_waitlist')
        .select('*', { count: 'exact', head: true });

      setLoading(false);

      if (countError) {
        setStatusMessage({
          type: 'success',
          title: "You're on the waitlist!",
          detail: "We couldn't retrieve your exact position number, but your spot is saved.",
        });
      } else {
        setWaitlistPosition(count);
        setStatusMessage({
          type: 'success',
          title: 'Spot Successfully Claimed!',
          detail: 'You will receive real-time queue notifications as participating clinics launch near you.',
        });
      }

      setPatientForm({ full_name: '', contact_info: '', city: '', preferred_clinic: '' });
    } catch (err: any) {
      setLoading(false);
      setStatusMessage({
        type: 'error',
        title: 'Network Error',
        detail: err.message || 'Unable to connect to Supabase backend.',
      });
    }
  };

  const handleClinicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const { error: insertError } = await supabase
        .from('clinic_waitlist')
        .insert([clinicForm])
        .select();

      setLoading(false);

      if (insertError) {
        // Check for Postgres Unique Constraint Error (Duplicate Email)
        if (insertError.code === '23505') {
          setStatusMessage({
            type: 'error',
            title: 'Application Already Exists',
            detail: 'This clinic email is already registered. Our team will be in touch soon!',
          });
        } else {
          setStatusMessage({
            type: 'error',
            title: 'Submission Rejected',
            detail: `${insertError.message} (Code: ${insertError.code || 'UNKNOWN'})`,
          });
        }
      } else {
        setStatusMessage({
          type: 'success',
          title: 'Pilot Application Received!',
          detail: 'Our platform implementation team will reach out to arrange a workflow demo.',
        });
        setClinicForm({
          clinic_name: '',
          contact_name: '',
          contact_role: '',
          email: '',
          phone: '',
          daily_patient_volume: '<50',
        });
      }
    } catch (err: any) {
      setLoading(false);
      setStatusMessage({
        type: 'error',
        title: 'Connection Error',
        detail: err.message || 'Failed to communicate with database server.',
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Royalty-Free Background Image with Gradient Mask */}
      <div 
        className="fixed inset-0 pointer-events-none bg-cover bg-center opacity-20 filter blur-[1px]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=2000&q=80')`
        }}
      />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-slate-950/80 via-slate-950/95 to-slate-950" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/20">
              Q
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">Qlin</span>
          </div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            B2B Outpatient Access Platform
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Platform Pitch & Features */}
          <div className="lg:col-span-7 space-y-8 text-left pt-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider">
              Virtual Queueing • Physical Fairness
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Know the wait. <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
                Manage the flow.
              </span>
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
              Qlin eliminates crowded reception rooms and unpredictable waiting times. Patients register remotely, track live positions from anywhere, and activate their physical position upon arrival.
            </p>

            {/* YouTube Call To Action Button */}
            <div className="pt-2">
              <a
                href="https://www.youtube.com/watch?v=pGjz4I_77oM"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-md"
              >
                <svg
                  className="w-5 h-5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Watch Demo Video
              </a>
            </div>

            {/* Core Pillars */}
            <div className="grid sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
                <div className="text-blue-400 font-bold text-base mb-1">1. Remote Hold</div>
                <div className="text-xs text-slate-400 leading-normal">Claim an estimated slot online before traveling to the clinic.</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
                <div className="text-indigo-400 font-bold text-base mb-1">2. Arrival Check-In</div>
                <div className="text-xs text-slate-400 leading-normal">Scan reception QR code on-site to convert hold into active turn.</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
                <div className="text-sky-400 font-bold text-base mb-1">3. Universal Access</div>
                <div className="text-xs text-slate-400 leading-normal">Full reception desk support for walk-ins & elderly visitors.</div>
              </div>
            </div>

            {/* Detailed Feature List */}
            <div className="pt-6 border-t border-slate-800/80 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Why Clinics & Patients Trust Qlin</h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✓</span> Extended app experience  for patients
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✓</span> Zero complex EHR/EMR integration required
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✓</span> Real-time public TV screen dashboard
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 font-bold">✓</span> Automated SMS queue arrival alerts
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Waitlist Form Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
              
              {/* Tab Selector */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl mb-6 border border-slate-800">
                <button
                  onClick={() => { setActiveTab('patient'); setStatusMessage(null); setWaitlistPosition(null); }}
                  className={`py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === 'patient' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Patients
                </button>
                <button
                  onClick={() => { setActiveTab('clinic'); setStatusMessage(null); setWaitlistPosition(null); }}
                  className={`py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === 'clinic' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Clinics / Providers
                </button>
              </div>

              {/* Status Alert Banner */}
              {statusMessage && (
                <div className={`p-4 mb-6 rounded-xl border text-left ${
                  statusMessage.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                }`}>
                  <p className="font-bold text-sm mb-1">{statusMessage.title}</p>
                  {statusMessage.detail && <p className="text-xs text-slate-300">{statusMessage.detail}</p>}
                  
                  {/* Dynamic Position Card */}
                  {waitlistPosition !== null && (
                    <div className="mt-3 pt-3 border-t border-emerald-500/20 flex items-center justify-between">
                      <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Your Queue Standing</span>
                      <span className="text-xl font-black text-white bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-500/40">
                        #{waitlistPosition}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Patient Waitlist Form */}
              {activeTab === 'patient' ? (
                <form onSubmit={handlePatientSubmit} className="space-y-4 text-left">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Get Priority Patient Access</h2>
                    <p className="text-xs text-slate-400">Be notified when Qlin is enabled in your local outpatient center.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={patientForm.full_name}
                      onChange={(e) => setPatientForm({ ...patientForm, full_name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition text-sm"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Email *</label>
                    <input
                      type="email"
                      required
                      value={patientForm.contact_info}
                      onChange={(e) => setPatientForm({ ...patientForm, contact_info: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition text-sm"
                      placeholder="jane@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">City *</label>
                      <input
                        type="text"
                        required
                        value={patientForm.city}
                        onChange={(e) => setPatientForm({ ...patientForm, city: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition text-sm"
                        placeholder="e.g. Metro Area"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Preferred Clinic</label>
                      <input
                        type="text"
                        value={patientForm.preferred_clinic}
                        onChange={(e) => setPatientForm({ ...patientForm, preferred_clinic: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition text-sm"
                        placeholder="Central Outpatient"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 text-sm"
                  >
                    {loading ? 'Registering Entry...' : 'Join Waitlist & View Standing'}
                  </button>
                </form>
              ) : (
                /* Clinic Registration Form */
                <form onSubmit={handleClinicSubmit} className="space-y-4 text-left">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Request Pilot Access for Clinic</h2>
                    <p className="text-xs text-slate-400">Test Qlin's queue management system at zero hardware cost.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Clinic Name *</label>
                    <input
                      type="text"
                      required
                      value={clinicForm.clinic_name}
                      onChange={(e) => setClinicForm({ ...clinicForm, clinic_name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition text-sm"
                      placeholder="St. Jude Health Center"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Contact Name *</label>
                      <input
                        type="text"
                        required
                        value={clinicForm.contact_name}
                        onChange={(e) => setClinicForm({ ...clinicForm, contact_name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition text-sm"
                        placeholder="Dr. Alex Rivera"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Your Role *</label>
                      <input
                        type="text"
                        required
                        value={clinicForm.contact_role}
                        onChange={(e) => setClinicForm({ ...clinicForm, contact_role: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition text-sm"
                        placeholder="Clinic Manager"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Work Email *</label>
                      <input
                        type="email"
                        required
                        value={clinicForm.email}
                        onChange={(e) => setClinicForm({ ...clinicForm, email: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition text-sm"
                        placeholder="alex@clinic.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={clinicForm.phone}
                        onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition text-sm"
                        placeholder="+1 555-0149"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Est. Daily Patients *</label>
                    <select
                      value={clinicForm.daily_patient_volume}
                      onChange={(e) => setClinicForm({ ...clinicForm, daily_patient_volume: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition text-sm"
                    >
                      <option value="<50">Under 50 patients / day</option>
                      <option value="50-100">50 – 100 patients / day</option>
                      <option value="100-250">100 – 250 patients / day</option>
                      <option value="250+">250+ patients / day</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50 text-sm"
                  >
                    {loading ? 'Submitting Application...' : 'Request Beta Pilot Demo'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Embedded YouTube Section Below the Main Grid */}
        <div className="mt-24 pt-12 border-t border-slate-800/80 w-full max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            See How Qlin Works
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Watch a quick walkthrough of our queue management system.
          </p>

          <div className="w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl aspect-video bg-black/40">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/pGjz4I_77oM"
              title="Qlin Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

      </main>
    </div>
  );
}