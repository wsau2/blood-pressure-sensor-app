import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import BloodPressureDisplay from '../components/BloodPressureDisplay';
import Graph from '../components/Graph';
import Statistics from '../components/Statistics';
import Header from '../components/header';
import { DataContext } from '../contexts/DataContext';

import {
  connectWebSocket,
  addMessageListener,
  removeMessageListener,
  closeWebSocket,
} from '../components/webSocketService.js'
import ControlPanel from '../components/ControlPanel.js';

const Results = ({ onStatusChange, onAdcValue, isRecording }) => {
  const [dataPoints, setDataPoints] = useState([]);


  const date = 'Mon, Aug 23';
  const systolic = 122;
  const diastolic = 82;
  const avgBpm = 92;
  const minBpm = 72;
  const maxBpm = 180;
  

  useEffect(() => {
      connectWebSocket();
  
      const handleMessage = (data) => {
        
        const match = data.match(/ADC:\s*(\d+)/);
        const adcValue = match ? parseInt(match[1], 10) : null;

        const matchStatus = data.match(/Status:\s*([A-Za-z]+)/);
        const status = matchStatus ? matchStatus[1] : null;

        if (status && onStatusChange) {
          onStatusChange(status);
        }        
  
        if (adcValue !== null) {
          setDataPoints((prev) => {
            const updated = [...prev, adcValue];
            return updated.slice(-100); // Keep only the last 1000 points ~10 seconds
          });
          onAdcValue(adcValue); // Pass ADC value up to App.js
        }
      };
  
      addMessageListener(handleMessage);
  
      return () => {
        removeMessageListener(handleMessage);
        // closeWebSocket(); // Optional: uncomment if you want to fully close it on unmount
      };
    }, [onAdcValue]);

  return (
    <View style={styles.container}>
      <Header date={date} />
      <DataContext.Provider value={{ dataPoints, setDataPoints }}>
        <BloodPressureDisplay systolic={systolic} diastolic={diastolic} />
        <Graph />
        <Statistics avg={avgBpm} min={minBpm} max={maxBpm} />
      </DataContext.Provider> 
      {/* <ControlPanel/> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    width: '80%',
    backgroundColor: '#ffffff',
  },
});


export default Results;
