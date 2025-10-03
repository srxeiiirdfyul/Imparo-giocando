
import React, { useState } from 'react';
import { GameType } from './types';
import { BookIcon, MathIcon, PaintIcon, RulerIcon } from './components/icons';
import WordGame from './components/WordGame';
import MathGame from './components/MathGame';
import DrawingGame from './components/DrawingGame';

interface GameCardProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  disabled?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ title, icon, color, onClick, disabled }) => {
  const baseClasses = `relative group w-full h-48 md:h-56 flex flex-col items-center justify-center p-4 rounded-3xl shadow-lg text-white font-black text-3xl md:text-4xl text-center cursor-pointer transform transition-transform duration-300`;
  const hoverClasses = disabled ? 'cursor-not-allowed' : 'hover:scale-105 hover:shadow-2xl';
  const disabledClasses = disabled ? 'opacity-60' : '';
  
  return (
    <div onClick={!disabled ? onClick : undefined} className={`${baseClasses} ${hoverClasses} ${disabledClasses}`} style={{ backgroundColor: color }}>
      <div className="mb-3">{icon}</div>
      <p>{title}</p>
      {disabled && (
        <div className="absolute bottom-4 px-4 py-1 bg-gray-800 bg-opacity-70 rounded-full text-sm font-bold">
          Prossimamente!
        </div>
      )}
    </div>
  );
};

const HomePage = ({ onGameSelect }: { onGameSelect: (game: GameType) => void }) => {
  return (
    <div className="flex flex-col items-center p-4 md:p-8">
      <h1 className="text-5xl md:text-7xl font-black text-center text-gray-800 mb-2">
        <span className="text-blue-500">Imparo</span> <span className="text-yellow-500">Giocando</span>
      </h1>
      <p className="text-xl text-gray-600 mb-8">Scegli un gioco per iniziare a divertirti!</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-6xl">
        <GameCard 
          title="Parole" 
          icon={<BookIcon className="w-16 h-16"/>}
          color="#3B82F6" 
          onClick={() => onGameSelect(GameType.Words)} 
        />
        <GameCard 
          title="Matematica" 
          icon={<MathIcon className="w-16 h-16"/>}
          color="#22C55E" 
          onClick={() => onGameSelect(GameType.Math)} 
        />
        <GameCard 
          title="Misure" 
          icon={<RulerIcon className="w-16 h-16"/>}
          color="#F97316" 
          onClick={() => {}}
          disabled 
        />
        <GameCard 
          title="Disegno" 
          icon={<PaintIcon className="w-16 h-16"/>}
          color="#A855F7" 
          onClick={() => onGameSelect(GameType.Drawing)} 
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentGame, setCurrentGame] = useState<GameType>(GameType.Home);

  const renderGame = () => {
    switch (currentGame) {
      case GameType.Home:
        return <HomePage onGameSelect={setCurrentGame} />;
      case GameType.Words:
        return <WordGame onBack={() => setCurrentGame(GameType.Home)} />;
      case GameType.Math:
        return <MathGame onBack={() => setCurrentGame(GameType.Home)} />;
      case GameType.Drawing:
        return <DrawingGame onBack={() => setCurrentGame(GameType.Home)} />;
      default:
        return <HomePage onGameSelect={setCurrentGame} />;
    }
  };

  return (
    <main className="min-h-screen bg-blue-50 w-full flex items-center justify-center transition-colors duration-500">
      {renderGame()}
    </main>
  );
};

export default App;
