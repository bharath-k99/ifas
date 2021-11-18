/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    View, Platform, Alert, AsyncStorage, ActivityIndicator, Text, NativeEventEmitter, NativeModules,
    BackHandler, TouchableWithoutFeedback, Image, TouchableOpacity, FlatList
} from 'react-native';
import colors from '../resources/colors';
import YouTube from 'react-native-youtube'
import BackPlayerButton from '../headers/BackPlayerButton'
import { EventRegister } from 'react-native-event-listeners';
import CONSTANTS from '../resources/constants';
import dimensions from '../resources/dimension';
import { showNativeAlert } from '../resources/app_utility';
// import WebView from 'react-native-android-fullscreen-webview-video';
import AndroidPlayer from '../screens/AndroidPlayer';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation';
import { PermissionsAndroid } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import ytdl from "react-native-ytdl"
import Toast from 'react-native-tiny-toast';

let timer = 0
let priviousstate = true

export default class video_player extends Component {

    static navigationOptions = (navigation) => {
        const { state } = navigation;
        if (Platform.OS == 'android') {
            return {
                title: 'Video Player',
                header: null,
            }
        }
        // title: `${navigation.state.params.Headertitle}`,
        return {
            title: 'Video Player', //this.state.headerTitle != undefined && this.state.headerTitle != '' ? this.state.headerTitle : '',
            headerStyle: { backgroundColor: colors.theme },
            headerTintColor: 'white',

            headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
            // headerLeft: <BackPlayerButton />,
            gesturesEnabled: false,
            headerRight: <View />
        }

    };

    constructor(props) {
        super(props);
        this.state = {
            isError: false,
            isRecording: false,
            access_token: '',
            fullScreeen: false,
            youtubeUrl: this.props.navigation.state.params.youtubeUrl,

            isLoading: true,
            topicId: this.props.navigation.state.params.topicId == null ? 0 : this.props.navigation.state.params.topicId,
            videoLength: 0,
            totalView: 0,
            errorMessage: 'Failed to load the video.',
            isHandlingBack: false,
            user_id: '',
            resizeMode: 'contain',
            headerTitle: '',

            //updated code by PRVN SINGH RATHORE
            isSessionTimer: 0,
            updateTimeForSharePref: 0,
            previousTotalViewVideoSize: 0,
            totalVideoSize: 0,
            remainingViewVideoSize: 0,
            frameRateDefault: 1.0,
            isSpeedSelect: false,
            frameRateArray: [
                { time: 0.25, is_selected: false, id: 1 }, { time: 0.50, is_selected: false, id: 2 },
                { time: 0.75, is_selected: false, id: 3 },
                { time: 1.0, is_selected: true, id: 4 }, { time: 1.25, is_selected: false, id: 5 },
                { time: 1.50, is_selected: false, id: 6 }, { time: 1.75, is_selected: false, id: 7 },
                { time: 2.0, is_selected: false, id: 8 }
            ]
        };
        this.onLoadStart = this.onLoadStart.bind(this);
        this.onLoad = this.onLoad.bind(this);
        this.interval = undefined;
    }

    onLoad(data) {
        // alert('On load fired!')
        console.log('On load fired!');
        if (this.state.isVideoLoading == true) {
            this.setState({ isVideoLoading: false });
        }
    }
    onBuffer() {
        console.log('On buffer!!');
    }
    videoError(err) {
        console.log(err);
    }

    onLoadStart(data) {
        console.log('On load fired!');
        this.setState({ isVideoLoading: true });
    }

