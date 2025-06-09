// MyBloodPressureApp/services/BleService.js

import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { PermissionsAndroid, Platform } from 'react-native';

// Define your UUIDs (from your ESP32 firmware)
const BLOOD_PRESSURE_SERVICE_UUID = '00001810-0000-1000-8000-00805F9B34FB';
const BLOOD_PRESSURE_MEASUREMENT_CHARACTERISTIC_UUID = '00002A35-0000-1000-8000-00805F9B34FB';
const COMMAND_SERVICE_UUID = 'YOUR_CUSTOM_COMMAND_SERVICE_UUID';
const COMMAND_CHARACTERISTIC_UUID = 'YOUR_CUSTOM_COMMAND_CHARACTERISTIC_UUID';

const manager = new BleManager(); // Instantiate the BLE manager once

// This service will manage the BLE connection and provide updates
class BleService {
    constructor() {
        this.device = null;
        this.isConnected = false;
        this.onUpdate = null; // Callback function to update UI/Context
        this.monitorSubscription = null; // To store the notification subscription
    }

    // Method to set the callback for updating UI/Context
    // This will be called from App.js/Home.js where DataContext is available
    setOnUpdateCallback(callback) {
        this.onUpdate = callback;
    }

    _updateContext(data) {
        if (this.onUpdate) {
            this.onUpdate(data);
        }
    }

    async requestBluetoothPermissions() {
        if (Platform.OS === 'android') {
            // Android 12+ requires BLUETOOTH_SCAN and BLUETOOTH_CONNECT
            if (Platform.Version >= 31) { // Android 12 is API 31
                const bluetoothScanPermission = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    {
                        title: "Bluetooth Scan Permission",
                        message: "This app needs Bluetooth Scan permission to discover devices.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                const bluetoothConnectPermission = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    {
                        title: "Bluetooth Connect Permission",
                        message: "This app needs Bluetooth Connect permission to connect to devices.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                const fineLocationPermission = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Location Permission",
                        message: "This app needs Location permission to discover devices.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );

                const granted = (bluetoothScanPermission === PermissionsAndroid.RESULTS.GRANTED &&
                                 bluetoothConnectPermission === PermissionsAndroid.RESULTS.GRANTED &&
                                 fineLocationPermission === PermissionsAndroid.RESULTS.GRANTED);
                this._updateContext({ log: `Android Permissions granted: ${granted}` });
                return granted;

            } else if (Platform.Version >= 23) { // Android 6.0+ (API 23) to Android 11 (API 30)
                const fineLocationPermission = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Location Permission",
                        message: "This app needs Location permission to discover devices.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                const granted = (fineLocationPermission === PermissionsAndroid.RESULTS.GRANTED);
                this._updateContext({ log: `Android Location Permission granted: ${granted}` });
                return granted;
            }
        }
        // For iOS, Bluetooth permissions are handled automatically by the system
        // when you access Bluetooth functions for the first time, provided
        // you have the NSCameraUsageDescription and NSBluetoothPeripheralUsageDescription
        // (or NSBluetoothAlwaysUsageDescription for iOS 13+) in your Info.plist.
        // So, no explicit permission request here for iOS.
        this._updateContext({ log: `iOS permissions assumed granted or not needed by app logic.` });
        return true; // Assume permissions are handled or not strictly required by app logic for iOS
    }


    scanForDevice() {
        this._updateContext({ log: "Starting device scan..." });
        manager.startDeviceScan(
            [BLOOD_PRESSURE_SERVICE_UUID, COMMAND_SERVICE_UUID].filter(Boolean),
            null,
            (error, device) => {
                if (error) {
                    this._updateContext({ log: `Scan Error: ${error.message}` });
                    console.error('Scan Error:', error);
                    return;
                }

                if (device.name === 'MyESP32BloodPressure' || device.localName === 'MyESP32BloodPressure') {
                    manager.stopDeviceScan();
                    this._updateContext({ log: `Device found: ${device.name}. Connecting...` });
                    this.connectToDevice(device);
                }
            }
        );
    }

    async connectToDevice(device) {
        try {
            this.device = await device.connect();
            this.isConnected = true;
            this._updateContext({
                isConnected: true,
                deviceName: this.device.name,
                log: `Connected to: ${this.device.name}`
            });

            await this.device.discoverAllServicesAndCharacteristics();
            this._updateContext({ log: 'Discovered services and characteristics' });

            this.setupBloodPressureNotifications(this.device);

        } catch (error) {
            this._updateContext({ log: `Connection/Discovery Error: ${error.message}` });
            console.error('Connection/Discovery Error:', error);
        }
    }

    setupBloodPressureNotifications(device) {
        // Ensure any previous subscription is removed
        if (this.monitorSubscription) {
            this.monitorSubscription.remove();
        }

        this.monitorSubscription = device.monitorCharacteristicForService(
            BLOOD_PRESSURE_SERVICE_UUID,
            BLOOD_PRESSURE_MEASUREMENT_CHARACTERISTIC_UUID,
            (error, characteristic) => {
                if (error) {
                    this._updateContext({ log: `BP Notif Error: ${error.message}` });
                    console.error('Blood Pressure Notification Error:', error);
                    return;
                }
                if (characteristic && characteristic.value) {
                    const rawData = Buffer.from(characteristic.value, 'base64');
                    const pressureString = rawData.toString('utf8'); // Assuming UTF-8 string from ESP32
                    this._updateContext({
                        pressureReading: pressureString,
                        log: `Received BP: ${pressureString}`
                    });
                }
            }
        );
        this._updateContext({ log: 'Subscribed to Blood Pressure notifications.' });
    }

    async writeCommand(command) {
        if (!this.device || !this.isConnected) {
            this._updateContext({ log: "No device connected to send command." });
            return;
        }
        try {
            await this.device.writeCharacteristicWithoutResponseForService(
                COMMAND_SERVICE_UUID,
                COMMAND_CHARACTERISTIC_UUID,
                Buffer.from(command).toString('base64')
            );
            this._updateContext({ log: `Command sent: ${command}` });
        } catch (error) {
            this._updateContext({ log: `Error writing command '${command}': ${error.message}` });
            console.error('Error writing command:', error);
        }
    }

    // You might add a disconnect method
    async disconnect() {
        if (this.device) {
            try {
                await this.device.cancelConnection();
                this.isConnected = false;
                this.device = null;
                if (this.monitorSubscription) {
                    this.monitorSubscription.remove();
                    this.monitorSubscription = null;
                }
                this._updateContext({ isConnected: false, deviceName: null, log: 'Disconnected from device.' });
            } catch (error) {
                this._updateContext({ log: `Disconnection error: ${error.message}` });
                console.error('Disconnection error:', error);
            }
        }
    }

    // Important: Lifecycle management
    destroy() {
        if (this.monitorSubscription) {
            this.monitorSubscription.remove();
        }
        if (this.device) {
            this.device.cancelConnection(); // Best effort disconnect
        }
        manager.destroy(); // Releases native resources
        this._updateContext({ log: 'BLE Manager destroyed.' });
    }
}

// Export an instance so it's a singleton throughout the app
export const bleService = new BleService();