'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import QRCode from 'react-qr-code';
import { QrCodeIcon } from '@heroicons/react/24/outline';

export function QrCodeModal({ perfumeId, perfumeName }: { perfumeId: string; perfumeName: string }) {
  const [isOpen, setIsOpen] = useState(false);

  // Membuat URL publik untuk halaman detail parfum.
  // URL ini yang akan di-encode ke dalam QR code.
  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/perfume/${perfumeId}`
    : ''; // Biarkan kosong di server-side

  if (!publicUrl) return null; // Jangan render di server

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Show QR Code">
          <QrCodeIcon className="h-4 w-4" />
          <span className="sr-only">Tampilkan Kode QR</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kode QR untuk {perfumeName}</DialogTitle>
          <DialogDescription>
            Pindai kode ini dengan kamera untuk melihat detail parfum di halaman publik.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-4 bg-white rounded-md my-4">
          {/* Komponen QRCode memerlukan latar belakang terang agar mudah dipindai */}
          <QRCode
            value={publicUrl}
            size={256}
            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            viewBox={`0 0 256 256`}
          />
        </div>
        <DialogFooter className="sm:justify-start">
           <p className="text-xs text-muted-foreground break-all">
                URL: {publicUrl}
           </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
