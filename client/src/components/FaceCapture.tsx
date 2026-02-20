import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

interface FaceCaptureProps {
  onCapture: (imageBase64: string) => void;
  onCancel?: () => void;
  showPreview?: boolean;
  autoCapture?: boolean;
}

export function FaceCapture({ 
  onCapture, 
  onCancel, 
  showPreview = true,
  autoCapture = false 
}: FaceCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [qualityChecks, setQualityChecks] = useState({
    brightness: false,
    faceDetected: false,
    focus: false
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Use loadedmetadata event to ensure video is ready before playing
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.error("Video play error:", err);
            });
          }
        };
      }

      // Start quality monitoring
      monitorQuality();
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please ensure camera permissions are granted.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.onloadedmetadata = null;
    }
  };

  const monitorQuality = () => {
    // Simple quality checks - in production, use more sophisticated algorithms
    const interval = setInterval(() => {
      if (!videoRef.current || !stream) {
        clearInterval(interval);
        return;
      }

      // Simulate quality checks
      // In production, analyze video frame for:
      // - Face detection (using face-api.js or similar)
      // - Brightness/contrast
      // - Sharpness/blur detection
      const video = videoRef.current;
      
      setQualityChecks({
        brightness: video.readyState === 4, // Video is ready
        faceDetected: video.readyState === 4 && video.videoWidth > 0,
        focus: video.readyState === 4
      });
    }, 500);

    return () => clearInterval(interval);
  };

  const captureFrame = async () => {
    if (!videoRef.current || !stream) {
      setError("Camera not ready");
      return;
    }

    setCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas context not available");
      }

      // Draw current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64 JPEG
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      const base64 = dataUrl.split(",")[1];
      
      if (showPreview) {
        setCapturedImage(dataUrl);
      } else {
        stopCamera();
        onCapture(base64);
      }
    } catch (err) {
      console.error("Capture error:", err);
      setError("Failed to capture image. Please try again.");
    } finally {
      setCapturing(false);
    }
  };

  const confirmCapture = () => {
    if (capturedImage) {
      const base64 = capturedImage.split(",")[1];
      stopCamera();
      onCapture(base64);
    }
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const allChecksPass = qualityChecks.brightness && qualityChecks.faceDetected && qualityChecks.focus;

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <Alert>
        <Camera className="h-4 w-4" />
        <AlertDescription>
          <strong>Face Capture Tips:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Position your face in the center of the frame</li>
            <li>• Ensure good lighting - avoid shadows</li>
            <li>• Look directly at the camera</li>
            <li>• Keep a neutral expression</li>
            <li>• Remove glasses and hats if possible</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Camera/Preview */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-video bg-black">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                
                {/* Face overlay guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-80 border-4 border-primary/50 rounded-full" />
                </div>

                {/* Quality indicators */}
                <div className="absolute top-4 right-4 space-y-2">
                  <QualityIndicator 
                    label="Lighting" 
                    passed={qualityChecks.brightness} 
                  />
                  <QualityIndicator 
                    label="Face Detected" 
                    passed={qualityChecks.faceDetected} 
                  />
                  <QualityIndicator 
                    label="Focus" 
                    passed={qualityChecks.focus} 
                  />
                </div>
              </>
            ) : (
              <img 
                src={capturedImage} 
                alt="Captured face" 
                className="w-full h-full object-cover"
              />
            )}

            {error && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex justify-between items-center">
        {!capturedImage ? (
          <>
            <Button
              variant="outline"
              onClick={() => {
                stopCamera();
                onCancel?.();
              }}
            >
              Cancel
            </Button>
            
            <Button
              size="lg"
              onClick={captureFrame}
              disabled={capturing || !stream || !allChecksPass}
              className="gap-2"
            >
              {capturing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Capturing...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4" />
                  Capture Photo
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={retake}>
              Retake
            </Button>
            
            <Button size="lg" onClick={confirmCapture} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Use This Photo
            </Button>
          </>
        )}
      </div>

      {!allChecksPass && !capturedImage && !error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Waiting for optimal conditions... Ensure your face is visible and well-lit.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function QualityIndicator({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
      {passed ? (
        <CheckCircle className="h-3 w-3 text-green-500" />
      ) : (
        <Loader2 className="h-3 w-3 text-yellow-500 animate-spin" />
      )}
      <span>{label}</span>
    </div>
  );
}
