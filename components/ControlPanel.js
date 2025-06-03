import React from 'react'
import { connectWebSocket, sendMessage } from './webSocketService';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

/**
 * Serial.println(F("Commands:"));
  Serial.println(F("  ] : Move forward for 0.5 seconds (no stall detection)"));
  Serial.println(F("  [ : Move backward for 0.5 seconds (no stall detection)"));
  Serial.println(F("  k : Move backward at speed 5 for 40 seconds (no stall detection)"));
  Serial.println(F("  j : Move forward until stalled, then move backward for 40 seconds"));
  Serial.println(F("  x : Immediately stop the motor"));
  Serial.println(F("  d : Display stall detection values"));
 * @returns 
 */
function ControlPanel({ onButtonPress }) {
  const buttonHelper = (key) => {
    console.log("pressed button: ", key);
    sendMessage(key);
    
    if (onButtonPress) {
      onButtonPress(key)
    }
    
  }  

  return (
    <View style={styles.container}>
      <Text>Motor Controller:</Text>
        <TouchableOpacity style={styles.button} onPress={() => buttonHelper('k')}>
          <Text style={styles.buttonText}>k</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => buttonHelper('[')}>
          <Text style={styles.buttonText}>[</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => buttonHelper('x')}>
          <Text style={styles.buttonText}>x</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => buttonHelper(']')}>
          <Text style={styles.buttonText}>]</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => buttonHelper('j')}>
          <Text style={styles.buttonText}>j</Text>
        </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 'auto',
    marginTop: 5,
    flexDirection:'row',
  },
  button: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#6c63ff',
    flex: 1,
    padding: 8
  },
  longButton: {
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#6c63ff',
    paddingVertical: 14,
    paddingHorizontal: 10,
    width: '98%',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ControlPanel