// Graph.js

import React, { useContext } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { DataContext } from '../contexts/DataContext';

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
  const { dataPoints, elapsed } = useContext(DataContext);

  return (
    <View style={styles.graphContainer}>
      <LineChart
        data={{
          datasets: [
            {
              data: dataPoints,
              color: () => 'rgba(134, 65, 244, 1)',
              strokeWidth: 2,
            },
          ],
        }}
        width={screenWidth - 32}
        height={220}
        withShadow={false}
        chartConfig={chartConfig}
        bezier
        style={styles.lineChart}
        withVerticalLabels={true}
        withHorizontalLabels={false}
        withDots={false}
        withInnerLines={true}
        segments={4}
        withVerticalLines={false}

      />
      <Text>{ elapsed }</Text>
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
    marginLeft: -50
  },
});

export default Graph;
