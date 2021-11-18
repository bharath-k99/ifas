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
    TouchableOpacity, Alert, AsyncStorage, NativeEventEmitter, NativeModules, Modal, FlatList, AppState
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
import ytdl from "react-native-ytdl"
import Video from 'react-native-video';
import DeviceInfo from 'react-native-device-info';
import Ripple from 'react-native-material-ripple';
import CardView from 'react-native-cardview'

import BackButton from 'react-native-vector-icons/MaterialIcons';
const backButton = <BackButton name="arrow-back" size={28} color={colors.white} />;
var seekingTime = 0;
export default class PaidLiveSessionPlayer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            access_token: '',
            isRecording: false,
            isRecording: '',
            youtubeUrl: '',
            //Previous screen name
            previousScreenName: this.props.navigation.state.params.screen_name,

            //is playing first time
            isPlayingFirstTime: false,

            //Flag for isNativePlayer
            isNativePlayerVisible: true,
            nativePlayerURL: undefined,
            frameRateDefault: 1.0,
            isFirstTimeEnter: false,
            isCallRotatePlayIOS: false,

            isSyncTap: '',
            isPlay: true,

            //app state
            appState: AppState.currentState,
            isShowingPlayingIcon: false,
            isPlayerPlay: true
        };
    }

    componentDidMount() {
        // Recording of
        if (Platform.OS == 'ios') {
            this.addListener()
        }
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
            Orientation.lockToLandscape();
        }
        this.setState({
            youtubeUrl: this.props.navigation.state.params.youtubeUrl
        }, () => {
            console.warn('SFS', this.state.youtubeUrl)
            this._getVideoSessionTiming()
            //this._playerReadyToplay()
        })
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
    }
    componentWillUnmount() {
        EventRegister.removeEventListener(this.listenerSession);
        if (Platform.OS == 'ios') {
            this.screenCaptureEnabled.remove()
            NativeModules.SFViewControl.rotatePlayerLockUnlock('potrate')
            Orientation.lockToPortrait();
        }
        if (Platform.OS == 'android')
            Orientation.lockToPortrait();
    }

    addListener = () => {
        NativeModules.ScreenRecorderDetect.addScreenRecorderListner()
        console.warn('CAPTURE_SESSIONS')
        let bridge = new NativeEventEmitter(NativeModules.ScreenRecorderDetect);

        this.screenCaptureEnabled = bridge.addListener("isScreenCaptureEnabled", (res) => {
            console.warn('CAPTURE_SESSIONS1' + '\n\n' + JSON.stringify(res))
            if (res.value == true) {
                //console.warn('CAPTURE_SESSIONS2' + '\n\n' + JSON.stringify(res) + '\n\n' + this.state.isRecording)
                this.setState({
                    isRecording: true,
                    isPlayerPlay: false
                })
            }
            else {
                this.setState({ isRecording: false, isPlayerPlay: true }, () => {
                    //console.warn('CAPTURE_SESSIONS3' + '\n\n' + JSON.stringify(res) + '\n\n' + this.state.isRecording)
                })
            }

        })
    }

    extractorYoutubeURL = async (youtube) => {

        //let youtubeUrl2 = 'https://www.youtube.com/watch?v=FEU-LZiZIV4&list=RDFEU-LZiZIV4&start_radio=1';
        //let youtubeUrl2 = 'https://www.youtube.com/watch?v=4XeruKiMbE8';
        let youtubeUrl = 'https://www.youtube.com/watch?v=' + youtube;

        console.warn('Format found! url' + JSON.stringify(youtubeUrl));
        let qualityForVideo = '18';
        ytdl.getInfo(youtubeUrl).then((info) => {
            if (info != undefined && info.formats != undefined) {
                let format = ytdl.chooseFormat(info.formats, { quality: '18' });
                console.warn('Format found!1', format);
                if (format != undefined && format.url != undefined) {
                    this.setState({
                        nativePlayerURL: format.url,
                    }, () => {
                        this.setState({
                            isLoading: false,
                            isNativePlayerVisible: true
                        })
                    })
                } else {
                    this.setState({
                        isLoading: true,
                        isNativePlayerVisible: false
                    })
                }
            }
        }).catch(() => {
            this.setState({
                isLoading: true,
                isNativePlayerVisible: false
            })
        })
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
                this.setState({
                    isShowingPlayingIcon: false,
                    isLoading: false,
                    isNativePlayerVisible: false,
                    isPlayerPlay: true
                })
                // this.setState({
                //     isLoading: false,
                //     isNativePlayerVisible: false
                // })
                // if (this.state.isFirstTimeEnter) {

                // } else {
                // this.extractorYoutubeURL(this.props.navigation.state.params.youtubeUrl.trim())
                // this.setState({
                //     isFirstTimeEnter: true
                // })
                // }
                //return true
            } else {
                showNativeAlert('Live Session has been ended.')
                EventRegister.emit('SessionExpried', '')
                this.methodGoBack()
                //return false
            }
        } catch (err) {
            console.warn('SESSION EXCEPTION SESSION SCREEN' + JSON.stringify(err))
        }
    }

    _playerReadyToplay() {
        //let convertedSeekTime = (parseFloat(seekingTime) / 1000)
        //console.warn('in player seekingTime' + seekingTime + '\n\n' + convertedSeekTime)
        console.warn('in player seekingTime' + seekingTime)
        setTimeout(() => {
            this._youTubeRef.seekTo(seekingTime)
        }, 500);
    }

    _playerReadyToplayNative = () => {
        let convertedSeekTime = (parseFloat(seekingTime) / 1000)
        console.log('in player seekingTime native' + seekingTime + '\n\n' + convertedSeekTime)
        setTimeout(() => {
            this.player.seek(seekingTime)
        }, 500);
    }

    methodGoBack() {
        this.props.navigation.goBack()
        if (Platform.OS == 'ios') {
            NativeModules.SFViewControl.rotatePlayerLockUnlock('potrate')
        }
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
                <View style={{ flex: 1, backgroundColor: colors.black }}>

                    {this.renderHeader()}
                    <View style={{
                        flex: 1,
                        width: '100%',
                    }}>
                        {this.state.isNativePlayerVisible ?

                            <View
                                style={{
                                    flex: 1,
                                    width: '100%'
                                }}>
                                {this.state.nativePlayerURL != '' &&
                                    <Video
                                        //inverted={-1}
                                        //onLayout={this._onLayout}
                                        source={{ uri: this.state.nativePlayerURL }}   // Can be a URL or a local file.
                                        controls={false}
                                        hideShutterView={true}
                                        play={this.state.isPlayerPlay}
                                        fullscreen={true}
                                        resizeMode={"contain"}
                                        onLoad={() => {
                                            this._playerReadyToplayNative()
                                        }}
                                        onEnd={() => {
                                            //showNativeAlert('Live Session has been ended.')
                                            //EventRegister.emit('SessionExpried', '')
                                            this.methodGoBack()
                                        }}
                                        style={{
                                            flex: 1,
                                            width: '100%'
                                        }}
                                        ref={(ref) => {
                                            this.player = ref
                                        }}
                                        rate={this.state.frameRateDefault}
                                        playInBackground={true}
                                        playWhenInactive={true}
                                    />
                                }
                            </View>
                            :
                            <View
                                style={{
                                    flex: 1,
                                    width: '100%'
                                }}>
                                {this.state.youtubeUrl != '' &&
                                    <YouTube
                                        ref={component => {
                                            this._youTubeRef = component;
                                        }}
                                        apiKey="AIzaSyCZs5LGQYP8EL8uQvvpO6SA-cFZs8kHw30"
                                        videoId={this.state.youtubeUrl}
                                        play={this.state.isPlayerPlay}
                                        fullscreen={false}
                                        loop={true}
                                        showinfo={false}
                                        controls={Platform.OS == 'android' ? 2 : 0}
                                        resumePlayAndroid={true}
                                        onError={e => console.log(e)}
                                        style={{ width: '100%', height: '100%', backgroundColor: 'black' }}

                                        // onReady={e => this.setState({ isReady: true })}
                                        onChangeState={(e) => {
                                            //playing, stopped, buffering
                                            console.warn('isStopPlaying', e.state)
                                            switch (e.state) {
                                                case 'stopped':
                                                    this.setState({
                                                        isPlayerPlay: false,
                                                    }, () => {
                                                        this.setState({
                                                            isShowingPlayingIcon: true
                                                        })
                                                    })
                                                    break;
                                                    case 'paused':
                                                        this.setState({
                                                            isPlayerPlay: false,
                                                        }, () => {
                                                            this.setState({
                                                                isShowingPlayingIcon: true
                                                            })
                                                        })
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
                                {/* {
                                    <View style={{
                                        height: 60,
                                        width: '100%',
                                        position: 'absolute',
                                        backgroundColor: '#00000000',
                                        //backgroundColor: 'pink',
                                    }}>
                                    </View>
                                }
                                {
                                    <View style={{
                                        height: 55,
                                        width: '100%',
                                        position: 'absolute',
                                        backgroundColor: '#00000000',
                                        bottom: 0
                                    }}>
                                    </View>
                                } */}
                                {
                                    <View style={{
                                        flex: 1, height: '100%',
                                        width: '100%', justifyContent: 'center',
                                        alignItems: 'center', position: 'absolute',
                                        backgroundColor: 'rgba(0,0,0,0.0)',
                                        //backgroundColor: 'pink',
                                    }}>
                                        {this.state.isShowingPlayingIcon == true &&
                                            <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', width: 100, height: 100 }}
                                                onPress={() => {
                                                    this._getVideoSessionTiming()
                                                    setTimeout(() => {
                                                        this._playerReadyToplay()
                                                    }, 500);
                                                }}>
                                                <Image source={require('../../images/play_icon.png')}
                                                    style={{ justifyContent: 'center', tintColor: 'blue', alignItems: 'center', width: 50, height: 50, resizeMode: 'contain' }} />
                                            </TouchableOpacity>
                                        }
                                    </View>
                                }
                            </View>
                        }
                    </View>
                </View>
            );
        }
    }

    renderHeader = () => {
        return (
            <View
                style={{
                    width: '100%',
                    height: 35,
                    backgroundColor: colors.theme,
                    paddingHorizontal: 10,
                    alignItems: 'center',
                    flexDirection: 'row'
                }}>
                <Ripple
                    onPress={() => {
                        this.methodGoBack()
                    }}>
                    {backButton}
                </Ripple>
                <Text style={{ fontSize: 18, fontFamily: CONSTANTS.DEMI, color: colors.white, textAlign: 'left', marginLeft: 15, marginTop: 5 }}>
                    {'Live Session'}
                </Text>
            </View>
        )
    }
}




  // await ytdl.getInfo(youtubeUrl, {}, (err, info) => {
            //     //if (err) 

            //     console.log('format error' + JSON.stringify(err) + '\n\n' + JSON.stringify(info));
            //     if (info != undefined && info.formats != undefined) {
            //         let format1 = ytdl.chooseFormat(info.formats, { quality: qualityForVideo });

            //         console.warn('Format found!1' + JSON.stringify(format1));
            //         let videoURL = undefined;
            //         if (format1 != undefined && format1.url != undefined) {

            //             videoURL = format1.url
            //             this.setState({
            //                 nativePlayerURL: format1.url,
            //             }, () => {
            //                 this.setState({
            //                     isLoading: false,
            //                     isNativePlayerVisible: true
            //                 })
            //             })
            //             console.warn('Format found!2' + JSON.stringify(format1));
            //         } else {
            //             this.setState({
            //                 isLoading: true,
            //                 isNativePlayerVisible: false
            //             }, () => {

            //             })
            //         }
            //     } else {
            //         this.setState({
            //             isLoading: true,
            //             isNativePlayerVisible: false
            //         })
            //     }
            // })
            //     .catch((e) => {
            //         this.setState({
            //             isLoading: true,
            //             isNativePlayerVisible: false
            //         })
            //     })