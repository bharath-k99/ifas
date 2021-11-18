
import React, { Component } from 'react';
// Bellow Components are using for make design and functionality
import {
    Platform, AsyncStorage, Text, Button, View, Image,
    TouchableOpacity, TextInput, Alert, ActivityIndicator, StatusBar,
    NativeEventEmitter, NativeModules, FlatList, Keyboard, Dimensions,
    ScrollView, AppState
} from 'react-native';
import colors from '../resources/colors';
import CONSTANTS from '../resources/constants';
import dimensions from '../resources/dimension';
import Orientation from 'react-native-orientation';
import { PermissionsAndroid } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { EventRegister } from 'react-native-event-listeners';
import { showNativeAlert } from '../resources/app_utility';

import ytdl from "react-native-ytdl"
import Toast from 'react-native-tiny-toast';
import AndroidPlayer from '../screens/AndroidPlayer';
import Video from 'react-native-video';
import DeviceInfo from 'react-native-device-info';
import DropDown from 'react-native-vector-icons/FontAwesome';
const DropDownView = <DropDown name="caret-down" size={20} color={colors.white} />;

// video_start_at: '2020-07-09 17:30:00',
// video_end_at: '2020-07-09 20:30:00'
let seekingTime = 0;
export default class LiveVideoStreaming extends Component {

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
            headerLeft: <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <TouchableOpacity
                    //hitSlop={{top: 20, bottom: 20, left: 30, right: 30}} 
                    onPress={() => navigation.navigation.state.params.methodGoBack()}
                    style={{
                        width: dimensions.sizeRatio * 35,
                        height: dimensions.sizeRatio * 25,
                        marginLeft: Platform.OS == 'android' ? dimensions.sizeRatio * 10 : dimensions.sizeRatio * 5,
                        zIndex: 1,
                        padding: dimensions.sizeRatio * 2,
                        //marginBottom: Platform.OS == 'ios' ? dimensions.sizeRatio * 10 : 0,
                        justifyContent: 'center'
                    }}>
                    <Image
                        source={Platform.OS == 'ios' ? require('../images/back.png') : require('../images/back_two.png')}
                        style={{
                            width: Platform.OS == 'android' ? dimensions.sizeRatio * 30 : dimensions.sizeRatio * 20,
                            height: Platform.OS == 'android' ? dimensions.sizeRatio * 20 : dimensions.sizeRatio * 20,
                            //marginTop: Platform.OS == 'android' ? 0 : dimensions.sizeRatio * 5,
                            tintColor: colors.white,
                            alignSelf: 'center'
                            //padding: 5
                        }}
                        resizeMode={Platform.OS == 'android' ? 'contain' : 'contain'}
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
            appState: AppState.currentState,
            userId: undefined,
            access_token: undefined,
            isFirstTime: false,
            youtubeUrl: undefined,
            play: true,
            isVideoLoading: true,
            frameRateDefault: 1.0,
            fullScreeen: true,
            isScreenLandScape: true,
            isScreenLandScapeHideOpenClose: true,
            isCloseOpen: true,
            commentTextInput: '',
            chatArrayList: [],
            pageCount: 1,
            messageLimit: 35,
            lastMessageId: 1,
            isAndroidShowHideButton: true,
            currentPage: 0,
            holdFirstTimePage: 0,
            isChatScrollFirst: true,
            messageCount: 0,
            isApiCallingRecurssion: false
        }
        isRecordingGloble = false
        savedLastID = 0;
    }

    methodGoBack() {
        this.props.navigation.goBack()
        return true
    }

    componentDidMount() {
        this.setState({
            isVideoLoading: true
        })
        this.props.navigation.setParams({ methodGoBack: this.methodGoBack.bind(this) });
        this.getAccessToken()

        const { navigation } = this.props;
        if (Platform.OS == 'android') {
            // this.focusListener = navigation.addListener("didFocus", () => {
            //     // The screen is focused
            //     Orientation.lockToLandscape();
            //     Orientation.addOrientationListener(this._orientationDidChange);
            // });
        }
        // Recording of
        if (Platform.OS == 'ios') {
            this.checkIfRecord()
            this.addListener()
        }
        AppState.addEventListener('change', this._handleAppStateChange);
    }
    componentWillUnmount() {
        Orientation.removeOrientationListener(this._orientationDidChange);
        AppState.removeEventListener('change', this._handleAppStateChange);
        if (Platform.OS == 'ios') {
            this.screenCaptureEnabled.remove()
            NativeModules.SFViewControl.rotatePlayerLockUnlock('potrate')
            Orientation.lockToPortrait();
        } else {
            //Orientation.lockToPortrait();
            // Remove the event listener
            //this.focusListener.remove();
        }
    }

    checkIfRecord() {
        //console.warn('CAPTURE_SESSIONS_O')

        try {
            //NativeModules.ScreenRecorderDetect.addScreenRecorderListner()
            NativeModules.ScreenRecorderDetect.get().then(isRecord => {
                //console.warn('CAPTURE_SESSIONS_A' + '\n\n' + JSON.stringify(isRecord))

                if (isRecord == 'YES') {
                    isRecordingGloble = true
                    //console.warn('CAPTURE_SESSIONS_B' + '\n\n' + JSON.stringify(isRecord) + '\n\n' + this.state.isRecording)
                    this.setState({
                        isRecording: true
                    })
                }
                else {
                    isRecordingGloble = false
                    this.setState({ isRecording: false }, () => {
                        //console.warn('CAPTURE_SESSIONS_C' + '\n\n' + JSON.stringify(isRecord) + '\n\n' + this.state.isRecording)
                    })
                }
            });
        } catch (e) {
            console.error(e);
        }
    }

    addListener = () => {
        NativeModules.ScreenRecorderDetect.addScreenRecorderListner()
        //console.warn('CAPTURE_SESSIONS')
        let bridge = new NativeEventEmitter(NativeModules.ScreenRecorderDetect);

        this.screenCaptureEnabled = bridge.addListener("isScreenCaptureEnabled", (res) => {
            //console.warn('CAPTURE_SESSIONS1' + '\n\n' + JSON.stringify(res))
            if (res.value == true) {
                //console.warn('CAPTURE_SESSIONS2' + '\n\n' + JSON.stringify(res) + '\n\n' + this.state.isRecording)
                isRecordingGloble = true
                this.setState({
                    isRecording: true
                })
            }
            else {
                isRecordingGloble = false
                this.setState({ isRecording: false }, () => {
                    //console.warn('CAPTURE_SESSIONS3' + '\n\n' + JSON.stringify(res) + '\n\n' + this.state.isRecording)
                })
            }

        })
    }

    _handleAppStateChange = (nextAppState) => {

        console.log('App  state ')
        console.warn('handleForceUpdating1')
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            console.warn('App has come to the foreground!')
            this._getVideoSessionTimingStateChange()
        }
        this.setState({ appState: nextAppState });
    }

    _getVideoSessionTimingStateChange() {
        try {
            let now = new Date().getTime()
            // Do your operations
            var arr = this.props.navigation.state.params.live_session_data.start_date.split(/-|\s|:/);// split string and create array.
            let startDate = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
            //let startDate = new Date(CONSTANTS.SESSION_START_DATE);

            //var arr2 = '2020-07-20 13:05:00'.split(/-|\s|:/);// split string and create array.
            var arr2 = this.props.navigation.state.params.live_session_data.end_date.split(/-|\s|:/);// split string and create array.
            let endDate = new Date(arr2[0], arr2[1] - 1, arr2[2], arr2[3], arr2[4], arr2[5]);
            // let endDate = new Date(CONSTANTS.SESSION_END_DATE );

            if (startDate.getTime() <= now && now <= endDate.getTime()) {
                if (Platform.OS == 'android') {
                    Orientation.lockToLandscape();
                    Orientation.addOrientationListener(this._orientationDidChange);
                }
            } else {
                showNativeAlert('Live Session has been ended.')
                EventRegister.emit('SessionExpried', '')
                this.methodGoBack()
            }
        } catch (err) {
            console.warn('SESSION EXCEPTION SESSION SCREEN STATE CHANGE' + JSON.stringify(err))
        }
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
                    console.log("Hii -- " + self.state.access_token);
                    this._getVideoSessionTiming()
                    this.getLiveSessionComments(true, null)
                })

            } else {
                showNativeAlert('Not logged-In')
            }
        })
    }

    callExtractionLogApi = (accessToken, errSucess, type) => {

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
                brand_name:${DeviceInfo.getBrand()}`;

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
                //formData.append('user_id', );
                formData.append('device_name', `${deviceName}`);
                formData.append('username', loginData.data.USER_NAME);
                //formData.append('username', 'Puneet');
                //formData.append('video_id', '');
                formData.append('video_url', this.props.navigation.state.params.youtubeUrl);
                formData.append('os', DeviceInfo.getSystemVersion());
                formData.append('type', 1);
                formData.append('success', successData);
                formData.append('error', errorData);
                // formData.append('success', (type == 'success' ? errSucess : ''));
                // formData.append('error', (type == 'error' ? errSucess : ''));
                console.warn('EXTACTION_LOG_REQUEST' + JSON.stringify(formData))

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
                        console.warn('ENTER_EXTRCTOIN' + JSON.stringify(responseJson))
                        if (responseJson.code == 201) {

                        } else {
                            //work here
                            //alert(JSON.stringify(responseJson))
                        }
                    })
                    .catch((error) => {
                        console.warn('ERROR_EXTRACION' + JSON.stringify(error));
                        //showNativeAlert("Network request failed")
                    });

            }
        })
    }

    getLiveSessionComments(isFirstTime, lastMessageId) {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('session_id', 36);
        if (isFirstTime) {
            //formData.append('page', this.state.pageCount);
            formData.append('limit', this.state.messageLimit);
        } else {
            //formData.append('page', this.state.pageCount);
            //formData.append('limit', this.state.messageLimit);
            formData.append('last_comment_id', lastMessageId);
            this.setState({
                isApiCallingRecurssion: true
            })
        }
        console.log(formData)

        fetch(CONSTANTS.BASE + CONSTANTS.GET_LIVE_SESSION_COMMENTS, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log('livesession comments response')
                console.log(responseJson)
                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else {
                    //Work here
                    if (isFirstTime) {
                        this.setState({
                            chatArrayList: responseJson.recent_data.reverse(),
                            isVideoLoading: false,
                        }, () => {
                            setTimeout(() => {
                                let chatArrayLength = this.state.chatArrayList.length;
                                if (chatArrayLength > 0) {
                                    let lastCommentId = this.state.chatArrayList[chatArrayLength - 1].LSC_ID;
                                    if (this.scrollView != undefined) {
                                        this.scrollView.scrollToEnd({ animated: true, index: -1 }, 200);
                                    }
                                    console.log('SETTIMEOUT1' + chatArrayLength + '\n\n' + JSON.stringify(lastCommentId))
                                    this.getLiveSessionComments(false, lastCommentId)
                                } else {
                                    console.log('SETTIMEOUT2' + chatArrayLength)
                                    this.getLiveSessionComments(true, null)
                                }
                            }, 1000);
                        })
                    } else {
                        let newMesasgeCount = 0;
                        if (responseJson.recent_data.length != 0) {
                            newMesasgeCount = parseInt(this.state.messageCount) + parseInt(responseJson.recent_data.length);
                        }
                        this.setState({
                            chatArrayList: [...this.state.chatArrayList, ...responseJson.recent_data],
                            isVideoLoading: false,
                            messageCount: newMesasgeCount != 0 ? newMesasgeCount : this.state.messageCount
                        }, () => {
                            setTimeout(() => {
                                this.setState({
                                    isApiCallingRecurssion: false
                                }, () => {
                                    let chatArrayLength = this.state.chatArrayList.length;
                                    let chatArrLenght = 0;
                                    let lastCommentId = 0;
                                    if (responseJson.recent_data.length != 0) {
                                        chatArrLenght = responseJson.recent_data.length;
                                        lastCommentId = responseJson.recent_data[0].LSC_ID;
                                        savedLastID = responseJson.recent_data[0].LSC_ID;
                                        console.log('ARARY_LENGTH' + chatArrLenght + '\n\n' + JSON.stringify(responseJson.recent_data) + '\n\n' +
                                            responseJson.recent_data[0].LSC_ID + '\n\n' + savedLastID)
                                    } else {
                                        if (savedLastID == 0) {
                                            lastCommentId = this.state.chatArrayList[chatArrayLength - 1].LSC_ID;
                                            console.log('ENTER IF' + lastCommentId + '\n\n' + savedLastID)
                                        } else {
                                            lastCommentId = savedLastID;
                                            console.log('ENTER ELSE' + savedLastID)
                                        }
                                    }
                                    if (this.state.isApiCallingRecurssion == false) {
                                        console.log('LAST_COMMENT_ID' + JSON.stringify(lastCommentId) + '\n\n' + 'LAST ARRAY' + JSON.stringify(responseJson.recent_data))
                                        this.getLiveSessionComments(false, lastCommentId)
                                    }
                                })

                            }, 1000);
                        })
                    }
                }
            })
            .catch((error) => {
                console.error(error);
                // showNativeAlert("Network request failed")
            });
    }

    _getVideoSessionTiming() {
        try {
            let now = new Date().getTime()
            // Do your operations
            var arr = this.props.navigation.state.params.live_session_data.start_date.split(/-|\s|:/);// split string and create array.
            let startDate = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
            //let startDate = new Date(CONSTANTS.SESSION_START_DATE);

            //var arr2 = '2020-07-20 13:05:00'.split(/-|\s|:/);// split string and create array.
            var arr2 = this.props.navigation.state.params.live_session_data.end_date.split(/-|\s|:/);// split string and create array.
            let endDate = new Date(arr2[0], arr2[1] - 1, arr2[2], arr2[3], arr2[4], arr2[5]);
            // let endDate = new Date(CONSTANTS.SESSION_END_DATE );

            if (startDate.getTime() <= now && now <= endDate.getTime()) {
                let seconds = now - startDate.getTime();
                console.warn('SESSIONTIME' + now + '\n\n' + startDate.getTime() + '\n\n' + endDate.getTime() + '\n\n' + seconds)
                seekingTime = seconds
                console.log('seekingTime', seekingTime)
                if (Platform.OS == 'android') {
                    Orientation.lockToLandscape();
                    Orientation.addOrientationListener(this._orientationDidChange);
                } else {
                    NativeModules.SFViewControl.rotatePlayerLockUnlock('unloack')
                    Orientation.lockToLandscape();
                    Orientation.addOrientationListener(this._orientationDidChange);
                }
                this.extractorYoutubeURL(this.props.navigation.state.params.youtubeUrl.trim())

            } else {
                showNativeAlert('Live Session has been ended.')
                EventRegister.emit('SessionExpried', '')
                this.methodGoBack()
            }
        } catch (err) {
            console.warn('SESSION EXCEPTION SESSION SCREEN' + JSON.stringify(err))
            Toast.show('Live session chat not working please join LIVE SESSION through Without Chat!')
            //showNativeAlert('Live session chat not working please join LIVE SESSION through Without Chat!')
            this.methodGoBack()
        }
    }

    onProgress = (data) => {
        //console.warn('ONPROGRESS' + JSON.stringify(data))
    };

    onLoadStart = (data) => {
        console.warn('On load start fired!');
        if (Platform.OS == 'android') {
            this.setState({ isVideoLoading: true });
        } else {
            this.setState({ isVideoLoading: true });
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

    extractorYoutubeURL = async (youtubeUrl) => {

        //let youtubeUrl2 = 'https://www.youtube.com/watch?v=FEU-LZiZIV4&list=RDFEU-LZiZIV4&start_radio=1';
        //let youtubeUrl2 = 'https://www.youtube.com/watch?v=4XeruKiMbE8';

        console.warn('Format found! url' + JSON.stringify(youtubeUrl));
        let qualityForVideo = '18';
        await ytdl.getInfo(youtubeUrl, {}, (err, info) => {
            //if (err) 

            console.log('format error' + JSON.stringify(err) + '\n\n' + JSON.stringify(info));
            if (info != undefined && info.formats != undefined) {
                //17 video 144
                //18 video 360
                //83 video 240
                //22 video 720
                //137 video 1080
                //101 audio 140
                let format1 = ytdl.chooseFormat(info.formats, { quality: qualityForVideo });

                console.warn('Format found!1' + JSON.stringify(format1));
                let videoURL = undefined;
                if (format1 != undefined && format1.url != undefined) {

                    videoURL = format1.url
                    this.setState({
                        youtubeUrl: format1.url,
                        isVideoLoading: false,
                    }, () => {
                        this.callExtractionLogApi(this.state.access_token, format1, 'success')
                    })
                    console.warn('Format found!2' + JSON.stringify(format1));
                } else {
                    this.callExtractionLogApi(this.state.access_token, err, 'error')
                    Toast.show('Live session chat not working please join LIVE SESSION through Without Chat!')
                    //showNativeAlert('Live session chat not working please join LIVE SESSION through Without Chat!')
                    this.methodGoBack()
                }
            } else {
                this.callExtractionLogApi(this.state.access_token, err, 'error')
                Toast.show('Live session chat not working please join LIVE SESSION through Without Chat!')
                //showNativeAlert('Live session chat not working please join LIVE SESSION through Without Chat!')
                this.methodGoBack()
                // this.setState({
                //     isVideoLoading: false,
                // })
            }
        })
            .catch((e) => {
                this.callExtractionLogApi(this.state.access_token, { "line": 146795, "column": 18, "sourceURL": "http://192.168.0.109:8081/index.bundle?platform=android&dev=true&minify=false" }, 'error')
                Toast.show('Live session chat not working please join LIVE SESSION through Without Chat!')
                //showNativeAlert('Live session chat not working please join LIVE SESSION through Without Chat!')
                this.methodGoBack()
            })
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
        console.log('handleForceUpdating7')
        Orientation.unlockAllOrientations()
        if (orientation === 'LANDSCAPE') {
            // do something with landscape layout
            console.log('handleForceUpdating8')
            this.setState({
                play: true,
                isScreenLandScape: true,
                isScreenLandScapeHideOpenClose: true,
                isAndroidShowHideButton: true
            })
            if (this.scrollView != undefined) {
                this.scrollView.scrollToEnd({ animated: true })
            }
        } else {
            // do something with portrait layout
            console.log('handleForceUpdating9')
            // Hide that keyboard!
            Keyboard.dismiss()
            this.setState({
                play: true,
                isScreenLandScape: false,
                isScreenLandScapeHideOpenClose: false,
                isAndroidShowHideButton: false
            })
        }
    }

    onCommentSubmit = (message) => {
        //let messageTrim = message.replace(/\s/g, '');
        let messageTrim = message.trim();
        if (messageTrim != undefined && messageTrim != null && messageTrim != '') {
            // Hide that keyboard!
            Keyboard.dismiss()
            this.storeLiveSessionComments(messageTrim)
            this.setState({
                commentTextInput: ''
            })
        } else {
            // Hide that keyboard!
            Keyboard.dismiss()
        }
    }
    closeOpenChat = (isOpen) => {
        console.warn('abcccc0' + isOpen)
        if (isOpen) {
            console.warn('abcccc1' + isOpen)
            this.setState({
                isScreenLandScape: true,
                isCloseOpen: isOpen
            })
        } else {
            console.warn('abcccc2' + isOpen)
            this.setState({
                isScreenLandScape: false,
                isCloseOpen: isOpen
            })
        }
    }

    _playerReadyToplay() {
        let convertedSeekTime = (parseFloat(seekingTime) / 1000)
        console.log('in player seekingTime' + seekingTime + '\n\n' + convertedSeekTime)
        this.player.seek(convertedSeekTime)
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

    logoutUser() {
        showNativeAlert(CONSTANTS.LOGOUT_MESSAGE)
        // CONSTANTS.TOP_SCREEN = ''
        CONSTANTS.IS_LOGGED_IN = false
        this.props.navigation.popToTop()

    }

    storeLiveSessionComments(message) {

        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('session_id', 36);
        formData.append('comment', message);
        console.log(formData)

        fetch(CONSTANTS.BASE + CONSTANTS.STORE_LIVE_SESSION_COMMENTS, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log('storeLiveSession comments response')
                console.log(responseJson)
                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else {
                    //Work here
                }
            })
            .catch((error) => {
                console.error(error);
                // showNativeAlert("Network request failed")
            });
    }

    _onScroll(event) {
        let newPageNum = Math.round(parseFloat(event.nativeEvent.contentOffset.y / Dimensions.get('window').height))

        if (this.state.isChatScrollFirst) {
            newPageNum != this.state.currentPage &&
                this.setState({
                    currentPage: newPageNum,
                    holdFirstTimePage: newPageNum,
                    isChatScrollFirst: false
                }, () => {
                    console.warn('SCROLLPAGE' + this.state.currentPage)
                });
        } else {
            if (this.state.holdFirstTimePage < newPageNum) {
                this.setState({
                    currentPage: newPageNum,
                    holdFirstTimePage: newPageNum,
                })
            } else {
                this.setState({
                    currentPage: newPageNum,
                })
            }
        }
        this.setState({
            messageCount: 0
        })
    }
    render() {
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
                <View
                    style={{
                        flex: 1,//for cover full screen height and width
                        width: '100%',
                    }}>
                    <StatusBar
                        barStyle="light-content"
                        backgroundColor="#052048" />
                    {this.state.isVideoLoading == true ?
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                            <ActivityIndicator />
                            <Text style={{
                                top: 10, fontSize: 14,
                                textAlignVertical: "center", color: 'white',
                            }}>buffering video...</Text>
                        </View> :
                        <View style={{
                            flex: 1,
                        }}>
                            {Platform.OS == 'android' ?
                                <View style={{ backgroundColor: 'black', flex: 1 }}>

                                    {this.state.youtubeUrl != undefined &&
                                        <View style={{
                                            backgroundColor: 'black',
                                            flex: 1,
                                            width: '100%',
                                            flexDirection: 'row'
                                        }}>
                                            <View style={{
                                                width: this.state.isScreenLandScape ? '65%' : '100%'
                                            }}>
                                                <Video
                                                    inverted={-1}
                                                    onLayout={this._onLayout}
                                                    source={{ uri: this.state.youtubeUrl }}   // Can be a URL or a local file.
                                                    controls={false}
                                                    hideShutterView={true}
                                                    play={this.state.play}
                                                    onProgress={this.onProgress}
                                                    fullscreen={this.state.fullScreeen}
                                                    resizeMode={this.state.isScreenLandScape ? "stretch" : 'contain'}
                                                    //onLoadStart={this.onLoadStart}
                                                    onLoad={() => {
                                                        this._playerReadyToplay()
                                                    }}
                                                    onEnd={() => {
                                                        showNativeAlert('Live Session has been ended.')
                                                        EventRegister.emit('SessionExpried', '')
                                                        this.methodGoBack()
                                                    }}
                                                    style={{
                                                        flex: 1,
                                                        width: '100%'
                                                    }}
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
                                                {/* For android side chat menu open using this code */}
                                                {this.state.isScreenLandScape == false &&
                                                    this.state.isAndroidShowHideButton ?
                                                    <TouchableOpacity
                                                        activeOpacity={.9}
                                                        onPress={() => {
                                                            console.warn('ababab')
                                                            this.closeOpenChat(!this.state.isCloseOpen)
                                                        }}
                                                        style={{
                                                            width: 50,
                                                            height: 50,
                                                            borderRadius: 25,
                                                            backgroundColor: colors.transparent_theme,
                                                            position: 'absolute',
                                                            top: 0,
                                                            right: 0,
                                                            marginRight: -20,
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            zIndex: 0
                                                        }}>
                                                        <Image
                                                            style={{
                                                                width: 35,
                                                                height: 35,
                                                                color: colors.theme
                                                            }}
                                                            source={require('../images/icon_close.png')}
                                                            resizeMode={'contain'}
                                                        //Dropdown
                                                        />
                                                    </TouchableOpacity> : null
                                                }
                                            </View>
                                            {/* Right chat view */}
                                            <View style={{
                                                flex: 1,
                                                width: this.state.isScreenLandScape ? '35%' : 0,
                                                backgroundColor: colors.white
                                            }}>
                                                <View style={{
                                                    height: '100%', width: '100%',
                                                    height: Dimensions.get('window').height - 80
                                                }}>
                                                    {this.state.chatArrayList != undefined && this.state.chatArrayList.length > 0 ?
                                                        <ScrollView
                                                            ref={ref => {
                                                                this.scrollView = ref
                                                            }}
                                                            //scrollEventThrottle={15}
                                                            //removeClippedSubviews={true}
                                                            //pagingEnabled={true}
                                                            onScroll={this._onScroll.bind(this)}
                                                            onContentSizeChange={() => {
                                                                if (this.state.holdFirstTimePage == this.state.currentPage) {
                                                                    this.scrollView.scrollToEnd({ animated: true })
                                                                }
                                                            }}
                                                            // style={{
                                                            //     flex: 1,
                                                            //     height: '100%'
                                                            // }}
                                                            //contentContainerStyle={{ height:Dimensions.get('window').height - 80 }}
                                                            contentContainerStyle={{ flexGrow: 1 }}
                                                            //nestedScrollEnabled={true}
                                                            bounces={false}>
                                                            {this.state.chatArrayList.map((item, index) => (
                                                                <View style={{
                                                                    flexDirection: 'row',
                                                                    width: '100%',
                                                                    backgroundColor: 'white',
                                                                    alignItems: 'center',
                                                                    padding: 7
                                                                }}>
                                                                    <Text
                                                                        style={{
                                                                            fontSize: 13,
                                                                            color: item.IS_SELF == 1 ? colors.primary_dark :
                                                                                (this.props.navigation.state.params.live_session_data.subject_teacher_id == item.ifas_registration.STUDENT_NO) ? colors.primary_dark : colors.gray,
                                                                            fontWeight: '600',
                                                                            textAlign: 'left'
                                                                        }}>
                                                                        {item.IS_SELF == 1 ? `You:` :
                                                                            (this.props.navigation.state.params.live_session_data.subject_teacher_id == item.ifas_registration.STUDENT_NO) ? `IFAS:` :
                                                                                `${item.ifas_registration.FIRST_NAME} ${item.ifas_registration.LAST_NAME}:`}
                                                                        <Text
                                                                            style={{
                                                                                fontSize: 12,
                                                                                color: colors.black,
                                                                                fontWeight: '600'
                                                                            }}>
                                                                            {item.IS_SELF == 1 ? item.LSC_COMMENT : item.LSC_COMMENT}
                                                                        </Text>
                                                                    </Text>
                                                                    {/* <Text
                                                                    style={{
                                                                        fontSize: 13,
                                                                        color: item.IS_SELF == 1 ? colors.primary_dark : colors.gray,
                                                                        fontWeight: '600',
                                                                        textAlign: 'left'
                                                                    }}>
                                                                    {item.IS_SELF == 1 ? `You:` : `${item.ifas_registration.FIRST_NAME} ${item.ifas_registration.LAST_NAME}:`}
                                                                    <Text
                                                                        style={{
                                                                            fontSize: 12,
                                                                            color: colors.black,
                                                                            fontWeight: '600'
                                                                        }}>
                                                                        {item.IS_SELF == 1 ? item.LSC_COMMENT : item.LSC_COMMENT}
                                                                    </Text>
                                                                </Text> */}
                                                                </View>
                                                            ))}
                                                        </ScrollView> : null
                                                    }
                                                    {/* <FlatList
                                                    ref={ref => (this.scrollView = ref)}
                                                    onContentSizeChange={() => {
                                                        if(this.state.chatArrayList.length >= 10 &&
                                                            this.state.chatArrayList.length )
                                                        this.scrollView.scrollToEnd({ animated: true, index: -1 }, 200);
                                                    }}
                                                    data={this.state.chatArrayList}
                                                    renderItem={({ item }) =>
                                                        <View style={{
                                                            flexDirection: 'row',
                                                            width: '100%',
                                                            backgroundColor: 'white',
                                                            alignItems: 'center',
                                                            padding: 7
                                                        }}>
                                                            <Text
                                                                style={{
                                                                    fontSize: 13,
                                                                    color: item.IS_SELF == 1 ? colors.primary_dark : colors.gray,
                                                                    fontWeight: '600',
                                                                    textAlign: 'left'
                                                                }}>
                                                                {item.IS_SELF == 1 ? `You:` : `${item.ifas_registration.FIRST_NAME} ${item.ifas_registration.LAST_NAME}:`}
                                                                <Text
                                                                    style={{
                                                                        fontSize: 12,
                                                                        color: colors.black,
                                                                        fontWeight: '600'
                                                                    }}>
                                                                    {item.IS_SELF == 1 ? item.LSC_COMMENT : item.LSC_COMMENT}
                                                                </Text>
                                                            </Text>
                                                        </View>
                                                    }
                                                    extraData={this.props}
                                                    keyExtractor={(item, index) => this.keyExtractor(item)}
                                                /> */}
                                                    {this.state.isScreenLandScape && this.state.messageCount > 0 &&
                                                        <TouchableOpacity
                                                            style={{
                                                                width: 40,
                                                                height: 20,
                                                                borderRadius: 20,
                                                                backgroundColor: colors.red,
                                                                position: 'absolute',
                                                                bottom: 0,
                                                                right: 0,
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                margin: 5
                                                            }}
                                                            onPress={() => {
                                                                this.scrollView.scrollToEnd({ animated: true })
                                                                this.setState({
                                                                    messageCount: 0
                                                                })
                                                            }}>
                                                            {DropDownView}
                                                            {/* Using for this text view showing counti(Functionality done from my hand) */}
                                                            {/* <Text
                                                                style={{
                                                                    fontSize: 9,
                                                                    color: colors.white,
                                                                    fontWeight: '600'
                                                                }}>
                                                                {this.state.messageCount}
                                                            </Text> */}
                                                        </TouchableOpacity>
                                                    }
                                                </View>
                                                <View style={{
                                                    width: '100%',
                                                    height: 50,
                                                    backgroundColor: colors.lightgray,
                                                    justifyContent: 'center',
                                                    padding: 10,
                                                }}>
                                                    <View style={{
                                                        width: '100%',
                                                        height: 40,
                                                        borderColor: colors.gray,
                                                        borderWidth: 1,
                                                        borderRadius: 25,
                                                        backgroundColor: colors.white,
                                                        justifyContent: 'center',
                                                        paddingHorizontal: 10
                                                    }}>
                                                        <TextInput
                                                            style={{
                                                                flex: 1, color: colors.black,
                                                                fontSize: 14,
                                                                fontFamily: CONSTANTS.REGULAR,
                                                                paddingTop: 0,
                                                                paddingBottom: 0,
                                                            }}
                                                            placeholder="Comment"
                                                            placeholderTextColor='#495F8E'
                                                            onChangeText={(commentTextInput) => this.setState({ commentTextInput })}
                                                            value={this.state.commentTextInput}
                                                            blurOnSubmit={false}
                                                            keyboardType="default"
                                                            returnKeyType="done"
                                                            autoCapitalize="none"
                                                            autoCorrect={false}
                                                            // scrollEnabled={false}
                                                            ref={(input) => this.commentInput = input}
                                                            onSubmitEditing={() => {
                                                                this.onCommentSubmit(this.state.commentTextInput)
                                                            }}
                                                            numberOfLines={1}
                                                            multiline
                                                        />
                                                    </View>
                                                </View>
                                                {this.state.isScreenLandScapeHideOpenClose &&
                                                    <TouchableOpacity
                                                        activeOpacity={.9}
                                                        onPress={() => {
                                                            console.warn('ababab')
                                                            this.closeOpenChat(!this.state.isCloseOpen)
                                                            if (this.scrollView != undefined) {
                                                                this.scrollView.scrollToEnd({ animated: true, index: -1 }, 200);
                                                            }
                                                        }}
                                                        style={{
                                                            width: 50,
                                                            height: 50,
                                                            borderRadius: 25,
                                                            backgroundColor: colors.transparent_theme,
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            marginLeft: this.state.isScreenLandScape ? -25 : 0,
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            zIndex: this.state.isScreenLandScape ? 1 : 0,
                                                            padding: 5
                                                        }}>
                                                        <Image
                                                            style={{
                                                                width: 35,
                                                                height: 35,
                                                                color: colors.theme
                                                            }}
                                                            source={require('../images/icon_close.png')}
                                                            resizeMode={'contain'}
                                                        />
                                                    </TouchableOpacity>
                                                }
                                            </View>
                                        </View>
                                    }
                                </View> :
                                <View style={{
                                    backgroundColor: 'black',
                                    flex: 1,
                                }}>
                                    {this.state.youtubeUrl != undefined &&
                                        <View style={{
                                            backgroundColor: 'black',
                                            flex: 1,
                                            width: '100%',
                                            flexDirection: 'row'
                                        }}>
                                            <View style={{
                                                width: this.state.isScreenLandScape ? '65%' : '100%'
                                            }}>
                                                <Video
                                                    onLayout={this._onLayout}
                                                    source={{ uri: this.state.youtubeUrl }}   // Can be a URL or a local file.
                                                    controls={false}
                                                    hideShutterView={true}
                                                    play={this.state.play}
                                                    onProgress={this.onProgress}
                                                    fullscreen={this.state.fullScreeen}
                                                    resizeMode={this.state.isScreenLandScape ? "stretch" : 'contain'}
                                                    //onLoadStart={this.onLoadStart}
                                                    onLoad={() => {
                                                        this._playerReadyToplay()
                                                    }}
                                                    onEnd={() => {
                                                        showNativeAlert('Live Session has been ended.')
                                                        EventRegister.emit('SessionExpried', '')
                                                        this.methodGoBack()
                                                    }}
                                                    style={{
                                                        flex: 1,
                                                        width: '100%'
                                                    }}
                                                    //ref={this.playerRef}
                                                    ref={(ref) => {
                                                        this.player = ref
                                                    }}
                                                    onBuffer={this.onBuffer}                // Callback when remote video is buffering
                                                    onError={this.videoError}
                                                    rate={this.state.frameRateDefault}
                                                    playInBackground={true}
                                                    playWhenInactive={true}
                                                    muted={false}
                                                />
                                            </View>
                                            {/* Right chat view */}
                                            <View style={{
                                                flex: 1,
                                                width: this.state.isScreenLandScape ? '35%' : 0,
                                                backgroundColor: colors.white
                                            }}>
                                                <View style={{
                                                    flex: 1
                                                }}>
                                                    <FlatList
                                                        ref={ref => (this.scrollView = ref)}
                                                        onContentSizeChange={() => {
                                                            this.scrollView.scrollToEnd({ animated: true, index: -1 }, 200);
                                                        }}
                                                        data={this.state.chatArrayList}
                                                        renderItem={({ item }) =>
                                                            <View style={{
                                                                flexDirection: 'row',
                                                                width: '100%',
                                                                backgroundColor: 'white',
                                                                alignItems: 'center',
                                                                padding: 7
                                                            }}>
                                                                <Text
                                                                    style={{
                                                                        fontSize: 13,
                                                                        color: item.IS_SELF == 1 ? colors.primary_dark :
                                                                            this.props.navigation.state.params.live_session_data.subject_teacher_id == item.ifas_registration.STUDENT_NO ? colors.primary_dark : colors.gray,
                                                                        fontWeight: '600',
                                                                        textAlign: 'left'
                                                                    }}>
                                                                    {item.IS_SELF == 1 ? `You:` :
                                                                        this.props.navigation.state.params.live_session_data.subject_teacher_id == item.ifas_registration.STUDENT_NO ? `IFAS:` :
                                                                            `${item.ifas_registration.FIRST_NAME} ${item.ifas_registration.LAST_NAME}:`}
                                                                    <Text
                                                                        style={{
                                                                            fontSize: 12,
                                                                            color: colors.black,
                                                                            fontWeight: '600'
                                                                        }}>
                                                                        {item.IS_SELF == 1 ? item.LSC_COMMENT : item.LSC_COMMENT}
                                                                    </Text>
                                                                </Text>
                                                            </View>
                                                        }
                                                        extraData={this.props}
                                                        keyExtractor={(item, index) => this.keyExtractor(item)}
                                                        showsVerticalScrollIndicator={true}
                                                    />
                                                </View>
                                                <View style={{
                                                    flexDirection: 'row',
                                                    width: '100%',
                                                    height: 50,
                                                    backgroundColor: colors.lightgray,
                                                    alignItems: 'center',
                                                    padding: 5,
                                                }}>
                                                    <View style={{
                                                        flex: .8,
                                                        width: '100%',
                                                        height: 40,
                                                        borderColor: colors.gray,
                                                        borderWidth: 1,
                                                        borderRadius: 25,
                                                        backgroundColor: colors.white,
                                                        paddingHorizontal: 15,
                                                        paddingVertical: 10,
                                                    }}>
                                                        <TextInput
                                                            style={{
                                                                color: colors.black,
                                                                fontSize: 14,
                                                                fontFamily: CONSTANTS.REGULAR,
                                                                width: '100%',
                                                            }}
                                                            placeholder="Comment"
                                                            placeholderTextColor='#495F8E'
                                                            onChangeText={(commentTextInput) => this.setState({ commentTextInput })}
                                                            value={this.state.commentTextInput}
                                                            blurOnSubmit={false}
                                                            keyboardType="default"
                                                            returnKeyType="default"
                                                            autoCapitalize="none"
                                                            autoCorrect={false}
                                                            // scrollEnabled={false}
                                                            ref={(input) => this.commentInput = input}
                                                            onSubmitEditing={() => {
                                                                // this.onCommentSubmit(this.state.commentTextInput)
                                                            }}
                                                            numberOfLines={1}
                                                            multiline
                                                        />
                                                    </View>
                                                    <TouchableOpacity
                                                        style={{
                                                            flex: .2,
                                                            width: 43 * dimensions.sizeRatio,
                                                            height: 43 * dimensions.sizeRatio,
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}
                                                        onPress={() => {
                                                            this.onCommentSubmit(this.state.commentTextInput)
                                                        }}
                                                    >
                                                        <Image
                                                            source={require('../images/send_message.png')}
                                                            style={{
                                                                tintColor: colors.theme,
                                                                width: 24,
                                                                height: 22,
                                                                resizeMode: "contain",
                                                                alignSelf: 'center'
                                                            }}
                                                        />
                                                    </TouchableOpacity>
                                                </View>
                                                {this.state.isScreenLandScapeHideOpenClose &&
                                                    <TouchableOpacity
                                                        activeOpacity={.9}
                                                        onPress={() => {
                                                            this.closeOpenChat(!this.state.isCloseOpen)
                                                        }}
                                                        style={{
                                                            width: 50,
                                                            height: 50,
                                                            borderRadius: 25,
                                                            backgroundColor: colors.transparent_theme,
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            marginLeft: -30,
                                                            //marginRight: this.state.isScreenLandScapeHideOpenClose ? 0 : 25,
                                                            justifyContent: 'center',
                                                            alignItems: 'center'
                                                        }}>
                                                        <Image
                                                            style={{
                                                                width: 35,
                                                                height: 35,
                                                                color: colors.theme
                                                            }}
                                                            source={require('../images/icon_close.png')}
                                                            resizeMode={'contain'}
                                                        />
                                                    </TouchableOpacity>
                                                }
                                            </View>
                                        </View>
                                    }
                                </View>
                            }
                        </View>
                    }
                </View>
            )
        }
    }
    keyExtractor = item => {
        return item.LSC_ID;
    };
} 