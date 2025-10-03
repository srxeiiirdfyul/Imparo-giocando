
import { useCallback } from 'react';

export const useTextToSpeech = () => {
  const speak = useCallback((text: string, lang = 'it-IT') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      
      // Attempt to find an Italian voice
      const voices = window.speechSynthesis.getVoices();
      const italianVoice = voices.find(voice => voice.lang === 'it-IT');
      if (italianVoice) {
        utterance.voice = italianVoice;
      }

      window.speechSynthesis.cancel(); // Cancel any previous speech
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Text-to-speech not supported in this browser.');
    }
  }, []);

  return { speak };
};
