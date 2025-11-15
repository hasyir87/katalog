'use client';

import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-center">
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear}{ ' ' }
          <Link href="/" className="font-medium hover:text-primary">
            M Katalog Parfum
          </Link>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}
