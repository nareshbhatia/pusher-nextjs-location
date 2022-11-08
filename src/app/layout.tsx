import * as React from 'react';
import LocationProvider from '../components/LocationProvider';
import PusherProvider from '../components/PusherProvider';
import './globals.css';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html className="h-full bg-gray-50 antialiased" lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="description" content="Pusher Location" />
        <title>Pusher Location</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="h-full">
        <PusherProvider
          pusherKey={process.env.PUSHER_KEY as string}
          cluster={process.env.PUSHER_CLUSTER as string}
        >
          <LocationProvider>{children}</LocationProvider>
        </PusherProvider>
      </body>
    </html>
  );
}
