'use client';

import { apiClient } from "@/api/api";
import { DownloadResponse } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getTikTokURL } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useRef, useEffect, useCallback } from "react";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import z from "zod";

const VideoPlayer = ({ 
  videoData, 
  currentTime, 
  isPlaying, 
  onTimeUpdate, 
  onPlayStateChange,
  isActive = true
}: { 
  videoData: DownloadResponse['data'];
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onPlayStateChange: (playing: boolean) => void;
  isActive?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(0);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  const syncVideoTime = useCallback((targetTime: number) => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      const video = videoRef.current;
      if (video && isActive && isVideoReady) {
        const timeDiff = Math.abs(video.currentTime - targetTime);
        if (timeDiff > 0.5) {
          video.currentTime = targetTime;
          setLastSyncTime(targetTime);
        }
      }
    }, 100);
  }, [isActive, isVideoReady]);

  const handlePlayPause = useCallback(async (shouldPlay: boolean) => {
    const video = videoRef.current;
    if (!video || !isActive || !isVideoReady) return;

    try {
      if (playPromiseRef.current) {
        await playPromiseRef.current.catch(() => {});
      }

      if (shouldPlay && video.paused) {
        playPromiseRef.current = video.play();
        await playPromiseRef.current;
      } else if (!shouldPlay && !video.paused) {
        video.pause();
        playPromiseRef.current = null;
      }
    } catch (error) {
      console.warn('Playback error:', error);
      onPlayStateChange(false);
    }
  }, [isActive, isVideoReady]);

  const handleLoadedMetadata = useCallback(() => {
    setIsVideoReady(true);
    const video = videoRef.current;
    if (video && currentTime > 0) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video && isActive && isVideoReady) {
      const currentVideoTime = video.currentTime;
      if (Math.abs(currentVideoTime - lastSyncTime) > 0.1) {
        onTimeUpdate(currentVideoTime);
        setLastSyncTime(currentVideoTime);
      }
    }
  }, [isActive, isVideoReady, lastSyncTime]);

  const handlePlay = useCallback(() => {
    if (isActive) {
      onPlayStateChange(true);
    }
  }, [isActive]);

  const handlePause = useCallback(() => {
    if (isActive) {
      onPlayStateChange(false);
    }
  }, [isActive]);

  const handleEnded = useCallback(() => {
    onPlayStateChange(false);
    onTimeUpdate(0);
  }, []);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e);
    onPlayStateChange(false);
    setIsVideoReady(false);
  }, []);

  const handleWaiting = useCallback(() => {
    // Buffering video...
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsVideoReady(true);
  }, []);

  useEffect(() => {
    if (isVideoReady && isActive) {
      handlePlayPause(isPlaying);
    }
  }, [isPlaying, isVideoReady, isActive]);

  useEffect(() => {
    if (isVideoReady && isActive) {
      syncVideoTime(currentTime);
    }
  }, [currentTime, isVideoReady, isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (!isActive) {
        if (!video.paused) {
          video.pause();
        }
      } else if (isVideoReady && isPlaying) {
        if (Math.abs(video.currentTime - currentTime) > 0.5) {
          video.currentTime = currentTime;
        }
        if (video.paused) {
          handlePlayPause(true);
        }
      }
    }
  }, [isActive, isVideoReady]);

  useEffect(() => {
    setIsVideoReady(false);
    setLastSyncTime(0);
    if (playPromiseRef.current) {
      playPromiseRef.current.catch(() => {});
      playPromiseRef.current = null;
    }
  }, [videoData.video?.urls[0]]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      if (playPromiseRef.current) {
        playPromiseRef.current.catch(() => {});
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border">
      <h3 className="text-xl lg:text-2xl font-semibold mb-4">Video Preview</h3>
      <div className="relative">
        <video 
          ref={videoRef}
          controls 
          className="w-full aspect-video rounded-lg shadow-md bg-black"
          src={videoData.video?.urls[0]}
          poster={videoData.video?.thumb}
          preload="metadata"
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          onError={handleError}
          onWaiting={handleWaiting}
          onCanPlay={handleCanPlay}
        >
          Your browser does not support the video tag.
        </video>
        
        {/* Loading indicator */}
        {!isVideoReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Provider:</strong> {videoData.provider}</p>
        <p><strong>Available formats:</strong> {videoData.video?.urls.length}</p>
        <p><strong>Status:</strong> {isVideoReady ? 'Ready' : 'Loading...'}</p>
      </div>
    </div>
  );
};

const DownloadOptions = ({ videoData, onDownload }: { 
  videoData: DownloadResponse['data'], 
  onDownload: (url: string, index: number) => void 
}) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border">
      <h3 className="text-xl lg:text-2xl font-semibold mb-4">
        Download Options 
        <span className="text-base font-normal text-gray-500 ml-2">
          ({videoData.video?.urls.length} available)
        </span>
      </h3>
      
      <div className="space-y-3">
        {videoData.video?.urls.map((url, index) => (
          <Button
            key={index}
            variant="neutral"
            onClick={() => onDownload(url, index)}
            className="w-full justify-start p-4 h-auto hover:bg-gray-50 transition-colors"
            size="lg"
          >
            <Download className="w-5 h-5 mr-3 flex-shrink-0" />
            <div className="text-left flex-1">
              <div className="font-medium text-base">
                Quality {index + 1} {index === 0 ? "(HD)" : index === 1 ? "(Standard)" : "(Alternative)"}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Click to download MP4 file
              </div>
            </div>
          </Button>
        ))}
        
        <div className="pt-3 border-t mt-4">
          <Button
            variant="noShadow"
            onClick={() => window.open(videoData.video?.urls[0], '_blank')}
            className="w-full justify-start p-4 h-auto hover:bg-gray-50 transition-colors"
            size="lg"
          >
            <ExternalLink className="w-5 h-5 mr-3 flex-shrink-0" />
            <div className="text-left">
              <div className="font-medium">View in new tab</div>
              <div className="text-sm text-gray-500 mt-1">
                Open video directly in browser
              </div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [videoData, setVideoData] = useState<DownloadResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoIsPlaying, setVideoIsPlaying] = useState(false);
  
  const [activePlayer, setActivePlayer] = useState<'mobile' | 'desktop'>('desktop');

  useEffect(() => {
    const checkScreenSize = () => {
      setActivePlayer(window.innerWidth >= 1024 ? 'desktop' : 'mobile');
    };

    checkScreenSize();

    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const formSchema = z.object({
    url: z.url().refine((val) => getTikTokURL(val), {
      error: 'Invalid VT Tiktok URL',
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.post('./api/download', {
        json: {
          url: values.url,
        },
      }).json<DownloadResponse>();

      if (response.message) {
        form.setError('url', {
          message: response.message,
        });
        setVideoData(null);
        return;
      }

      setVideoData(response);
      // Reset video state untuk video baru
      setVideoCurrentTime(0);
      setVideoIsPlaying(false);
    } catch (error) {
      console.error('API Error:', error);
      form.setError('url', {
        message: 'Failed to process video. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `tiktok_video_${index + 1}.mp4`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setVideoData(null);
    setVideoCurrentTime(0);
    setVideoIsPlaying(false);
    form.reset();
  };

  const handleTimeUpdate = useCallback((time: number) => {
    setVideoCurrentTime(time);
  }, []);

  const handlePlayStateChange = useCallback((playing: boolean) => {
    setVideoIsPlaying(playing);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Mobile/Tablet Layout - Stack Vertically */}
      <div className="lg:hidden p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-sans text-black mb-6 text-center">
            Download TikTok Videos!
          </h1>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-6">
              <FormField control={form.control} name="url" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl">VT URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Tiktok video URL (e.g. https://vt.tiktok.com/XXXXXX)" 
                      className="text-lg py-3"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Please provide the tiktok video URL to download
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isLoading ? "Processing..." : "Download"}
                </Button>
                {videoData && (
                  <Button type="button" variant="neutral" onClick={resetForm}>
                    New Video
                  </Button>
                )}
              </div>
            </form>
          </Form>

          {/* Video Results - Stack Vertically on Mobile */}
          {videoData?.data && (
            <div className="space-y-6">
              <VideoPlayer 
                videoData={videoData.data} 
                currentTime={videoCurrentTime}
                isPlaying={videoIsPlaying}
                onTimeUpdate={handleTimeUpdate}
                onPlayStateChange={handlePlayStateChange}
                isActive={activePlayer === 'mobile'}
              />
              <DownloadOptions videoData={videoData.data} onDownload={handleDownload} />
            </div>
          )}
        </div>
      </div>

      {/* Large Screen Hero Layout - Side by Side */}
      <div className="hidden lg:flex lg:min-h-screen lg:items-center lg:justify-center">
        <div className="w-full max-w-7xl mx-auto px-6">
          <div className="flex items-start gap-12">
            {/* Hero Title */}
            <div className="flex-shrink-0">
              <h1 className="text-6xl font-sans text-black leading-tight">
                Download<br />
                TikTok<br />
                Videos!
              </h1>
            </div>

            {/* Form and Video Section */}
            <div className="flex-1 max-w-5xl">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-8">
                  <FormField control={form.control} name="url" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xl">VT URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Tiktok video URL (e.g. https://vt.tiktok.com/XXXXXX)" 
                          className="text-lg py-3"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-base">
                        Please provide the tiktok video URL to download
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="flex gap-3">
                    <Button type="submit" size="lg" disabled={isLoading} className="flex-1 max-w-xs">
                      {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
                      {isLoading ? "Processing..." : "Download"}
                    </Button>
                    {videoData && (
                      <Button type="button" variant="neutral" size="lg" onClick={resetForm}>
                        New Video
                      </Button>
                    )}
                  </div>
                </form>
              </Form>

              {/* Video Results - Side by Side on Desktop */}
              {videoData?.data && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <VideoPlayer 
                    videoData={videoData.data} 
                    currentTime={videoCurrentTime}
                    isPlaying={videoIsPlaying}
                    onTimeUpdate={handleTimeUpdate}
                    onPlayStateChange={handlePlayStateChange}
                    isActive={activePlayer === 'desktop'}
                  />
                  <DownloadOptions videoData={videoData.data} onDownload={handleDownload} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}