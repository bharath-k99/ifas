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
    BackHandler, TouchableWithoutFeedback, Image, TouchableOpacity, FlatList, Dimensions, StatusBar
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
import DeviceInfo from 'react-native-device-info';
import AutoHeightWebView from 'react-native-autoheight-webview'
import Ripple from 'react-native-material-ripple';

import BackButton from 'react-native-vector-icons/MaterialIcons';
const backButton = <BackButton name="arrow-back" size={28} color={colors.white} />;

//check if video playe through vimeo player maintain flag for video recording off in iOS
let isVideoRecordingVemio = false;
export default class VideoPlayerNew extends React.Component {

    // static navigationOptions = (navigation) => {
    //     const { state } = navigation;
    //     if (Platform.OS == 'android') {
    //         return {
    //             title: 'Video Player',
    //             header: null,
    //         }
    //     }
    //     return {
    //         title: 'Recorded Video',
    //         headerStyle: { backgroundColor: colors.theme },
    //         headerTintColor: 'white',

    //         headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
    //         // headerLeft: <BackPlayerButton />,
    //         gesturesEnabled: false,
    //         headerRight: <View />
    //     }

    // };

    constructor(props) {
        super(props);
        this.state = {
            access_token: '',
            youtubeUrl: undefined,
            selected_item: undefined,
            fullScreeen: false,
            errorMessage: 'Failed to load the video.',
            resizeMode: 'contain',
            isError: false,
            isRecording: false,
            isVideoLoading: true,
            frameRateDefault: 1.0,
            frameRateDefaultSaved: 1.0,
            isSpeedSelect: false,
            currentTime: 0,
            frameRateArray: [
                { time: 0.25, is_selected: false, id: 1 }, { time: 0.50, is_selected: false, id: 2 },
                { time: 0.75, is_selected: false, id: 3 },
                { time: 1.0, is_selected: true, id: 4 }, { time: 1.25, is_selected: false, id: 5 },
                { time: 1.50, is_selected: false, id: 6 }, { time: 1.75, is_selected: false, id: 7 },
                { time: 2.0, is_selected: false, id: 8 }
            ],
            isVimeoURLVisible: false,
            vimeoVideoIDForPlay: undefined,

            //Timer
            seconds: 0
        }
        //this.tick = this.tick.bind(this); // bind to the component
        //this.playerRef= React.createRef();
    }

    async componentDidMount() {

        //back handler
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

        global.isLiveConfRunningIosForLiveSessionNotHide = true;
        //Not visible notification start popup for this screen
        global.isChatLiveSessionVisible = true;
        isTopicPlayerVisible = true;

        if (this.props.navigation.state.params.youtubeUrl != undefined && this.props.navigation.state.params.youtubeUrl != null &&
            this.props.navigation.state.params.youtubeUrl != '') {
            this.setState({
                youtubeUrl: undefined,
                selected_item: this.props.navigation.state.params.item,
                isError: false,
            }, () => {
                console.warn('SELECTEDITEM_TOPIC' + JSON.stringify(this.state.selected_item))
                this.getQualityAfterExtractYoutubeURL(this.props.navigation.state.params.youtubeUrl)
            })
        } else {
            this.setState({
                isError: true,
            })
        }
        if (Platform.OS == 'android') {
            Orientation.unlockAllOrientations();
            Orientation.addOrientationListener(this._orientationDidChange);
        }

        if (Platform.OS == 'ios') {
            this.addListener()
        }
        this.getAccessToken()
    }

    tick = () => {
        //console.warn('TICK1')
        // start timer after button is clicked
        this.interval = setInterval(() => {
            //console.warn('TICK2')
            this.setState(prevState => ({
                seconds: prevState.seconds + 1
            }), () => {
                //console.warn('SECOND', this.state.seconds)
            });
        }, 1000);
    }

