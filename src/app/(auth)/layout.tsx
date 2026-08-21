import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Left Panel - Industrial Level Static Imagery */}
      <div className="hidden md:flex w-1/2 bg-zinc-950 border-r border-zinc-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Static Industrial Hero Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/auth-industrial.jpg" 
            alt="Enterprise Event Infrastructure" 
            fill 
            className="object-cover object-center opacity-75" 
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/40" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-zinc-950/20 to-zinc-950/80" />
        </div>

        {/* Top Header / Brand */}
        <div className="flex items-center gap-2 relative z-10">
          <div className="h-9 w-9 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-zinc-950 font-bold text-lg leading-none">I</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">Identity</span>
        </div>

        {/* Bottom Editorial Content */}
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-zinc-200 text-xs font-semibold backdrop-blur-md mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white" /> Enterprise Grade Platform
          </div>
          <p className="text-2xl font-bold text-white tracking-tight leading-snug">
            Mission-critical event infrastructure and real-time QR identification.
          </p>
          <p className="text-sm text-zinc-400 mt-2 font-medium">
            Designed for scale, security, and sub-second verification across high-throughput gates.
          </p>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white md:bg-transparent">
        <div className="w-full max-w-sm">
          <div className="flex md:hidden items-center gap-2 mb-12">
            <div className="h-8 w-8 bg-zinc-900 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg leading-none">I</span>
            </div>
            <span className="font-semibold text-lg tracking-tight text-zinc-900">Identity</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
