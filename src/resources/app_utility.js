import React, {Component} from 'react';
import {Alert} from 'react-native';
import CONSTANTS from '../resources/constants.js'

export function showNativeAlert(message) {
    Alert.alert(CONSTANTS.APP_NAME, message)
}