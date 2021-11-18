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
    TouchableOpacity, Alert, AsyncStorage, NativeEventEmitter, NativeModules, Modal, Linking
} from 'react-native';
import colors from '../../resources/colors';
import renderIf from '../../resources/utility.js';
import dimensions from '../../resources/dimension';
import CONSTANTS from '../../resources/constants';
import styles from '../../styles/sessions_style.js';
import { showNativeAlert } from '../../resources/app_utility.js'
import { EventRegister } from 'react-native-event-listeners';
import { NavigationEvents } from 'react-navigation';
import { Dialog } from 'react-native-simple-dialogs';
import DeviceInfo from 'react-native-device-info';
import Toast from 'react-native-tiny-toast';
import BlinkView from 'react-native-blink-view'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Orientation from 'react-native-orientation';
import Ripple from 'react-native-material-ripple';
import CardView from 'react-native-cardview'
//Vector icon
import CheckBoxRectOFF from 'react-native-vector-icons/MaterialIcons';
import CheckBoxRectON from 'react-native-vector-icons/MaterialIcons';
const checkBoxRectOFF = <CheckBoxRectOFF name="check-box-outline-blank" size={24} color={colors.theme} />;
const checkBoxRectON = <CheckBoxRectON name="check-box" size={24} color={colors.theme} />;
import BackButton from 'react-native-vector-icons/MaterialIcons';
const backButton = <BackButton name="arrow-back" size={28} color={colors.black} />;

let isRecordingGloble = false;

export default class PaidSessions extends Component {

