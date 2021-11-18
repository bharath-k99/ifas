/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    Platform, ScrollView, ActivityIndicator, BackHandler, Text, View, Image, StatusBar,
    TouchableOpacity, Alert, AsyncStorage, NativeEventEmitter, NativeModules, Modal, FlatList
} from 'react-native';
import colors from '../../resources/colors';
import renderIf from '../../resources/utility.js';
import dimensions from '../../resources/dimension';
import CONSTANTS from '../../resources/constants';
import styles from '../../styles/sessions_style.js';
import { showNativeAlert } from '../../resources/app_utility.js'
import { EventRegister } from 'react-native-event-listeners';
import { NavigationEvents } from 'react-navigation';
import Ripple from 'react-native-material-ripple';
import CardView from 'react-native-cardview';
import Toast from 'react-native-tiny-toast';


export default class AnalysisPaidFree extends Component {

    //Navigation Method
    isSessionFocus = false
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            access_token: '',
            dataSource: [],
            isRecording: false,

        };
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    handleBackButtonClick = () => {
        this.props.navigation.goBack();
        return true;
    }
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    componentWillUnmount() {
        console.log("Unmounted Analysis")
    }
    render() {

        return (
            <View style={{ flex: 1, backgroundColor: colors.white }}>
                <View style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Text numberOfLines={1}
                        style={{
                            color: colors.black,
                            fontFamily: CONSTANTS.MEDIUM,
                            fontSize: dimensions.sizeRatio * 22,
                        }}
                        numberOfLines={1}>
                        {'Coming Soon'}
                    </Text>
                </View>
            </View>
        );
    }
}