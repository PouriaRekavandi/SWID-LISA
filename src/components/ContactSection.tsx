import React, { useState } from 'react';
import { Mail, MapPin, Globe, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ContactSectionProps {
  onNotify: (msg: string, isError?: boolean) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onNotify }) => {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderEmail || !message) {
      onNotify('Please complete all required fields.', true);
      return;
    }

    setSent(true);
    onNotify('Inquiry transmitted successfully. We will reply promptly.');
    setTimeout(() => {
      setSenderName('');
      setSenderEmail('');
      setSubject('');
      setMessage('');
      setSent(false);
    }, 4000);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-block border-b-2 dark:border-[#00b8ff] border-sky-600 pb-1 mb-4">
          <h2 className="font-section-title text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wider dark:text-white text-slate-900 flex items-center">
            <span className="dark:text-[#00ff41] text-emerald-600 font-mono mr-2 select-none">//</span>
            <span>Connect &amp; Collaborate</span>
          </h2>
        </div>
        <p className="dark:text-zinc-400 text-slate-600 font-mono text-sm max-w-3xl leading-relaxed">
          Open for collaborative research proposals, graduate student supervision, and industry partnerships in mechanical/aerospace engineering.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lab Info */}
        <div className="lg:col-span-5 dark:bg-[#141414]/80 bg-white border dark:border-[#333333] border-slate-200 rounded-xl p-6 space-y-6 shadow-md">
          <h3 className="font-orbitron font-bold text-base sm:text-lg dark:text-white text-slate-900 pb-3 border-b-2 dark:border-[#00b8ff] border-sky-600">
            Research Lab Coordinates
          </h3>

          <div className="space-y-4 text-xs sm:text-sm font-mono dark:text-zinc-300 text-slate-700">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 dark:text-[#00ff41] text-emerald-600 flex-none mt-0.5" />
              <div>
                <strong className="dark:text-white text-slate-900 block font-bold">SWID-SHRK Laboratory</strong>
                <span>Department of Mechanical Engineering</span><br />
                <span>University of Maryland, Baltimore County (UMBC)</span><br />
                <span>1000 Hilltop Circle, Baltimore, MD 21250, USA</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 dark:text-[#00b8ff] text-sky-600 flex-none mt-0.5" />
              <div>
                <strong className="dark:text-white text-slate-900 block font-bold">Principal Investigator Email</strong>
                <a
                  href="mailto:s.s.hejazirekavandi@gmail.com"
                  className="dark:text-[#00b8ff] text-sky-700 hover:underline transition-colors"
                >
                  s.s.hejazirekavandi@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 dark:text-[#00e676] text-emerald-600 flex-none mt-0.5" />
              <div>
                <strong className="dark:text-white text-slate-900 block font-bold">Lab Portal &amp; Repository</strong>
                <a
                  href="https://swid-shrk.umbc.edu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dark:text-[#00b8ff] text-sky-700 hover:underline"
                >
                  https://swid-shrk.umbc.edu/
                </a>
              </div>
            </div>
          </div>

          <div className="p-4 dark:bg-[#0a0f14] bg-slate-50 border dark:border-[#00b8ff]/30 border-slate-200 rounded-lg text-xs font-mono dark:text-zinc-300 text-slate-700 space-y-2">
            <div className="flex items-center gap-2 dark:text-[#00ff41] text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4" /> Graduate Supervision Inquiries
            </div>
            <p className="dark:text-zinc-400 text-slate-600 leading-relaxed text-[11px]">
              Prospective PhD, Master's, and visiting scholars with backgrounds in finite element methods, fracture mechanics, or computational metamaterials are invited to send their CV and research statement.
            </p>
          </div>
        </div>

        {/* Transmission Form */}
        <div className="lg:col-span-7 dark:bg-[#141414]/80 bg-white border dark:border-[#333333] border-slate-200 rounded-xl p-6 shadow-md">
          <h3 className="font-orbitron font-bold text-base sm:text-lg dark:text-white text-slate-900 pb-3 border-b-2 dark:border-[#00b8ff] border-sky-600 mb-5">
            Transmit Secure Message
          </h3>

          {sent ? (
            <div className="p-8 text-center dark:bg-black/40 bg-emerald-50/50 border dark:border-[#00ff41]/50 border-emerald-300 rounded-lg space-y-3">
              <CheckCircle2 className="w-12 h-12 dark:text-[#00ff41] text-emerald-600 mx-auto animate-bounce" />
              <h4 className="font-orbitron font-bold dark:text-white text-slate-900 text-base">Inquiry Transmitted</h4>
              <p className="font-mono text-xs dark:text-zinc-300 text-slate-600">
                Your communication has been encrypted and dispatched to Dr. Pouria Hejazi Rekavandi.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block dark:text-zinc-300 text-slate-700 font-bold mb-1.5 text-xs">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Dr. John Doe"
                    className="w-full px-3 py-2 dark:bg-[#090909] bg-slate-50 border dark:border-[#3b3b3b] border-slate-300 focus:border-sky-600 dark:focus:border-[#00b8ff] rounded dark:text-white text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block dark:text-zinc-300 text-slate-700 font-bold mb-1.5 text-xs">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="you@institution.edu"
                    className="w-full px-3 py-2 dark:bg-[#090909] bg-slate-50 border dark:border-[#3b3b3b] border-slate-300 focus:border-sky-600 dark:focus:border-[#00b8ff] rounded dark:text-white text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block dark:text-zinc-300 text-slate-700 font-bold mb-1.5 text-xs">
                  Subject / Topic
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Collaboration on Metamaterial Shock Absorbers"
                  className="w-full px-3 py-2 dark:bg-[#090909] bg-slate-50 border dark:border-[#3b3b3b] border-slate-300 focus:border-sky-600 dark:focus:border-[#00b8ff] rounded dark:text-white text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block dark:text-zinc-300 text-slate-700 font-bold mb-1.5 text-xs">
                  Message / Research Brief *
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detail your inquiry, project scope, or supervisory request..."
                  className="w-full px-3 py-2 dark:bg-[#090909] bg-slate-50 border dark:border-[#3b3b3b] border-slate-300 focus:border-sky-600 dark:focus:border-[#00b8ff] rounded dark:text-white text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 dark:bg-[#00ff41] dark:hover:bg-[#00ff41]/90 dark:text-[#050505] bg-emerald-600 hover:bg-emerald-700 text-white font-orbitron font-bold text-xs uppercase tracking-wider rounded transition-all duration-200 dark:hover:shadow-[0_0_15px_rgba(0,255,65,0.6)] shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Transmit Dispatch
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
