
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getWordGameChallenge } from '../services/geminiService';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface WordGameProps {
  onBack: () => void;
}

interface WordChallenge {
  word: string;
  imageUrl: string;
}

const LoadingSpinner = () => (
    <div className="w-20 h-20 border-8 border-dashed rounded-full animate-spin border-purple-600"></div>
);

// Function to shuffle an array
const shuffle = <T,>(array: T[]): T[] => {
  return array.sort(() => Math.random() - 0.5);
};

const WordGame: React.FC<WordGameProps> = ({ onBack }) => {
  const [challenge, setChallenge] = useState<WordChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | ''>('');
  const { speak } = useTextToSpeech();

  const letterOptions = useMemo(() => {
    if (!challenge) return [];
    const wordChars = challenge.word.split('');
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const distractors: string[] = [];
    while (distractors.length < 4) {
      const char = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!wordChars.includes(char) && !distractors.includes(char)) {
        distractors.push(char);
      }
    }
    return shuffle([...wordChars, ...distractors]);
  }, [challenge]);

  const fetchNewChallenge = useCallback(async () => {
    setIsLoading(true);
    setUserInput([]);
    setFeedback('');
    const newChallenge = await getWordGameChallenge();
    setChallenge(newChallenge);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchNewChallenge();
  }, [fetchNewChallenge]);
  
  useEffect(() => {
    if (challenge && !isLoading) {
        speak(`Componi la parola`);
    }
  }, [challenge, isLoading, speak]);

  const handleLetterClick = (letter: string) => {
    if (feedback) return;
    if (userInput.length < (challenge?.word.length || 0)) {
        setUserInput([...userInput, letter]);
    }
  };
  
  const handleBackspace = () => {
    if (feedback) return;
    setUserInput(userInput.slice(0, -1));
  };
  
  const checkAnswer = () => {
    if(userInput.join('') === challenge?.word) {
        setFeedback('correct');
        speak(`${challenge?.word}! Bravissimo!`);
    } else {
        setFeedback('incorrect');
        speak('Non è giusto, riprova!');
        setTimeout(() => {
            setFeedback('');
            setUserInput([]);
        }, 1500);
    }
  };
  
  useEffect(() => {
    if (challenge && userInput.length === challenge.word.length) {
        checkAnswer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInput, challenge]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <LoadingSpinner />
        <p className="mt-4 text-2xl font-bold text-gray-600">Cerco una nuova parola...</p>
      </div>
    );
  }

  if (!challenge) {
    return <div className="text-center text-red-500">Errore nel caricamento del gioco.</div>;
  }
  
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <div className="w-full max-w-3xl p-6 bg-white rounded-3xl shadow-2xl border-4 border-pink-300">
        <h2 className="text-3xl md:text-4xl font-black text-center text-purple-800 mb-4">Componi la parola</h2>
        <div className="aspect-square w-full max-w-md mx-auto bg-gray-100 rounded-2xl mb-4 overflow-hidden shadow-inner">
          <img src={challenge.imageUrl} alt="Oggetto da indovinare" className="w-full h-full object-contain" />
        </div>

        <div className="flex justify-center items-center gap-2 md:gap-4 mb-6 h-20">
            {challenge.word.split('').map((_, index) => (
                <div key={index} className={`flex items-center justify-center w-16 h-16 md:w-20 md:h-20 text-5xl font-bold rounded-2xl shadow-inner transition-colors duration-300 
                ${feedback === 'correct' ? 'bg-green-200 text-green-800' : feedback === 'incorrect' ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-700'}`}>
                    {userInput[index] || ''}
                </div>
            ))}
        </div>
        
        <div className="flex justify-center flex-wrap gap-2 md:gap-3 mb-6">
            {letterOptions.map((letter, index) => (
                <button key={index} onClick={() => handleLetterClick(letter)}
                 className="w-14 h-14 md:w-16 md:h-16 text-4xl font-bold text-white bg-blue-500 rounded-xl shadow-lg transform hover:scale-110 transition-transform disabled:opacity-50 disabled:transform-none"
                 disabled={!!feedback}>
                    {letter}
                </button>
            ))}
            <button onClick={handleBackspace} className="w-14 h-14 md:w-16 md:h-16 text-4xl font-bold text-white bg-red-500 rounded-xl shadow-lg transform hover:scale-110 transition-transform disabled:opacity-50"
                 disabled={!!feedback}>
                 &#9003;
            </button>
        </div>

        <div className="flex justify-between items-center mt-6">
            <button onClick={onBack} className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl shadow-md hover:bg-gray-300 transition-colors">Indietro</button>
            {feedback === 'correct' && (
                <button onClick={fetchNewChallenge} className="px-6 py-3 bg-pink-400 text-white font-bold rounded-xl shadow-md hover:bg-pink-500 transition-colors animate-pulse">Prossima Parola!</button>
            )}
        </div>
      </div>
    </div>
  );
};

export default WordGame;
