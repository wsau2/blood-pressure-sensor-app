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
  console.log("app renders")

  
  const [recording, setRecording] = useState(false);
  const [waitingForStalled, setWaitingForStalled] = useState(false);
  const [showHome, setShowHome] = useState(false);

  // Track current values in .current to avoid stale closures
  const recordingRef = useRef(recording);
  const waitingForStalledRef = useRef(waitingForStalled);

  const adcValueRef = useRef(null);
  const elapsedRef = useRef(null)
  const adcRecordingsRef = useRef([])
  const adcBufferRef = useRef('');

  useEffect(() => {
    recordingRef.current = recording;
  }, [recording]);

  useEffect(() => {
    waitingForStalledRef.current = waitingForStalled;
  }, [waitingForStalled]);

  useEffect(() => {
    connectWebSocket();

    const handleMessage = (data) => {
      adcBufferRef.current += data;

      // Regex to match a complete message: ADC: ... | Elapsed: ...ms | Status: ...
      const messageRegex = /ADC:\s*(-?\d+)\s*\|\s*Elapsed:\s*(\d+)ms\s*\|\s*Status:\s*([A-Za-z]+)/g;
      let match;
      let lastIndex = 0;

      while ((match = messageRegex.exec(adcBufferRef.current)) !== null) {
        adcValueRef.current = parseInt(match[1], 10);
        elapsedRef.current = match[2];
        const status = match[3];

        // adcValueRef.current = currAdcValue;
        // elapsedRef.current = currElapsed

        // console.log(adcValueRef.current)

        // If recording in progress, record non-null adc values in adcBuffer
        if (recordingRef.current) {
          adcRecordingsRef.current.push(adcValueRef.current)
        }

        // Handle STALLED → start recording
        if (waitingForStalledRef.current && status === 'STALLED') {
          console.log("Stalled -- start recording")
          setWaitingForStalled(false);
          setRecording(true);
          adcRecordingsRef.current = []
        }

        // Handle IDLE → stop recording and show result
        if (recordingRef.current && status === 'IDLE') {
          console.log("IDLE -- stop recording")
          setRecording(false);
          recordingRef.current = false;
          setShowHome(false);
          if (adcRecordingsRef.current.length > 0) {
            console.log('ADC Buffer:', adcRecordingsRef.current);
          }
        }

        lastIndex = messageRegex.lastIndex;
      }

      // Remove processed messages from buffer, keep incomplete part
      adcBufferRef.current = adcBufferRef.current.slice(lastIndex);
    };

    addMessageListener(handleMessage);

    return () => {
      removeMessageListener(handleMessage);
    };
  }, [showHome, adcRecordingsRef]);

  const handleControlPanelPress = (key) => {
    if (key === 'j') {
      console.log('Waiting for STALLED status...');
      setShowHome(true);
      setWaitingForStalled(true);
      setRecording(false);
      adcRecordingsRef.current = []
    }
  };


  // const value = React.useMemo(() => ({
  //   adcValueRef,
  //   elapsedRef,
  //   recording,
  //   adcRecordingsRef
  // }), [adcValueRef, elapsedRef, recording, adcRecordingsRef]);


  return (
    <DataContext.Provider value={{adcValueRef, elapsedRef, recording, adcRecordingsRef}}>
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
