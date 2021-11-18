/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    Platform, StatusBar, AsyncStorage, Text, View,
    Image, TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl, Modal, NativeEventEmitter, NativeModules
} from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import styles from '../styles/subject_style.js';
import CONSTANTS from '../resources/constants.js'
import renderIf from '../resources/utility.js';
import ProfileHeaderButton from '../headers/ProfileHeaderButton'
import BackSubjectsButton from '../headers/BackSubjectsButton'
import { showNativeAlert } from '../resources/app_utility.js'
import RNFetchBlob from 'rn-fetch-blob';
import Orientation from 'react-native-orientation';
import { NavigationEvents } from 'react-navigation';

//Using this for handle start conference
import { EventRegister } from 'react-native-event-listeners';
import * as GoToScreen from '../resources/goToScreen'
import DeviceInfo from 'react-native-device-info';
import Ripple from 'react-native-material-ripple';
import CardView from 'react-native-cardview'

let isRecordingGloble = false;
export default class NotificationDetail extends Component {

    //Navigation Method
    static navigationOptions = (navigation) => {
        return ({
            title: 'Notification Detail',
            headerStyle: { backgroundColor: colors.theme },
            headerTitleStyle: { color: colors.white, textAlign: 'center', position:'absolute',alignItems:'center',justifyContent:'center',marginLeft:dimensions.width/4 - 20},
            headerBackTitle: null,
            headerTintColor: 'white',
            //headerLeft: <BackSubjectsButton />,

            headerRight: <View></View>,
            gesturesEnabled: false,

        })
    };
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            access_token: '',
            selectedItem: this.props.navigation.state.params.prop
        }
        isRecordingGloble = false
    }

    getAccessToken() {
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                this.offset = 1;
                self.setState({
                    access_token: value.slice(1, -1),
                    dataSource: ''
                }, () => {
                    //self.getMessages(true) 
                })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }
    componentDidMount() {
        // Recording of
        if (Platform.OS == 'ios') {
            this.addListener()
        }
    }

    componentWillUnmount() {
        if (Platform.OS === "ios") {
            this.screenCaptureEnabled.remove()
        }
    }

    addListener = () => {
        console.warn('CAPTURE_SESSIONS')
        let bridge = new NativeEventEmitter(NativeModules.ScreenRecorderDetect);

        this.screenCaptureEnabled = bridge.addListener("isScreenCaptureEnabled", (res) => {
            console.warn('CAPTURE_SESSIONS1' + '\n\n' + JSON.stringify(res))
            if (res.value == true) {
                console.warn('CAPTURE_SESSIONS2' + '\n\n' + JSON.stringify(res) + '\n\n' + this.state.isRecording)

                isRecordingGloble = true
                this.setState({
                    isRecording: true
                })
            }
            else {
                isRecordingGloble = false
                this.setState({ isRecording: false }, () => {
                    console.warn('CAPTURE_SESSIONS3' + '\n\n' + JSON.stringify(res) + '\n\n' + this.state.isRecording)
                })
            }

        })
    }

    _onWillFocus() {
        this.getAccessToken()
    }
    render() {
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>

                    <ActivityIndicator />

                    <Text style={{ top: 10, fontSize: (dimensions.sizeRatio * 20), textAlignVertical: "center", color: colors.black, fontFamily: CONSTANTS.DEMI }}>
                        Please wait...
                    </Text>
                </View>
            )
        }

        if (this.state.isRecording) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>

                    <ActivityIndicator />

                    <Text style={{ top: 10, fontSize: (dimensions.sizeRatio * 15), textAlignVertical: "center", color: colors.black, fontFamily: CONSTANTS.DEMI }}>
                        ⚠️ Video Recording not allowed!! ⚠️
                        </Text>
                </View>
            )
        }

        return (
            <View style={{
                flex: 1,
                width: '100%',
                backgroundColor: colors.sessions_bgtheme
            }}>

                <NavigationEvents
                    onWillFocus={payload => this._onWillFocus()}
                />
                <View style={{
                    flex: 1,
                    flexDirection: 'column',
                    width: '100%',
                    padding: 10
                }}>
                    <Text style={{
                        marginTop: 10,
                        fontSize: (dimensions.sizeRatio * 14),
                        color: colors.black,
                        fontFamily: CONSTANTS.MEDIUM
                    }}>{this.state.selectedItem.UN_MESSAGE}</Text>
                </View>
            </View >
        )
    }
}