import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Volunteer OS | NGO Operational Management System',
  description: 'Operating Platform for Volunteer-Led Education Centers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
