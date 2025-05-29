let ws = null;
let listeners = [];

export const connectWebSocket = (url = 'ws://127.0.0.1:8082') => {
  if (ws) return; // prevent reconnecting if already connected

  ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('WebSocket connected');
  };

  ws.onmessage = (event) => {
    listeners.forEach((callback) => callback(event.data));
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
    ws = null;
  };
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