    //Navigation Method

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            access_token: '',
            isRecording: false,
            isRecording: ''
        };
    }

    componentDidMount() {
        Orientation.lockToPortrait();
    }

    componentWillUnmount() {

    }

    handleBackButtonClick = () => {
        this.props.navigation.goBack();
        return true;
    }
    render() {

        if (this.state.isLoading) {
            return (

                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: colors._transparent,
                    padding: 20
                }}>
                    <ActivityIndicator />
                    <Text style={{ top: 10, fontSize: (dimensions.sizeRatio * 20), textAlignVertical: "center", color: colors.black, fontFamily: CONSTANTS.DEMI }}>
                        Loading session...
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
        } else {
            return (
                <View style={{ flex: 1, backgroundColor: colors.white }}>

                    {this.renderHeader()}
                    <ScrollView
                        showsVerticalScrollIndicator={false}>
                        <View
                            style={{
                                flex: 1,
                                width: '100%',
                                backgroundColor: colors.white,
                            }}>

                            {/* Top view */}
                            <View style={{
                                width: '100%',
                                flexDirection: 'row',
                                paddingVertical: 10
                            }}>
                                {/* Live sessionsz */}
                                <CardView
                                    style={{
                                        width: dimensions.width / 2 - 25,
                                        height: dimensions.height / 2 - 40,
                                        backgroundColor: colors.session_color_1,
                                        marginTop: 10,
                                        marginLeft: 15
                                    }}
                                    cardElevation={3}
                                    cardMaxElevation={2}
                                    cornerRadius={5}>
                                    <Ripple style={{
                                        width: dimensions.width / 2 - 20,
                                        alignItems: 'center'
                                    }}>
                                        <View style={{
                                            width: dimensions.width / 2 - 15,
                                            height: (dimensions.height / 2 - 40) / 2 + 20,
                                            justifyContent: 'flex-end',
                                            alignItems: 'center',
                                        }}>
                                            <Image source={require('../../images/icon_session1.png')}
                                                style={{ width: dimensions.sizeRatio * 140, height: dimensions.sizeRatio * 140, resizeMode: 'contain' }} />
                                        </View>
                                        <View style={{
                                            width: dimensions.width / 2 - 20,
                                            height: (dimensions.height / 2 - 40) / 2 - 20,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10
                                        }}>
                                            <Text numberOfLines={1} style={{
                                                paddingTop: dimensions.sizeRatio * 10,
                                                color: colors.theme,
                                                paddingLeft: dimensions.sizeRatio * 15,
                                                paddingRight: dimensions.sizeRatio * 15,
                                                fontSize: dimensions.sizeRatio * 16,
                                                fontFamily: CONSTANTS.DEMI
                                            }}
                                                numberOfLines={2}>
                                                {'Live Sessions'}
                                            </Text>
                                            {/* NO LIVE URL AND NO DATE TIME */}
                                            {this.state.liveUrl == '' && this.state.dateTime == '' &&
                                                <Text numberOfLines={1}
                                                    style={{
                                                        color: colors.black,
                                                        paddingLeft: dimensions.sizeRatio * 15,
                                                        paddingRight: dimensions.sizeRatio * 15,
                                                        marginTop: dimensions.sizeRatio * 5,
                                                        fontSize: dimensions.sizeRatio * 14,
                                                        marginBottom: dimensions.sizeRatio * 10
                                                    }}
                                                    numberOfLines={2}>
                                                    {'No live session available.'}
                                                </Text>
                                            }
                                            {/* LIVE URL AND DATE TIME  */}
                                            {this.state.liveUrl != '' && this.state.dateTime != '' && this._checkTimingSession() == true &&
                                                <Text numberOfLines={1}
                                                    style={{
                                                        color: colors.black,
                                                        paddingLeft: dimensions.sizeRatio * 15,
                                                        paddingRight: dimensions.sizeRatio * 15,
                                                        marginTop: dimensions.sizeRatio * 5,
                                                        fontSize: dimensions.sizeRatio * 14,
                                                        marginBottom: dimensions.sizeRatio * 10
                                                    }}
                                                    numberOfLines={2}>
                                                    {'Live session available'}
                                                </Text>
                                            }

                                            {this.state.liveUrl != '' && this.state.dateTime != '' && this._checkTimingSession() == true &&
                                                <Text numberOfLines={1}
                                                    style={{
                                                        color: colors.black,
                                                        paddingLeft: dimensions.sizeRatio * 15,
                                                        paddingRight: dimensions.sizeRatio * 15,
                                                        marginTop: dimensions.sizeRatio * 5,
                                                        fontSize: dimensions.sizeRatio * 18,
                                                        marginBottom: dimensions.sizeRatio * 10
                                                    }}
                                                    numberOfLines={2}>
                                                    {'CLICK TO JOIN'}
                                                </Text>
                                            }
                                            {/* NO LIVE URL BUT DATE TIME */}
                                            {this.state.dateTime != '' && this._checkTimingSession() == false &&
                                                <Text numberOfLines={1}
                                                    style={{
                                                        color: colors.black,
                                                        paddingLeft: dimensions.sizeRatio * 15,
                                                        paddingRight: dimensions.sizeRatio * 15,
                                                        marginTop: dimensions.sizeRatio * 5,
                                                        fontSize: dimensions.sizeRatio * 14,
                                                        marginBottom: dimensions.sizeRatio * 10
                                                    }}
                                                    numberOfLines={1}>
                                                    {this.state.dateTime}
                                                </Text>
                                            }
                                        </View>
                                    </Ripple>
                                </CardView>

                                {/* Video lectures */}
                                <CardView
                                    style={{
                                        width: dimensions.width / 2 - 20,
                                        height: dimensions.height / 2 - 40,
                                        backgroundColor: colors.session_color_2,
                                        marginTop: 10,
                                        marginLeft: 15
                                    }}
                                    cardElevation={3}
                                    cardMaxElevation={2}
                                    cornerRadius={5}>
                                    <Ripple style={{
                                        width: dimensions.width / 2 - 20,
                                        alignItems: 'center'
                                    }}
                                    onPress={()=>{
                                        this.props.navigation.navigate('PaidSubjects', { item:{} })
                                    }}>
                                        <View style={{
                                            width: dimensions.width / 2 - 20,
                                            height: (dimensions.height / 2 - 40) / 2 + 20,
                                            justifyContent: 'flex-end',
                                            alignItems: 'center',
                                        }}>
                                            <Image source={require('../../images/icon_session2.png')}
                                                style={{ width: dimensions.sizeRatio * 140, height: dimensions.sizeRatio * 140, resizeMode: 'contain' }} />
                                        </View>
                                        <View style={{
                                            width: dimensions.width / 2 - 15,
                                            height: (dimensions.height / 2 - 40) / 2 - 20,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10
                                        }}>
                                            <Text numberOfLines={1} style={{
                                                paddingTop: dimensions.sizeRatio * 10,
                                                color: colors.theme,
                                                paddingLeft: dimensions.sizeRatio * 15,
                                                paddingRight: dimensions.sizeRatio * 15,
                                                fontSize: dimensions.sizeRatio * 16,
                                                fontFamily: CONSTANTS.DEMI
                                            }}
                                                numberOfLines={2}>
                                                {'Video Lectures'}
                                            </Text>
                                        </View>
                                    </Ripple>
                                </CardView>
                            </View>


                            {/* Bottom view */}
                            <View style={{
                                width: '100%',
                                flexDirection: 'row',
                                paddingVertical: 10,
                                marginBottom: 10
                            }}>
                                {/* Live conference */}
                                <CardView
                                    style={{
                                        width: dimensions.width / 2 - 25,
                                        height: dimensions.height / 2 - 40,
                                        backgroundColor: colors.session_color_3,
                                        marginTop: 10,
                                        marginLeft: 15
                                    }}
                                    cardElevation={3}
                                    cardMaxElevation={2}
                                    cornerRadius={5}>
                                    <Ripple style={{
                                        width: dimensions.width / 2 - 20,
                                        alignItems: 'center'
                                    }}
                                    onPress={()=>{

                                    }}>
                                        <View style={{
                                            width: dimensions.width / 2 - 15,
                                            height: (dimensions.height / 2 - 40) / 2 + 20,
                                            justifyContent: 'flex-end',
                                            alignItems: 'center',
                                        }}>
                                            <Image source={require('../../images/icon_session3.png')}
                                                style={{ width: dimensions.sizeRatio * 140, height: dimensions.sizeRatio * 140, resizeMode: 'contain' }} />
                                        </View>
                                        <View style={{
                                            width: dimensions.width / 2 - 20,
                                            height: (dimensions.height / 2 - 40) / 2 - 20,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10
                                        }}>
                                            <Text numberOfLines={1} style={{
                                                paddingTop: dimensions.sizeRatio * 10,
                                                color: colors.theme,
                                                paddingLeft: dimensions.sizeRatio * 15,
                                                paddingRight: dimensions.sizeRatio * 15,
                                                fontSize: dimensions.sizeRatio * 16,
                                                fontFamily: CONSTANTS.DEMI
                                            }}
                                                numberOfLines={2}>
                                                {'Live Conference'}
                                            </Text>
                                            <Text numberOfLines={1}
                                                style={{
                                                    color: colors.black,
                                                    paddingLeft: dimensions.sizeRatio * 15,
                                                    paddingRight: dimensions.sizeRatio * 15,
                                                    marginTop: dimensions.sizeRatio * 5,
                                                    fontSize: dimensions.sizeRatio * 14,
                                                    marginBottom: dimensions.sizeRatio * 10
                                                }}
                                                numberOfLines={1}>
                                                {'No live session available.'}
                                            </Text>
                                        </View>
                                    </Ripple>
                                </CardView>

                                {/* e books */}
                                <CardView
                                    style={{
                                        width: dimensions.width / 2 - 20,
                                        height: dimensions.height / 2 - 40,
                                        backgroundColor: colors.session_color_4,
                                        marginTop: 10,
                                        marginLeft: 15
                                    }}
                                    cardElevation={3}
                                    cardMaxElevation={2}
                                    cornerRadius={5}>
                                    <Ripple style={{
                                        width: dimensions.width / 2 - 20,
                                        alignItems: 'center'
                                    }}
                                    onPress={()=>{
                                        this.props.navigation.navigate('PaidEbookSubects', { item:{} })
                                    }}>
                                        <View style={{
                                            width: dimensions.width / 2 - 20,
                                            height: (dimensions.height / 2 - 40) / 2 + 20,
                                            justifyContent: 'flex-end',
                                            alignItems: 'center',
                                        }}>
                                            <Image source={require('../../images/icon_session4.png')}
                                                style={{ width: dimensions.sizeRatio * 140, height: dimensions.sizeRatio * 140, resizeMode: 'contain' }} />
                                        </View>
                                        <View style={{
                                            width: dimensions.width / 2 - 15,
                                            height: (dimensions.height / 2 - 40) / 2 - 20,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginBottom: 10
                                        }}>
                                            <Text numberOfLines={1} style={{
                                                paddingTop: dimensions.sizeRatio * 10,
                                                color: colors.theme,
                                                paddingLeft: dimensions.sizeRatio * 15,
                                                paddingRight: dimensions.sizeRatio * 15,
                                                fontSize: dimensions.sizeRatio * 16,
                                                fontFamily: CONSTANTS.DEMI
                                            }}
                                                numberOfLines={2}>
                                                {'E-Books'}
                                            </Text>
                                        </View>
                                    </Ripple>
                                </CardView>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            );
        }
    }

    renderHeader = () => {
        return (
            <View
                style={{
                    width: '100%',
                    height: 55,
                    backgroundColor: colors.white,
                    paddingHorizontal: 10,
                    alignItems: 'center',
                    flexDirection: 'row'
                }}>
                <Ripple
                    onPress={() => {
                        this.handleBackButtonClick()
                    }}>
                    {backButton}
                </Ripple>
                <Text style={{ fontSize: 18, fontFamily: CONSTANTS.DEMI, color: colors.black, textAlign: 'left', marginLeft: 15 }}>
                    {'Sessions'}
                </Text>
            </View>
        )
    }
}