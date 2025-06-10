import { useEffect } from 'react';
import { connectWebSocket, sendMessage } from './webSocketService';
import { Platform } from 'react-native';

const KeyboardListener = () => {
  useEffect(() => {
    connectWebSocket();

    if (Platform.OS === 'web') {
      const handleKeyDown = (event) => {
        const key = event.key;
        sendMessage(key);
        console.log(key);
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);

  return null; // No UI needed
};

export default KeyboardListener;
