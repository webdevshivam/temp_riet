import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle, XCircle, ImageIcon, Loader2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function FaceTesting() {
  const [storedImage, setStoredImage] = useState<string | null>(null);
  const [testImage, setTestImage] = useState<string | null>(null);
  const [storedImagePreview, setStoredImagePreview] = useState<string | null>(null);
  const [testImagePreview, setTestImagePreview] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<{ match: boolean; confidence: number } | null>(null);
  const { toast } = useToast();

  const handleStoredImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      setStoredImage(base64);
      setStoredImagePreview(URL.createObjectURL(file));
      setResult(null);
      toast({
        title: "Stored Image Loaded",
        description: "Reference face image has been loaded successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load image",
      });
    }
  };

  const handleTestImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      setTestImage(base64);
      setTestImagePreview(URL.createObjectURL(file));
      setResult(null);
      toast({
        title: "Test Image Loaded",
        description: "Verification image has been loaded successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load image",
      });
    }
  };

  const compareFaces = async () => {
    if (!storedImage || !testImage) {
      toast({
        variant: "destructive",
        title: "Missing Images",
        description: "Please upload both stored and test images",
      });
      return;
    }

    setIsComparing(true);
    setResult(null);

    try {
      // Call the face recognition service
      const response = await fetch('/api/face-test/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storedImage,
          testImage
        }),
      });

      if (!response.ok) {
        throw new Error('Face comparison failed');
      }

      const data = await response.json();
      setResult(data);

      toast({
        title: data.match ? "Match Found!" : "No Match",
        description: data.match 
          ? `Faces match with ${data.confidence.toFixed(1)}% confidence`
          : `Faces don't match (${data.confidence.toFixed(1)}% confidence)`,
        variant: data.match ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Comparison Error",
        description: error instanceof Error ? error.message : "Failed to compare faces",
      });
    } finally {
      setIsComparing(false);
    }
  };

  const clearAll = () => {
    setStoredImage(null);
    setTestImage(null);
    setStoredImagePreview(null);
    setTestImagePreview(null);
    setResult(null);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display flex items-center justify-center gap-3 text-orange-600 dark:text-orange-400">
          <ShieldCheck className="h-8 w-8" />
          Face Verification Testing
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Test face recognition by uploading two images
        </p>
      </div>

      {/* Instructions */}
      <Alert className="mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200">
        <ImageIcon className="h-5 w-5 text-blue-600" />
        <AlertDescription className="text-blue-900 dark:text-blue-100">
          <p className="font-semibold mb-2">How to test:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Upload a <strong>Stored Image</strong> (reference face from database)</li>
            <li>Upload a <strong>Test Image</strong> (face to verify)</li>
            <li>Click <strong>Compare Faces</strong> to see if they match</li>
            <li>The system shows match percentage and result</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Upload Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Stored Image */}
        <Card className="warm-shadow border-orange-100/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5 text-orange-500" />
              Stored Image (Reference)
            </CardTitle>
            <CardDescription>
              Upload the face image stored in the database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="stored-image" className="cursor-pointer">
                <div className="border-2 border-dashed border-orange-200 rounded-xl p-8 text-center hover:border-orange-400 hover:bg-orange-50/50 transition-colors">
                  {storedImagePreview ? (
                    <img
                      src={storedImagePreview}
                      alt="Stored face"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 mx-auto text-orange-400" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload stored image
                      </p>
                    </div>
                  )}
                </div>
              </Label>
              <Input
                id="stored-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleStoredImageUpload}
              />
            </div>
            {storedImage && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setStoredImage(null);
                  setStoredImagePreview(null);
                  setResult(null);
                }}
              >
                Clear Stored Image
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Test Image */}
        <Card className="warm-shadow border-rose-100/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5 text-rose-500" />
              Test Image (Verify)
            </CardTitle>
            <CardDescription>
              Upload the face image to verify
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-image" className="cursor-pointer">
                <div className="border-2 border-dashed border-rose-200 rounded-xl p-8 text-center hover:border-rose-400 hover:bg-rose-50/50 transition-colors">
                  {testImagePreview ? (
                    <img
                      src={testImagePreview}
                      alt="Test face"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-12 w-12 mx-auto text-rose-400" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload test image
                      </p>
                    </div>
                  )}
                </div>
              </Label>
              <Input
                id="test-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleTestImageUpload}
              />
            </div>
            {testImage && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setTestImage(null);
                  setTestImagePreview(null);
                  setResult(null);
                }}
              >
                Clear Test Image
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center mb-6">
        <Button
          size="lg"
          className="btn-primary"
          onClick={compareFaces}
          disabled={!storedImage || !testImage || isComparing}
        >
          {isComparing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Comparing...
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-5 w-5" />
              Compare Faces
            </>
          )}
        </Button>
        {(storedImage || testImage) && (
          <Button variant="outline" size="lg" onClick={clearAll}>
            Clear All
          </Button>
        )}
      </div>

      {/* Result */}
      {result && (
        <Card
          className={`border-2 shadow-xl ${
            result.match
              ? "border-green-500 bg-green-50 dark:bg-green-950/50"
              : "border-red-500 bg-red-50 dark:bg-red-950/50"
          }`}
        >
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              {result.match ? (
                <div className="flex-shrink-0">
                  <CheckCircle className="h-20 w-20 text-green-600" />
                </div>
              ) : (
                <div className="flex-shrink-0">
                  <XCircle className="h-20 w-20 text-red-600" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  {result.match ? "✅ Faces Match!" : "❌ Faces Don't Match"}
                </h2>
                <p className="text-lg mb-4">
                  Confidence Score: <strong>{result.confidence.toFixed(1)}%</strong>
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Match Threshold:</strong> 75% (configurable in server code)
                  </p>
                  <p>
                    <strong>Algorithm:</strong> Simplified pixel-based comparison (for
                    production, use AWS Rekognition, Azure Face API, or face-api.js)
                  </p>
                  {result.match ? (
                    <p className="text-green-700 dark:text-green-300">
                      ✓ These faces are similar enough to be considered a match
                    </p>
                  ) : (
                    <p className="text-red-700 dark:text-red-300">
                      ✗ These faces are too different to be considered a match
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card className="mt-6 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50">
        <CardHeader>
          <CardTitle className="text-base">Testing Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <ul className="list-disc list-inside space-y-1">
            <li>Use clear, well-lit photos for best results</li>
            <li>Face should be clearly visible and centered</li>
            <li>Try uploading the same person's photo twice - should match</li>
            <li>Try uploading different people's photos - should not match</li>
            <li>Current algorithm is simplified - production systems use advanced AI</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
