
import React, { useState, useEffect, useCallback } from 'react';
import { getMathGameChallenge } from '../services/geminiService';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface MathGameProps {
  onBack: () => void;
}

interface MathChallenge {
  num1: number;
  num2: number;
  answer: number;
  imageUrl: string;
  options: number[];
}

const LoadingSpinner = () => (
    <div className="w-20 h-20 border-8 border-dashed rounded-full animate-spin border-blue-600"></div>
);

const MathGame: React.FC<MathGameProps> = ({ onBack }) => {
  const [challenge, setChallenge] = useState<MathChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | ''>('');
  const { speak } = useTextToSpeech();

  const fetchNewChallenge = useCallback(async () => {
    setIsLoading(true);
    setFeedback('');
    setSelectedAnswer(null);
    const newChallenge = await getMathGameChallenge();
    setChallenge(newChallenge);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchNewChallenge();
  }, [fetchNewChallenge]);
  
  useEffect(() => {
    if (challenge && !isLoading) {
      speak(`${challenge.num1} più ${challenge.num2} fa?`);
    }
  }, [challenge, isLoading, speak]);

  const handleAnswerSelect = (option: number) => {
    if (feedback) return;
    setSelectedAnswer(option);
    if (option === challenge?.answer) {
      setFeedback('correct');
      speak('Giusto!');
    } else {
      setFeedback('incorrect');
      speak('Riprova!');
    }
  };

  const getButtonClass = (option: number) => {
    if (!feedback) {
      return 'bg-blue-500 hover:bg-blue-600';
    }
    if (option === challenge?.answer) {
      return 'bg-green-500 scale-110';
    }
    if (option === selectedAnswer && option !== challenge?.answer) {
      return 'bg-red-500';
    }
    return 'bg-gray-400';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <LoadingSpinner />
        <p className="mt-4 text-2xl font-bold text-gray-600">Preparo una domanda...</p>
      </div>
    );
  }

  if (!challenge) {
    return <div className="text-center text-red-500">Errore nel caricamento del gioco.</div>;
  }
  
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <div className="w-full max-w-3xl p-6 bg-white rounded-3xl shadow-2xl border-4 border-yellow-300">
        <h2 className="text-3xl md:text-4xl font-black text-center text-blue-800 mb-4">Quanto fa?</h2>
        <div className="aspect-square w-full max-w-md mx-auto bg-gray-100 rounded-2xl mb-4 overflow-hidden shadow-inner">
          <img src={challenge.imageUrl} alt="Visual representation of the math problem" className="w-full h-full object-contain" />
        </div>

        <div className="text-5xl md:text-7xl font-bold text-center text-gray-700 mb-6 tracking-wider">
          {challenge.num1} + {challenge.num2} = ?
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {challenge.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswerSelect(option)}
              disabled={!!feedback}
              className={`p-4 text-5xl font-bold text-white rounded-2xl shadow-lg transform transition-all duration-300 ${getButtonClass(option)}`}
            >
              {option}
            </button>
          ))}
        </div>
        
        {feedback && (
          <div className="text-center text-3xl font-bold">
            {feedback === 'correct' ? <p className="text-green-600">Ottimo lavoro! 🎉</p> : <p className="text-red-600">Non è corretto, ma puoi riprovare!</p>}
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
            <button onClick={onBack} className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl shadow-md hover:bg-gray-300 transition-colors">Indietro</button>
            {feedback === 'correct' && (
                <button onClick={fetchNewChallenge} className="px-6 py-3 bg-yellow-400 text-yellow-900 font-bold rounded-xl shadow-md hover:bg-yellow-500 transition-colors animate-pulse">Prossimo!</button>
            )}
        </div>
      </div>
    </div>
  );
};

export default MathGame;
