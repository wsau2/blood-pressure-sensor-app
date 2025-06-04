// MyBloodPressureApp/App.js - REVISED

import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, StyleSheet, Platform, View, Text, Button } from 'react-native'; // Added Button, View, Text for BLE controls

import Home from './pages/Home';
import Results from './pages/Results'; // Assuming Results is your main display screen
import KeyboardListener from './components/KeyboardListener'; // Revisit this component
import ControlPanel from './components/ControlPanel';

// NEW IMPORTS FOR BLE
import { DataProvider, useData } from './contexts/DataContext';
import { bleService } from './services/BLEservice';

// This is the main application component that orchestrates everything
function AppContent() { // Renamed to AppContent as App will be a wrapper
    const { state, dispatch, updateBleContext } = useData(); // Get state, dispatch, and the updater from DataContext

    // Local states managed within AppContent
    const [dataPoints, setDataPoints] = useState([]);
    const [adcBuffer, setAdcBuffer] = useState([]);
    const [recording, setRecording] = useState(false);
    const [waitingForStalled, setWaitingForStalled] = useState(false);
    const [showHome, setShowHome] = useState(false); // Controls visibility of Home component
    const [elapsed, setElapsed] = useState(0); // From incoming BLE data

    // Refs for non-stale values in callbacks
    const recordingRef = useRef(recording);
    const waitingForStalledRef = useRef(waitingForStalled);

    useEffect(() => {
        recordingRef.current = recording;
    }, [recording]);

    useEffect(() => {
        waitingForStalledRef.current = waitingForStalled;
    }, [waitingForStalled]);


    // --- NEW useEffect for BLE Communication ---
    useEffect(() => {
        // Link the BleService to the DataContext's update function
        bleService.setOnUpdateCallback(updateBleContext);

        // Initial BLE setup: Request permissions and start scanning
        bleService.requestBluetoothPermissions().then(granted => {
            if (granted) {
                updateBleContext({ log: "Permissions granted. Starting BLE scan..." });
                bleService.scanForDevice();
            } else {
                updateBleContext({ log: "Bluetooth permissions denied. Cannot scan." });
            }
        }).catch(e => updateBleContext({ log: `BLE Init Error: ${e.message}` }));

        // Cleanup: Disconnect from BLE and destroy manager when AppContent unmounts
        return () => {
            bleService.destroy(); // This will also cancel connections and stop monitoring
            updateBleContext({ log: "BLE Service destroyed on app unmount." });
        };
    }, []); // Empty dependency array means this runs once on mount


    // --- Processing incoming data from BleService via DataContext ---
    // This useEffect will react to changes in state.pressureReading, state.logMessages, etc.
    useEffect(() => {
        // When BleService updates the DataContext, this useEffect reacts
        // state.pressureReading will now contain the full "ADC:123|Status:IDLE|Elapsed:123ms" string
        const latestData = state.pressureReading; // Get the raw data string from DataContext

        if (latestData && typeof latestData === 'string') {
            const adcMatch = latestData.match(/ADC:\s*(\d+)/);
            const statusMatch = latestData.match(/Status:\s*([A-Za-z]+)/);
            const elapsedMatch = latestData.match(/Elapsed:\s*(\d+)ms/);

            const adcValue = adcMatch ? parseInt(adcMatch[1], 10) : null;
            const status = statusMatch ? statusMatch[1] : null;
            if (elapsedMatch) { setElapsed(parseInt(elapsedMatch[1], 10)); }

            // Update chart with recent 100 values
            if (adcValue !== null) {
                setDataPoints((prev) => {
                    const updated = [...prev, adcValue];
                    return updated.slice(-100);
                });

                // Record if currently recording
                if (recordingRef.current) {
                    setAdcBuffer((prev) => [...prev, adcValue]);
                }
            }

            // Handle STALLED → start recording
            if (waitingForStalledRef.current && status === 'STALLED') {
                console.log('STALLED received, start recording');
                setWaitingForStalled(false);
                setRecording(true);
                setAdcBuffer([]); // Clear buffer at the start of recording
                // setShowHome(true); // Keep Home visible to show live data
                updateBleContext({ log: 'STALLED: Starting recording.' });
            }

            // Handle IDLE → stop recording and show result
            if (recordingRef.current && status === 'IDLE') {
                console.log('IDLE received, stop recording');
                setRecording(false);
                recordingRef.current = false; // Manually update ref for immediate effect
                setShowHome(false); // Switch to Results page
                if (adcBuffer.length > 0) {
                    console.log('ADC Buffer (final):', adcBuffer); // Log the full buffer
                    updateBleContext({ log: `IDLE: Recording stopped. Buffer size: ${adcBuffer.length}` });
                    // Here you would process adcBuffer for systolic/diastolic/pulse
                    // and store it in DataContext for Results page to consume.
                    // For now, let's just log it.
                } else {
                    updateBleContext({ log: 'IDLE: Recording stopped, no data in buffer.' });
                }
            }

            // Log other status changes if desired
            if (status && status !== 'IDLE' && status !== 'STALLED') {
                updateBleContext({ log: `Status: ${status}` });
            }
        }
    }, [state.pressureReading, recordingRef.current, waitingForStalledRef.current, adcBuffer]); // Depend on relevant states/refs


    const handleControlPanelPress = (key) => {
        // This function will now be called by ControlPanel with the command key
        if (key === 'j') {
            console.log('Waiting for STALLED status...');
            setShowHome(true); // Show Home screen for live pressure display
            setWaitingForStalled(true); // Start waiting for STALLED status
            setRecording(false); // Ensure recording is off initially
            setAdcBuffer([]); // Clear buffer for new cycle
            updateBleContext({ log: 'Command "j" sent. Waiting for STALLED.' });
        }
        // Other commands 'c', 'x', 'k', ']', '[' will just be sent directly by ControlPanel
    };


    // Your UI layout for App.js
    return (
        <SafeAreaView style={styles.container}>
            {/* These buttons are for BLE connection management, not motor control */}
            <View style={styles.bleControlButtons}>
                <Button
                    title="Scan & Connect BLE"
                    onPress={() => bleService.scanForDevice()}
                    disabled={state.isConnected}
                />
                <Button
                    title="Disconnect BLE"
                    onPress={() => bleService.disconnect()}
                    disabled={!state.isConnected}
                    color="red"
                />
            </View>

            <Text style={styles.connectionStatus}>
                Connection: {state.isConnected ? `Connected to ${state.deviceName}` : 'Disconnected'}
            </Text>

            {/* Render Results or Home based on showHome state */}
            {showHome ? (
                <Home visible={showHome} /> // Home component with the animation
            ) : (
                <Results /> // Your Results display
            )}

            {/* Pass the writeCommand function from bleService to ControlPanel */}
            {/* The onSendCommand prop will replace onButtonPress */}
            <ControlPanel onSendCommand={bleService.writeCommand} isConnected={state.isConnected} />

            {/* You might want to display the logs somewhere */}
            <View style={styles.logContainer}>
                <Text style={styles.logHeader}>App Logs:</Text>
                <ScrollView>
                    {state.logMessages.map((msg, index) => (
                        <Text key={index} style={styles.logText}>{msg}</Text>
                    ))}
                </ScrollView>
            </View>

            {/* KeyboardListener might be obsolete if you're purely using BLE buttons */}
            {/* If it was meant for dev input, you might keep it and pass bleService.writeCommand */}
            {/* <KeyboardListener /> */}
        </SafeAreaView>
    );
}

// The root App component that wraps AppContent with the DataProvider
export default function App() {
    return (
        <DataProvider>
            <AppContent />
        </DataProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'flex-start', // Align to top for better layout
        paddingTop: Platform.OS === 'android' ? 30 : 0, // Adjust for status bar
    },
    bleControlButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '90%',
        marginTop: 10,
        marginBottom: 10,
    },
    connectionStatus: {
        fontSize: 16,
        marginBottom: 10,
    },
    logContainer: {
        marginTop: 20,
        height: 150, // Fixed height for scrollable logs
        width: '90%',
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 5,
    },
    logHeader: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    logText: {
        fontSize: 12,
        color: '#555',
    },
});