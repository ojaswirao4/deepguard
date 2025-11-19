import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Shield, AlertTriangle, CheckCircle, Scan, FileVideo } from "lucide-react";
import { Navigation } from "@/components/Navigation";

type ScanResult = {
  isAuthentic: boolean;
  confidence: number;
  issues: string[];
};

const Index = () => {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast({
          title: "Invalid File",
          description: "Please select a valid video file",
          variant: "destructive",
        });
        return;
      }
      setSelectedVideo(file);
      setVideoPreview(URL.createObjectURL(file));
      setScanResult(null);
    }
  };

  const extractFrames = async (videoFile: File, numFrames: number = 5): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const frames: string[] = [];
      
      video.preload = 'metadata';
      video.src = URL.createObjectURL(videoFile);
      
      video.onloadedmetadata = () => {
        const duration = video.duration;
        const interval = duration / (numFrames + 1);
        let currentFrame = 0;
        
        const captureFrame = () => {
          if (currentFrame >= numFrames) {
            URL.revokeObjectURL(video.src);
            resolve(frames);
            return;
          }
          
          const timeToSeek = interval * (currentFrame + 1);
          video.currentTime = timeToSeek;
        };
        
        video.onseeked = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx?.drawImage(video, 0, 0);
          
          // Convert to base64
          const frameData = canvas.toDataURL('image/jpeg', 0.8);
          frames.push(frameData);
          
          currentFrame++;
          captureFrame();
        };
        
        captureFrame();
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video'));
      };
    });
  };

  const analyzeWithAI = async () => {
    console.log("analyzeWithAI called");
    if (!selectedVideo) {
      console.log("No video selected");
      return;
    }
    
    setIsScanning(true);
    setScanResult(null);

    try {
      console.log("Starting frame extraction...");
      toast({
        title: "Extracting Frames",
        description: "Analyzing video frames with AI...",
      });

      // Extract 5 frames from the video
      const frames = await extractFrames(selectedVideo, 5);
      console.log(`Extracted ${frames.length} frames, first frame size:`, frames[0]?.length);
      
      toast({
        title: "Analyzing with AI",
        description: "Our AI is examining the video for deepfake indicators...",
      });

      // Call edge function for AI analysis
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-deepfake`;
      console.log("Calling API:", apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ frames }),
      });

      console.log("API response status:", response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error("API error response:", error);
        throw new Error(error.error || 'Analysis failed');
      }

      const result = await response.json();
      console.log("Analysis result:", result);
      
      setScanResult({
        isAuthentic: result.isAuthentic,
        confidence: result.confidence,
        issues: result.issues || [],
      });

      toast({
        title: result.isAuthentic ? "Video Verified" : "Deepfake Detected",
        description: result.isAuthentic
          ? "This video appears to be authentic"
          : "Suspicious patterns detected in the video",
        variant: result.isAuthentic ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze video",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Main Content */}
      <main id="home" className="flex-1 container mx-auto px-4 py-8 md:py-12 pt-24">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-6 mb-16 mt-12 animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              AI-Powered <span className="gradient-text bg-200 animate-gradient-shift">Deepfake Detection</span>
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
              Upload any video and let our advanced AI analyze it for authenticity. 
              Real-time detection at social media scale.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">99% Accurate</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
                <span className="text-muted-foreground">Real-time Analysis</span>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <Card className="border-primary/30 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 card-glow hover:scale-[1.01]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Upload className="w-5 h-5 text-primary" />
                Upload Video
              </CardTitle>
              <CardDescription>Select a video file to scan for deepfake manipulation</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="video/*"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-primary/30 rounded-lg p-8 md:p-12 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 group"
              >
                <FileVideo className="w-16 h-16 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
                <p className="text-foreground font-semibold mb-2">
                  {selectedVideo ? selectedVideo.name : "Click to upload video"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports MP4, MOV, AVI and other video formats
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Video Preview */}
          {videoPreview && (
            <Card className="border-primary/30 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-foreground">Video Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full max-h-96 object-contain"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <Scan className="w-16 h-16 text-primary mx-auto animate-spin" />
                        <div className="space-y-2">
                          <p className="text-primary font-bold text-xl">SCANNING...</p>
                          <p className="text-sm text-muted-foreground">Analyzing video for manipulation</p>
                        </div>
                        <div className="w-64 h-1 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary animate-scan"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  onClick={analyzeWithAI}
                  disabled={isScanning}
                  className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-6 text-lg shadow-lg hover:shadow-primary/50 transition-all duration-300"
                >
                  <Scan className="w-5 h-5 mr-2" />
                  {isScanning ? "SCANNING..." : "SCAN FOR DEEPFAKE"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {scanResult && (
            <Card
              className={`border-2 ${
                scanResult.isAuthentic
                  ? "border-success/50 bg-success/5"
                  : "border-destructive/50 bg-destructive/5"
              } backdrop-blur-sm animate-fade-in`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  {scanResult.isAuthentic ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-success" />
                      AUTHENTIC VIDEO
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-6 h-6 text-destructive" />
                      DEEPFAKE DETECTED
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Confidence Score */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-foreground">Confidence Score</span>
                    <span
                      className={`text-2xl font-bold ${
                        scanResult.isAuthentic ? "text-success" : "text-destructive"
                      }`}
                    >
                      {scanResult.confidence}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        scanResult.isAuthentic ? "bg-success" : "bg-destructive"
                      }`}
                      style={{ width: `${scanResult.confidence}%` }}
                    ></div>
                  </div>
                </div>

                {/* Issues */}
                {!scanResult.isAuthentic && scanResult.issues.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      Detected Issues
                    </h4>
                    <ul className="space-y-2">
                      {scanResult.issues.map((issue, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-muted-foreground bg-destructive/10 p-3 rounded border border-destructive/20"
                        >
                          <span className="text-destructive font-bold">•</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {scanResult.isAuthentic && (
                  <div className="bg-success/10 p-4 rounded border border-success/20">
                    <p className="text-sm text-muted-foreground">
                      No manipulation detected. This video appears to be authentic based on our analysis.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="max-w-4xl mx-auto space-y-8 py-16">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">1. Upload Video</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Select any video file from your device for analysis
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Scan className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">2. AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Our AI examines frames for manipulation indicators
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">3. Get Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Receive detailed authenticity report with confidence score
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="max-w-4xl mx-auto space-y-8 py-16">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">Key Features</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Advanced AI Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  State-of-the-art AI models trained on millions of videos
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scan className="w-5 h-5 text-primary" />
                  Real-time Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Get results in seconds, not minutes or hours
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  High Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  99% accuracy rate in detecting deepfakes and manipulations
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileVideo className="w-5 h-5 text-primary" />
                  Multiple Formats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Support for all common video formats and resolutions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* About Section */}
        <div id="about" className="max-w-4xl mx-auto space-y-8 py-16">
          <h3 className="text-3xl font-bold text-center text-foreground mb-8">About DeepGuard</h3>
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed mb-4">
                DeepGuard is an advanced AI-powered platform designed to detect deepfakes and video manipulations. 
                In an era where synthetic media is becoming increasingly sophisticated, we provide reliable tools 
                to verify video authenticity.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our technology leverages cutting-edge machine learning models trained on extensive datasets 
                to identify subtle inconsistencies that indicate manipulation. Whether you're a journalist, 
                researcher, or concerned individual, DeepGuard helps you make informed decisions about 
                video content authenticity.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/20 bg-card/30 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground">
                AI-Powered Authenticity Scanner
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Real-time Detection</span>
              <span>•</span>
              <span>99% Accuracy</span>
              <span>•</span>
              <span>Social Media Scale</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
