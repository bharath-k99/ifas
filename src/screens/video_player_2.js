/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { View, Platform, Alert, AsyncStorage, ActivityIndicator, Text, NativeEventEmitter, NativeModules, TouchableWithoutFeedback } from 'react-native';
import colors from '../resources/colors';
import YouTube from 'react-native-youtube'
import BackPlayerButton from '../headers/BackPlayerButton'
import { EventRegister } from 'react-native-event-listeners';
import CONSTANTS from '../resources/constants';
import dimensions from '../resources/dimension';
import { showNativeAlert } from '../resources/app_utility';
// import WebView from 'react-native-android-fullscreen-webview-video';
import AndroidPlayer from './AndroidPlayer';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation';
import { PermissionsAndroid } from 'react-native';
let timer = 0
let priviousstate = true

export default class video_player extends Component {

    static navigationOptions = ({ navigation }) => {
        if (Platform.OS == 'android') {
            return {
                title: 'Video Player',
                header: null,
            }
        }
        return {
            title: `${navigation.state.params.Headertitle}`,
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
            frameRateDefault: 1.0
        };
        this.onLoadStart = this.onLoadStart.bind(this);
        this.onLoad = this.onLoad.bind(this);
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

    onFullscreenPlayerWillPresent = (event) => {
        console.log(event)
        // if (Platform.OS == 'ios') {
        //     var RNScreenDetector = NativeModules.RNScreenDetector;
        //     const myModuleEvt = new NativeEventEmitter(NativeModules.RNScreenDetector)
        //     myModuleEvt.addListener('screen_recording', (data) => {
        //         console.log('is screeen recording' + data)
        //         if (data) {
        //             this.setState({ isRecording: data, play: false, fullScreeen: false })
        //         } else {
        //             this.player.seek(this.player.seek, 50);
        //             this.setState({ isRecording: data, play: true, fullScreeen: this.state.fullScreeen })
        //         }
        //     })
        //     RNScreenDetector.startObservingRecording()
        // }
    }

    componentDidMount() {
        global.navigation = this.props.navigation

        // if (Platform.OS == 'ios') {
        //     var RNScreenDetector = NativeModules.RNScreenDetector;
        //     const myModuleEvt = new NativeEventEmitter(NativeModules.RNScreenDetector)
        //     myModuleEvt.addListener('screen_recording', (data) => {
        //         console.log('is screeen recording' + data)
        //         if (data) {
        //             RNScreenDetector.dismissTopController()
        //             this.setState({ isRecording: data, play: false, fullScreeen: false })
        //         } else {
        //             this.setState({ isRecording: data, play: true, fullScreeen: this.state.fullScreeen })
        //         }
        //     })
        //     RNScreenDetector.startObservingRecording()
        // } else {
        //     // this._requestAndroidPermission()

        // }

        //LISTENER FOR CUSTOM HARDWARE BACK BUTTON TAP
        this.listener = EventRegister.addEventListener('HardWareBackCustom', (data) => {
            if (this.state.topicId != 0 && this.state.access_token != '') {
                this.updateVideoLog(false, false)
            } else {
                this.methodGoBack()
            }
        })

        if (this.state.topicId != 0) {
            // Count down timer
            this.interval = setInterval(
                () => this.timerUpdated(),
                1000
            );

            //Login status timer
            if (CONSTANTS.SESSION_TIMER != 0) {
                this.interval = setInterval(
                    () => this.checkLoginStatus(),
                    CONSTANTS.SESSION_TIMER * 60 * 1000
                );
            }

            this.getAccessToken()
        } else {
            this.setState({
                isLoading: false,
                isError: false,
            })

        }
        if (Platform.OS == 'android') {
            Orientation.unlockAllOrientations();
            Orientation.addOrientationListener(this._orientationDidChange);
        }


    }
    _onLayout = event => {
        const { width, height } = event.nativeEvent.layout;
        if (width > height) {
            this.setState({ resizeMode: 'stretch' });
        } else {
            this.setState({ resizeMode: 'contain' });
        }
    }
    checkLoginStatus() {
        // showNativeAlert("Checking status")

        if (CONSTANTS.IS_LOGGED_IN == false) {
            return
        }
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
                console.log(responseJson)
                if (responseJson.code != 1) {
                    self.removeItemValue('ACCESS_TOKEN')

                } else if (responseJson.code == 200) {
                    self.updateVideoLog()
                }
            })
            .catch((error) => {
                console.log(error);
                showNativeAlert('Network request failed')
            });
    }

    getAccessToken() {
        let self = this;
        AsyncStorage.getItem("ACCESS_TOKEN").then(value => {
            if (value != null) {
                console.log('VALUE:' + value)
                self.setState({
                    access_token: value.slice(1, -1),
                })
                self.getVideoLog()
            } else {
                self.getVideoLog()
                // showNativeAlert('Not logged-In')
            }
        })


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

    getVideoLog() {

        let videoURL = this.props.navigation.state.params.youtubeUrl
        // var RNScreenDetector = NativeModules.RNScreenDetector;
        // RNScreenDetector.openAVPlayerController(videoURL)
        // if (Platform.OS == 'android') {
        //     console.log(videoURL)
        //     const rnClass = NativeModules.RNScreenDetector;
        //     rnClass.androidNativePlayer(videoURL)
        // }  


        this.setState({
            isLoading: true,
            videoLength: 0,
            user_id: '',
            youtubeUrl: videoURL,
            isLoading: false,
            isError: false
        });

        // const formData = new FormData();
        // formData.append('topic_video_id', this.state.topicId);

        // let strURl = CONSTANTS.BASE + CONSTANTS.GET_VIDEO_LOG
        // if (this.state.access_token == '') {
        //     strURl = CONSTANTS.BASE + CONSTANTS.GET_VIDEO_LOG_FREE
        // } else {
        //     formData.append('access_token', this.state.access_token);
        // }
        // console.log(formData)
        // console.log(strURl)
        // let self = this;

        // fetch(strURl, {
        //     method: 'POST',
        //     headers: {
        //         Accept: 'application/json',
        //         'Content-Type': 'multipart/form-data',
        //     },
        //     body: formData,
        // }).then((response) => response.json())
        //     .then((responseJson) => {
        //         console.log(responseJson)

        //         if (responseJson.code == 201) {
        //             self.removeItemValue('ACCESS_TOKEN')
        //         } else if (responseJson.code == 1) {

        //             let videoURL = (CONSTANTS.VIDEO_TYPE == 1) ? ((responseJson.data.tmp_url != '') ? responseJson.data.tmp_url : self.state.youtubeUrl) : self.state.youtubeUrl
        //             // var RNScreenDetector = NativeModules.RNScreenDetector;
        //             // RNScreenDetector.openAVPlayerController(videoURL)
        //             // if (Platform.OS == 'android') {
        //             //     console.log(videoURL)
        //             //     const rnClass = NativeModules.RNScreenDetector;
        //             //     rnClass.androidNativePlayer(videoURL)
        //             // }  
        //                 self.setState({
        //                     isLoading: true,
        //                     videoLength: responseJson.data.video_length * responseJson.data.multiplier,
        //                     user_id: responseJson.data.USER_ID,
        //                     youtubeUrl: videoURL,
        //                 }, function () {
        //                     // showNativeAlert(this.state.youtubeUrl)
        //                     if (self.state.videoLength * 60 > responseJson.data.TOTAL_VIEW) {
        //                         // showNativeAlert('Can view video')
        //                         self.setState({
        //                             isLoading: false,
        //                             isError: false,
        //                         })
        //                     } else {
        //                         // showNativeAlert('Cannot view video')
        //                         clearInterval(this.interval);

        //                         self.setState({
        //                             errorMessage: 'You have reached your time limit for this video.',
        //                             isLoading: false,
        //                             isError: true,
        //                         })
        //                     }
        //                 });



        //         }


        //     })
        //     .catch((error) => {
        //         console.log(error);
        //         clearInterval(this.interval);
        //         timer = 0;
        //         self.setState({
        //             isLoading: false,
        //             isError: true,
        //         })
        //     });
    }

    updateVideoLog() {
        // const divisor = (this.state.timer / 60) | 0

        const divisor = timer
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
        // .then((response) => response.json())
        // .then((responseJson) => {
        //     console.log(responseJson)
        // })
        // .catch((error) => {
        //     console.log(error);
        // });
    }

    timerUpdated() {
        timer = ++timer;
        // this.setState({timer: ++this.state.timer})
        // showNativeAlert("Timer updating")
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
    //             this.intervalTimer = setInterval(() => {


    //                 const rnClass = NativeModules.RNScreenDetector;
    //                 rnClass.checkAudioVIdeoRecordingInAndroid()

    //                 const myModuleEvt = new NativeEventEmitter(NativeModules.RNScreenDetector)
    //                 myModuleEvt.addListener('screen_recording', (data) => {
    //                     //  alert(data)
    //                     if (priviousstate != data) {
    //                         if (data) {
    //                             this.setState({ isRecording: data, play: true })
    //                         } else {
    //                             this.setState({ isRecording: data, play: false })
    //                         }
    //                         priviousstate = data
    //                     } else {
    //                         priviousstate = data
    //                     }


    //                 })


    //             }, 1000);

    //         }
    //         // else {
    //         //    this._openSettings()
    //         //  }
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

    componentWillUnmount() {
        if (Platform.OS == 'android') {
            Orientation.removeOrientationListener(this._orientationDidChange);
            Orientation.lockToPortrait();
        }
        clearInterval(this.intervalTimer);
        console.log("Unmounted")
        clearInterval(this.interval);
        // if (Platform.OS == 'ios') {
        //     var RNScreenDetector = NativeModules.RNScreenDetector;
        //     RNScreenDetector.removeObservingRecording()
        // }

        if (CONSTANTS.SESSION_TIMER == 0) {
            return
        }


        if (this.state.topicId != 0 && this.state.access_token != '') {
            this.updateVideoLog()
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

    _onPressButton = () => {
        Alert.alert('You tapped the button!')
        this.state.setState({ frameRateDefault: 2.0 });
    }

    render() {

        console.log(this.state.youtubeUrl)
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

        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>

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
                        <Text style={{ fontSize: dimensions.sizeRatio * 16, fontFamily: CONSTANTS.DEMI }}>
                            {this.state.errorMessage}
                        </Text>
                    </View>
                )
            } else {

                if (Platform.OS == 'android') {
                    return (<View style={{ backgroundColor: 'black', flex: 1 }}>

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

                        <AndroidPlayer url={this.state.youtubeUrl} />
                    </View>
                    )
                    //     return (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    //         <ActivityIndicator />
                    //         <Text style={{
                    //             top: 10, fontSize: (dimensions.sizeRatio * 14),
                    //             textAlignVertical: "center", color: colors.white,
                    //             fontFamily: CONSTANTS.DEMI
                    //         }}>buffering video...</Text>
                    //     </View>
                    //     )
                    // //     console.log("Unlocking")
                    // //     Orientation.unlockAllOrientations();
                    // //     return (
                    // //         <View style={{ flex: 1, backgroundColor: 'black' }}>
                    // //             <WebView
                    // //                 source={{ uri: this.state.youtubeUrl }}
                    // //                 style={{ flex: 1 }}
                    // //             />
                    // //         </View>

                    // //     )

                } else {
                    return (
                        <View style={{
                            backgroundColor: 'black',
                            flex: 1
                        }}>
                            <Video
                                onLayout={this._onLayout}
                                source={{ uri: this.state.youtubeUrl }}   // Can be a URL or a local file.
                                controls={true}
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
                        </View>
                    )
                }

            }
        }
    }
}



