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
  const  [elapsedRefPoints, setElapsedPoints] = useState([])

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
        // setDataPoints(prev => [...prev, adcValue].slice(-100));
        // setElapsedPoints(prev => [...prev, elapsed].slice(-100));
        bigBuffer.current = [...bigBuffer.current, adcValue].slice(-100);
        setSmallBuffer(bigBuffer.current.slice(-parseInt(selected) * 10))
        // setSmallBuffer(bigBuffer.current.slice(-50))
      }

    }, 100); 

    return () => clearInterval(interval);
  }, [selected]); 



  // let labels = [];
  // const n = elapsedRefPoints.length;
  // let labels = new Array(n)
  // if (n > 0) {
  //   // labels = Array(n).fill("");
  //   labels[0] = (elapsedRefPoints[0] / 1000).toFixed(1);
  //   labels[Math.floor(n / 2)] = (elapsedRefPoints[Math.floor(n / 2)] / 1000).toFixed(1);
  //   labels[n - 5] = (elapsedRefPoints[n - 1] / 1000).toFixed(1);
  // }


  
  const data = [
    {key:'1', value:'1'},
    {key:'2', value:'5'},
    {key:'3', value:'10'}
  ]

  return (
    <View style={styles.graphContainer}>
      <SelectList 
        setSelected={setSelected}
        data = {data}
        save = "value"
        defaultOption={{key: '10', value:'10'}} // Weird workaround for SelectList library
      />
      <LineChart
        data={{
          // labels:labels,
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
        // bezier
        style={styles.lineChart}
        withVerticalLabels={true}
        withHorizontalLabels={false}
        withDots={false}
        withInnerLines={true}
        segments={4}
        withVerticalLines={false}

      />
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
});

export default Graph;