    componentDidMount() {
        global.navigation = this.props.navigation
        console.log('without delay')
        console.log('global.navigation player', global.navigation)
        setTimeout(function () {
            console.log('with delay')
            console.log('global.navigation player', global.navigation)
        }, 10000);
        //LISTENER FOR CUSTOM HARDWARE BACK BUTTON TAP
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

        // I need change when application live
        if (this.state.topicId != 0) {
            if (this.props.navigation.state.params.youtubeUrl.includes('https://www.youtube.com/')) {
                this.setState({
                    isLoading: true,
                    isError: false,
                })
                this.getQualityAfterExtractYoutubeURL(this.props.navigation.state.params.youtubeUrl)
                //this.extractorYoutubeURL(this.props.navigation.state.params.youtubeUrl)
            } else {
                this.getAccessToken('normal_type')
            }

        } else {
            // this.setState({
            //     isLoading: false,
            //     isError: false,
            // })
            // this.setState({
            //     isLoading: true,
            //     isError: false,
            // })
            // this.extractorYoutubeURL(this.props.navigation.state.params.youtubeUrl)
            //this.extractorYoutubeURL('https://www.youtube.com/watch?v=yuDsz2633dA')
        }
        if (Platform.OS == 'android') {
            Orientation.unlockAllOrientations();
            Orientation.addOrientationListener(this._orientationDidChange);
        }
    }

    handleBackButtonClick = () => {
        if (this.state.topicId != 0 && this.state.access_token != '') {
            console.warn('HardWareBackCustom1')
            this.checkLoginStatus('back_press', undefined);
        } else {
            console.warn('HardWareBackCustom2')
            this.methodGoBack()
        }
    }

    methodGoBack = () => {
        clearInterval(this.intervalTimer);
        clearInterval(this.interval);
        this.props.navigation.goBack();
        return true;
    }
    _onLayout = event => {
        const { width, height } = event.nativeEvent.layout;
        if (width > height) {
            this.setState({ resizeMode: 'stretch' });
        } else {
            this.setState({ resizeMode: 'contain' });
        }
    }

    onFullscreenPlayerWillPresent = (event) => {
        console.log(event)
        if (Platform.OS == 'ios') {
            var RNScreenDetector = NativeModules.RNScreenDetector;
            const myModuleEvt = new NativeEventEmitter(NativeModules.RNScreenDetector)
            myModuleEvt.addListener('screen_recording', (data) => {
                console.log('is screeen recording' + data)
                if (data) {
                    this.setState({ isRecording: data, play: false, fullScreeen: false })
                } else {
                    this.player.seek(this.player.seek, 50);
                    this.setState({ isRecording: data, play: true, fullScreeen: this.state.fullScreeen })
                }
            })
            RNScreenDetector.startObservingRecording()
        }
    }

    getAccessToken(url_type) {
        let self = this;
        AsyncStorage.getItem("ACCESS_TOKEN").then(value => {
            console.log('ACCESS_TOKEN VALUE' + JSON.stringify(value))
            if (value != null) {
                console.log('VALUE:' + value)
                self.setState({
                    access_token: value.slice(1, -1),
                }, () => {
                    self.getVideoLog(url_type)
                })
            } else {
                self.getVideoLog(url_type)
                // showNativeAlert('Not logged-In')
            }
        })
    }

