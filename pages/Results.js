import React from 'react';
import { View, StyleSheet } from 'react-native';
import BloodPressureDisplay from '../components/BloodPressureDisplay';
import Graph from '../components/Graph';
import Statistics from '../components/Statistics';
import Header from '../components/header';

const Results = () => {
  const date = 'Mon, Aug 23';
const systolic = 122;
const diastolic = 82;
  const avgBpm = 92;
  const minBpm = 72;
  const maxBpm = 180;

   return (
    <View style={styles.container}>
      <Header date={date} />
           <BloodPressureDisplay systolic={systolic} diastolic={diastolic} />
      <Graph />
      <Statistics avg={avgBpm} min={minBpm} max={maxBpm} />
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
