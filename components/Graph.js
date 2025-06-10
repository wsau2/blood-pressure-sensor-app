// Graph.js

import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { DataContext } from '../contexts/DataContext';
import { SelectList } from 'react-native-dropdown-select-list';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "#fff",
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  withVerticalLines: false,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

const Graph = () => {
  const { adcValueRef, elapsedRef } = useContext(DataContext);

  const  [selected, setSelected] = useState("")
  const  [dataPoints, setDataPoints] = useState([])
  const  [elapsedPoints, setElapsedPoints] = useState([])

  // console.log("graph render")

  const bigBuffer = useRef([]);
  const [smallBuffer, setSmallBuffer] = useState([]);


  useEffect(() => {
    setDataPoints(Array(100).fill(0));
  }, []);
  

  // Every 100 ms, receives an adc from App and adds it to the big buffer
  useEffect(() => {
    console.log("graph set to ", selected)
    const interval = setInterval(() => {
      const adcValue = adcValueRef.current;
      const elapsed = elapsedRef.current;

      if (
        adcValue !== undefined &&
        adcValue !== null &&
        elapsed !== undefined &&
        elapsed !== null
      ) {
        // Big buffer stores last 100 values
        bigBuffer.current = [...bigBuffer.current, adcValue].slice(-100);

        // Store the last 
        const windowSize = -parseInt(selected) * 10
        setSmallBuffer(bigBuffer.current.slice(windowSize))
        setElapsedPoints(prev => [...prev, elapsed].slice(windowSize));
      }

    }, 100); 

    return () => clearInterval(interval);
  }, [selected]); 



  // Compute labels based on elapsedPoints
  let leftLabel = '';
  let midLabel = '';
  let rightLabel = '';
  const n = elapsedPoints.length;
  if (n > 0) {
    leftLabel = (elapsedPoints[0] / 1000).toFixed(1);
    midLabel = (elapsedPoints[Math.floor(n / 2)] / 1000).toFixed(1);
    rightLabel = (elapsedPoints[n - 1] / 1000).toFixed(1);
  }
  // // console.log(elapsedPoints)
  const labels = [1, 2, 3]


  
  const data = [
    {key:'1', value:'1'},
    {key:'2', value:'5'},
    {key:'3', value:'10'}
  ]

  return (
    <View style={styles.graphContainer}>
      <View style={styles.selectContainer}>
        <Text>Window size (seconds): </Text>
        <SelectList 
          setSelected={setSelected}
          data={data}
          save="value"
          defaultOption={{key: '10', value:'10'}}
        />
      </View>
      <LineChart
        data={{
          // labels: labels, // (optional, for chart x-axis)
          datasets: [
            {
              data: smallBuffer,
              color: () => 'rgba(134, 65, 244, 1)',
              strokeWidth: 2,
            },
          ],
        }}
        width={screenWidth - 32}
        height={220}
        withShadow={false}
        chartConfig={chartConfig}
        style={styles.lineChart}
        withVerticalLabels={true}
        withHorizontalLabels={false}
        withDots={false}
        withInnerLines={true}
        segments={4}
        withVerticalLines={false}
      />
      <View style={styles.labels}>
        <Text style={{ fontSize: 14 }}>{leftLabel}</Text>
        <Text style={{ fontSize: 14 }}>{midLabel}</Text>
        <Text style={{ fontSize: 14 }}>{rightLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  graphContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    borderRadius: 10,
    width: '100%', // Ensure the container takes full width
    flexDirection: 'column',
  },
  lineChart: {
    height: 220,
    width: screenWidth - 32, // Match the width prop of LineChart
    borderRadius: 10,
    alignSelf: 'center',     // Center the chart within the container
    marginLeft: -50         // adjust left for invisible y axis labels 
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  labels: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});

export default Graph;
