/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    View, Platform, Alert, StatusBar, Image,
    AppState, AsyncStorage, ActivityIndicator, Text, BackHandler, TouchableOpacity, NativeEventEmitter, NativeModules
} from 'react-native';
import colors from '../resources/colors';
import YouTube from 'react-native-youtube'
import BackStreamingButton from '../headers/BackStreamingButton'
import FullScreenButton from '../headers/FullScreenHeaderButton'
import { EventRegister } from 'react-native-event-listeners';
import CONSTANTS from '../resources/constants';
import dimensions from '../resources/dimension';
import { showNativeAlert } from '../resources/app_utility';
import renderIf from '../resources/utility.js';
import Orientation from 'react-native-orientation';
import { PermissionsAndroid } from 'react-native';
import { NavigationEvents } from 'react-navigation';

// import Telephony from 'react-native-telephony'
// import NetInfo from "@react-native-community/netinfo";

const youtubeHTML = require('../MockData/youtube.html');

var isFullScreen = false;
var isLandscape = false;
var seekingTime = 0;
var forceUpdating = false

var accessToken = ''
export default class video_streaming extends Component {

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
            title: 'Live Streaming',
            headerStyle: { backgroundColor: colors.theme },
            headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
            headerBackTitle: null,
            headerLeft: <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                    //hitSlop={{top: 20, bottom: 20, left: 30, right: 30}} 
                    onPress={() => navigation.navigation.state.params.methodGoBack()}
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
                        source={Platform.OS == 'ios' ? require('../images/back.png') : require('../images/back_two.png')}
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
            fullscreen: false,
            appState: AppState.currentState,
            isRecording: false,
            isError: false,
            access_token: '',
            youtubeUrl: this.props.navigation.state.params.youtubeUrl.trim(),
            timer: 0,
            isLoading: true,
            topicId: 0,
            videoLength: 0,
            totalView: 0,
            errorMessage: 'Failed to load the video.',
            isHandlingBack: false,
            play: true,
            isSyncTap: '',
            isCallRotatePlayIOS: false
            // alreadyConnected:true,
        };

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


    _handleAppStateChange = (nextAppState) => {

        console.log('App  state ')
        console.warn('handleForceUpdating1' + forceUpdating)
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            console.warn('App has come to the foreground!')
            forceUpdating = true
            // if (forceUpdating == true) {
            //     forceUpdating = false
            // }
            //this._playAgain()
            console.log('handleForceUpdating2' + forceUpdating)
            //console.log(forceUpdating)

            //let session = this._getVideoSessionTiming()
            console.log('_handleAppStateChange seekingTime', seekingTime)
            // if (session == true && seekingTime != null && this._youTubeRef != null) {
            //     this._youTubeRef.seekTo(seekingTime)

            // }
        }
        this.setState({ appState: nextAppState, play: true });
    }

    methodGoBack() {
        this.props.navigation.goBack()
        if (Platform.OS == 'ios') {
            NativeModules.SFViewControl.rotatePlayerLockUnlock('potrate')
            Orientation.lockToPortrait();
        } else {
            Orientation.lockToPortrait();
        }
        return true
        // setTimeout(() => {
        //     this.props.navigation.goBack()
        // }, 500);
    }

    async componentDidMount() {
        this.props.navigation.setParams({ methodGoBack: this.methodGoBack.bind(this) });
        global.isLiveConfRunningIosForLiveSessionNotHide = false;
        setTimeout(() => {
            console.warn('entervideostream1')
            if (Platform.OS == 'ios') {
                if (this.state.isCallRotatePlayIOS == false) {
                    console.warn('entervideostream2')
                    NativeModules.SFViewControl.rotatePlayerLockUnlock('unloack')
                    this.setState({
                        isCallRotatePlayIOS: true
                    })
                    console.warn('entervideostream3')
                }
            }
        }, 500);
        if (Platform.OS == 'android') {
            global.isAndroidLiveSessionOpen = true;
        }

        //Not visible notification start popup for this screen
        global.isChatLiveSessionVisible = true;
        global.navigation = this.props.navigation
        console.log('global.navigation streaming', global.navigation)
        CONSTANTS.TOP_SCREEN = 'STREAMING'
        this._getVideoSessionTiming()


        //LISTENER FOR PROFILE BUTTON TAP
        this.listener = EventRegister.addEventListener('isStopPlaying', (data) => {

            console.log('handleForceUpdating3' + forceUpdating)
            if (data == 'paused' && forceUpdating == false) {
                forceUpdating = true
                console.log(data)
                this.setState({ play: false })

                console.log('handleForceUpdating4' + forceUpdating)

            } else if (data == 'paused' && forceUpdating == true) {
                console.log('false' + data)
                this.setState({ play: false })
                console.log('handleForceUpdating5' + forceUpdating)
            }
            if (data == 'playing' && Platform.OS == 'ios') {
                forceUpdating = false
                this.setState({ play: true })
                console.log('handleForceUpdating6' + forceUpdating)
            }
        })

        if (Platform.OS == 'ios') {
            this.listener = EventRegister.addEventListener('end_live_conf_on_notification', (data) => {
                console.log('end_live_conf_on_notification getAccessToken ')
                NativeModules.SFViewControl.rotatePlayerLockUnlock('unloack')
            })
        }

        if (Platform.OS == 'android') {
            //Check start live conf notification or screen currently visible or not
            this.listener = EventRegister.addEventListener('start_live_conf_noti_android_live_session', (data) => {
                console.log('start_live_conf_noti_android_live_session getAccessToken ')
                setTimeout(() => {
                    forceUpdating = false;
                    this.setState({ play: true })
                }, 1000);
            })
        }

        let self = this;
        this.listenerSession = EventRegister.addEventListener('sessionExpire_notification', (data) => {

            const TypeMessage = self.state.isSyncTap;
            console.log('isSyncTap' + TypeMessage + " sessionExpire_notification -- " + data);
            if (TypeMessage != data) {
                self.setState({
                    isSyncTap: data
                }, () => {
                    showNativeAlert(data)
                    EventRegister.emit('SessionExpried', '')
                    self.methodGoBack()
                })

                //Put All Your Code Here, Which You Want To Execute After Some Delay Time.

            } else {
                console.log('repeating message ' + TypeMessage);
            }



        })

        AppState.addEventListener('change', this._handleAppStateChange);

        //LISTENER FOR BACK BUTTON TAP
        this.listener = EventRegister.addEventListener('FullScreenEvent', (data) => {
            this.methodGoLive()
        })

        //LISTENER FOR BACK BUTTON TAP

        //LISTENER FOR CUSTOM HARDWARE BACK BUTTON TAP
        this.listener = EventRegister.addEventListener('HardWareBackCustom', (data) => {
            this.updateVideoLog(false)
        })

        // showNativeAlert(this.state.topicId.toString())

        if(this.props.navigation.state.params.topicId != undefined && this.props.navigation.state.params.topicId != null &&
            this.props.navigation.state.params.topicId != ''){
            this.setState({
                topicId:this.props.navigation.state.params.topicId
            },()=>{
                this.interval = setInterval(
                    () => this.timerUpdated(),
                    1000
                );
                this.getAccessToken()
            })
        }else {
            this.setState({
                isLoading: false,
                isError: false,
            })
        }

        // if (this.state.topicId != 0) {

        //     // showNativeAlert(this.state.topicId.toString())

        //     // Count down timer
        //     this.interval = setInterval(
        //         () => this.timerUpdated(),
        //         1000
        //     );
        //     this.getAccessToken()
        // } else {
        //     this.setState({
        //         isLoading: false,
        //         isError: false,
        //     })
        // }


        if (CONSTANTS.SESSION_TIMER != 0) {
            // showNativeAlert('Yes')
            this.interval = setInterval(
                () => this.getAccessToken(),
                CONSTANTS.SESSION_TIMER * 60 * 1000
            );
        }



        // if(Platform.OS == 'android') {
        Orientation.unlockAllOrientations();
        Orientation.addOrientationListener(this._orientationDidChange);
        // }

        if (Platform.OS == 'ios') {
            this.addListener()
        }
    }

    addListener = () => {
        let bridge = new NativeEventEmitter(NativeModules.ScreenRecorderDetect);

        this.screenCaptureEnabled = bridge.addListener("isScreenCaptureEnabled", (res) => {
            if (res.value == true) {
                this.setState({
                    isRecording: true,
                    play: false,
                    fullScreeen: false
                }, () => {
                    //console.warn('CAPTURE2'+'\n\n'+JSON.stringify(res)+ '\n\n'+this.state.isRecording +'\n\n'+this.state.play + '\n\n'+this.state.fullscreen)
                })
            }
            else {
                //let prviousCurrentTime = this.state.currentTime;
                console.log('ONPROGRESS2')
                this.setState({ isRecording: false, play: true }, () => {
                    setTimeout(() => {
                        this._playerReadyToplay()
                    }, 1200);
                    console.warn('CAPTURE3'+'\n\n'+JSON.stringify(res)+ '\n\n'+this.state.isRecording +'\n\n'+this.state.play + '\n\n'+this.state.fullscreen)
                })
            }

        })
    }

    // async _requestAndroidPermission() {
    //     const granted = await PermissionsAndroid.request(
    //         PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    //         {
    //             'title': 'IFAS',
    //             'message': 'IFAS need to record audio permission to avoid recording.'
    //         }
    //     ).then((granted) => {
    //         //PermissionStatus = "granted" | "denied" | "never_ask_again";
    //         if (granted === true || granted === PermissionsAndroid.RESULTS.GRANTED) {
    //             var rnClass = NativeModules.RNScreenDetector;
    //             this.intervalTimer = setInterval(() => {
    //                 let data = rnClass.checkAudioVIdeoRecordingInAndroid()
    //                 if (data == true) {
    //                     this.setState({ isRecording: data, play: false })
    //                 } else if (data == false) {
    //                     this.setState({ isRecording: data, play: true })
    //                 }
    //             }, 1000);

    //         }

    //     })
    // }
    _openSettings() {
        Alert.alert('Audio record permission', 'IFAS need to record audio permission to avoid recording.', [
            {
                text: 'Open Settings', onPress: () => Linking.canOpenURL('app-settings:').then(supported => {
                    if (!supported) {
                        console.log('Can\'t handle settings url');
                    } else {
                        return Linking.openURL('app-settings:');
                    }
                }).catch(err => console.error('An error occurred', err))
            },
            { text: 'Cancel', },
        ])
    }

    _playerReadyToplay() {
        console.log('in player seekingTime' + seekingTime)
        this._youTubeRef.seekTo(seekingTime)
        this.setState({ isReady: true })
    }

    componentWillUnmount() {

        console.log("Remove Streaming")
        if (Platform.OS == 'android') {
            global.isAndroidLiveSessionOpen = false;
        }
        //Not visible notification start popup for this screen
        global.isChatLiveSessionVisible = false;
        clearInterval(this.intervalTimer);
        // Telephony.removeEventListener()

        EventRegister.removeEventListener(this.listenerSession);

        AppState.removeEventListener('change', this._handleAppStateChange);
        EventRegister.removeEventListener(this.listener);

        clearInterval(this.interval);
        Orientation.removeOrientationListener(this._orientationDidChange);


        if (this.state.topicId != 0) {
            this.updateVideoLog(false)
        }

        if (Platform.OS === "ios") {
            this.screenCaptureEnabled.remove()
        }

    }
    _onWillFocus() {
        if (Platform.OS == 'android') {
            //Orientation.unlockAllOrientations();
            //Orientation.addOrientationListener(this._orientationDidChange);
        }
    }

    _onWillBlurr() {
        if (Platform.OS == 'android') {
            Orientation.removeOrientationListener(this._orientationDidChange);
            Orientation.lockToPortrait();
        }
    }

    checkLoginStatus() {
        // showNativeAlert("Checking status")
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        fetch(CONSTANTS.BASE + CONSTANTS.CHECK_ACCESS_TOKEN, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                //   Alert.alert(responseJson.message)
                console.log(responseJson)

                if (responseJson.code != 1) {
                    this.removeItemValue('ACCESS_TOKEN')
                }


            })
            .catch((error) => {
                console.error(error);
                showNativeAlert('Network request failed')
            });
    }

    updateTimer() {
        // showNativeAlert('Updating timer')
        this.updateVideoLog()
    }

    async getAccessToken() {

        try {
            const value = await AsyncStorage.getItem('ACCESS_TOKEN');
            if (value !== null) {
                console.log('VALUE:' + value)
                accessToken = value.slice(1, -1)
                this.setState({
                    access_token: value.slice(1, -1),
                })
                this.checkLoginStatus()
            } else {
                showNativeAlert('Not logged-In')
            }
        } catch (error) {
            showNativeAlert(error.message)

        }
    }

    logoutUser() {
        showNativeAlert(CONSTANTS.LOGOUT_MESSAGE)
        CONSTANTS.TOP_SCREEN = ''
        this.props.navigation.popToTop()
        CONSTANTS.IS_LOGGED_IN = false
    }

    removeItemValue(key) {
        let self = this;
        AsyncStorage.removeItem(key).then(
            () => {
                self.logoutUser()
            },
            () => {
                console.log('rejected')
            }
        )
    }

    getVideoLog() {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('topic_video_id', this.state.topicId);
        console.log(formData)

        fetch(CONSTANTS.BASE + CONSTANTS.GET_VIDEO_LOG, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                //   Alert.alert(responseJson.message)
                console.log(responseJson)

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else if (responseJson.code == 1) {
                    this.setState({
                        isLoading: true,
                        videoLength: responseJson.data.video_length * responseJson.data.multiplier
                    }, function () {
                        // showNativeAlert(this.state.videoLength.toString())
                        if (this.state.videoLength > responseJson.data.total_view) {
                            // showNativeAlert('Can view video')
                            this.setState({
                                isLoading: false,
                                isError: false,
                            })
                        } else {
                            // showNativeAlert('Cannot view video')
                            clearInterval(this.interval);
                            this.setState({
                                errorMessage: 'You have reached your time limit for this video.',
                                isLoading: false,
                                isError: true,
                                timer: 0,
                            })
                        }
                    });
                }


            })
            .catch((error) => {
                console.log(error);
                clearInterval(this.interval);
                this.setState({
                    isLoading: false,
                    isError: true,
                    timer: 0,
                })
            });
    }

    updateVideoLog(isBackButton = true) {
        const divisor = (this.state.timer / 60) | 0

        this.setState({
            isHandlingBack: true,
            timer: 0
        })



        // showNativeAlert('DIVISOR: ' + divisor.toString())
        if (divisor == 0) {
            if (isBackButton) {
                this.methodGoBack()
            }

        } else {
            const formData = new FormData();
            formData.append('access_token', this.state.access_token);
            formData.append('topic_video_id', this.state.topicId);
            formData.append('duration', divisor);
            console.log(formData)

            fetch(CONSTANTS.BASE + CONSTANTS.SET_VIDEO_LOG, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            }).then((response) => response.json())
                .then((responseJson) => {

                    this.setState({
                        isHandlingBack: false,
                    })

                    console.log(responseJson)

                    if (isBackButton) {
                        this.methodGoBack()
                    }

                })
                .catch((error) => {
                    console.error(error);
                    this.setState({
                        isHandlingBack: false,
                    })
                    if (isBackButton) {
                        this.methodGoBack()
                    }
                });
        }


    }

    timerUpdated() {
        this.setState({ timer: ++this.state.timer })
        // showNativeAlert(this.state.timer.toString())
    }



    _orientationDidChange = (orientation) => {
        console.log('handleForceUpdating7' + forceUpdating)
        Orientation.unlockAllOrientations()
        if (orientation === 'LANDSCAPE') {
            // do something with landscape layout
            console.log('handleForceUpdating8' + forceUpdating)
            isLandscape = true
            console.log('LANDSCAPE')
            if (forceUpdating == true) {
                this.setState({
                    play: true
                })
            }
            // this.setState({fullscreen:true})

        } else {
            isLandscape = false
            // do something with portrait layout
            console.log('handleForceUpdating9' + forceUpdating)
            console.log('PORTRAIT')
            if (forceUpdating == true) {
                this.setState({ play: true })
            }


        }

    }

    methodGoLive() {
        if (this.state.fullscreen == false) {
            isFullScreen = true
            this.setState({ fullscreen: true })

        } else {
            this.setState({ fullscreen: false })
            console.log('set iniline screen')
        }
    }


    togglePlay = (e) => {
        console.log(e)
        let self = this;

        setTimeout(function () {

            console.log(e)
            self.setState({ play: true });

        }, 100);
    };

    togglePlayClick = (e) => {

        let self = this;

        setTimeout(function () {
            console.log(!e)
            self.setState(s => ({ play: !e }));
            //   this.forceUpdate()
        }, 200);
    };

    _playAgain() {
        console.log('play again', seekingTime)
        forceUpdating = false
        this._getVideoSessionTiming()
        this._youTubeRef.seekTo(seekingTime)
        this.setState({ play: true })
        console.log('handleForceUpdating10' + forceUpdating)
    }

    methodFullScreen(e) {
        console.log("Method full screen")
    }

    render() {



        if (this.state.isRecording) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>

                    <NavigationEvents
                        onWillFocus={payload => this._onWillFocus()}
                        onWillBlur={payload => this._onWillBlurr()}
                    />
                    <ActivityIndicator />

                    <Text style={{ top: 10, fontSize: (dimensions.sizeRatio * 15), textAlignVertical: "center", color: colors.black, fontFamily: CONSTANTS.DEMI }}>
                        ⚠️ Video Recording not allowed!! ⚠️
                    </Text>
                </View>
            )
        }
        else if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>

                    <NavigationEvents
                        onWillFocus={payload => this._onWillFocus()}
                        onWillBlur={payload => this._onWillBlurr()}
                    />
                    <ActivityIndicator />

                    <Text style={{ top: 10, fontSize: (dimensions.sizeRatio * 20), textAlignVertical: "center", color: colors.black, fontFamily: CONSTANTS.DEMI }}>
                        Please wait...
                    </Text>
                </View>
            )
        }
        else {

            if (this.state.isError) {
                return (
                    <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>

                        <NavigationEvents
                            onWillFocus={payload => this._onWillFocus()}
                            onWillBlur={payload => this._onWillBlurr()}
                        />
                        <Text style={{ fontSize: dimensions.sizeRatio * 16, fontFamily: CONSTANTS.DEMI }}>
                            {this.state.errorMessage}
                        </Text>
                    </View>
                )
            } else {
                if (Platform.OS == 'android') {
                    return (

                        <View
                            style={{
                                flex: 1, backgroundColor: 'tranparent',
                                justifyContent: 'center'
                            }}
                        // onStartShouldSetResponder={() => this.methodGoLive()}
                        >

                            <NavigationEvents
                                onWillFocus={payload => this._onWillFocus()}
                                onWillBlur={payload => this._onWillBlurr()}
                            />
                            <YouTube
                                ref={component => {
                                    this._youTubeRef = component;
                                }}
                                apiKey="AIzaSyCZs5LGQYP8EL8uQvvpO6SA-cFZs8kHw30"
                                videoId={this.state.youtubeUrl} // The YouTube video ID
                                play={this.state.play}
                                // play={true}    		
                                fullscreen={false}
                                // control playback of video with true/false
                                // control whether the video should play in fullscreen or inline
                                loop={true}             // control whether the video should loop when ended
                                showinfo={false}
                                controls={0}
                                resumePlayAndroid={true}
                                // modestbranding={false}

                                onError={e => console.log(e)}
                                onChangeFullscreen={e => this.methodFullScreen(e)}
                                // onChangeFullscreen={e => console.log(e)}
                                onReady={e => this._playerReadyToplay()}


                                style={{ height: dimensions.width - 30, backgroundColor: 'black', justifyContent: 'center', }}
                                // onReady={e => this.setState({ isReady: true })}
                                onChangeState={(e) => {
                                    EventRegister.emit('isStopPlaying', e.state)
                                }
                                }
                                onChangeQuality={e => this.setState({ quality: e.quality })}
                            // onError={e => this.setState({ error: Alert.alert("Error") })}
                            />

                            {
                                forceUpdating == true ?
                                    <View style={{
                                        flex: 1, height: dimensions.width - 30, width: isLandscape === false ? dimensions.width : dimensions.height,
                                        justifyContent: 'center', alignItems: 'center', position: 'absolute', backgroundColor: 'rgba(0,0,0,0.5)'
                                    }}>
                                        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', width: 100, height: 100 }}
                                            onPress={this._playAgain.bind(this)}>
                                            <Image source={require('../images/play_icon.png')}
                                                style={{ justifyContent: 'center', tintColor: 'white', alignItems: 'center', width: 50, height: 50, resizeMode: 'contain' }} />
                                        </TouchableOpacity>
                                    </View> : null
                            }

                        </View>
                    )
                } else {
                    return (

                        <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'center', }}>

                            <NavigationEvents
                                onWillFocus={payload => this._onWillFocus()}
                                onWillBlur={payload => this._onWillBlurr()}
                            />
                            <Text style={{ top: 0, width: (isLandscape === true ? dimensions.height : dimensions.width), height: (isLandscape === true ? 120 : (dimensions.height == 568 ? 210 : 250)), zIndex: 20, backgroundColor: 'transparent', position: 'absolute' }}> </Text>
                            <YouTube
                                ref={component => {
                                    this._youTubeRef = component;
                                }}
                                apiKey="AIzaSyCZs5LGQYP8EL8uQvvpO6SA-cFZs8kHw30"
                                videoId={this.state.youtubeUrl} // The YouTube video ID
                                play={this.state.play}             // control playback of video with true/false
                                fullscreen={this.state.fullscreen}       // control whether the video should play in fullscreen or inline
                                loop={true}             // control whether the video should loop when ended
                                showinfo={false}
                                controls={0}
                                // modestbranding={false}
                                onChangeState={(e) => {
                                    EventRegister.emit('isStopPlaying', e.state)
                                }
                                }
                                onReady={e => this._playerReadyToplay()}
                                // onChangeState={e => this.setState({ status: e.state })}
                                onChangeQuality={e => this.setState({ quality: e.quality })}
                                // onError={e => this.setState({ error:  console.log(error) })}   if (orientation === 'LANDSCAPE') {   Platform.OS == 'android'  *** 
                                style={{ alignSelf: 'stretch', height: dimensions.sizeRatio * (isLandscape === true ? dimensions.width - 25 : 400), top: 0 }}
                            />
                            <View style={{
                                height: this.state.fullscreen === true ? dimensions.width / 3 : dimensions.height / 3,
                                width: isLandscape === true ? dimensions.height : dimensions.width,
                                backgroundColor: 'transparent',
                                position: 'absolute', bottom: 0
                            }}></View>

                            {
                                forceUpdating == true ?
                                    <View style={{
                                        flex: 1, height: dimensions.sizeRatio * (isLandscape === true ? dimensions.width - 25 : 400),
                                        width: isLandscape === false ? dimensions.width : dimensions.height, justifyContent: 'center',
                                        alignItems: 'center', position: 'absolute',
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        //backgroundColor: 'pink',
                                    }}>
                                        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', width: 100, height: 100 }}
                                            onPress={this._playAgain.bind(this)}>
                                            <Image source={require('../images/play_icon.png')}
                                                style={{ justifyContent: 'center', tintColor: 'white', alignItems: 'center', width: 50, height: 50, resizeMode: 'contain' }} />
                                        </TouchableOpacity>
                                    </View> : null
                            }

                        </View>
                    )
                }
            }
        }
    }
}

