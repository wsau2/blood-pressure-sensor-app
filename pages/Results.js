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

const Results = () => {
  const [dataPoints, setDataPoints] = useState([]);


  const date = 'Mon, Aug 23';
  const systolic = 122;
  const diastolic = 82;
  const avgBpm = Math.floor(dataPoints.length > 0 ? dataPoints.reduce((sum, val) => sum + val, 0) / dataPoints.length : 0);
  const minBpm = dataPoints.length > 0 ? Math.min(...dataPoints) : 0;
  const maxBpm = dataPoints.length > 0 ? Math.max(...dataPoints) : 0;

  // const systolic = 122;
  // const diastolic = 82;
  // const avgBpm = 92;
  // const minBpm = 72;
  // const maxBpm = 180;
  

  useEffect(() => {
      connectWebSocket();
  
      const handleMessage = (data) => {
        const match = data.match(/ADC:\s*(\d+)/);
        const adcValue = match ? parseInt(match[1], 10) : null;
  
        if (adcValue !== null) {
          setDataPoints((prev) => {
            const updated = [...prev, adcValue];
            return updated.slice(-1000); // Keep only the last 1000 points ~10 seconds
          });
        }
      };
  
      addMessageListener(handleMessage);
  
      return () => {
        removeMessageListener(handleMessage);
        // closeWebSocket(); // Optional: uncomment if you want to fully close it on unmount
      };
    }, []);

  return (
    <View style={styles.container}>
      <Header date={date} />
      <DataContext.Provider value={{ dataPoints, setDataPoints }}>
        <BloodPressureDisplay systolic={systolic} diastolic={diastolic} />
        <Graph />
        <Statistics avg={avgBpm} min={minBpm} max={maxBpm} />
      </DataContext.Provider> 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '80%',
    backgroundColor: '#ffffff',
  },
});


export default Results;
