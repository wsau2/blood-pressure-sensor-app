import React, { useContext } from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { DataContext } from '../contexts/DataContext'; 

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

function ResultGraph() {
  const { recordingArr, processedData } = useContext(DataContext);

  return (
    <View>
      <LineChart
        data={{
          labels: [], // Optionally add labels if you want
          datasets: [
            {
              data: recordingArr.current || [],
              color: () => 'rgba(134, 65, 244, 1)',
              strokeWidth: 2,
            },
            {
              data: processedData.current || [],
              color: () => 'rgb(0, 255, 42)',
              strokeWidth: 2,
            },
          ],
        }}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        withDots={false}
        withInnerLines={true}
        withOuterLines={false}
        bezier
        style={{ borderRadius: 10, alignSelf: 'center' }}
        withVerticalLines={false}
      />
    </View>
  );
}

export default ResultGraph;