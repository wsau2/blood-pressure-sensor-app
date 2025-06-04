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
  const [dataPoints, setDataPoints] = useState([]);
  const [adcBuffer, setAdcBuffer] = useState([]);

  const [recording, setRecording] = useState(false);
  const [waitingForStalled, setWaitingForStalled] = useState(false);
  const [showHome, setShowHome] = useState(false);

  // Track current values in .current to avoid stale closures
  const recordingRef = useRef(recording);
  const waitingForStalledRef = useRef(waitingForStalled);

  // Elapsed Time
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    recordingRef.current = recording;
  }, [recording]);

  useEffect(() => {
    waitingForStalledRef.current = waitingForStalled;
  }, [waitingForStalled]);

  useEffect(() => {
    connectWebSocket();

    const handleMessage = (data) => {
      const adcMatch = data.match(/ADC:\s*(\d+)/);
      const statusMatch = data.match(/Status:\s*([A-Za-z]+)/);
      const elapsedMatch = data.match(/Elapsed:\s*(\d+)ms/);


      const adcValue = adcMatch ? parseInt(adcMatch[1], 10) : null;
      const status = statusMatch ? statusMatch[1] : null;
      if (elapsedMatch) { setElapsed(elapsedMatch[1])}

      // Update chart with recent 100 values
      if (adcValue !== null) {
        setDataPoints((prev) => {
          const updated = [...prev, adcValue];
          return updated.slice(-100);
        });

        // Record if currently recording
        if (recordingRef.current) {
          setAdcBuffer((prev) => [...prev, adcValue]);
        }
      }

      // Handle STALLED → start recording
      if (waitingForStalledRef.current && status === 'STALLED') {
        console.log('STALLED received, start recording');
        setWaitingForStalled(false);
        setRecording(true);
        setAdcBuffer([]);
      }

      // Handle IDLE → stop recording and show result
      if (recordingRef.current && status === 'IDLE') {
        console.log('IDLE received, stop recording');
        setRecording(false);
        recordingRef.current = false
        setShowHome(false);
        if (adcBuffer.length > 0) {
          console.log('ADC Buffer:', adcBuffer);
        }
      }

      // if (showHome && status) {
      //   console.log('Status:', status);
      // }
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
    <DataContext.Provider value={{ dataPoints, adcBuffer, recording, elapsed }}>
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
