import { BleManager } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';

const SERVICE_UUID = '00001810-0000-1000-8000-00805F9B34FB';
const CHARACTERISTIC_UUID = '00002A35-0000-1000-8000-00805F9B34FB';

class BLEService {
  constructor() {
    this.bleManager = new BleManager();
    this.device = null;
    this.messageListeners = new Set();
  }

  async requestPermissions() {
    if (Platform.OS === 'android') {
      const apiLevel = Platform.Version;
      
      // Android 12+ (API 31+) requires new Bluetooth permissions
      if (apiLevel >= 31) {
        const permissions = [
          'android.permission.BLUETOOTH_SCAN',
          'android.permission.BLUETOOTH_CONNECT',
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ];
        
        const results = await PermissionsAndroid.requestMultiple(permissions, {
          title: 'Bluetooth Permissions',
          message: 'This app needs Bluetooth permissions to connect to your blood pressure sensor',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });
        
        return (
          results['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          results['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        // Android 11 and below
        const locationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth scanning requires location permission',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return locationGranted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  }

  async scanForDevice() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      return new Promise((resolve, reject) => {
        this.bleManager.startDeviceScan(null, null, (error, device) => {
          if (error) {
            reject(error);
            return;
          }

          if (device && device.name === 'XIAO_BP_Monitor') {
            this.bleManager.stopDeviceScan();
            this.device = device;
            resolve(device);
          }
        });

        // Stop scanning after 10 seconds
        setTimeout(() => {
          this.bleManager.stopDeviceScan();
          reject(new Error('Device not found'));
        }, 10000);
      });
    } catch (error) {
      console.error('Scan error:', error);
      throw error;
    }
  }

  async connect() {
    try {
      if (!this.device) {
        await this.scanForDevice();
      }

      await this.bleManager.connectToDevice(this.device.id);
      await this.device.discoverAllServicesAndCharacteristics();
      
      // Subscribe to notifications
      this.startTime = Date.now();
      this.device.monitorCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('Monitoring error:', error);
            return;
          }
          
          if (characteristic && characteristic.value) {
            // Parse binary data: 4 bytes representing int32_t ADC value
            const base64Value = characteristic.value;
            const binaryString = atob(base64Value);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            
            // Convert 4 bytes to int32 (big-endian)
            const adcValue = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
            // Handle sign extension for negative numbers
            const adcReading = adcValue | (adcValue & 0x80000000 ? 0xFFFFFFFF00000000 : 0);
            
            // Calculate elapsed time
            const elapsed = Date.now() - this.startTime;
            
            // Format as string that App.js expects
            // Note: Status will be determined by the app logic, defaulting to MOVING
            const formattedData = `ADC: ${adcReading} | Elapsed: ${elapsed}ms | Status: MOVING`;
            this.messageListeners.forEach(listener => listener(formattedData));
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  addMessageListener(listener) {
    this.messageListeners.add(listener);
  }

  removeMessageListener(listener) {
    this.messageListeners.delete(listener);
  }

  async disconnect() {
    if (this.device) {
      await this.bleManager.cancelDeviceConnection(this.device.id);
      this.device = null;
    }
  }
}

export const bleService = new BLEService(); 