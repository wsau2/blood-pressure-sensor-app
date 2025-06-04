import { useEffect } from 'react';
import { connectWebSocket, sendMessage } from './webSocketService';

const KeyboardListener = () => {
  useEffect(() => {
    connectWebSocket();

    const handleKeyDown = (event) => {
      const key = event.key;
      sendMessage(key);
      console.log(key);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null; // No UI needed
};

export default KeyboardListener; 
