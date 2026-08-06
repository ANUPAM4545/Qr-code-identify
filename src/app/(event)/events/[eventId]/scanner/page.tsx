/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useEffect, useRef, useState } from "react";
import { CameraService } from "@/application/services/CameraService";
import { ScanResult } from "@/application/services/ScannerService";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  SwitchCamera, 
  Settings2, 
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  User as UserIcon,
  WifiOff,
  Lightbulb,
  LightbulbOff,
  Camera
} from "lucide-react";
import { OfflineQueueService } from "@/application/services/OfflineQueueService";
import { toast } from "sonner";

export default function ScannerTerminalPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  
  const [cameraService, setCameraService] = useState<CameraService | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<{id: string, label: string}[]>([]);
  const [torchOn, setTorchOn] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [overlay, setOverlay] = useState<ScanResult | null>(null);

  // Initialize Scanner
  useEffect(() => {
    const service = new CameraService({
      fps: 10,
      qrbox: 250,
      aspectRatio: 1.0,
      disableFlip: false
    });
    setCameraService(service);

    return () => {
      service.stop().catch(console.error);
    };
  }, []);

  useEffect(() => {
    if (!cameraService) return;
    
    // Mount scanner
    cameraService.init(
      "reader",
      async (decodedText) => {
        handleScan(decodedText);
      },
      (err) => {
        // Continuous scan errors are ignored (e.g. no QR found in frame)
      }
    ).then(() => {
      cameraService.getAdapter().getCameras().then(setCameras);
    });
  }, [cameraService]);

  const handleScan = async (qrData: string) => {
    // Pause immediately to prevent multiple scans of the same QR
    cameraService?.pause();

    const isOnline = navigator.onLine;

    let result: ScanResult;

    if (isOnline) {
      try {
        const res = await fetch(`/api/events/${eventId}/scanner/scan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qrData, direction: "in" })
        });
        const data = await res.json();
        
        if (!res.ok) {
          result = { success: false, status: "invalid", reason: data.error || "Unknown error" };
        } else {
          result = data as ScanResult;
        }
      } catch (e: unknown) {
        // Fallback to offline queue if fetch fails
        result = await enqueueOfflineScan(qrData);
      }
    } else {
      result = await enqueueOfflineScan(qrData);
    }

    // Play Sound
    playAudioFeedback(result.status);
    
    // Show Overlay
    setOverlay(result);
    setRecentScans(prev => [result, ...prev].slice(0, 50)); // Keep last 50

    // Auto resume if configured
    const delay = cameraService?.getSettings().autoResumeDelay || 2000;
    setTimeout(() => {
      setOverlay(null);
      cameraService?.resume();
    }, delay);
  };

  const enqueueOfflineScan = async (qrData: string): Promise<ScanResult> => {
    const scanId = crypto.randomUUID();
    await OfflineQueueService.enqueueScan({
      id: scanId,
      eventId,
      qrPayload: qrData,
      timestamp: new Date(),
      scannerId: "browser-session",
      operatorId: "operator", // Will come from session
      method: "qr_scan",
      direction: "in",
      retryCount: 0,
      syncStatus: "pending"
    });
    
    return {
      success: true,
      status: "offline_accepted",
      reason: "Queued for sync",
      // Best effort decode for UI
      guest: { firstName: "Guest", lastName: "(Offline Queue)" }
    };
  };

  const playAudioFeedback = (status: string) => {
    if (!cameraService?.getSettings().beep) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (status === "success" || status === "offline_accepted") {
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); // A6
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.2);
      } else {
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(200, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio fallback
    }
  };

  const toggleScanner = async () => {
    if (!cameraService) return;
    
    if (isScanning) {
      await cameraService.stop();
      setIsScanning(false);
    } else {
      try {
        await cameraService.start();
        setIsScanning(true);
      } catch (e: unknown) {
        toast.error("Failed to start camera: " + (e?.message || String(e)));
      }
    }
  };

  const toggleTorch = async () => {
    if (!cameraService) return;
    await cameraService.getAdapter().setTorch(!torchOn);
    setTorchOn(!torchOn);
  };

  const switchCamera = async () => {
    if (!cameraService || cameras.length <= 1) return;
    const currentIndex = cameras.findIndex(c => c.id === cameraService.getSettings().defaultCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    await cameraService.switchCamera(cameras[nextIndex].id);
  };

  const ResultIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "success": return <CheckCircle2 className="w-16 h-16 text-green-500 mb-4 mx-auto" />;
      case "duplicate": return <Clock className="w-16 h-16 text-yellow-500 mb-4 mx-auto" />;
      case "warning": return <AlertTriangle className="w-16 h-16 text-orange-500 mb-4 mx-auto" />;
      case "offline_accepted": return <WifiOff className="w-16 h-16 text-blue-500 mb-4 mx-auto" />;
      default: return <XCircle className="w-16 h-16 text-red-500 mb-4 mx-auto" />;
    }
  };

  return (
    <div className="flex flex-1 w-full">
      
      {/* Viewfinder Area */}
      <div className="flex-1 bg-background relative flex flex-col items-center justify-center">
        
        {/* Camera Container Wrapper */}
        <div className="w-full flex-1 max-w-4xl mx-auto overflow-hidden bg-muted rounded-none sm:rounded-xl my-0 sm:my-6 relative border border-border/50">
          {/* Third-party library target MUST be empty of React children */}
          <div id="reader" className="w-full h-full"></div>
          
          {!isScanning && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
              <Camera className="w-12 h-12 text-gray-500 mb-4" />
              <p className="text-gray-400 font-medium">Scanner Paused</p>
              <Button className="mt-6" onClick={toggleScanner}>
                Start Scanning
              </Button>
            </div>
          )}

          {/* Overlay Result */}
          {overlay && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in p-6 text-center">
              <ResultIcon status={overlay.status} />
              <h2 className="text-3xl font-bold mb-2">
                {overlay.status === "success" && "Access Granted"}
                {overlay.status === "duplicate" && "Already Checked In"}
                {overlay.status === "invalid" && "Access Denied"}
                {overlay.status === "offline_accepted" && "Queued Offline"}
              </h2>
              {overlay.guest && (
                <p className="text-xl text-gray-300">
                  {overlay.guest.firstName} {overlay.guest.lastName}
                </p>
              )}
              {overlay.reason && (
                <p className="text-sm text-red-400 mt-2 max-w-md mx-auto">
                  {overlay.reason}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-900/90 backdrop-blur px-6 py-4 rounded-full border border-gray-700 shadow-2xl">
          <Button variant="ghost" size="icon" className="rounded-full w-12 h-12" onClick={toggleScanner}>
            {isScanning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          
          {cameras.length > 1 && (
            <Button variant="ghost" size="icon" className="rounded-full w-12 h-12" onClick={switchCamera}>
              <SwitchCamera className="w-5 h-5" />
            </Button>
          )}

          {cameraService?.getAdapter().hasTorch() && (
            <Button variant="ghost" size="icon" className="rounded-full w-12 h-12" onClick={toggleTorch}>
              {torchOn ? <Lightbulb className="w-5 h-5 text-yellow-500" /> : <LightbulbOff className="w-5 h-5" />}
            </Button>
          )}

          <Button variant="ghost" size="icon" className="rounded-full w-12 h-12">
            <Search className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full w-12 h-12">
            <Settings2 className="w-5 h-5" />
          </Button>
        </div>

      </div>

      {/* Right Panel: Live Feed */}
      <div className="w-80 bg-gray-950 border-l border-gray-800 flex flex-col hidden lg:flex shrink-0">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Live Activity</h3>
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
        </div>
        
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {recentScans.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-10">
              No recent scans
            </div>
          ) : (
            recentScans.map((scan, idx) => (
              <div key={idx} className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-sm flex gap-3 animate-in slide-in-from-right-4">
                <div className="mt-1">
                  {scan.status === "success" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  {scan.status === "duplicate" && <Clock className="w-4 h-4 text-yellow-500" />}
                  {scan.status === "invalid" && <XCircle className="w-4 h-4 text-red-500" />}
                  {scan.status === "offline_accepted" && <WifiOff className="w-4 h-4 text-blue-500" />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium truncate text-gray-200">
                    {scan.guest ? `${scan.guest.firstName} ${scan.guest.lastName}` : "Unknown Guest"}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {scan.reason || "Checked In"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
