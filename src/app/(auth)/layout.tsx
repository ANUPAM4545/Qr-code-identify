import { AuthBackground } from "./components/AuthBackground";
import { AnimatedQR } from "./components/AnimatedQR";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Left Panel - Branding (Dark Mode) */}
      <div className="hidden md:flex w-1/2 bg-zinc-950 border-r border-zinc-800 p-12 flex-col justify-between relative overflow-hidden">
        
        <AuthBackground />

        <div className="flex items-center gap-2 relative z-10">
          <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <span className="text-zinc-950 font-bold text-lg leading-none">I</span>
          </div>
          <span className="font-semibold text-lg tracking-tight text-white">Identify</span>
        </div>

        <AnimatedQR />
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white md:bg-transparent">
        <div className="w-full max-w-sm">
          <div className="flex md:hidden items-center gap-2 mb-12">
            <div className="h-8 w-8 bg-zinc-900 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg leading-none">I</span>
            </div>
            <span className="font-semibold text-lg tracking-tight text-zinc-900">Identify</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
