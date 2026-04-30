import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Asteria Social",
  description: "Classy social platform built for CMPS 350 Phase 2",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
