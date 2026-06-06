import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Made Products Catalog',
  description: 'Premium Paper Bag Products Catalog & Pricing Management',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Made Products',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#7c3d12',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1c0f05',
              border: '1px solid #e8ddd0',
              borderRadius: '10px',
              boxShadow: '0 4px 20px -4px rgba(0,0,0,0.1)',
              fontFamily: 'DM Sans, sans-serif',
            },
          }}
        />
      </body>
    </html>
  );
}
