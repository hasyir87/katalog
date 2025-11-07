'use client';

import QRCode from "react-qr-code";
import { useState, useEffect } from "react";

export function QrCodeDisplay({ scentType }: { scentType: string }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fullUrl = `${window.location.origin}/aroma/${encodeURIComponent(scentType)}`;
      setUrl(fullUrl);
    }
  }, [scentType]);

  if (!url) {
    return <div className="w-32 h-32 bg-muted rounded-md animate-pulse" />;
  }

  return (
    <div style={{ background: 'white', padding: '16px', borderRadius: '8px' }}>
      <QRCode
        size={256}
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        value={url}
        viewBox={`0 0 256 256`}
      />
    </div>
  );
}
