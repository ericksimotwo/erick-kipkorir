import { LogIn, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: () => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 border-8 border-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <div className="inline-block p-4 border border-[#1A1A1A] mb-8 rotate-1">
             <GraduationCap size={48} className="text-[#1A1A1A]" />
          </div>
          <h1 className="text-5xl font-serif italic font-bold tracking-tighter uppercase mb-2">LRMS</h1>
          <p className="text-[10px] uppercase tracking-[.3em] font-bold opacity-40">Learning Recovery Management System</p>
        </div>

        <div className="bg-white border border-[#1A1A1A] p-10 shadow-[8px_8px_0px_0px_#1A1A1A]">
          <div className="space-y-8">
            <header className="border-b border-[#1A1A1A] pb-4 mb-8">
                <h2 className="text-xl font-serif italic mb-1">Institutional Entry</h2>
                <p className="text-[10px] uppercase font-bold opacity-40 tracking-widest italic">Identity Authentication</p>
            </header>
            
            <p className="text-sm italic text-gray-600 leading-relaxed text-center mb-8">
              Proceed to authenticate your credentials via the authorized institutional single sign-on protocol.
            </p>

            <button
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg"
            >
              <LogIn size={18} />
              Authenticate
            </button>

            <div className="pt-8 text-center border-t border-gray-100 mt-8">
                <span className="text-[9px] uppercase tracking-widest italic opacity-30">Secure Environment • SSL Protocol Active</span>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
            <p className="text-[9px] uppercase tracking-widest opacity-40 italic">Academic Oversight Unit © 2026</p>
        </div>
      </div>
    </div>
  );
};
