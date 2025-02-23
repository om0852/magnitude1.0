'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import StyledComponentsRegistry from './lib/registry';
import Navbar from './components/Navbar';
import { usePathname } from 'next/navigation';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// export const metadata = {
//   title: "Ride90 - Your Trusted Ride Partner",
//   description: "Modern ride-sharing platform for seamless transportation",
// };


export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  // Check if the current path is in the driver section
  const isDriverRoute = pathname?.startsWith('/driver');

  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <SessionProvider>
          <StyledComponentsRegistry>
            {/* Only show the Navbar if we're not in a driver route */}
            {!isDriverRoute && <Navbar />}
            <main>
              {children}
            </main>
          </StyledComponentsRegistry>
        </SessionProvider>
      </body>
    </html>
  );
}
