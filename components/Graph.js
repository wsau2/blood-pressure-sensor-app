import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { LineChart, Grid, YAxis, XAxis } from 'react-native-svg-charts';
import * as scale from 'd3-scale';
import { DataContext } from '../contexts/DataContext';



const screenWidth = Dimensions.get('window').width;

contentInset={ top: 20, bottom: 20 }

const Graph = () => {  
  const { dataPoints } = useContext(DataContext)

  return (
    <View style={styles.graphContainer}>
        <LineChart
          style={styles.lineChart}
          data={dataPoints}
          svg={{ stroke: 'rgb(134, 65, 244)', strokeWidth: 2 }}
          contentInset={contentInset}
          yMin={0}
          yMax={dataPoints.length>0 ? Math.max(...dataPoints) + 100 : 500} // Adjust depending on ADC range
          numberOfTicks={6}
          animate={false}
        >
          <Grid />
        </LineChart>
    </View>
  );
};

const styles = StyleSheet.create({
  graphContainer: {
    alignItems: 'center',
    marginVertical: 16,
    borderRadius: 10,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  lineChart: {
    height: 220,
    width: screenWidth - 100,
    borderRadius: 10,
  },
  yAxisStyle: {
    height: 220
  }
});

export default Graph;
