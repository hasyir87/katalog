import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/Logo.png" alt="M Perfume Logo" width={80} height={40} className="dark:invert"/>
          </Link>
          <p className="text-center text-sm leading-loose md:text-left text-muted-foreground">
            Dibuat oleh AI ramah lingkungan Anda.
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} M Katalog Parfum. Semua hak dilindungi.
        </p>
      </div>
    </footer>
  );
}
