// App.js
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Home from './pages/Home'; // Adjust the import path if necessary
import Results from './pages/Results'; // Adjust the path accordingly


export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Results />
      <Home/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
