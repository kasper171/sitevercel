import { useEffect, useState } from "react";

interface Spark {
  id: number;
  x: number;
  y: number;
  angle: number;
}

export const ClickSpark = () => {
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const newSparks: Spark[] = [];
      const sparkCount = 8;

      for (let i = 0; i < sparkCount; i++) {
        newSparks.push({
          id: Date.now() + i,
          x: e.clientX,
          y: e.clientY,
          angle: (360 / sparkCount) * i,
        });
      }

      setSparks((prev) => [...prev, ...newSparks]);

      setTimeout(() => {
        setSparks((prev) => prev.filter((spark) => !newSparks.includes(spark)));
      }, 600);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {sparks.map((spark) => (
        <div
          key={spark.id}
          className="absolute"
          style={{
            left: spark.x,
            top: spark.y,
            transform: `rotate(${spark.angle}deg)`,
          }}
        >
          <div
            className="h-1 w-8 origin-left animate-fade-out rounded-full"
            style={{
              background: "linear-gradient(90deg, hsl(0 84% 60%), transparent)",
              animation: "spark-move 0.6s ease-out forwards",
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes spark-move {
          0% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateX(30px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
