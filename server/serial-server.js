// serial-server.js
const { SerialPort } = require('serialport');
const WebSocket = require('ws');

async function findArduinoPort() {
  const ports = await SerialPort.list();
  // Try to find a port with 'Arduino' or 'usbmodem' in the manufacturer/path
  const arduinoPort = ports.find(
    port =>
      // (port.manufacturer && port.manufacturer.includes('Arduino')) ||
      (port.path && port.path.includes('usbmodem'))
  );
  return arduinoPort ? arduinoPort.path : null;
}

async function startServer() {
  const path = await findArduinoPort();
  if (!path) {
    console.error('Arduino port not found!');
    process.exit(1);
  }
  const port = new SerialPort({ path, baudRate: 9600 });
  const wss = new WebSocket.Server({ port: 8082 });

  wss.on('connection', (ws) => {
    console.log('Frontend connected');
    ws.on('message', (message) => {
      console.log('Received from frontend:', message);
      port.write(message);
    });
  });

  port.on('data', (data) => {
    const value = data.toString().trim();
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(value);
      }
    });
  });

  console.log(`WebSocket server running on ws://localhost:8082 (Serial: ${path})`);
}

startServer();

