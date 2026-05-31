import { useEffect, useRef, useCallback } from "react";

const FADE_MS = 500;
const FADE_OUT_LEAD = 0.55;

export default function FadingVideo({
  src,
  className,
  style,
}: {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rAFRef = useRef(0);
  const fadingOutRef = useRef(false);

  const fadeTo = useCallback((target: number, duration: number) => {
    cancelAnimationFrame(rAFRef.current);
    const el = videoRef.current;
    if (!el) return;
    const start = performance.now();
    const startOpacity = parseFloat(el.style.opacity) || 0;
    const delta = target - startOpacity;

    function step(now: number) {
      const p = Math.min((now - start) / duration, 1);
      el!.style.opacity = String(startOpacity + delta * p);
      if (p < 1) rAFRef.current = requestAnimationFrame(step);
    }
    rAFRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.src = src;
    video.style.opacity = "0";

    const onLoaded = () => {
      video.style.opacity = "0";
      video.play().catch(() => {});
      fadeTo(1, FADE_MS);
    };

    const onTimeUpdate = () => {
      if (!fadingOutRef.current && video.duration - video.currentTime <= FADE_OUT_LEAD && video.duration - video.currentTime > 0) {
        fadingOutRef.current = true;
        fadeTo(0, FADE_MS);
      }
    };

    const onEnded = () => {
      video.style.opacity = "0";
      setTimeout(() => {
        video.currentTime = 0;
        fadingOutRef.current = false;
        video.play().catch(() => {});
        fadeTo(1, FADE_MS);
      }, 100);
    };

    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);

    if (video.readyState >= 2) onLoaded();

    return () => {
      cancelAnimationFrame(rAFRef.current);
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, [src, fadeTo]);

  return (
    <video
      ref={videoRef}
      muted
      playsInline
      preload="auto"
      className={className}
      style={{ opacity: 0, willChange: "opacity", ...style }}
    />
  );
}
