// serial-server.js
const { SerialPort } = require('serialport');
const WebSocket = require('ws');

const port = new SerialPort({ path: '/dev/tty.usbmodem14401', baudRate: 9600 }); // Replace with your Arduino port
const wss = new WebSocket.Server({ port: 8082 });

port.on('data', (data) => {
  const value = data.toString().trim();
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(value);
    }
  });
});

console.log('WebSocket server running on ws://localhost:8082');


// // Listening for keyboard input and send to serial port
// process.stdin.setRawMode(true)
// process.stdin.resume()
// process.stdin.setEncoding('utf-8')

// process.stdin.on('data', (key) => {
//   if (key === '\u0003') { // Ctrl+C to exit
//     process.exit();
//   }
//   console.log(key)
//   port.write(key);
// })