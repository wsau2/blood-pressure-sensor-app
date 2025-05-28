import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const data = {
  labels: ['08:15', '12:30', '14:52', '17:46', '19:30'],
  datasets: [
    {
      data: [140, 160, 180, 200, 220],
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
      strokeWidth: 2 // optional
    },
    {
      data: [100, 120, 140, 160, 180],
      color: (opacity = 1) => `rgba(220, 20, 60, ${opacity})`, // optional
      strokeWidth: 2 // optional
    },
    {
      data: [60, 80, 100, 120, 140],
      color: (opacity = 1) => `rgba(34, 202, 202, ${opacity})`, // optional
      strokeWidth: 2 // optional
    }
  ],
  legend: ['Infrared', 'Red', 'Green'] // optional
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "#fff",
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  withVerticalLines: false,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  useShadowColorFromDataset: false, // optional
};

const Graph = () => {
  useEffect(() => {
    const ws = new WebSocket('ws://YOUR_COMPUTER_IP:8082');
    ws.onmessage = (event) => {
      console.log('Received from server:', event.data);
    };
    return () => ws.close();
  }, []);
  return (
    <View style={styles.graphContainer}>
      <LineChart
        data={data}
        width={screenWidth - 32} // from react-native
        height={220}
        withShadow={false}
        chartConfig={chartConfig}
        bezier
        style={styles.lineChart}
      />
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
    borderRadius: 10,
    width: screenWidth - 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Graph;
