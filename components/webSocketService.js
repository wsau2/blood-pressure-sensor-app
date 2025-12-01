let ws = null;
let listeners = [];

export const connectWebSocket = (url = 'ws://127.0.0.1:8082') => {
  if (ws) return; // prevent reconnecting if already connected

  try {
    ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      listeners.forEach((callback) => callback(event.data));
    };

    ws.onerror = (error) => {
      // Silently fail - WebSocket server may not be running (using BLE instead)
      // Only log if in development mode
      if (__DEV__) {
        console.log('WebSocket not available (using BLE instead)');
      }
    };

    ws.onclose = () => {
      if (__DEV__) {
        console.log('WebSocket disconnected');
      }
      ws = null;
    };
  } catch (error) {
    // WebSocket connection failed - this is OK if using BLE
    if (__DEV__) {
      console.log('WebSocket connection not available (using BLE instead)');
    }
    ws = null;
  }
};

export const addMessageListener = (callback) => {
  listeners.push(callback);
};

export const removeMessageListener = (callback) => {
  listeners = listeners.filter((cb) => cb !== callback);
};

export const closeWebSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
    listeners = [];
  }
};

export const sendMessage = (message) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(message);
  }
};
