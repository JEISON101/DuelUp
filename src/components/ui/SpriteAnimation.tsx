import { useEffect, useState } from "react";
import sprite from "../../assets/sprite.webp";

const COLS = 6;
const ROWS = 3;
const FRAMES = Array.from({ length: COLS * ROWS }, (_, n) => n);
const FPS = 6;

export default function SpriteAnimation({ width = 260 }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % FRAMES.length), 1000 / FPS);
    return () => clearInterval(id);
  }, []);

  const frame = FRAMES[i];
  const x = ((frame % COLS) / (COLS - 1)) * 100;
  const y = (Math.floor(frame / COLS) / (ROWS - 1)) * 100;

  return (
    <div
      className="bg-no-repeat"
      style={{
        width,
        height: width * (256 / 234),
        backgroundImage: `url(${sprite})`,
        backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
        backgroundPosition: `${x}% ${y}%`,
      }}
    />
  );
}