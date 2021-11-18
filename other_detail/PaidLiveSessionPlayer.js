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
import { Dialog } from 'react-native-simple-dialogs';
import Toast from 'react-native-tiny-toast';
import Orientation from 'react-native-orientation';
import YouTube from 'react-native-youtube'

var seekingTime = 0;
export default class PaidLiveSessionPlayer extends Component {

    //Navigation Method Remove Header in Android

    static navigationOptions = (navigation) => {
        const { state } = navigation;
        if (Platform.OS == 'android') {
            return {
                title: 'Live Streaming',
                header: null,
            }
        }
        return {
            title: 'Player',
            headerStyle: { backgroundColor: colors.theme },
            headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
            headerBackTitle: null,
            headerLeft: <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                    //hitSlop={{top: 20, bottom: 20, left: 30, right: 30}} 
                    onPress={() => {
                        navigation.navigation.state.params.methodGoBack()
                    }}
                    style={{
                        width: dimensions.sizeRatio * 35,
                        height: dimensions.sizeRatio * 25,
                        marginLeft: Platform.OS == 'android' ? dimensions.sizeRatio * 10 : dimensions.sizeRatio * 5,
                        zIndex: 1,
                        padding: dimensions.sizeRatio * 2,
                        marginBottom: Platform.OS == 'ios' ? dimensions.sizeRatio * 10 : 0,
                        justifyContent: 'center'
                    }}>
                    <Image
                        source={Platform.OS == 'ios' ? require('../../images/back.png') : require('../../images/back_two.png')}
                        style={{
                            width: Platform.OS == 'android' ? dimensions.sizeRatio * 30 : dimensions.sizeRatio * 25,
                            height: Platform.OS == 'android' ? dimensions.sizeRatio * 20 : dimensions.sizeRatio * 20,
                            marginTop: Platform.OS == 'android' ? 0 : dimensions.sizeRatio * 5,
                            tintColor: colors.white,
                            alignSelf: 'center'
                            //padding: 5
                        }}
                        resizeMode={'contain'}
                    />
                </TouchableOpacity>
            </View>,

            headerTintColor: 'white',
            // headerLeft: <BackStreamingButton />,
            gesturesEnabled: false,
            headerRight: <View />
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            access_token: '',
            isRecording: false,
            isRecording: '',
            youtubeUrl: '',
            //Previous screen name
            previousScreenName: this.props.navigation.state.params.screen_name,

            //is playing first time
            isPlayingFirstTime: false
        };
    }

    componentDidMount() {
        this.props.navigation.setParams({ methodGoBack: this.methodGoBack.bind(this) });
        if (Platform.OS == 'android')
            Orientation.lockToLandscape();
        this.setState({
            youtubeUrl: this.props.navigation.state.params.youtubeUrl
        }, () => {
            console.warn('SFS', this.state.youtubeUrl)
            if (this._getVideoSessionTiming() == true) {
                //this._playerReadyToplay()
            }
        })
    }
    componentWillUnmount() {
        if (Platform.OS == 'android')
            Orientation.lockToPortrait();
    }

    _getVideoSessionTiming() {
        try {
            let now = new Date().getTime()
            // Do your operations
            var arr = CONSTANTS.SESSION_START_DATE.split(/-|\s|:/);// split string and create array.
            let startDate = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
            //let startDate = new Date(CONSTANTS.SESSION_START_DATE);

            var arr2 = CONSTANTS.SESSION_END_DATE.split(/-|\s|:/);// split string and create array.
            let endDate = new Date(arr2[0], arr2[1] - 1, arr2[2], arr2[3], arr2[4], arr2[5]);
            // let endDate = new Date(CONSTANTS.SESSION_END_DATE );


            if (startDate.getTime() <= now && now <= endDate.getTime()) {
                let seconds = (now - startDate.getTime()) / 1000;
                seekingTime = seconds
                console.log('seekingTime', seekingTime)
                return true
            } else {
                showNativeAlert('Live Session has been ended.')
                EventRegister.emit('SessionExpried', '')
                this.methodGoBack()
                return false
            }
        } catch (err) {
            console.warn('SESSION EXCEPTION SESSION SCREEN' + JSON.stringify(err))
        }
    }

    _playerReadyToplay() {
        console.log('in player seekingTime' + seekingTime)
        this._youTubeRef.seekTo(seekingTime)
    }

    methodGoBack() {
        this.props.navigation.goBack()
        return true
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
                <View style={{ flex: 1, backgroundColor: colors.sessions_bgtheme }}>

                    <View style={{
                        flex: 1,
                        width: '100%',
                    }}>
                        {this.state.youtubeUrl != '' &&
                            <YouTube
                                ref={component => {
                                    this._youTubeRef = component;
                                }}
                                apiKey="AIzaSyCZs5LGQYP8EL8uQvvpO6SA-cFZs8kHw30"
                                videoId={this.state.youtubeUrl}
                                play={true}
                                fullscreen={true}
                                loop={true}
                                showinfo={false}
                                controls={2}
                                resumePlayAndroid={true}
                                modestbranding={false}
                                onError={e => console.log(e)}
                                style={{ width: '100%', height: '100%', backgroundColor: 'black' }}
                                // onReady={e => this.setState({ isReady: true })}
                                onChangeState={(e) => {
                                    //playing, stopped, buffering
                                    console.log('isStopPlaying', e.state)
                                    switch (e.state) {
                                        case 'loading':
                                            break;
                                        case 'seeking':
                                            break;
                                        case 'playing':
                                            if (this.state.isPlayingFirstTime) {
                                                this.setState({
                                                    isPlayingFirstTime: false
                                                }, () => {
                                                    this._getVideoSessionTiming()
                                                    this._playerReadyToplay()
                                                })
                                            } else {
                                                this.setState({
                                                    isPlayingFirstTime: true
                                                })
                                            }
                                            break;
                                    }
                                }}
                                onChangeQuality={e => this.setState({ quality: e.quality })}
                                onReady={e => {
                                    //console.warn('ONREADY', e)
                                    this._playerReadyToplay()
                                }}
                            // onError={e => this.setState({ error: Alert.alert("Error") })}
                            />
                        }
                    </View>
                </View>
            );
        }
    }
}