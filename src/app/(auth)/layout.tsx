import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Left Panel - Branding */}
      <div className="hidden md:flex w-1/2 bg-white border-r border-zinc-200 p-12 flex-col justify-between relative overflow-hidden">
        
        {/* Abstract Background Image */}
        <div className="absolute inset-0 flex items-center justify-center opacity-80 pointer-events-none translate-x-12 translate-y-12 mix-blend-multiply">
          <Image 
            src="/auth-bg.png" 
            alt="Abstract glassmorphism geometric shape" 
            width={800} 
            height={800} 
            className="w-[120%] h-auto max-w-none object-contain"
            priority
          />
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <div className="h-8 w-8 bg-zinc-900 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg leading-none">I</span>
          </div>
          <span className="font-semibold text-lg tracking-tight text-zinc-900">Identify</span>
        </div>

        <div className="mb-24 max-w-md relative z-10 bg-white/40 backdrop-blur-xl p-8 rounded-3xl border border-white/50 shadow-xl">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-zinc-900">The enterprise event operating system.</h1>
          <p className="text-zinc-600 text-lg">
            Manage massive scale events, configure intelligent QR tickets, and analyze check-ins in real-time.
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
            <span className="font-semibold text-lg tracking-tight text-zinc-900">Identify</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
