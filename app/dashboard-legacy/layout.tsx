import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import SideNav from '../ui/dashboard/sidenav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MeReNGO Study',
  description: 'MeReNGO Study Web App',
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        ></link>
      </head>
      <body className={`${inter.className} flex h-screen`}>
        <SideNav></SideNav>
        <main className="flex-1 p-4">{children}</main>
      </body>
    </html>
  );
}
