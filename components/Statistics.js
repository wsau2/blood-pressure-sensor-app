import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Statistics = ({ avg, min, max }) => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{avg} bpm</Text>
        <Text style={styles.statLabel}>Avg</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{min} bpm</Text>
        <Text style={styles.statLabel}>Min</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{max} bpm</Text>
        <Text style={styles.statLabel}>Max</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#000',
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 14,
    color: '#ffffff',
  },
});

export default Statistics;
