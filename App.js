import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Home from './pages/Home';
import Results from './pages/Results';
import KeyboardListener from './components/KeyboardListener';
import ControlPanel from './components/ControlPanel';
import getBloodPressure from './components/getBloodPressure';

import {
  connectWebSocket,
  addMessageListener,
  removeMessageListener,
} from './components/webSocketService';
import { DataContext } from './contexts/DataContext';
import ResultGraph from './components/ResultGraph';

export default function App() {
  console.log("app renders")

  const isRecording = useRef(false);
  const waitingForStalled = useRef(false);
  const [showHome, setShowHome] = useState(false);
  const adcValueRef = useRef(null);
  const elapsedRef = useRef(null)
  const recordingArr = useRef([])
  const adcBufferRef = useRef('');

  const processedData = useRef([]);

  useEffect(() => {
    connectWebSocket();

    const handleMessage = (data) => {
      adcBufferRef.current += data;

      // Regex to match a complete message: ADC: ... | Elapsed: ...ms | Status: ...
      const messageRegex = /ADC:\s*(-?\d+)\s*\|\s*Elapsed:\s*(\d+)ms\s*\|\s*Status:\s*([A-Za-z]+)/g;
      let match;
      let lastIndex = 0;

      while ((match = messageRegex.exec(adcBufferRef.current)) !== null) {
        adcValueRef.current = parseInt(match[1], 10) * (Math.random() * 0.2 + 0.9);
        elapsedRef.current = match[2];
        const status = match[3];

        // If recording in progress, record non-null adc values in adcBuffer
        if (isRecording.current) {
          recordingArr.current.push(adcValueRef.current)
        }

        // Handle STALLED → start recording
        if (waitingForStalled.current && status === 'STALLED') {
          console.log("Stalled -- start recording")
          waitingForStalled.current = false;
          isRecording.current = true;
          recordingArr.current = []
        }

        // Handle IDLE → stop recording and show result
        if (isRecording.current && status === 'IDLE') {
          console.log("IDLE -- stop recording")
          isRecording.current = false;
          isRecording.current = false;
          setShowHome(false)
          // if (recordingArr.current.length > 0) {
          //   console.log('ADC Buffer:', recordingArr.current);
          // }
          processedData.current = getBloodPressure(recordingArr.current);
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
  }, [showHome, recordingArr]);

  const handleControlPanelPress = (key) => {
    if (key === 'j') {
      console.log('Waiting for STALLED status...');
      setShowHome(true)
      waitingForStalled.current = true;
      isRecording.current = false;
      recordingArr.current = []
    }
  };

  return (
    <DataContext.Provider value={{adcValueRef, elapsedRef, isRecording, recordingArr, processedData}}>
      <SafeAreaView style={styles.container}>
        <Results />
        <ControlPanel onButtonPress={handleControlPanelPress} />
        {/* <ResultGraph/> */}
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
