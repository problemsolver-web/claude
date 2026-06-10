"use client";

import { useEffect, useState } from "react";

// Shows a scannable QR code + copy/share buttons for an agency's public page.
// The QR image is rendered by a public QR service (no build dependency); it
// only needs the user's browser to have internet, which it does in production.
export default function ShareAgency({ agencyName }: { agencyName: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") setUrl(window.location.href);
  }, []);

  const qrSrc = url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(
        url
      )}`
    : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${agencyName} - Probashi Shield`,
          text: `Verification status for ${agencyName}`,
          url,
        });
      } catch {
        // user cancelled
      }
    } else {
      copy();
    }
  }

  return (
    <div className="card">
      <h2 className="mb-3 font-bold text-slate-800">Share this verification</h2>
      <p className="mb-3 text-sm text-slate-500">
        Scan or send this so others can check {agencyName} before they pay.
      </p>
      <div className="flex flex-col items-center gap-3">
        {qrSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrSrc}
            alt={`QR code for ${agencyName}`}
            width={180}
            height={180}
            className="rounded-lg border border-slate-200"
          />
        ) : (
          <div className="h-[180px] w-[180px] animate-pulse rounded-lg bg-slate-100" />
        )}
        <div className="flex w-full gap-2">
          <button onClick={copy} className="btn-outline flex-1">
            {copied ? "Copied!" : "Copy link"}
          </button>
          <button onClick={share} className="btn-primary flex-1">
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
