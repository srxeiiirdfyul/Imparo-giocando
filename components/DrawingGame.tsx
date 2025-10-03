
import React, { useRef, useEffect, useState } from 'react';

const COLORS = ['#000000', '#EF4444', '#3B82F6', '#22C55E', '#F97316', '#FDE047', '#A855F7', '#EC4899'];

interface DrawingGameProps {
  onBack: () => void;
}

const DrawingGame: React.FC<DrawingGameProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Adjust for device pixel ratio for sharper drawing
    const scale = window.devicePixelRatio;
    canvas.width = canvas.offsetWidth * scale;
    canvas.height = canvas.offsetHeight * scale;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.scale(scale, scale);
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = 5;
    contextRef.current = context;
  }, []);
  
  useEffect(() => {
    if(contextRef.current) {
        contextRef.current.strokeStyle = color;
    }
  }, [color]);

  const startDrawing = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
    const { offsetX, offsetY } = getCoords(nativeEvent);
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoords(nativeEvent);
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
  };

  const getCoords = (event: MouseEvent | Touch) => {
    const canvas = canvasRef.current;
    if(!canvas) return {offsetX: 0, offsetY: 0};
    const rect = canvas.getBoundingClientRect();
     if (event instanceof MouseEvent) {
      return { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
    } else { // Touch event
      return { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => startDrawing({ nativeEvent: e.touches[0] } as any);
  const handleTouchMove = (e: React.TouchEvent) => draw({ nativeEvent: e.touches[0] } as any);
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <div className="w-full max-w-4xl p-4 bg-white rounded-2xl shadow-lg border-4 border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
          <h2 className="text-3xl font-bold text-purple-600">Disegno Libero</h2>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} className={`w-10 h-10 rounded-full transition-transform duration-150 ${color === c ? 'ring-4 ring-offset-2 ring-blue-500 transform scale-110' : 'ring-2 ring-gray-300'}`} style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={clearCanvas} className="px-6 py-2 bg-yellow-400 text-yellow-900 font-bold rounded-lg shadow-md hover:bg-yellow-500 transition-colors">Pulisci</button>
            <button onClick={onBack} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg shadow-md hover:bg-gray-300 transition-colors">Indietro</button>
          </div>
        </div>
        <canvas
          ref={canvasRef}
          className="w-full h-[60vh] bg-gray-50 rounded-lg cursor-crosshair touch-none border-2 border-gray-300"
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseMove={draw}
          onMouseLeave={finishDrawing}
          onTouchStart={handleTouchStart}
          onTouchEnd={finishDrawing}
          onTouchMove={handleTouchMove}
        />
      </div>
    </div>
  );
};

export default DrawingGame;
