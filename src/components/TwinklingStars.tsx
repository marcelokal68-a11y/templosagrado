import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export default function TwinklingStars({ count = 40 }: { count?: number }) {
  const [stars] = useState<Star[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    }))
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: `hsl(38 80% ${55 + Math.random() * 20}%)`,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