    getVideoLog(url_type) {
        const formData = new FormData();
        formData.append('topic_video_id', this.state.topicId);

        let strURl = CONSTANTS.BASE + CONSTANTS.GET_VIDEO_LOG
        if (this.state.access_token == '') {
            strURl = CONSTANTS.BASE + CONSTANTS.GET_VIDEO_LOG_FREE
        } else {
            formData.append('access_token', this.state.access_token);
        }
        console.log('url_type' + url_type + '\n\n' + strURl + '\n\n' + this.state.topicId + '\n\n' + this.state.access_token)
        let self = this;

        fetch(strURl, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.warn('getVideoooLOG' + JSON.stringify(responseJson) + '\n\n' + self.state.youtubeUrl)

                if (responseJson.code == 201) {
                    self.removeItemValue('ACCESS_TOKEN')
                } else if (responseJson.code == 1) {

                    let videoURL = (responseJson.data.tmp_url != '') ? responseJson.data.tmp_url : self.state.youtubeUrl;
                    //let videoURL = (CONSTANTS.VIDEO_TYPE == 1) ? ((responseJson.data.tmp_url != '') ? responseJson.data.tmp_url : self.state.youtubeUrl) : self.state.youtubeUrl
                    // var RNScreenDetector = NativeModules.RNScreenDetector;
                    // RNScreenDetector.openAVPlayerController(videoURL)
                    // if (Platform.OS == 'android') {
                    //     console.log(videoURL)
                    //     const rnClass = NativeModules.RNScreenDetector;
                    //     rnClass.androidNativePlayer(videoURL)
                    // }  
                    //timer = responseJson.data.timer;

                    console.warn('videoURRR' + videoURL)

                    if (responseJson.data.video_length * responseJson.data.multiplier * 60 * 2 > responseJson.data.TOTAL_VIEW) {

                        if (url_type == 'normal_type') {
                            self.setState({
                                youtubeUrl: videoURL,
                            })
                        }

                        self.setState({
                            isLoading: true,
                            videoLength: responseJson.data.video_length * responseJson.data.multiplier,
                            user_id: responseJson.data.USER_ID,
                            isSessionTimer: responseJson.data.timer,
                            previousTotalViewVideoSize: responseJson.data.TOTAL_VIEW,
                            totalVideoSize: responseJson.data.video_length * responseJson.data.multiplier * 60
                        }, function () {
                            console.log('enter true data normal youtube1')
                            if (self.state.videoLength * 60 > responseJson.data.TOTAL_VIEW) {
                                self.setState({
                                    isLoading: false,
                                    isError: false,
                                    remainingViewVideoSize: this.state.totalVideoSize - this.state.previousTotalViewVideoSize
                                })
                                console.log('enter true data normal youtube2')
                                if (responseJson.data.timer != 0 && responseJson.data.timer == 1) {
                                    //if (responseJson.data.timer == 0) {
                                    console.log('enter true data.timer1')
                                    AsyncStorage.getItem("SESSION_VIDEO_TIMER_COUNT").then(time => {
                                        let item = JSON.parse(time);
                                        console.log('enter true data.timer000 getVideoLog' + JSON.stringify(item))
                                        if (time != undefined && time != null && time != '') {
                                            console.log('enter true data.timer000 getVideoLog')
                                            if (item.video_id == this.state.topicId) {
                                                //console.warn('sahi gaya h..')
                                                self.checkLoginStatus('', item);
                                            }
                                        } else {
                                            console.log('enter true data.timer3')
                                            self.startTimerInterval()
                                        }
                                    }).catch(err => {
                                        console.log(err)
                                        self.startTimerInterval()
                                    });
                                } else {
                                    console.log('enter false data.timer')
                                }
                            } else {
                                clearInterval(this.interval);

                                self.setState({
                                    errorMessage: 'You have reached your time limit for this video.',
                                    isLoading: false,
                                    isError: true,
                                    youtubeUrl: undefined
                                })
                            }
                        });
                    } else {
                        clearInterval(this.interval);

                        self.setState({
                            errorMessage: 'You have reached your time limit for this video.',
                            isLoading: false,
                            isError: true,
                            youtubeUrl: undefined
                        })
                    }

                }
            })
            .catch((error) => {
                console.log('error log video' + JSON.stringify(error));
                clearInterval(this.interval);
                timer = 0;
                self.setState({
                    isLoading: false,
                    isError: true,
                })
            });
    }

    getQualityAfterExtractYoutubeURL = (youtubeUrl) => {
        let self = this;
        try {
            AsyncStorage.getItem(CONSTANTS.STORE_QUALITY).then(value => {
                console.log('CONSTANTS.STORE_QUALITY1:' + value)
                if (value != undefined) {
                    console.log('CONSTANTS.STORE_QUALITY2:' + value)
                    const item = JSON.parse(value);
                    this.extractorYoutubeURL(youtubeUrl, item)
                } else {
                    let storeQuality = JSON.stringify({ name: 'Video Quality: ', value: 360, is_selected: false })
                    const item = JSON.parse(storeQuality);
                    this.extractorYoutubeURL(youtubeUrl, item)
                }
            })
        } catch (error) {
            console.log('retrieveItem called error' + error.message);
            let storeQuality = JSON.stringify({ name: 'Video Quality: ', value: 360, is_selected: false })
            const item = JSON.parse(storeQuality);
            this.extractorYoutubeURL(youtubeUrl, item)
        }
    }

    extractorYoutubeURL = (youtubeUrl, videoQuality) => {

        //let youtubeUrl2 = 'https://www.youtube.com/watch?v=FEU-LZiZIV4&list=RDFEU-LZiZIV4&start_radio=1';
        //let youtubeUrl2 = 'https://www.youtube.com/watch?v=4XeruKiMbE8';

        console.warn('Format found! url' + JSON.stringify(youtubeUrl));
        let storeQualityData = videoQuality
        let qualityForVideo = '18';
        if (storeQualityData.value == 360) {
            qualityForVideo = '18'
        } else {
            qualityForVideo = '22'
        }
        ytdl.getInfo(youtubeUrl, {}, (err, info) => {
            //if (err) 

            console.log('format error' + JSON.stringify(err) + '\n\n' + JSON.stringify(info));
            if (info != undefined && info.formats != undefined) {
                //17 video 144
                //18 video 360
                //83 video 240
                //22 video 720
                //137 video 1080
                //101 audio 140
                let format = ytdl.chooseFormat(info.formats, { quality: qualityForVideo });
                console.warn('Format found!' + JSON.stringify(format));
                if (format != undefined && format.url != undefined) {

                    this.setState({
                        youtubeUrl: format.url,
                        isLoading: false,
                        isError: false,
                    })
                }
                else {

                    let format = ytdl.chooseFormat(info.formats, { quality: '18' });
                    console.warn('Format found Again18!' + JSON.stringify(format));
                    if (format != undefined && format.url != undefined) {

                        this.setState({
                            youtubeUrl: format.url,
                            isLoading: false,
                            isError: false,
                        })
                    } else {
                        this.setState({
                            isLoading: false,
                            isError: false,
                        }, () => {
                            this.getAccessToken('normal_type')
                        })
                    }
                }
            } else {
                this.setState({
                    isLoading: false,
                    isError: false,
                }, () => {
                    this.getAccessToken('normal_type')
                })
                // this.setState({
                //     errorMessage: 'This is not youtube URL.',
                //     isLoading: false,
                //     isError: true,
                // })
            }
        });
    }
    startTimerInterval = () => {
        console.log('enter true data.timer000 updateVideoLog startTimer')
        //Need to replace 5000 to 60000
        console.log('enter true data.timer1 timer1')
        setTimeout(() => {
            console.log('enter true data.timer1 timer2')
            this.interval = setInterval(
                () => this.timerUpdated(),
                1000);
        }, 60000);
    }

    timerUpdated() {
        console.log('enter true data.timer000 updateVideoLog timerUpdated')
        console.log('enter true data.timer1 timer2time' + timer)
        timer = ++timer;
        this.setState({
            updateTimeForSharePref: timer
        }, () => {
            let sessionObject = {
                time: timer,
                video_id: this.state.topicId
            }
            AsyncStorage.setItem('SESSION_VIDEO_TIMER_COUNT', JSON.stringify(sessionObject)).then(time => {
                console.log('SESSION_VIDEO_TIMER_COUNT', time)

            }).catch(err => console.log('SESSION_VIDEO_TIMER_COUNT' + err));
        })

        let previousTotalViewVideoSizeLocal = this.state.previousTotalViewVideoSize;
        let totalVideoSizeLocal = this.state.totalVideoSize;
        let newPreviousTotalVideoSizeLocal = timer + previousTotalViewVideoSizeLocal;
        if (newPreviousTotalVideoSizeLocal >= totalVideoSizeLocal) {
            console.log('enter true data.timer1 timer2time' + 'stop')
            clearInterval(this.interval);
            this.setState({
                errorMessage: 'You have reached your time limit for this video.',
                isLoading: false,
                isError: true,
                youtubeUrl: undefined
            })
        }
    }

    logoutUser() {
        showNativeAlert(CONSTANTS.LOGOUT_MESSAGE)
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
    checkLoginStatus(callMethodName, timerObject) {

        if (CONSTANTS.IS_LOGGED_IN == false) {
            console.warn('checkLoginStatu return')
            return
        }
        console.warn('checkLoginStatu not' + this.state.access_token)
        let self = this;
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
                if (responseJson.code != 1) {
                    console.warn('checkLoginStatu' + JSON.stringify(responseJson))
                    self.removeItemValue('ACCESS_TOKEN')

                } else if (responseJson.code == 200) {

                    this.updateVideoLog(callMethodName, timerObject)
                } else if (responseJson.code == 1) {
                    console.warn('checkLoginStatu sucess')
                    console.log('enter true data.timer000 loginStatus' + JSON.stringify(responseJson))
                    this.updateVideoLog(callMethodName, timerObject)
                }
            })
            .catch((error) => {
                console.log('error login status' + error);
                showNativeAlert('Network request failed')
            });
    }

    updateVideoLog(callMethodName, timerObject) {
        // const divisor = (this.state.timer / 60) | 0
        console.warn('update time of video' + timer);
        let divisor = 0;
        if (timerObject != undefined && timerObject != null && timerObject.time != undefined) {
            divisor = timerObject.time
            console.log('enter true data.timer000 updateVideoLog obj' + JSON.stringify(timerObject) + '\n\n' + timerObject.time)
        } else {
            divisor = timer;
            console.log('enter true data.timer000 updateVideoLog without obj' + divisor)
        }
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('topic_video_id', this.state.topicId);
        formData.append('duration', divisor);
        formData.append('user_id', this.state.user_id);
        console.log(formData)

        fetch(CONSTANTS.BASE + CONSTANTS.SET_VIDEO_LOG, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        })
            .then((response) => response.json())
            .then((responseJson) => {
                console.log('set video log', responseJson)
                if (callMethodName === 'back_press') {
                    AsyncStorage.removeItem('SESSION_VIDEO_TIMER_COUNT').then(
                        () => {
                            console.log('SESSION_VIDEO_TIMER_COUNT' + 'SUCCESS CLEAR back_press')
                        },
                        () => {
                            console.log('rejected back_press')
                        }
                    )
                    this.methodGoBack()
                } else {
                    console.log('enter true data.timer000 updateVideoLog withoutBack')
                    AsyncStorage.removeItem('SESSION_VIDEO_TIMER_COUNT').then(
                        () => {
                            console.log('SESSION_VIDEO_TIMER_COUNT' + 'SUCCESS CLEAR without back_press')
                        },
                        () => {
                            console.log('rejected without back_press')
                        }
                    )

                    this.startTimerInterval()
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

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

    componentWillUnmount() {
        if (Platform.OS == 'android') {
            Orientation.removeOrientationListener(this._orientationDidChange);
            Orientation.lockToPortrait();
        }
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        clearInterval(this.intervalTimer);
        console.log("Unmounted")
        clearInterval(this.interval);
        // if (Platform.OS == 'ios') {
        //     var RNScreenDetector = NativeModules.RNScreenDetector;
        //     RNScreenDetector.removeObservingRecording()
        // }

        if (CONSTANTS.fSESSION_TIMER == 0) {
            return
        }
        if (this.state.topicId != 0 && this.state.access_token != '') {
            console.log('enter true data.timer1 timer3')
            //this.checkLoginStatus('back_press');
            //this.updateVideoLog()
        }
        timer = ++timer
        // this.setState({timer: ++this.state.timer})

    }

    _orientationDidChange = (orientation) => {
        if (orientation === 'LANDSCAPE') {
            console.log('LANDSCAPE')

            this.setState({
                fullScreeen: true
            })
            // Orientation.lockToLandscape()
        } else {
            console.log('PORTRAIT')
            // Orientation.lockToLa

        }

    }
    _onWillFocus() {
        if (Platform.OS == 'android') {
            Orientation.unlockAllOrientations();
            Orientation.addOrientationListener(this._orientationDidChange);
        }
    }

    _onWillBlurr() {
        if (Platform.OS == 'android') {
            Orientation.removeOrientationListener(this._orientationDidChange);
            Orientation.lockToPortrait();
        }
    }

    _onPressButton = (item) => {
        let previousFrameRateArray = this.state.frameRateArray;
        previousFrameRateArray.forEach(element => {
            if (item.id == element.id) {
                element.is_selected = true
            } else {
                element.is_selected = false
            }
        });
        this.setState({
            frameRateDefault: item.time,
            isSpeedSelect: false,
            frameRateArray: [...previousFrameRateArray]
        }, () => {
            Toast.showSuccess(item.time + 'X')
        });
    }

    render() {

        //console.log(this.state.youtubeUrl)
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

        if (this.state.isLoading) {
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
        } else {

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
                    return (<View style={{ backgroundColor: 'black', flex: 1 }}>

                        <NavigationEvents
                            onWillFocus={payload => this._onWillFocus()}
                            onWillBlur={payload => this._onWillBlurr()}
                        />

                        {
                            this.state.isVideoLoading == true ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                                <ActivityIndicator />
                                <Text style={{
                                    top: 10, fontSize: (dimensions.sizeRatio * 14),
                                    textAlignVertical: "center", color: colors.white,
                                    fontFamily: CONSTANTS.DEMI
                                }}>buffering video...</Text>
                            </View> : null
                        }
                        {this.state.youtubeUrl != undefined &&
                            <AndroidPlayer
                                url={this.state.youtubeUrl}
                                rate={this.state.frameRateDefault}
                                buffingName={'video'}
                            //selectedVideoTrack={{ type: "resolution", value: 144 }}
                            />
                        }
                        <View
                            style={{
                                width: '100%',
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                position: 'absolute',
                                top: 0,
                                center: 0,
                                backgroundColor: colors._transparent,
                            }}>
                            {this.state.isSpeedSelect &&
                                <FlatList
                                    style={{
                                    }}
                                    contentContainerStyle={{
                                        flexGrow: 1,
                                        justifyContent: 'flex-end',
                                    }}
                                    horizontal
                                    data={this.state.frameRateArray}
                                    keyExtractor={(item, index) => item}
                                    renderItem={({ item, index }) => this.renderItemFrameRate(item, index)}
                                />}
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({
                                        isSpeedSelect: !this.state.isSpeedSelect
                                    })
                                }}
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 2,
                                    borderRadius: 25,
                                    width: 44,
                                    height: 44,
                                    marginRight: 3,
                                    marginTop: 3,
                                    marginLeft: 10,
                                    backgroundColor: colors.theme,
                                }}>
                                <Text style={{
                                    fontSize: (dimensions.sizeRatio * 12),
                                    textAlignVertical: "center",
                                    color: colors.white,
                                    fontWeight: 'bold',
                                    fontFamily: CONSTANTS.MEDIUM
                                }}>SPEED</Text>
                            </TouchableOpacity>
                        </View>
                    </View>)
                } else {
                    return (
                        <View style={{ backgroundColor: 'black', flex: 1 }}>

                            <NavigationEvents
                                onWillFocus={payload => this._onWillFocus()}
                                onWillBlur={payload => this._onWillBlurr()}
                            />
                            {this.state.youtubeUrl != undefined &&
                                <Video onLayout={this._onLayout} source={{ uri: this.state.youtubeUrl }}   // Can be a URL or a local file.
                                    controls={true}
                                    play={this.state.play}
                                    fullscreen={this.state.fullScreeen}
                                    resizeMode="contain"
                                    onLoadStart={this.onLoadStart}
                                    onLoad={this.onLoad}
                                    style={{ flex: 1 }}

                                    ref={(ref) => {
                                        this.player = ref
                                    }}                                      // Store reference
                                    onBuffer={this.onBuffer}                // Callback when remote video is buffering
                                    onError={this.videoError}
                                    rate={this.state.frameRateDefault}
                                />
                            }
                            <View
                                style={{
                                    width: '85%',
                                    flexDirection: 'row',
                                    justifyContent: 'flex-end',
                                    alignSelf: 'flex-end',
                                    alignItems: 'center',
                                    position: 'absolute',
                                    backgroundColor: colors._transparent,
                                }}>
                                {this.state.isSpeedSelect &&
                                    <FlatList
                                        style={{
                                        }}
                                        contentContainerStyle={{
                                            flexGrow: 1,
                                            justifyContent: 'flex-end',
                                        }}
                                        horizontal
                                        data={this.state.frameRateArray}
                                        keyExtractor={(item, index) => item}
                                        renderItem={({ item, index }) => this.renderItemFrameRate(item, index)}
                                    />}
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({
                                            isSpeedSelect: !this.state.isSpeedSelect
                                        })
                                    }}
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 2,
                                        borderRadius: 25,
                                        width: 44,
                                        height: 44,
                                        marginLeft: 10,
                                        marginRight: 3,
                                        marginTop: 3,
                                        backgroundColor: colors.theme,
                                    }}>
                                    <Text style={{
                                        fontSize: (dimensions.sizeRatio * 10),
                                        textAlignVertical: "center",
                                        textAlign: 'justify',
                                        marginTop: 3,
                                        color: colors.white,
                                        fontWeight: 'bold',
                                        fontFamily: CONSTANTS.MEDIUM
                                    }}>SPEED</Text>
                                </TouchableOpacity>
                            </View>
                            {
                                this.state.isVideoLoading == true ?
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                                        <ActivityIndicator />
                                        <Text style={{
                                            top: 10, fontSize: (dimensions.sizeRatio * 14),
                                            textAlignVertical: "center", color: colors.white,
                                            fontFamily: CONSTANTS.DEMI
                                        }}>buffering video...</Text>
                                    </View> : null
                            }
                        </View>
                    )
                }
            }
        }
    }

    renderItemFrameRate = (item, index) => {
        return (
            <TouchableOpacity
                onPress={() => {
                    this._onPressButton(item)
                }}
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 2,
                    borderRadius: 15,
                    marginLeft: 5,
                    marginRight: Platform.OS === 'ios' ? index == 4 ? 1 : 0 : 0,
                    width: 33,
                    height: 33,
                    backgroundColor: item.is_selected ? colors.white : colors.theme
                }}>
                <Text style={{
                    fontSize: (dimensions.sizeRatio * 12),
                    color: item.is_selected ? colors.theme : colors.white,
                    marginTop: Platform.OS == 'ios' ? 3 : 0,
                    textAlign: 'center',
                    alignSelf: 'center',
                    fontFamily: CONSTANTS.MEDIUM,
                }}>{item.time}</Text>
            </TouchableOpacity>
        )
    }
}



