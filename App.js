import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Home from './pages/Home';
import Results from './pages/Results';
import KeyboardListener from './components/KeyboardListener';
import ControlPanel from './components/ControlPanel';
import {
  connectWebSocket,
  addMessageListener,
  removeMessageListener,
} from './components/webSocketService';
import { DataContext } from './contexts/DataContext';

export default function App() {
  const [adcBuffer, setAdcBuffer] = useState([]);
  const [adcValue, setAdcValue] = useState(null);

  const [recording, setRecording] = useState(false);
  const [waitingForStalled, setWaitingForStalled] = useState(false);
  const [showHome, setShowHome] = useState(false);

  // Track current values in .current to avoid stale closures
  const recordingRef = useRef(recording);
  const waitingForStalledRef = useRef(waitingForStalled);

  // Elapsed Time
  const [elapsed, setElapsed] = useState(0)

  const bufferRef = useRef(''); // <-- Add a buffer ref

  useEffect(() => {
    recordingRef.current = recording;
  }, [recording]);

  useEffect(() => {
    waitingForStalledRef.current = waitingForStalled;
  }, [waitingForStalled]);

  useEffect(() => {
    connectWebSocket();

    const handleMessage = (data) => {
      bufferRef.current += data;

      // Regex to match a complete message: ADC: ... | Elapsed: ...ms | Status: ...
      const messageRegex = /ADC:\s*(-?\d+)\s*\|\s*Elapsed:\s*(\d+)ms\s*\|\s*Status:\s*([A-Za-z]+)/g;
      let match;
      let lastIndex = 0;

      while ((match = messageRegex.exec(bufferRef.current)) !== null) {
        const currAdcValue = parseInt(match[1], 10);
        const currElapsed = match[2];
        const status = match[3];

        setAdcValue(currAdcValue);
        setElapsed(currElapsed);

      

        // If recording in progress, record non-null adc values in adcBuffer
        if (recordingRef.current) {
          setAdcBuffer((prev) => [...prev, currAdcValue]);
        }

        // Handle STALLED → start recording
        if (waitingForStalledRef.current && status === 'STALLED') {
          setWaitingForStalled(false);
          setRecording(true);
          setAdcBuffer([]);
        }

        // Handle IDLE → stop recording and show result
        if (recordingRef.current && status === 'IDLE') {
          setRecording(false);
          recordingRef.current = false;
          setShowHome(false);
          if (adcBuffer.length > 0) {
            console.log('ADC Buffer:', adcBuffer);
          }
        }

        lastIndex = messageRegex.lastIndex;
      }

      // Remove processed messages from buffer, keep incomplete part
      bufferRef.current = bufferRef.current.slice(lastIndex);
    };

    addMessageListener(handleMessage);

    return () => {
      removeMessageListener(handleMessage);
    };
  }, [showHome, adcBuffer]);

  const handleControlPanelPress = (key) => {
    if (key === 'j') {
      console.log('Waiting for STALLED status...');
      setShowHome(true);
      setWaitingForStalled(true);
      setRecording(false);
      setAdcBuffer([]);
    }
  };

  return (
    <DataContext.Provider value={{ adcValue, adcBuffer, recording, elapsed }}>
      <SafeAreaView style={styles.container}>
        <Results />
        <ControlPanel onButtonPress={handleControlPanelPress} />
        <Home visible={showHome} />
        <KeyboardListener />
      </SafeAreaView>
    </DataContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
