export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-background border-r border-border/50 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-muted/50 via-background to-background -z-10" />
        
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-foreground rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-lg leading-none">I</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">Identify</span>
        </div>

        <div className="mb-24 max-w-md">
          <h1 className="text-4xl font-bold tracking-tight mb-4">The enterprise event operating system.</h1>
          <p className="text-muted-foreground text-lg">
            Manage massive scale events, configure intelligent QR tickets, and analyze check-ins in real-time.
          </p>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background lg:bg-transparent">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center gap-2 mb-12">
            <div className="h-8 w-8 bg-foreground rounded-lg flex items-center justify-center">
              <span className="text-background font-bold text-lg leading-none">I</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">Identify</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
