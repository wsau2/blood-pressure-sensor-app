// AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from './pages/HomePage'; // Replace with your actual path
import HeartRatePage from './pages/Results'; // Replace with your actual path

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Results" component={HeartRatePage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
