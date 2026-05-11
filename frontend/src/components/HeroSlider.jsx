import { useState, useEffect, useCallback } from 'react';
import api from '../api';

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api.get('/carousel').then((res) => setSlides(res.data)).catch(() => {});
  }, []);

  // 自動換頁，每 5 秒切換一張
  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer); // 元件卸載時清除計時器
  }, [next, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="w-full h-64 sm:h-80 md:h-[460px] lg:h-[560px] xl:h-[640px] bg-temple-green/10 flex items-center justify-center">
        <span className="text-temple-green/40 font-serif text-lg">載入中...</span>
      </div>
    );
  }

  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full overflow-hidden h-64 sm:h-80 md:h-[460px] lg:h-[560px] xl:h-[640px]">
      {/* 圖片 */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            idx === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={slide.image_url}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          {/* 漸層遮罩讓文字更清楚 */}
          <div className="absolute inset-0 carousel-overlay" />
        </div>
      ))}

      {/* 文字標題 */}
      <div className="absolute bottom-8 left-0 right-0 text-center text-white px-4">
        <h2 className="font-serif text-2xl md:text-4xl font-bold drop-shadow-lg">
          {slides[current]?.title}
        </h2>
        {slides[current]?.description && (
          <p className="mt-2 text-sm md:text-base text-white/90 drop-shadow">
            {slides[current].description}
          </p>
        )}
      </div>

      {/* 左右切換按鈕 */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition"
          >
            ›
          </button>

          {/* 底部圓點指示 */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === current ? 'bg-temple-gold w-5' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
