import Link from "next/link";

export function SiteFooter() {
  const footerLinks = {
    Product: [
      { name: "Features", href: "#" },
      { name: "QR Studio", href: "#" },
      { name: "Scanner App", href: "#" },
      { name: "Analytics", href: "#" },
      { name: "Pricing", href: "#" },
    ],
    Resources: [
      { name: "Documentation", href: "#" },
      { name: "Help Center", href: "#" },
      { name: "Event Guides", href: "#" },
      { name: "API Reference", href: "#" },
      { name: "Community", href: "#" },
    ],
    Company: [
      { name: "About Us", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Contact", href: "#" },
      { name: "Partners", href: "#" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Security", href: "#" },
      { name: "Cookie Policy", href: "#" },
    ]
  };

  return (
    <footer className="border-t border-border/50 bg-background pt-20 pb-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-12 mb-16">
          <div className="col-span-2 md:col-span-2 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-foreground rounded-lg flex items-center justify-center">
                <span className="text-background font-bold text-lg leading-none">I</span>
              </div>
              <span className="font-semibold text-lg tracking-tight">Identify</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              The premium enterprise platform for event management, intelligent QR codes, secure check-ins, and analytics.
            </p>
            <div className="flex gap-4 mt-2">
              {/* Social icons placeholder */}
              <div className="w-5 h-5 bg-muted-foreground/30 hover:bg-foreground transition-colors rounded" />
              <div className="w-5 h-5 bg-muted-foreground/30 hover:bg-foreground transition-colors rounded" />
              <div className="w-5 h-5 bg-muted-foreground/30 hover:bg-foreground transition-colors rounded" />
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="flex flex-col gap-4">
              <h4 className="font-semibold text-sm">{category}</h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Identify Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