    getAccessToken() {
        // try {
        console.log('getting access token ')
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                console.log('access token received')
                self.setState({
                    access_token: value.slice(1, -1),
                }, () => {
                    console.log("PLAYER ACCESS TOKEN -- " + self.state.access_token);
                })

            } else {
                //showNativeAlert('Not logged-In')
            }
        })
    }

    callExtractionLogApi = (accessToken, errSucess, type, updatedYoutubeURL) => {

        AsyncStorage.getItem('LOGIN_USER_NAME').then(value => {

            if (value != undefined) {
                let loginData = JSON.parse(value)

                // let deviceName = {
                //     model_version:DeviceInfo.getSystemVersion(),
                //     device_type:Platform.OS == 'android'? 'android' :'ios',
                //     brand_name:DeviceInfo.getBrand()
                // }
                let deviceName = '';
                let successData = '';
                let errorData = '';
                try {

                    deviceName = `model_version:${DeviceInfo.getSystemVersion()},device_type:${Platform.OS == 'android' ? 'android' : 'ios'},
                brand_name:${DeviceInfo.getBrand()}, recorded_type:VIDEO`;

                    if (type == 'success') {
                        successData = `url:${errSucess.url}, mimeType:${errSucess.mimeType}, qualityLabel:${errSucess.qualityLabel}, bitrate:${errSucess.bitrate}, itag:${errSucess.itag},
                    width:${errSucess.width}, height:${errSucess.height}, container:${errSucess.container}, quality:${errSucess.quality}`;
                    }

                    if (type == 'error') {
                        errorData = `line:${errSucess.line}, column:${errSucess.column}, sourceURL:${errSucess.sourceURL}, platform:${errSucess.platform}, dev:${errSucess.dev},
                    minify:${errSucess.minify}`;
                    }
                } catch (error) {

                }

                const formData = new FormData();
                formData.append('access_token', accessToken);
                formData.append('course_id', global.landingScreenPaidItem.id);
                //formData.append('user_id', );
                formData.append('device_name', deviceName);
                formData.append('username', loginData.data.USER_NAME);
                //formData.append('username', 'Puneet');
                //formData.append('video_id', '');
                formData.append('video_url', updatedYoutubeURL);
                formData.append('os', DeviceInfo.getSystemVersion());
                formData.append('type', 2);
                formData.append('success', successData);
                formData.append('error', errorData);
                // formData.append('success', (type == 'success' ? errSucess : ''));
                // formData.append('error', (type == 'error' ? 'test' : ''));
                console.log('EXTACTION_LOG_REQUEST' + JSON.stringify(formData))

                fetch(CONSTANTS.BASE + CONSTANTS.POST_EXTRACTION_LOG, {
                    method: 'post',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formData,
                }).then((response) => response.json())
                    .then((responseJson) => {
                        console.log('extraction log response')
                        console.log('ENTER_EXTRCTOIN' + JSON.stringify(responseJson))
                        if (responseJson.code == 201) {

                        } else {
                            //work here
                        }
                    })
                    .catch((error) => {
                        console.warn('ERROR_EXTRACION' + JSON.stringify(error));
                        //showNativeAlert("Network request failed")
                    });

            }
        })
    }

    addListener = () => {
        console.warn('CAPTURE_VIDEO_PLAYER_NEW')
        let bridge = new NativeEventEmitter(NativeModules.ScreenRecorderDetect);

        this.screenCaptureEnabled = bridge.addListener("isScreenCaptureEnabled", (res) => {
            if (res.value == true) {
                if (isVideoRecordingVemio = false) {
                    this.setState({
                        isRecording: true,
                        play: false,
                        fullScreeen: false
                    }, () => {
                        console.warn('CAPTURE_VIDEO_PLAYER_NEW1' + '\n\n' + JSON.stringify(res) + '\n\n' + this.state.isRecording + '\n\n' + this.state.play + '\n\n' + this.state.fullscreen)
                    })
                } else {
                    this.setState({
                        isRecording: true
                    })
                }
            }
            else {
                if (isVideoRecordingVemio = false) {
                    let prviousCurrentTime = this.state.currentTime;
                    console.log('ONPROGRESS2' + prviousCurrentTime)
                    this.setState({ isRecording: false, play: true, fullScreeen: this.state.fullScreeen }, () => {
                        setTimeout(() => {
                            this.player.seek(prviousCurrentTime, 50);
                        }, 1200);
                        console.warn('CAPTURE_VIDEO_PLAYER_NEW2' + '\n\n' + JSON.stringify(res) + '\n\n' + this.state.isRecording + '\n\n' + this.state.play + '\n\n' + this.state.fullscreen)
                    })
                } else {
                    this.setState({
                        isRecording: false
                    })
                }
            }

        })
    }

    onProgress = (data) => {
        if (this.state.isRecording == false)
            this.setState({ currentTime: data.currentTime });
    };

    componentWillUnmount() {

        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        clearInterval(this.interval);
        if (Platform.OS == 'android') {
            Orientation.removeOrientationListener(this._orientationDidChange);
            Orientation.lockToPortrait();
        }

        if (Platform.OS === "ios") {
            this.screenCaptureEnabled.remove()
        }
    }

    getQualityAfterExtractYoutubeURL = (youtubeUrl) => {

        this.setState({
            isError: true,
            errorMessage: 'Please wait...'
        })
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

    youtube_parser(url) {
        var regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
        var match = url.match(regExp);
        if (match != null) {
            return match[1]
        } else {
            console.log("The youtube url is not valid.");
            return null;
        }
    }

    extractorYoutubeURL = async (youtubeUrl, videoQuality) => {

        setTimeout(() => {
            //START TIMER
            this.tick()
        }, 1000);
        // let selected_item = {
        //     URL: '',
        //     URL2: '',
        //     VIMEO_URL: null,
        //     TMP_VIDEO_URL: 'https://ifas-video.s3.ap-south-1.amazonaws.com/LIFE+SCIENCE+JAN+2020/UNIT+TEST/UNIT+TEST+-+5+PAPER+DISCUSSION+.mp4'}
        const { selected_item } = this.state;
        console.warn('Format found! url' + JSON.stringify(selected_item));
        let qualityForVideo = 18;

        if (selected_item != undefined && selected_item != null &&
            selected_item != '') {
            // Check URL empty
            if (selected_item.URL != null && selected_item.URL != '') {
                ytdl.getInfo(selected_item.URL).then(async (info) => {
                    // First URL extract1
                    if (info != undefined && info.formats != undefined) {
                        let format = await ytdl.chooseFormat(info.formats, { quality: '18' });
                        console.warn('Format found!URL1', format);
                        if (format != undefined && format.url != undefined) {
                            console.warn('Format found! URL', format);
                            this.setState({
                                youtubeUrl: format.url,
                                isError: false,
                            }, () => {
                                this.callExtractionLogApi(this.state.access_token, format, 'success', selected_item.URL)
                            })
                        } else if (selected_item.URL2 != null && selected_item.URL2 != '') {
                            ytdl.getInfo(selected_item.URL2).then((info) => {
                                // First URL extract2
                                if (info != undefined && info.formats != undefined) {
                                    let format = ytdl.chooseFormat(info.formats, { quality: '18' });
                                    console.warn('Format found!10', format);
                                    if (format != undefined && format.url != undefined) {
                                        this.setState({
                                            youtubeUrl: format.url,
                                            isError: false,
                                        }, () => {
                                            this.callExtractionLogApi(this.state.access_token, format, 'success', selected_item.URL2)
                                        })
                                    } else if (global.isVimeoPlayerVisible &&
                                        selected_item != undefined && selected_item.VIMEO_URL != '' &&
                                        selected_item.VIMEO_URL != null) {
                                        this.callExtractionLogApi(this.state.access_token, format, 'error', selected_item.URL2)
                                        //check condition vimeo is visible or not
                                        console.warn('Format found!URL2 11', format);
                                        isVideoRecordingVemio = true
                                        this.setState({
                                            isVimeoURLVisible: true,
                                            vimeoVideoIDForPlay: selected_item.VIMEO_URL,
                                            isError: false,
                                        })
                                    } else if (selected_item != undefined && selected_item.TMP_VIDEO_URL != '' &&
                                        selected_item.TMP_VIDEO_URL != null) {
                                        this.callExtractionLogApi(this.state.access_token, format, 'error', selected_item.URL2)
                                        console.warn('Format found!URL2 12', format);
                                        this.setState({
                                            youtubeUrl: selected_item.TMP_VIDEO_URL,
                                            isError: false,
                                        })
                                    } else {
                                        if (!selected_item.URL.includes('https://www.youtube.com/')) {
                                            console.warn('Format found!URL2 13');
                                            this.setState({
                                                youtubeUrl: selected_item.URL,
                                                isError: false,
                                            })
                                        } else {
                                            console.warn('Format found!URL2 14');
                                            this.setState({
                                                isError: true,
                                                youtubeUrl: undefined,
                                                errorMessage: 'No video available. Please contact to admin for more details.'
                                            })
                                        }
                                    }
                                }
                            })
                        } else if (global.isVimeoPlayerVisible &&
                            selected_item != undefined && selected_item.VIMEO_URL != '' &&
                            selected_item.VIMEO_URL != null) {
                            this.callExtractionLogApi(this.state.access_token, format, 'error', selected_item.URL)
                            //check condition vimeo is visible or not
                            console.warn('Format found! 11', format);
                            isVideoRecordingVemio = true
                            this.setState({
                                isVimeoURLVisible: true,
                                vimeoVideoIDForPlay: selected_item.VIMEO_URL,
                                isError: false,
                            })
                        } else if (selected_item != undefined && selected_item.TMP_VIDEO_URL != '' &&
                            selected_item.TMP_VIDEO_URL != null) {
                            this.callExtractionLogApi(this.state.access_token, format, 'error', selected_item.URL)
                            console.warn('Format found! 12', format);
                            this.setState({
                                youtubeUrl: selected_item.TMP_VIDEO_URL,
                                isError: false,
                            })
                        } else {
                            this.callExtractionLogApi(this.state.access_token, format, 'error', selected_item.URL)
                            if (!selected_item.URL.includes('https://www.youtube.com/')) {
                                console.warn('Format found! URL 13');
                                this.setState({
                                    youtubeUrl: selected_item.URL,
                                    isError: false,
                                })
                            } else {
                                console.warn('Format found! 14');
                                this.setState({
                                    isError: true,
                                    youtubeUrl: undefined,
                                    errorMessage: 'No video available. Please contact to admin for more details.'
                                })
                            }
                        }
                    }
                }).catch((error) => {
                    //HERE EXCEPTION HANDLING (URL1)
                    this.callExtractionLogApi(this.state.access_token, error, 'error', selected_item.URL)
                    console.warn('EXCEPTION1', selected_item)
                    if (selected_item.URL2 != null && selected_item.URL2 != '') {
                        ytdl.getInfo(selected_item.URL2).then((info) => {
                            // First URL extract2
                            if (info != undefined && info.formats != undefined) {
                                let format = ytdl.chooseFormat(info.formats, { quality: '18' });
                                console.warn('Format found ex1', format);
                                if (format != undefined && format.url != undefined) {
                                    this.setState({
                                        youtubeUrl: format.url,
                                        isError: false,
                                    }, () => {
                                        this.callExtractionLogApi(this.state.access_token, format, 'success', selected_item.URL2)
                                    })
                                } else if (global.isVimeoPlayerVisible &&
                                    selected_item != undefined && selected_item.VIMEO_URL != '' &&
                                    selected_item.VIMEO_URL != null) {
                                    this.callExtractionLogApi(this.state.access_token, format, 'error', selected_item.URL2)
                                    //check condition vimeo is visible or not
                                    console.warn('Format found! ex11', format);
                                    isVideoRecordingVemio = true
                                    this.setState({
                                        isVimeoURLVisible: true,
                                        vimeoVideoIDForPlay: selected_item.VIMEO_URL,
                                        isError: false,
                                    })
                                } else if (selected_item != undefined && selected_item.TMP_VIDEO_URL != '' &&
                                    selected_item.TMP_VIDEO_URL != null) {
                                    this.callExtractionLogApi(this.state.access_token, format, 'error', selected_item.URL2)
                                    console.warn('Format found! ex12', format);
                                    this.setState({
                                        youtubeUrl: selected_item.TMP_VIDEO_URL,
                                        isError: false,
                                    })
                                } else {
                                    if (!selected_item.URL.includes('https://www.youtube.com/')) {
                                        console.warn('Format found! ex13');
                                        this.setState({
                                            youtubeUrl: selected_item.URL,
                                            isError: false,
                                        })
                                    } else {
                                        console.warn('Format found! ex14');
                                        this.setState({
                                            isError: true,
                                            youtubeUrl: undefined,
                                            errorMessage: 'No video available. Please contact to admin for more details.'
                                        })
                                    }
                                }
                            }
                        }).catch((error) => {
                            this.callExtractionLogApi(this.state.access_token, error, 'error', selected_item.URL2)
                            //HERE EXCEPTION HANDLING (URL2)
                            if (global.isVimeoPlayerVisible &&
                                selected_item != undefined && selected_item.VIMEO_URL != '' &&
                                selected_item.VIMEO_URL != null) {
                                console.warn('Format found! URL2 ex 1');
                                this.callExtractionLogApi(this.state.access_token, error, 'error', selected_item.URL2)
                                //check condition vimeo is visible or not
                                isVideoRecordingVemio = true
                                this.setState({
                                    isVimeoURLVisible: true,
                                    vimeoVideoIDForPlay: selected_item.VIMEO_URL,
                                    isError: false,
                                })
                            } else if (selected_item != undefined && selected_item.TMP_VIDEO_URL != '' &&
                                selected_item.TMP_VIDEO_URL != null) {
                                console.warn('Format found! URL2 ex 2');
                                this.callExtractionLogApi(this.state.access_token, error, 'error', selected_item.URL2)
                                this.setState({
                                    youtubeUrl: selected_item.TMP_VIDEO_URL,
                                    isError: false,
                                })
                            } else {
                                if (!selected_item.URL.includes('https://www.youtube.com/')) {
                                    console.warn('Format found! URL2 ex 3');
                                    this.setState({
                                        youtubeUrl: selected_item.URL,
                                        isError: false,
                                    })
                                } else {
                                    console.warn('Format found! URL2 ex 4');
                                    this.setState({
                                        isError: true,
                                        youtubeUrl: undefined,
                                        errorMessage: 'No video available. Please contact to admin for more details.'
                                    })
                                }
                            }
                        })
                    } else if (global.isVimeoPlayerVisible &&
                        selected_item != undefined && selected_item.VIMEO_URL != '' &&
                        selected_item.VIMEO_URL != null) {
                        //check condition vimeo is visible or not
                        console.warn('Format found! URL1 ex and URL not found 1');
                        isVideoRecordingVemio = true
                        this.setState({
                            isVimeoURLVisible: true,
                            vimeoVideoIDForPlay: selected_item.VIMEO_URL,
                            isError: false,
                        })
                    } else if (selected_item != undefined && selected_item.TMP_VIDEO_URL != '' &&
                        selected_item.TMP_VIDEO_URL != null) {
                        console.warn('Format found! URL1 ex and URL not found 2');
                        this.setState({
                            youtubeUrl: selected_item.TMP_VIDEO_URL,
                            isError: false,
                        })
                    } else {
                        if (!selected_item.URL.includes('https://www.youtube.com/')) {
                            console.warn('Format found! URL1 ex and URL not found 3');
                            this.setState({
                                youtubeUrl: selected_item.URL,
                                isError: false,
                            })
                        } else {
                            console.warn('Format found! URL1 ex and URL not found  4');
                            this.setState({
                                isError: true,
                                youtubeUrl: undefined,
                                errorMessage: 'No video available. Please contact to admin for more details.'
                            })
                        }
                    }
                })
            } else if (selected_item.URL2 != null && selected_item.URL2 != '') {
                ytdl.getInfo(selected_item.URL2).then((info) => {
                    // Second URL extract
                    if (info != undefined && info.formats != undefined) {
                        let format = ytdl.chooseFormat(info.formats, { quality: '18' });
                        console.warn('Format found!20', format);
                        if (format != undefined && format.url != undefined) {
                            this.setState({
                                youtubeUrl: format.url,
                                isError: false,
                            }, () => {
                                this.callExtractionLogApi(this.state.access_token, format, 'success', selected_item.URL2)
                            })
                        } else if (global.isVimeoPlayerVisible &&
                            selected_item != undefined && selected_item.VIMEO_URL != '' &&
                            selected_item.VIMEO_URL != null) {
                            this.callExtractionLogApi(this.state.access_token, format, 'error', selected_item.URL2)
                            //check condition vimeo is visible or not
                            console.warn('Format found! 21', format);
                            isVideoRecordingVemio = true
                            this.setState({
                                isVimeoURLVisible: true,
                                vimeoVideoIDForPlay: selected_item.VIMEO_URL,
                                isError: false,
                            })
                        } else if (selected_item != undefined && selected_item.TMP_VIDEO_URL != '' &&
                            selected_item.TMP_VIDEO_URL != null) {
                            this.callExtractionLogApi(this.state.access_token, format, 'error', selected_item.URL2)
                            console.warn('Format found! 22', format);
                            this.setState({
                                youtubeUrl: selected_item.TMP_VIDEO_URL,
                                isError: false,
                            })
                        } else {
                            if (!selected_item.URL.includes('https://www.youtube.com/')) {
                                console.warn('Format found! 23');
                                this.setState({
                                    youtubeUrl: selected_item.URL,
                                    isError: false,
                                })
                            } else {
                                console.warn('Format found! 24');
                                this.setState({
                                    isError: true,
                                    youtubeUrl: undefined,
                                    errorMessage: 'No video available. Please contact to admin for more details.'
                                })
                            }
                        }
                    }
                }).catch(() => {
                    //HERE EXCEPTION HANLDING (URL1)
                    if (selected_item.URL2 != null && selected_item.URL2 != '') {
                        ytdl.getInfo(selected_item.URL2).then((info) => {
                            // First URL extract2
                            if (info != undefined && info.formats != undefined) {
                                let format = ytdl.chooseFormat(info.formats, { quality: '18' });
                                console.warn('Format found!10', format);
                                if (format != undefined && format.url != undefined) {
                                    this.setState({
                                        youtubeUrl: format.url,
                                        isError: false,
                                    }, () => {
                                        this.callExtractionLogApi(this.state.access_token, format, 'success', selected_item.URL2)
                                    })
                                } else if (global.isVimeoPlayerVisible &&
                                    selected_item != undefined && selected_item.VIMEO_URL != '' &&
                                    selected_item.VIMEO_URL != null) {
                                    this.callExtractionLogApi(this.state.access_token, format, 'error', selected_item.URL2)
                                    //check condition vimeo is visible or not
                                    console.warn('Format found! 11', format);
                                    isVideoRecordingVemio = true
                                    this.setState({
                                        isVimeoURLVisible: true,
                                        vimeoVideoIDForPlay: selected_item.VIMEO_URL,
                                        isError: false,
                                    })
                                } else if (selected_item != undefined && selected_item.TMP_VIDEO_URL != '' &&
                                    selected_item.TMP_VIDEO_URL != null) {
                                    this.callExtractionLogApi(this.state.access_token, format, 'error', selected_item.URL2)
                                    console.warn('Format found! 12', format);
                                    this.setState({
                                        youtubeUrl: selected_item.TMP_VIDEO_URL,
                                        isError: false,
                                    })
                                } else {
                                    if (!selected_item.URL.includes('https://www.youtube.com/')) {
                                        console.warn('Format found! 13');
                                        this.setState({
                                            youtubeUrl: selected_item.URL,
                                            isError: false,
                                        })
                                    } else {
                                        console.warn('Format found! 14');
                                        this.setState({
                                            isError: true,
                                            youtubeUrl: undefined,
                                            errorMessage: 'No video available. Please contact to admin for more details.'
                                        })
                                    }
                                }
                            }
                        }).catch((error) => {
                            //HERE EXCEPTION HANDLING (URL2)
                            if (global.isVimeoPlayerVisible &&
                                selected_item != undefined && selected_item.VIMEO_URL != '' &&
                                selected_item.VIMEO_URL != null) {
                                this.callExtractionLogApi(this.state.access_token, error, 'error', selected_item.URL2)
                                //check condition vimeo is visible or not
                                isVideoRecordingVemio = true
                                this.setState({
                                    isVimeoURLVisible: true,
                                    vimeoVideoIDForPlay: selected_item.VIMEO_URL,
                                    isError: false,
                                })
                            } else if (selected_item != undefined && selected_item.TMP_VIDEO_URL != '' &&
                                selected_item.TMP_VIDEO_URL != null) {
                                this.callExtractionLogApi(this.state.access_token, error, 'error', selected_item.URL2)
                                this.setState({
                                    youtubeUrl: selected_item.TMP_VIDEO_URL,
                                    isError: false,
                                })
                            } else {
                                if (!selected_item.URL.includes('https://www.youtube.com/')) {
                                    console.warn('Format found! 13');
                                    this.setState({
                                        youtubeUrl: selected_item.URL,
                                        isError: false,
                                    })
                                } else {
                                    console.warn('Format found! 14');
                                    this.setState({
                                        isError: true,
                                        youtubeUrl: undefined,
                                        errorMessage: 'No video available. Please contact to admin for more details.'
                                    })
                                }
                            }
                        })
                    } else {
                        console.warn('Format found! error 11', format);
                        this.setState({
                            isError: true,
                            youtubeUrl: undefined,
                            errorMessage: 'No video available. Please contact to admin for more details.'
                        }, () => {
                            this.callExtractionLogApi(this.state.access_token, format, 'error', selected_item.URL)
                        })
                    }
                })
            } else if (global.isVimeoPlayerVisible &&
                selected_item != undefined && selected_item.VIMEO_URL != '' &&
                selected_item.VIMEO_URL != null) {
                //check condition vimeo is visible or not
                console.warn('Format found! 31');
                isVideoRecordingVemio = true
                this.setState({
                    isVimeoURLVisible: true,
                    vimeoVideoIDForPlay: selected_item.VIMEO_URL,
                    isError: false,
                })
            } else if (selected_item != undefined && selected_item.TMP_VIDEO_URL != '' &&
                selected_item.TMP_VIDEO_URL != null) {
                console.warn('Format found! 32');
                this.setState({
                    youtubeUrl: selected_item.TMP_VIDEO_URL,
                    isError: false,
                })
            } else {
                if (!selected_item.URL.includes('https://www.youtube.com/')) {
                    console.warn('Format found! 33');
                    this.setState({
                        youtubeUrl: selected_item.URL,
                        isError: false,
                    })
                } else {
                    console.warn('Format found! 34');
                    this.setState({
                        isError: true,
                        youtubeUrl: undefined,
                        errorMessage: 'No video available. Please contact to admin for more details.'
                    })
                }
            }
        }
    }

    handleBackButtonClick = () => {
        console.warn('BACK_HAAA', this.state.seconds)
        if (this.state.seconds >= 1) {
            this.props.navigation.state.params.onGoBack(this.state.seconds,
                this.props.navigation.state.params.item);
        }
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

    onLoad = (data) => {
        // alert('On load fired!')
        console.warn('On load fired!');
        if (Platform.OS == 'android') {
            if (this.state.isVideoLoading == true) {
                this.setState({
                    isVideoLoading: false
                });
            }
        } else {
            if (this.state.isVideoLoading == true) {
                this.setState({
                    isVideoLoading: false
                });
            }
        }
    }
    onBuffer() {
        console.log('On buffer!!');
    }
    videoError(err) {
        console.log(err);
    }

    onLoadStart = (data) => {
        console.warn('On load start fired!');
        if (Platform.OS == 'android') {
            this.setState({ isVideoLoading: true });
        } else {
            this.setState({ isVideoLoading: true });
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
            frameRateDefaultSaved: item.time,
            isSpeedSelect: false,
            frameRateArray: [...previousFrameRateArray]
        }, () => {
            Toast.showSuccess(item.time + 'X')
        });
    }

    getVimeoPageURL(videoId) {
        return 'https://myagi.github.io/react-native-vimeo/v0.3.0.html?vid=' + videoId;
    }

    onPlaybackRateChange = (data) => {
        // alert('On load fired!')
        console.warn('On playback fired!', data);
        // if (data?.playbackRate === 1) {
        //     this.setState({
        //         frameRateDefault:1.0
        //     })
        //     setTimeout(() => {
        //         this.setState({
        //             frameRateDefault: this.state.frameRateDefaultSaved
        //         },()=>{
        //             console.warn('HANDLE_RATE'+ this.state.frameRateDefault + '\n\n' + this.state.frameRateDefaultSaved)
        //         })
        //     }, 1000);
        // }
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
        if (this.state.isError) {
            return (
                <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 }}>
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
                    <View style={{ backgroundColor: 'black', flex: 1 }}>
                        {this.state.isVimeoURLVisible == false ?
                            <View style={{ flex: 1 }}>

                                <NavigationEvents
                                    onWillFocus={payload => this._onWillFocus()}
                                    onWillBlur={payload => this._onWillBlurr()}
                                />
                                <StatusBar hidden />
                                {this.state.youtubeUrl != undefined &&
                                    <AndroidPlayer
                                        url={this.state.youtubeUrl}
                                        rate={this.state.frameRateDefault}
                                        buffingName={'video'}
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
                                        //center: 0,
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
                                            showsHorizontalScrollIndicator={false}
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
                            </View>
                            :
                            <View style={{ flex: 1, backgroundColor: colors.black }}>

                                <NavigationEvents
                                    onWillFocus={payload => this._onWillFocus()}
                                    onWillBlur={payload => this._onWillBlurr()}
                                />
                                <StatusBar hidden />
                                <AutoHeightWebView
                                    //style={{ width: Dimensions.get('window').width - 15, marginTop: 35 }}
                                    style={{ flex: 1, width: '100%', marginBottom: -10 }}
                                    source={{ uri: this.getVimeoPageURL(this.state.vimeoVideoIDForPlay) }}
                                    scalesPageToFit={true}
                                    viewportContent={'width=device-width, user-scalable=no'}
                                    scrollEnabledWithZoomedin={false}
                                    originWhitelist={['*']}
                                    showsVerticalScrollIndicator={false}
                                    showsHorizontalScrollIndicator={false}
                                />
                            </View>}
                    </View>)
            } else {
                return (
                    <View style={{ backgroundColor: 'black', flex: 1 }}>
                        {/* Header view */}
                        {this.renderHeader()}
                        {this.state.isVimeoURLVisible == false ?
                            <View style={{ flex: 1 }}>
                                <NavigationEvents
                                    onWillFocus={payload => this._onWillFocus()}
                                    onWillBlur={payload => this._onWillBlurr()}
                                />
                                <StatusBar hidden />
                                {this.state.youtubeUrl != undefined &&
                                    <Video
                                        onLayout={this._onLayout}
                                        source={{ uri: this.state.youtubeUrl }}   // Can be a URL or a local file.
                                        controls={true}
                                        play={this.state.play}
                                        onProgress={this.onProgress}
                                        fullscreen={this.state.fullScreeen}
                                        resizeMode="contain"
                                        onLoadStart={this.onLoadStart}
                                        onLoad={this.onLoad}
                                        onPlaybackRateChange={this.onPlaybackRateChange}
                                        style={{ flex: 1 }}
                                        //ref={this.playerRef}
                                        ref={(ref) => {
                                            this.player = ref
                                        }}
                                        onBuffer={this.onBuffer}                // Callback when remote video is buffering
                                        onError={this.videoError}
                                        rate={this.state.frameRateDefault}
                                        playInBackground={true}
                                        playWhenInactive={true}
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
                                            showsHorizontalScrollIndicator={false}
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
                                {this.state.isVideoLoading != undefined && this.state.isVideoLoading == true ?
                                    <View style={{
                                        flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, position: 'absolute', alignItems: 'center',
                                        left: 0, right: 0, bottom: 0, top: 0
                                    }}>
                                        <ActivityIndicator />
                                        <Text style={{
                                            top: 10, fontSize: (dimensions.sizeRatio * 14),
                                            textAlignVertical: "center", color: colors.white,
                                            fontFamily: CONSTANTS.DEMI
                                        }}>buffering video...</Text>
                                    </View> : null
                                }
                            </View>
                            :
                            <View style={{ flex: 1, backgroundColor: colors.black }}>

                                <NavigationEvents
                                    onWillFocus={payload => this._onWillFocus()}
                                    onWillBlur={payload => this._onWillBlurr()}
                                />
                                <StatusBar hidden />
                                <AutoHeightWebView
                                    //style={{ width: Dimensions.get('window').width - 15, marginTop: 35 }}
                                    style={{ flex: 1, width: '100%', marginBottom: -10 }}
                                    source={{ uri: this.getVimeoPageURL(this.state.vimeoVideoIDForPlay) }}
                                    scalesPageToFit={true}
                                    viewportContent={'width=device-width, user-scalable=no'}
                                    scrollEnabledWithZoomedin={false}
                                    originWhitelist={['*']}
                                    showsVerticalScrollIndicator={false}
                                    showsHorizontalScrollIndicator={false}
                                />
                            </View>
                        }
                    </View>
                )
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

    renderHeader = () => {
        return (
            <View
                style={{
                    width: '100%',
                    height: 45,
                    backgroundColor: colors.theme,
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
                <Text style={{ fontSize: 18, fontFamily: CONSTANTS.DEMI, color: colors.white, textAlign: 'left', marginLeft: 15 }}>
                    {'Video Player'}
                </Text>
            </View>
        )
    }
}










// extractorYoutubeURL = (youtubeUrl, videoQuality) => {

//     console.warn('Format found! url' + JSON.stringify(youtubeUrl));
//     let storeQualityData = videoQuality
//     let qualityForVideo = '18';
//     if (storeQualityData.value == 360) {
//         qualityForVideo = '18'
//     } else {
//         qualityForVideo = '22'
//     }
//     ytdl.getInfo(youtubeUrl, {}, (err, info) => {

//         console.log('format error' + JSON.stringify(err) + '\n\n' + JSON.stringify(info));

//         if (info != undefined && info.formats != undefined) {
//             let format = ytdl.chooseFormat(info.formats, { quality: qualityForVideo });
//             console.warn('Format found1' + JSON.stringify(format));
//             if (format != undefined && format.url != undefined) {

//                 this.setState({
//                     youtubeUrl: format.url,
//                     isError: false,
//                 })
//             }
//             else {

//                 let format = ytdl.chooseFormat(info.formats, { quality: '18' });
//                 console.warn('Format found Again18!' + JSON.stringify(format));
//                 console.warn('Format found2' + JSON.stringify(format));
//                 if (format != undefined && format.url != undefined) {
//                     console.warn('Format found3' + JSON.stringify(format));
//                     this.setState({
//                         youtubeUrl: format.url,
//                         isError: false,
//                     })
//                 } else {
//                     console.warn('Format found! video else4');
//                     if (selected_item != undefined && selected_item.TMP_VIDEO_URL != '' &&
//                         selected_item.TMP_VIDEO_URL != null) {
//                         console.warn('Format found! video else5');
//                         this.setState({
//                             youtubeUrl: selected_item.TMP_VIDEO_URL,
//                             isError: false,
//                         })
//                     } else {
//                         console.warn('Format found! video else6');
//                         //Check here main url is youtube or not
//                         if (!youtubeUrl.includes('https://www.youtube.com/')) {
//                             console.warn('Format found! video else7');
//                             this.setState({
//                                 youtubeUrl: youtubeUrl,
//                                 isError: false,
//                             })
//                         } else {
//                             console.warn('Format found! video else8');
//                             this.setState({
//                                 isError: true,
//                                 youtubeUrl: undefined,
//                                 errorMessage: 'No video available. Please contact to admin for more details.'
//                             })

//                             alert('first error 18'+ youtubeUrl + '\n\n'+JSON.stringify(format))
//                         }
//                     }
//                 }
//             }
//         } else {
//             console.warn('Format found! video else9');
//             if (selected_item != undefined && selected_item.TMP_VIDEO_URL != '' &&
//                 selected_item.TMP_VIDEO_URL != null) {
//                 console.warn('Format found! video else10');
//                 this.setState({
//                     youtubeUrl: selected_item.TMP_VIDEO_URL,
//                     isError: false,
//                 })
//             } else {
//                 console.warn('Format found! video else11');
//                 //Check here main url is youtube or not
//                 if (!youtubeUrl.includes('https://www.youtube.com/')) {
//                     console.warn('Format found! video else12');
//                     this.setState({
//                         youtubeUrl: youtubeUrl,
//                         isError: false,
//                     })
//                 } else {
//                     console.warn('Format found! video else13');
//                     this.setState({
//                         isError: true,
//                         youtubeUrl: undefined,
//                         errorMessage: 'No video available. Please contact to admin for more details.'
//                     })
//                     alert('second error' + youtubeUrl + '\n\n'+JSON.stringify(err) + '\n\n'+JSON.stringify(info))
//                 }
//             }
//         }
//     });
// }