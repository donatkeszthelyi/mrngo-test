import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';

export default function SideNav() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-2/3 bg-cyan-600 w-40 flex flex-col items-center justify-center px-3 py-4 md:px-2 rounded-3xl opacity-75">
        <div className="p-2 flex flex-col space-y-10">
          <NavLinks />
        </div>
      </div>
    </div>
  );
}
