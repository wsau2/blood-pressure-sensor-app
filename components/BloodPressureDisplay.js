import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Make sure you have expo vector icons installed

const BloodPressureDisplay = ({ systolic, diastolic }) => {
  return (
    <View style={styles.container}>
      <FontAwesome name="heart" size={30} color="#d600d3" style={styles.icon} />
      <Text style={styles.bpmText}>{systolic}/{diastolic} mmHg</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  bpmText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default BloodPressureDisplay;
