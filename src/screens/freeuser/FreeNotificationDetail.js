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
import { NavigationEvents } from 'react-navigation';

import DeviceInfo from 'react-native-device-info';
import Ripple from 'react-native-material-ripple';
import CardView from 'react-native-cardview';
import Orientation from 'react-native-orientation';

//Vector icon
import EntypoPDF from 'react-native-vector-icons/MaterialCommunityIcons';
import IoniconsMore from 'react-native-vector-icons/MaterialIcons';
const pDF = <EntypoPDF name="file-pdf" size={24} color={colors.theme} />;
const moreICon = <IoniconsMore name="switch-video" size={26} color={colors.white} />;

let isRecordingGloble = false;
export default class FreeNotificationDetail extends Component {

    //Navigation Method
    static navigationOptions = (navigation) => {
        return ({
            title: 'Notification Detail',
            headerStyle: { backgroundColor: colors.theme },
            headerTitleStyle: { color: colors.white, textAlign: 'center', position: 'absolute', alignItems: 'center', justifyContent: 'center', marginLeft: dimensions.width / 4 - 30 },
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
            isPagginationLoading: false,
            access_token: '',
            notificationArray: [1, 2, 3],
            previousScreenObj: this.props.navigation.state.params.selected_item
        }
        isRecordingGloble = false
        this.offset = 1;
        this.limit = 10;
        this.pageCount = 0;
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        const paddingToBottom = 20; // how far from the bottom
        return layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;
    };

    onEndReached = () => {
        if (!this.state.isPagginationLoading) {
            if (this.offset <= this.pageCount) {
                if (this.state.isSelectedTabType == 'first') {
                    this.getNotificationList(true, 1);
                } else if (this.state.isSelectedTabType == 'second') {
                    this.getNotificationList(true, 2);
                } else {
                    this.getNotificationList(true, 3);
                }
            }
        }
    }

    renderFooter = () => {
        //it will show indicator at the bottom of the list when data is loading otherwise it returns null
        if (!this.state.isPagginationLoading) return null;
        return (
            <ActivityIndicator
                style={{
                    color: colors.theme
                }}
                size={'large'}
            />
        );
    };

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
                <View style={{
                    flex: 1,
                    flexDirection: 'column',
                    width: '100%',
                    padding: 10
                }}>
                    {this.state.previousScreenObj != undefined &&
                        <Text style={{
                            marginTop: 10,
                            fontSize: (dimensions.sizeRatio * 14),
                            color: colors.black,
                            fontFamily: CONSTANTS.MEDIUM
                        }}>{this.state.previousScreenObj.UN_MESSAGE}</Text>
                    }
                </View>
            </View >
        )
    }
}