import "./globals.css";

export const metadata = {
  title: "Asteria Social",
  description: "Classy social platform built for CMPS 350 Phase 2",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
