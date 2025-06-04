// MyBloodPressureApp/contexts/DataContext.js

import React, { createContext, useContext, useReducer } from 'react';

// Initial state for the data context
const initialState = {
    pressureReading: 'N/A',
    isConnected: false,
    deviceName: null,
    logMessages: [], // For debugging messages from the BLE service
    // ... any other data you want to manage globally (e.g., historical readings)
};

// Reducer function to handle state updates
const dataReducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_PRESSURE':
            return { ...state, pressureReading: action.payload };
        case 'SET_CONNECTION_STATUS':
            return { ...state, isConnected: action.payload.isConnected, deviceName: action.payload.deviceName };
        case 'ADD_LOG':
            return { ...state, logMessages: [...state.logMessages, action.payload] };
        case 'RESET_LOGS':
            return { ...state, logMessages: [] };
        case 'UPDATE_BLE_STATE': // A generic update for multiple BLE states
            return { ...state, ...action.payload };
        default:
            return state;
    }
};

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [state, dispatch] = useReducer(dataReducer, initialState);

    // This is the function that the BleService will call to update the context
    const updateBleContext = (data) => {
        dispatch({ type: 'UPDATE_BLE_STATE', payload: data });
        if (data.log) {
            dispatch({ type: 'ADD_LOG', payload: data.log });
        }
    };

    return (
        <DataContext.Provider value={{ state, dispatch, updateBleContext }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    return useContext(DataContext);
};