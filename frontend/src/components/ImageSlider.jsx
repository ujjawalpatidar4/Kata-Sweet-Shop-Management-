import React, { useEffect, useMemo, useRef, useState } from 'react';

export default function ImageSlider() {
  // Import all images from assets folder (png, jpg, jpeg, webp)
  const images = useMemo(() => {
    const modules = import.meta.glob('../assets/*.{png,jpg,jpeg,webp}', { eager: true });
    const list = Object.values(modules)
      .map((m) => m.default)
      .filter(Boolean);
    return list;
  }, []);

  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const hasImages = images.length > 0;

  useEffect(() => {
    if (!hasImages) return;
    // Auto-play every 4 seconds
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [hasImages, images.length]);

  const goPrev = () => {
    if (!hasImages) return;
    clearInterval(timerRef.current);
    setIndex((i) => (i - 1 + images.length) % images.length);
  };

  const goNext = () => {
    if (!hasImages) return;
    clearInterval(timerRef.current);
    setIndex((i) => (i + 1) % images.length);
  };

  if (!hasImages) {
    return null;
  }

  return (
    <div className="container section-tight">
      <div className="relative bg-white rounded-xl shadow overflow-hidden">
        <img
          src={images[index]}
          alt={`Slide ${index + 1}`}
          className="w-full h-56 sm:h-72 md:h-80 object-cover"
        />
        {/* Controls */}
        <button
          aria-label="Previous slide"
          onClick={goPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-2 shadow"
        >
          ‹
        </button>
        <button
          aria-label="Next slide"
          onClick={goNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-2 shadow"
        >
          ›
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 rounded-full ${i === index ? 'bg-sky-600' : 'bg-slate-300'} hover:bg-sky-500`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
