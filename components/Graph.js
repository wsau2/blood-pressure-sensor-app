import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { LineChart, Grid } from 'react-native-svg-charts';
import * as scale from 'd3-scale';
import { DataContext } from '../contexts/DataContext';



const screenWidth = Dimensions.get('window').width;

const Graph = () => {  
  const { dataPoints } = useContext(DataContext)

  return (
    <View style={styles.graphContainer}>
      <LineChart
        style={styles.lineChart}
        data={dataPoints}
        svg={{ stroke: 'rgb(134, 65, 244)', strokeWidth: 2 }}
        contentInset={{ top: 20, bottom: 20 }}
        yMin={0}
        yMax={dataPoints.length>0 ? Math.max(...dataPoints) + 100 : 500} // Adjust depending on ADC range
        numberOfTicks={5}
      >
        <Grid />
      </LineChart>
      <Text style={styles.text}>
        {dataPoints.length > 0
          ? `Latest Value: ${dataPoints[dataPoints.length - 1]}`
          : 'Waiting for data...'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  graphContainer: {
    alignItems: 'center',
    marginVertical: 16,
    borderRadius: 10,
    justifyContent: 'center',
  },
  lineChart: {
    height: 220,
    width: screenWidth - 32,
    borderRadius: 10,
  },
  text: {
    marginTop: 8,
    fontSize: 16,
  },
});

export default Graph;
