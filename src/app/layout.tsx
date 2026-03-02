import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fusion Energy Intelligence Platform',
  description: 'Autonomous energy management for the Fusion Students portfolio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
