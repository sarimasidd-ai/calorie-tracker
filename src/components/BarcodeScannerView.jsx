import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import ManualBarcodeEntry from './ManualBarcodeEntry';

const REGION_ID = 'barcode-scanner-region';

// html5-qrcode's stop()/clear() throw *synchronously* if called while the
// scanner isn't actually running (e.g. unmounted before start() resolved).
// Swallow that defensively so it never crashes the component tree.
function safeStopAndClear(scanner) {
  if (!scanner) return;
  try {
    const maybePromise = scanner.stop();
    if (maybePromise && typeof maybePromise.then === 'function') {
      maybePromise.catch(() => {}).finally(() => {
        try {
          scanner.clear();
        } catch {
          // ignore
        }
      });
      return;
    }
  } catch {
    // wasn't running — fall through to a best-effort clear
  }
  try {
    scanner.clear();
  } catch {
    // ignore
  }
}

export default function BarcodeScannerView({ onDetected, onCancel }) {
  const [status, setStatus] = useState('starting'); // starting | scanning | permission-denied | start-failed
  const firedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    firedRef.current = false;
    const scanner = new Html5Qrcode(REGION_ID, {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
      ],
      verbose: false,
    });

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 160 } },
        (decodedText) => {
          if (firedRef.current) return;
          firedRef.current = true;
          onDetected(decodedText);
        },
        () => {
          // per-frame "nothing decoded yet" — not an error, ignore
        }
      )
      .then(() => {
        if (cancelled) {
          safeStopAndClear(scanner);
        } else {
          setStatus('scanning');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = String(err);
        setStatus(/NotAllowedError|Permission|denied/i.test(msg) ? 'permission-denied' : 'start-failed');
      });

    return () => {
      cancelled = true;
      safeStopAndClear(scanner);
    };
  }, [onDetected]);

  const showCamera = status === 'starting' || status === 'scanning';

  return (
    <div className="space-y-3">
      {showCamera && (
        <>
          <div id={REGION_ID} className="overflow-hidden rounded-lg bg-black [&_video]:rounded-lg" />
          <p className="text-center text-xs text-slate-500">Point your camera at the barcode</p>
        </>
      )}

      {status === 'permission-denied' && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          Couldn't access your camera — check camera permission for this site in your browser settings. You can
          still enter the barcode by hand below.
        </div>
      )}

      {status === 'start-failed' && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          Camera didn't start (it needs HTTPS, or your device may not have one). Enter the barcode by hand below.
        </div>
      )}

      <div>
        <div className="mb-1.5 text-xs font-medium text-slate-500">
          {showCamera ? 'Or enter it manually' : 'Enter barcode manually'}
        </div>
        <ManualBarcodeEntry onSubmit={onDetected} />
      </div>

      <button type="button" onClick={onCancel} className="w-full rounded-lg bg-slate-800 py-3 text-sm font-medium text-slate-300">
        Cancel
      </button>
    </div>
  );
}
