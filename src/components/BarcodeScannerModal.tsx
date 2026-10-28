import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { Product } from '../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  products: Product[];
  language: 'hi' | 'en';
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  products,
  language,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const isHindi = language === 'hi';

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch retail beep
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // AudioContext not allowed or not supported
    }
  };

  const handleDetectedCode = (code: string) => {
    playBeep();
    onScan(code.trim());
    onClose();
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsScanning(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported on this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      // Check if native BarcodeDetector is available
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new (window as unknown as { BarcodeDetector: new (options?: { formats: string[] }) => { detect: (video: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a'],
        });

        const scanFrame = async () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0 && barcodes[0].rawValue) {
                handleDetectedCode(barcodes[0].rawValue);
                return;
              }
            } catch {
              // Ignore single frame detect errors
            }
          }
          animationFrameRef.current = requestAnimationFrame(scanFrame);
        };

        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err) {
      console.warn('Camera initiation error:', err);
      setCameraError(
        isHindi
          ? 'कैमरा शुरू नहीं हो सका या अनुमति नहीं मिली। कृपया नीचे मैन्युअल कोड दर्ज करें।'
          : 'Could not access camera. Please enter barcode or IMEI code manually below.'
      );
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter products by manualCode
  const matchingProducts = manualCode.trim().length > 1
    ? products.filter(
        (p) =>
          p.barcode.includes(manualCode.trim()) ||
          p.sku.toLowerCase().includes(manualCode.toLowerCase()) ||
          p.name.toLowerCase().includes(manualCode.toLowerCase()) ||
          (p.smartphoneDetails?.imeiList.some((imei) => imei.includes(manualCode.trim())))
      ).slice(0, 4)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {isHindi ? 'बारकोड / IMEI स्कैनर' : 'Barcode & IMEI Scanner'}
              </h3>
              <p className="text-xs text-slate-400">
                {isHindi ? 'कैमरे के सामने बारकोड लाएं' : 'Align camera over barcode or phone box'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder area */}
        <div className="relative bg-black h-56 flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-xs">{cameraError}</p>
              <button
                onClick={startCamera}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {isHindi ? 'कैमरा पुनः प्रयास करें' : 'Retry Camera'}
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {/* Scan target reticle overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-64 h-32 border-2 border-emerald-500/80 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
                  <div className="absolute -top-6 left-0 right-0 text-center text-[11px] font-medium text-emerald-400">
                    {isHindi ? 'स्कैनर सक्रिय है' : 'Target Barcode Here'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Manual Input & Suggestions */}
        <div className="p-4 space-y-3 bg-slate-900 border-t border-slate-800 flex-1 overflow-y-auto">
          <label className="block text-xs font-medium text-slate-300">
            {isHindi ? 'या मैन्युअल बारकोड / IMEI / SKU दर्ज करें:' : 'Or type Barcode, IMEI or SKU:'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && manualCode.trim()) {
                  handleDetectedCode(manualCode);
                }
              }}
              placeholder={isHindi ? 'उदा. 890123450001 या 8642...' : 'e.g. 890123450001 or 15-digit IMEI'}
              className="flex-1 px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              onClick={() => manualCode.trim() && handleDetectedCode(manualCode)}
              disabled={!manualCode.trim()}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              {isHindi ? 'जोड़ें' : 'Add'}
            </button>
          </div>

          {/* Quick matching chips */}
          {matchingProducts.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-[11px] text-slate-400 font-medium">
                {isHindi ? 'मिलते-जुलते सामान:' : 'Matching Products:'}
              </span>
              <div className="space-y-1.5">
                {matchingProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleDetectedCode(p.barcode)}
                    className="w-full text-left p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between transition-colors group"
                  >
                    <div className="truncate pr-2">
                      <div className="text-xs font-medium text-slate-200 group-hover:text-emerald-400 truncate">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        BC: {p.barcode} · Qty: {p.stockQuantity}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-white font-mono shrink-0">
                      ₹{p.sellingPrice}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hint */}
          <div className="text-[11px] text-slate-400 pt-1 leading-relaxed">
            💡 {isHindi
              ? 'टिप: यदि आपके पास फिजिकल USB/Bluetooth बारकोड गन है, तो वह सीधे इनपुट फील्ड में भी स्कैन कर सकती है।'
              : 'Tip: Physical Bluetooth/USB barcode scanners can also type directly into search bars.'}
          </div>
        </div>
      </div>
    </div>
  );
};