{/* For rate 1X */ }
// {this.state.isSpeedSelect &&
//     <TouchableOpacity
//         onPress={() => {
//             this._onPressButton(1.0)
//         }}
//         style={{
//             alignItems: 'center',
//             justifyContent: 'center',
//             padding: 5,
//             borderRadius: 15,
//             backgroundColor: colors.theme
//         }}>
//         <Text style={{
//             fontSize: (dimensions.sizeRatio * 15),
//             textAlignVertical: "center",
//             color: colors.white,
//             fontFamily: CONSTANTS.MEDIUM
//         }}>1X</Text>
//     </TouchableOpacity>
// }
// {/* For rate 2X */}
// {this.state.isSpeedSelect &&
//     <TouchableOpacity
//         onPress={() => {
//             this._onPressButton(2.0)
//         }}
//         style={{
//             alignItems: 'center',
//             justifyContent: 'center',
//             padding: 5,
//             borderRadius: 15,
//             marginLeft: 10,
//             backgroundColor: colors.theme
//         }}>
//         <Text style={{
//             fontSize: (dimensions.sizeRatio * 15),
//             textAlignVertical: "center",
//             color: colors.white,
//             fontFamily: CONSTANTS.MEDIUM
//         }}>2X</Text>
//     </TouchableOpacity>
// }
// {/* For rate 3X */}
// {this.state.isSpeedSelect &&
//     <TouchableOpacity
//         onPress={() => {
//             this._onPressButton(3.0)
//         }}
//         style={{
//             alignItems: 'center',
//             justifyContent: 'center',
//             padding: 5,
//             borderRadius: 15,
//             marginLeft: 10,
//             backgroundColor: colors.theme
//         }}>
//         <Text style={{
//             fontSize: (dimensions.sizeRatio * 15),
//             textAlignVertical: "center",
//             color: colors.white,
//             fontFamily: CONSTANTS.MEDIUM
//         }}>3X</Text>
//     </TouchableOpacity>
// }