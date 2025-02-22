import { useEffect, useState } from "react";
import Mint from "./components/Mint";

export default function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Consider <768px as mobile
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-900 text-white p-6">
        <h1 className="text-3xl font-bold mb-4">📵 Oh, using a phone? Cute.</h1>
        <p className="text-lg">
          This app isn't designed for mobile. Time to upgrade to a real machine. 💻
        </p>
        <p className="text-sm mt-2 text-gray-400">
          The future belongs to those with keyboards, not just touchscreens. 😉
        </p>
      </div>
    );
  }

  return <Mint />;
}
