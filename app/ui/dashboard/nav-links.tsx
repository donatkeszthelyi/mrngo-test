'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavLinks() {
  // Use the Next.js hook to get query parameters from the URL.
  const searchParams = useSearchParams();
  // Extract the 'username' parameter from the URL, default to an empty string if not present.
  const username = searchParams.get('username') || '';
  const links = [
    {
      name: 'Welcome Page',
      href: `/`,
    },
    {
      name: 'Concept Entry',
      href: `/dashboard/concept-entry-audio?username=${encodeURIComponent(
        username
      )}`,
    },
    {
      name: 'History',
      href: `/dashboard/history?username=${encodeURIComponent(username)}`,
    },
  ];

  const pathname = usePathname();
  return (
    <>
      {links.map((link) => (
        <Link key={link.name} href={link.href}>
          <p className="hidden md:flex text-xl w-full sm:w-auto text-center h-20 items-center justify-center rounded-full bg-cyan-600 border border-cyan-600 font-bold font-heading text-black hover:bg-cyan-400 focus:ring focus:ring-cyan-400 transition duration-200">
            {link.name}
          </p>
        </Link>
      ))}
    </>
  );
}
