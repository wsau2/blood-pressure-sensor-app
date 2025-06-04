// // serial-server.js
// const { SerialPort } = require('serialport');
// const WebSocket = require('ws');

// const port = new SerialPort({ path: '/dev/tty.usbmodem14401', baudRate: 9600 }); // Replace with your Arduino port
// const wss = new WebSocket.Server({ port: 8082 });

// wss.on('connection', (ws) => {
//   console.log('Frontend connected');
  

//   ws.on('message', (message) => {
//     console.log('Received from frontend:', message);
//     port.write(message); // Send character to Arduino
//   });
// });

// port.on('data', (data) => {
//   const value = data.toString().trim();
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(value);
//     }
//   });
// });

// console.log('WebSocket server running on ws://localhost:8082');

