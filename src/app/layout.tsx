import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BT Journal',
  description: 'BT Journal – your daily self-care and reflection space',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Belleza&family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-[#FCFAFA] text-[#2C2C2C]">{children}</body>
    </html>
  );
}
