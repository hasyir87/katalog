import { SprayCan } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <SprayCan className="h-6 w-6 text-primary hidden md:block" />
          <p className="text-center text-sm leading-loose md:text-left text-muted-foreground">
            Built by your friendly neighborhood AI.
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} ScentVault. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
