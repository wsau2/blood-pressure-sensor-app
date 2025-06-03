// App.js
import React, {useEffect, useState, useRef} from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Home from './pages/Home'; 
import Results from './pages/Results'; 
import KeyboardListener from './components/KeyboardListener.js';
import ControlPanel from './components/ControlPanel.js';


export default function App() {
  const [showHome, setShowHome] = useState(false);
  const [recording, setRecording] = useState(false);
  const [adcBuffer, setAdcBuffer] = useState([]);
  const [waitingForStalled, setWaitingForStalled] = useState(false);

  const recordingRef = useRef(recording);
  const waitingForStalledRef = useRef(waitingForStalled);
  const handleAdcValueRef = useRef();

  useEffect(() => {
    recordingRef.current = recording;
  }, [recording]);
  useEffect(() => {
    waitingForStalledRef.current = waitingForStalled;
  }, [waitingForStalled]);

  const handleControlPanelPress = (key) => {
    if (key === 'j') {
      setShowHome(true);
      setWaitingForStalled(true);
      setRecording(false);
      setAdcBuffer([]);
      console.log("waiting for status STALLED");
    }
  };

  const handleStatusIdle = (status) => {

    if (waitingForStalledRef.current && status === "STALLED") {
      setRecording(true);
      setAdcBuffer([]);
      setWaitingForStalled(false);
      console.log("STALLED received, start recording");
      return;
    }

    if (recordingRef.current && status === "IDLE") {
      setShowHome(false);
      setRecording(false);
      console.log("IDLE received, stop recording");
      if (adcBuffer.length > 0) {
        console.log(adcBuffer);
      }
    }
  };

  const handleAdcValue = (adcValue) => {
    if (handleAdcValueRef.current) {
      handleAdcValueRef.current(adcValue);
    }
  };

  useEffect(() => {
    handleAdcValueRef.current = (adcValue) => {
      if (recordingRef.current) {
        setAdcBuffer(prev => [...prev, adcValue]);
      }
    };
  }, [recording]); // update ref when recording changes

  return (
    <SafeAreaView style={styles.container}>
      <Results onStatusChange={handleStatusIdle} onAdcValue={handleAdcValue} />
      <ControlPanel onButtonPress={handleControlPanelPress}/>
      <Home visible={showHome}/>
      <KeyboardListener/>
    </SafeAreaView>
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
