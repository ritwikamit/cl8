import { useState, useEffect, useRef } from "react";

export function useTypewriter(
  text: string,
  speed = 38,
  startDelay = 600,
): { displayed: string; done: boolean } {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      if (indexRef.current >= text.length) {
        setDone(true);
        clearInterval(interval);
        return;
      }
      setDisplayed(text.slice(0, indexRef.current + 1));
      indexRef.current++;
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed]);

  return { displayed, done };
}
