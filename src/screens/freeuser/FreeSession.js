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
import { StackActions, NavigationActions } from 'react-navigation';
//Vector icon
import CheckBoxRectOFF from 'react-native-vector-icons/MaterialIcons';
import CheckBoxRectON from 'react-native-vector-icons/MaterialIcons';

const checkBoxRectOFF = <CheckBoxRectOFF name="check-box-outline-blank" size={24} color={colors.white} />;
const checkBoxRectON = <CheckBoxRectON name="check-box" size={24} color={colors.white} />;
import BackButton from 'react-native-vector-icons/MaterialIcons';
const backButton = <BackButton name="arrow-back" size={28} color={colors.black} />;
import DropDownArrow from 'react-native-vector-icons/Entypo';
const dropDownArrow = <DropDownArrow name="chevron-down" size={32} color={colors.black} />;

//Craete SHA1
var sha1 = require('sha1');

//Live Video Chat
var bbbJoinUri = 'https://meet.ifasonline.com/bigbluebutton/api/join?'
var fullName = ''
var meetingId = 'gzhbqcfy05yrqlruilmm2igovmz6tur1fxrt0yiz'
var password = 'GaHLMNVPyhDD'
var redirect = true
var checksum = ''
var finalURI = undefined
let upgradeMessage = `A newer version(${DeviceInfo.getVersion()}) of this app is available for download. Please update it from Playstore !`
export default class FreeSession extends Component {

    //Navigation Method
    isSessionFocus = false

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            access_token: '',
            isRecording: false,
            courseSelectedItem: global.landingScreenFreeItem,

            //for live session
            liveUrl: '',
            dateTime: '',

            //Live Video Cht
            checkSumKey: undefined,
            meetingAvailableObj: undefined,

            //Upgrade app (force or not)
            upgradeResponseData: undefined,
            upgradeResponseDataiOS: undefined,
            isShowUpgade: false,
            isShowUpgadeiOS: false,
            newerVersion: '3.6',
            currentVersion: '3.5',

            dialogVisible: false,
            isCheckDontShowMeVisibile: false
        };
    }

    componentDidMount() {
        Orientation.lockToPortrait();
        this.getAccessToken()
        isSessionFocus = true
        if (global.navigateAction != null) {
            // (global.navigation == undefined || global.navigation == null) ? null : global.navigation.dispatch(navigateAction);
            // global.navigateAction = null
        }
        else {
            BackHandler.addEventListener('hardwareBackPress', () => {
                console.log('blue whale')
                if (isSessionFocus === true) {
                    Alert.alert(
                        'EXIT APP',
                        'Are you sure you want to exit the app?',
                        [
                            { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                            { text: 'OK', onPress: () => BackHandler.exitApp() },
                        ],
                        { cancelable: false }
                    )
                    return true
                }

                return false;
            });
        }

        // Recording of
        if (Platform.OS == 'ios') {
            this.addListener()
        }
    }

    componentWillUnmount() {
        isSessionFocus = false
        BackHandler.removeEventListener('hardwareBackPress', () => { });
        if (Platform.OS === "ios") {
            this.screenCaptureEnabled.remove()
        }
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
                    isRecording: true
                })
            }
            else {
                this.setState({ isRecording: false }, () => {
                    //console.warn('CAPTURE_SESSIONS3' + '\n\n' + JSON.stringify(res) + '\n\n' + this.state.isRecording)
                })
            }

        })
    }

    getAccessToken() {
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                self.setState({
                    access_token: value.slice(1, -1),
                }, () => {
                    if (global.landingScreenFreeItem != undefined)
                        self.getLiveSessionApi(global.landingScreenFreeItem)
                    self.getIsMeetingAvailable(global.landingScreenFreeItem)
                })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    getLiveSessionApi(item) {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('course_id', item.id);
        console.log(formData)

        fetch(CONSTANTS.BASE + CONSTANTS.POST_FREE_LIVE_SESSIONS, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.warn('SUBJECT_NEW', responseJson)

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else {

                    //Upgarde App
                    if (responseJson.data.version_setting != undefined && responseJson.data.version_setting != null) {

                        let currenVersionAndroieIos = DeviceInfo.getVersion();
                        //responseJson.data.version_setting.forEach(element => {
                        if (Platform.OS == 'android') {
                            let element = responseJson.data.version_setting[0];
                            if (element.VUS_TYPE === 1) {
                                console.warn('aaa1', element)
                                if (currenVersionAndroieIos.toString() != element.VUS_VERSION) {
                                    if (element.VUS_FORCE_UPDATE === 1) {
                                        console.warn('aaa2', element)
                                        //Remove android update cancel async if is exist in async storage
                                        AsyncStorage.removeItem('VUS_FORCE_NOT_UPDATE_ASYNC').then(
                                            () => {
                                                console.warn('VUS_FORCE_NOT_UPDATE_ASYNC_REMOVE' + 'SUCCESS CLEAR')
                                            },
                                            () => {
                                                console.warn('rejected back_press')
                                            }
                                        )
                                        this.setState({
                                            upgradeResponseData: element,
                                            isShowUpgade: true
                                        })
                                    } else {
                                        AsyncStorage.getItem("VUS_FORCE_NOT_UPDATE_ASYNC").then(item => {
                                            console.log('force_update_outA' + item)
                                            if (item != undefined && item != null && item != '') {
                                                console.log('force_update_innerA' + item + '\n\n' + JSON.stringify(element))
                                                if (item == element.VUS_VERSION) {
                                                    console.log('force_update_inner')
                                                    console.warn('aaa3', element)
                                                    this.setState({
                                                        upgradeResponseData: element,
                                                        isShowUpgade: false
                                                    })
                                                } else {
                                                    console.log('force_update_inner else')
                                                    this.setState({
                                                        isCheckDontShowMeVisibile: false,
                                                    }, () => {
                                                        this.setState({
                                                            upgradeResponseData: element,
                                                            isShowUpgade: true
                                                        })
                                                    })
                                                }
                                            } else {
                                                console.log('force_update_not_found')
                                                console.warn('aaa4', element)
                                                this.setState({
                                                    isCheckDontShowMeVisibile: false,
                                                }, () => {
                                                    this.setState({
                                                        upgradeResponseData: element,
                                                        isShowUpgade: true
                                                    })
                                                })

                                                // this.setState({
                                                //     isCheckDontShowMeVisibile:false,
                                                //     upgradeResponseData: element,
                                                //     isShowUpgade: true
                                                // })
                                            }
                                        }).catch(err => {
                                            console.log('eerrr' + err)
                                            this.setState({
                                                isCheckDontShowMeVisibile: false,
                                            }, () => {
                                                this.setState({
                                                    upgradeResponseData: element,
                                                    isShowUpgade: true
                                                })
                                            })

                                            // this.setState({
                                            //     isCheckDontShowMeVisibile:false,
                                            //     upgradeResponseData: element,
                                            //     isShowUpgade: true
                                            // })
                                        });
                                    }
                                }
                            }
                        } else {
                            let elementIOS = responseJson.data.version_setting[1];
                            console.warn('iosbbb', elementIOS)
                            if (elementIOS != undefined) {
                                if (elementIOS.VUS_TYPE === 2) {
                                    console.warn('iosbbb1', elementIOS)
                                    if (currenVersionAndroieIos.toString() != elementIOS.VUS_VERSION) {
                                        console.warn('iosbbb2', elementIOS)
                                        if (elementIOS.VUS_FORCE_UPDATE === 1) {
                                            console.warn('iosbbb3', elementIOS)
                                            //Remove android update cancel async if is exist in async storage
                                            AsyncStorage.removeItem('VUS_FORCE_NOT_UPDATE_ASYNC').then(
                                                () => {
                                                    console.warn('VUS_FORCE_NOT_UPDATE_ASYNC_REMOVE' + 'SUCCESS CLEAR')
                                                },
                                                () => {
                                                    console.warn('rejected back_press')
                                                }
                                            )
                                            this.setState({
                                                upgradeResponseDataiOS: elementIOS,
                                                isShowUpgadeiOS: true
                                            })
                                        } else {
                                            AsyncStorage.getItem("VUS_FORCE_NOT_UPDATE_ASYNC").then(item => {
                                                console.log('force_update_outIOS' + item)
                                                if (item != undefined && item != null && item != '') {
                                                    console.log('force_update_inner')
                                                    console.warn('iosbbb4', elementIOS)
                                                    if (item == elementIOS.VUS_VERSION) {
                                                        this.setState({
                                                            upgradeResponseDataiOS: elementIOS,
                                                            isShowUpgadeiOS: false
                                                        })
                                                    } else {
                                                        this.setState({
                                                            isCheckDontShowMeVisibile: false,
                                                        }, () => {
                                                            this.setState({
                                                                upgradeResponseDataiOS: elementIOS,
                                                                isShowUpgadeiOS: true
                                                            })
                                                        })
                                                    }
                                                } else {
                                                    console.log('force_update_not_found')
                                                    console.warn('iosbbb5', elementIOS)
                                                    this.setState({
                                                        isCheckDontShowMeVisibile: false,
                                                    }, () => {
                                                        this.setState({
                                                            upgradeResponseDataiOS: elementIOS,
                                                            isShowUpgadeiOS: true
                                                        })
                                                    })
                                                }
                                            }).catch(err => {
                                                console.log('eerrr' + err)
                                                this.setState({
                                                    isCheckDontShowMeVisibile: false,
                                                }, () => {
                                                    this.setState({
                                                        upgradeResponseDataiOS: elementIOS,
                                                        isShowUpgadeiOS: true
                                                    })
                                                })
                                            });
                                        }
                                    }
                                }
                            }
                        }
                        //});
                    }

                    if (responseJson.data.LiveSession[0] == null) {
                        self.setState({
                            //isLoading: false,
                            liveUrl: '',
                            dateTime: '',
                        }, function () {

                        });

                    } else {
                        const link = responseJson.data.LiveSession[0]
                        var dateArray = ""
                        var strDate = ""
                        if (link.start_time.trim() != "") {
                            dateArray = link.start_time.split(' ')
                            strDate = dateArray[0] + " " + dateArray[1].split('+')[0]
                        }
                        CONSTANTS.SESSION_START_DATE = link.video_start_at
                        CONSTANTS.SESSION_END_DATE = link.video_end_at
                        CONSTANTS.SESSION_TEACHER_ID = link.subject_teacher_id
                        this.setState({
                            liveUrl: link.url,
                            dateTime: link.video_start_at,
                            //isLoading: false,
                        });

                        CONSTANTS.VIDEO_TYPE = responseJson.data.is_video_link_created
                        if (responseJson.data.timer_required == 1) {
                            if (responseJson.data.timer != null) {
                                if (responseJson.data.timer != '') {
                                    if (isNaN(responseJson.data.timer)) {
                                        // showNativeAlert('Is a not number')
                                        CONSTANTS.SESSION_TIMER = 0
                                    } else {
                                        // showNativeAlert('Is a number')
                                        CONSTANTS.SESSION_TIMER = responseJson.data.timer
                                    }

                                } else {
                                    CONSTANTS.SESSION_TIMER = 0
                                    // showNativeAlert('Empty')
                                }
                            } else {
                                CONSTANTS.SESSION_TIMER = 0
                                // showNativeAlert('Null')
                            }
                        } else {
                            CONSTANTS.SESSION_TIMER = 0
                        }
                    }
                }
            })
            .catch((error) => {
                // console.error(error);
                // showNativeAlert("Network request failed")
                this.setState({
                    dataSource: [],
                    //isLoading: false,
                    errorMessage: 'Failed to fetch your live session.'
                })
            });
    }

    getIsMeetingAvailable(item) {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('course_id', item.id);
        console.warn(formData)

        //fetch('http://35.154.11.3/pa/ifas/apis/' + CONSTANTS.GET_CONFERENCES, {
        fetch(CONSTANTS.BASE + CONSTANTS.POST_FREE_LIVE_CONFERENCES, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                //console.warn('meeting response' + JSON.stringify(responseJson))
                console.warn('CONFF', responseJson)
                if (responseJson != undefined) {
                    if (responseJson.data != undefined && responseJson.data != null) {
                        //console.warn('meetingresponse1' + JSON.stringify(responseJson))
                        if (responseJson.data.LiveConferences != undefined && responseJson.data.LiveConferences != null) {
                            //console.warn('meetingresponse2' + JSON.stringify(responseJson))
                            this.setState({
                                meetingAvailableObj: responseJson.data.LiveConferences
                            })
                        } else {
                            this.setState({
                                meetingAvailableObj: undefined
                            })
                        }
                    } else {
                        this.setState({
                            meetingAvailableObj: undefined
                        })
                    }
                } else {
                    this.setState({
                        meetingAvailableObj: undefined
                    })
                }
                this.setState({
                    isLoading: false
                })
            })
            .catch((error) => {
                console.error(error);
                this.setState({
                    meetingAvailableObj: undefined,
                    isLoading: false
                })
                // showNativeAlert("Network request failed")
            });
    }

    _getVideoSessionTiming(screen_type) {

        let sessionID = this._checkTimingSession()
        if (sessionID == true) {
            let url = this.youtube_parser(this.state.liveUrl)
            if (url != 'NULL') {
                let itemObj = {
                    url: this.state.liveUrl
                }
                this.props.navigation.navigate('FreeLiveSession', { youtubeUrl: itemObj })
                //this.props.navigation.navigate('FreeVideoPlayer', { selected_item: itemObj, screen_name: 'FreeSession' })
            } else {
                // alert('url not found')
            }
        } else {
            console.log('_getVideoSessionTiming getAccessToken ')
            this.getAccessToken(false)
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

    _checkTimingSession() {
        try {
            let now = new Date().getTime()
            // Do your operations
            var arr = CONSTANTS.SESSION_START_DATE.split(/-|\s|:/);// split string and create array.
            //console.warn('TIMTING1'+JSON.stringify(arr))
            let startDate = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);

            var arr2 = CONSTANTS.SESSION_END_DATE.split(/-|\s|:/);// split string and create array.
            let endDate = new Date(arr2[0], arr2[1] - 1, arr2[2], arr2[3], arr2[4], arr2[5]);
            // let endDate = new Date(CONSTANTS.SESSION_END_DATE );

            if (startDate.getTime() <= now && now <= endDate.getTime()) {
                return true
            } else {

                return false
            }
        } catch (err) {
            console.warn('SESSION EXCEPTION SESSION SCREEN' + JSON.stringify(err))
        }
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
        CONSTANTS.IS_LOGGED_IN = false
        //this.props.navigation.popToTop()
        this.clearPreviousStackCourse()

    }

    clearPreviousStackCourse = () => {
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'Courses' })],
        });
        this.props.navigation.dispatch(resetAction);
    }

    joinLiveVideoConferencing = async () => {
        if (this.state.meetingAvailableObj != undefined && this.state.meetingAvailableObj != null) {

            //Live Video Chat
            AsyncStorage.getItem('LOGIN_USER_NAME').then(value => {
                if (value != undefined) {
                    let loginData = JSON.parse(value);
                    console.warn('LoginData1', loginData)
                    let firstName = loginData.data.FIRST_NAME;
                    let lastName = loginData.data.LAST_NAME;
                    let withoutSpaceFirstName = firstName.replace(/\s/g, '');
                    let withoutSpaceLastName = lastName.replace(/\s/g, '');
                    let newFirstName = withoutSpaceFirstName.replace(/[^a-zA-Z ]/g, "")
                    let newLastName = withoutSpaceLastName.replace(/[^a-zA-Z ]/g, "")
                    var apiName = "join"
                    var joinApi = `fullName=${newFirstName}_${newLastName}&meetingID=${this.state.meetingAvailableObj.MEETING_ID}&password=${this.state.meetingAvailableObj.MEETING_PASSWORD}&redirect=true`
                    var sharedSecret = this.state.meetingAvailableObj.SHARED_KEY
                    checksum = sha1(apiName + joinApi + sharedSecret);
                    finalURI = bbbJoinUri + 'fullName=' + newFirstName + '_' + newLastName + '&meetingID=' + this.state.meetingAvailableObj.MEETING_ID +
                        '&password=' + this.state.meetingAvailableObj.MEETING_PASSWORD + '&redirect=' + true + '&checksum='
                    this.setState({
                        checkSumKey: finalURI + checksum
                    }, () => {
                        if (Platform.OS == 'android') {
                            //console.warn('MEETING GENRATED URL: ' + this.state.checkSumKey)
                            this.props.navigation.navigate('GroupVideoCall', { meetingGenratedURL: this.state.checkSumKey })
                        } else {
                            //console.warn('MEETING GENRATED URL: ' + finalURI + checksum)
                            global.isLiveConfRunningIosForLiveSessionNotHide = false;
                            NativeModules.SFViewControl.openURL(this.state.checkSumKey, {})
                        }
                    })
                }
            })
        }
    }

    handleBackButtonClick = () => {
        this.props.navigation.goBack();
        return true;
    }

    _onWillFocus() {
        isSessionFocus = true
        console.log('Session controller focused')
        if (global.navigateAction == null) {
            BackHandler.addEventListener('hardwareBackPress', () => {
                console.log('blue whale')
                if (isSessionFocus === true) {
                    Alert.alert(
                        'EXIT APP',
                        'Are you sure you want to exit the app?',
                        [
                            { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                            { text: 'OK', onPress: () => BackHandler.exitApp() },
                        ],
                        { cancelable: false }
                    )
                    return true
                }
                return false;
            });
        }
        else {
            //  let navi = global.navigateAction
            // global.navigateAction = null
            (global.navigation == undefined || global.navigation == null) ? null : global.navigation.dispatch(global.navigateAction);
            global.navigateAction = null
        }

        //this.getAccessToken(false)
    }

    _onDidFocus() {
        if (global.navigateAction == null) {
            console.log('Free Session controller did focused')
            BackHandler.addEventListener('hardwareBackPress', () => {
                console.log('blue whale')
                if (isSessionFocus === true) {
                    Alert.alert(
                        'EXIT APP',
                        'Are you sure you want to exit the app?',
                        [
                            { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                            { text: 'OK', onPress: () => BackHandler.exitApp() },
                        ],
                        { cancelable: false }
                    )
                    return true
                }

                return false;
            });
        }
    }

    _checkTimingConfenrece(conferenceObj) {

        if (conferenceObj != undefined) {
            let now = new Date().getTime()
            // Do your operations
            var arr = conferenceObj.CONFERENCES_START.split(/-|\s|:/);// split string and create array.
            //console.warn('TIMTING2'+JSON.stringify(arr))
            let startDate = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);

            if (startDate.getTime() <= now) {
                return true
            } else {

                return false
            }
        } else {
            return false
        }
    }

    _didBlur() {
        isSessionFocus = false
        console.log('Free Session controller _didBlur')
        BackHandler.removeEventListener('hardwareBackPress', () => { });

    }

    _willBlur() {
        isSessionFocus = false
        console.log('Free Session controller _willBlur')
        BackHandler.removeEventListener('hardwareBackPress', () => { });
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
                    <NavigationEvents
                        onWillFocus={payload => this._onWillFocus()}
                        onDidFocus={payload => this._onDidFocus()}
                        onWillBlur={payload => this._willBlur()}
                        onDidBlur={payload => this._didBlur()}
                    />
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
                                    }}
                                        onPress={() => {
                                            //this.methodGoLive() 
                                            this._getVideoSessionTiming('')
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
                                                        marginBottom: dimensions.sizeRatio * 10,
                                                        textAlign:'center'
                                                    }}
                                                    numberOfLines={2}>
                                                    {'No live session available.'}
                                                </Text>
                                            }
                                            {/* LIVE URL AND DATE TIME  */}
                                            {/* {this.state.liveUrl != '' && this.state.dateTime != '' && this._checkTimingSession() == true &&
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
                                            } */}

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
                                        onPress={() => {
                                            this.props.navigation.navigate('FreeSubects', { item: {} })
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
                                                fontFamily: CONSTANTS.DEMI,
                                                textAlign:'center'
                                            }}
                                                numberOfLines={2}>
                                                {'Free Video Lectures'}
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
                                        onPress={() => {
                                            if (this.state.meetingAvailableObj != undefined && this.state.meetingAvailableObj != null && this.state.meetingAvailableObj != '' &&
                                                this._checkTimingConfenrece(this.state.meetingAvailableObj) == true) {
                                                this.joinLiveVideoConferencing()
                                            }
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
                                            {this.state.meetingAvailableObj == undefined &&
                                                <Text numberOfLines={1}
                                                    style={{
                                                        color: colors.black,
                                                        paddingLeft: dimensions.sizeRatio * 15,
                                                        paddingRight: dimensions.sizeRatio * 15,
                                                        marginTop: dimensions.sizeRatio * 5,
                                                        fontSize: dimensions.sizeRatio * 14,
                                                        marginBottom: dimensions.sizeRatio * 10,
                                                        textAlign:'center'
                                                    }}
                                                    numberOfLines={2}>
                                                    {'No live conference available.'}
                                                </Text>
                                            }
                                            {/* NO conferencing URL AND NO DATE TIME */}
                                            {this.state.meetingAvailableObj != undefined && this.state.meetingAvailableObj != null && this.state.meetingAvailableObj != '' &&
                                                this._checkTimingConfenrece(this.state.meetingAvailableObj) == true &&
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

                                            {/* LIVE conferencing BUT DATE TIME */}
                                            {this.state.meetingAvailableObj != undefined && this.state.meetingAvailableObj != null && this.state.meetingAvailableObj != '' &&
                                                this._checkTimingConfenrece(this.state.meetingAvailableObj) == false &&
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
                                                    {this.state.meetingAvailableObj.CONFERENCES_START}
                                                </Text>
                                            }
                                        </View>
                                    </Ripple>
                                </CardView>

                                {/* Pay Now */}
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
                                        onPress={() => {
                                            if (global.landingScreenFreeItem.payment_link != null && global.landingScreenFreeItem.payment_link != '') {
                                                Linking.openURL(global.landingScreenFreeItem.payment_link)
                                            }
                                        }}>
                                        <View style={{
                                            width: dimensions.width / 2 - 20,
                                            height: (dimensions.height / 2 - 40) / 2 + 20,
                                            justifyContent: 'flex-end',
                                            alignItems: 'center',
                                        }}>
                                            <Image source={require('../../images/icon_session5.png')}
                                                style={{ width: dimensions.sizeRatio * 140, height: dimensions.sizeRatio * 140, resizeMode: 'contain' }} />
                                        </View>
                                        <Text numberOfLines={1} style={{
                                            paddingTop: dimensions.sizeRatio * 10,
                                            color: colors.theme,
                                            paddingLeft: dimensions.sizeRatio * 15,
                                            paddingRight: dimensions.sizeRatio * 15,
                                            fontSize: dimensions.sizeRatio * 16,
                                            fontFamily: CONSTANTS.DEMI,
                                            marginTop:10,
                                            textAlign:'center'
                                        }}
                                            numberOfLines={2}>
                                            {'Purchase Full Course'}
                                        </Text>
                                        <Text numberOfLines={1} style={{
                                            color: colors.black,
                                            paddingLeft: dimensions.sizeRatio * 15,
                                            paddingRight: dimensions.sizeRatio * 15,
                                            marginTop: dimensions.sizeRatio * 5,
                                            fontSize: dimensions.sizeRatio * 14,
                                            textAlign:'center'
                                        }}
                                            numberOfLines={1}>
                                            {'₹' + global.landingScreenFreeItem.fees}
                                        </Text>

                                        <Text numberOfLines={1} style={{
                                            color: colors.black,
                                            paddingLeft: dimensions.sizeRatio * 15,
                                            paddingRight: dimensions.sizeRatio * 15,
                                            marginTop: dimensions.sizeRatio * 5,
                                            fontSize: dimensions.sizeRatio * 14,
                                            marginBottom: dimensions.sizeRatio * 10,
                                            textAlign:'center'
                                        }}
                                            numberOfLines={1}>
                                            {global.landingScreenFreeItem.batch_start_date}
                                        </Text>
                                    </Ripple>
                                </CardView>
                            </View>
                        </View>
                    </ScrollView>

                    {this.renderUpgradeApp()}
                    {this.renderUpgradeiOSApp()}
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
                    flexDirection: 'row',
                }}>
                <Ripple
                    style={{
                        flexDirection:'row',
                        alignItems:'center'
                    }}
                    onPress={() => {
                        //this.handleBackButtonClick()
                        this.props.navigation.navigate('LandingScreen', {})
                    }}>
                    <Image
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 40 / 2,
                            marginRight:5
                        }}
                        resizeMode={'cover'}
                        defaultSource={require('../../images/logo2.png')}
                        source={this.state.courseSelectedItem != undefined &&
                            this.state.courseSelectedItem.image != '' ?
                            { uri: this.state.courseSelectedItem.image } :
                            require('../../images/logo2.png')}
                    />
                    {dropDownArrow}
                </Ripple>
                <Text style={{ fontSize: 18, fontFamily: CONSTANTS.DEMI, color: colors.black, textAlign: 'left', marginLeft: 15 }}>
                    {'Free Sessions'}
                </Text>
            </View>
        )
    }

    renderUpgradeApp() {
        const { isShowUpgade, upgradeResponseData } = this.state;

        return (
            <Modal
                visible={isShowUpgade}
                transparent={true}
                onRequestClose={() =>
                    this.setState({ isShowUpgade: true })
                }
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <View
                        style={{
                            backgroundColor: colors.theme,
                            height: 400,
                            width: '95%',
                            borderRadius: dimensions.sizeRatio * 5,
                            paddingVertical: dimensions.sizeRatio * 20,
                            alignSelf: 'center',
                            borderColor: colors.white,
                            borderWidth: .5
                        }}>
                        <ScrollView>
                            <View style={{
                                width: '100%',
                                flexDirection: 'column',
                                padding: dimensions.sizeRatio * 10
                            }}>
                                <View style={{
                                    width: '100%',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Text style={{
                                        fontWeight: 'bold', fontSize: dimensions.sizeRatio * 26, color: colors.white, fontFamily: CONSTANTS.DEMI,
                                    }}>{'Update Available'}</Text>
                                    <Text style={{
                                        fontWeight: 'normal', fontSize: dimensions.sizeRatio * 16, color: colors.white, fontFamily: CONSTANTS.DEMI,
                                    }}>{'Current version:' + DeviceInfo.getVersion()}</Text>
                                </View>
                                {/* Center view */}
                                <View
                                    style={{
                                        width: '100%',
                                        alignItems: 'center',
                                        marginTop: 20
                                    }}>
                                    <Image source={require('../../images/logo.png')}
                                        style={{
                                            width: dimensions.sizeRatio * 80,
                                            height: dimensions.sizeRatio * 80,
                                        }} resizeMode={'contain'} />
                                    <Text style={{
                                        textAlign: 'center',
                                        fontWeight: 'normal',
                                        fontSize: dimensions.sizeRatio * 16,
                                        color: colors.white,
                                        fontFamily: CONSTANTS.DEMI,
                                        marginTop: 20,
                                    }}>{upgradeResponseData != undefined ? upgradeResponseData.VUS_MESSAGE : upgradeMessage}</Text>
                                </View>
                            </View>
                        </ScrollView>
                        <View style={{
                            width: '100%',
                            flexDirection: 'column',
                            position: 'absolute',
                            bottom: 0,
                            padding: dimensions.sizeRatio * 10,
                        }}>
                            {upgradeResponseData != undefined && upgradeResponseData.VUS_FORCE_UPDATE == 0 ?
                                <TouchableOpacity
                                    activeOpacity={.9}
                                    onPress={() => {
                                        this.setState({
                                            isCheckDontShowMeVisibile: !this.state.isCheckDontShowMeVisibile
                                        })
                                    }}>

                                    <View style={{
                                        flexDirection: 'row',
                                        paddingVertical: dimensions.sizeRatio * 10,
                                        alignItems: 'center'
                                    }}>
                                        {
                                            this.state.isCheckDontShowMeVisibile ?

                                                <View>
                                                    {checkBoxRectON}
                                                </View>
                                                :
                                                <View>
                                                    {checkBoxRectOFF}
                                                </View>
                                        }
                                        <Text style={{
                                            marginLeft: dimensions.sizeRatio * 10,
                                            fontFamily: CONSTANTS.DEMI,
                                            fontSize: dimensions.sizeRatio * 16,
                                            color: colors.white,
                                            fontFamily: CONSTANTS.DEMI,
                                        }}>
                                            {'Do not show me again'}
                                        </Text>
                                    </View>
                                </TouchableOpacity> : null}
                            <View style={{
                                width: '100%',
                                flexDirection: 'row',
                            }}>
                                <TouchableOpacity style={{
                                    width: '49%',
                                    backgroundColor: colors.gray,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: dimensions.sizeRatio * 10
                                }}
                                    onPress={() => {
                                        if (upgradeResponseData != undefined && upgradeResponseData.VUS_FORCE_UPDATE == 0) {
                                            console.log('enter3')
                                            if (this.state.isCheckDontShowMeVisibile) {
                                                AsyncStorage.setItem('VUS_FORCE_NOT_UPDATE_ASYNC', upgradeResponseData.VUS_VERSION).then(elementObj => {
                                                    console.log('VUS_FORCE_NOT_UPDATE_ASYNC', elementObj)

                                                }).catch(err => {
                                                    setTimeout(() => { Toast.show('Network is not available', Toast.CENTER) }, 200)
                                                    console.log('VUS_FORCE_NOT_UPDATE_ASYNC' + err)
                                                });
                                            }
                                            this.setState({
                                                isShowUpgade: false
                                            })
                                        } else {
                                            console.log('enter4')
                                            BackHandler.exitApp()
                                        }
                                    }}>
                                    <Text style={{
                                        color: colors.white,
                                        fontSize: dimensions.sizeRatio * 22,
                                        fontWeight: '600'
                                    }}>{upgradeResponseData != undefined && upgradeResponseData.VUS_FORCE_UPDATE == 0 ? 'Cancel' : 'Exit'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{
                                    width: '50%',
                                    backgroundColor: colors.white,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: dimensions.sizeRatio * 10,
                                    marginLeft: dimensions.sizeRatio * 5
                                }}
                                    onPress={() => {
                                        if (Platform.OS == 'android') {
                                            Linking.openURL(
                                                "https://play.google.com/store/apps/details?id=com.ifasapp&hl=en"
                                            );
                                        } else {
                                            Linking.openURL(
                                                "https://apps.apple.com/in/app/ifas/id1448199555"
                                            );
                                        }
                                    }}>
                                    <Text style={{
                                        color: colors.theme,
                                        fontSize: dimensions.sizeRatio * 22,
                                        fontWeight: '600'
                                    }}>{'Update'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }


    renderUpgradeiOSApp() {
        const { isShowUpgadeiOS, upgradeResponseDataiOS } = this.state;
        //console.warn('IOSUPGRADE', upgradeResponseDataiOS)
        return (
            <Modal
                visible={isShowUpgadeiOS}
                transparent={true}
                onRequestClose={() =>
                    this.setState({ isShowUpgadeiOS: true })
                }
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <View
                        style={{
                            backgroundColor: colors.theme,
                            height: 400,
                            width: '95%',
                            borderRadius: dimensions.sizeRatio * 5,
                            paddingVertical: dimensions.sizeRatio * 20,
                            alignSelf: 'center',
                            borderColor: colors.white,
                            borderWidth: .5
                        }}>
                        <ScrollView>
                            <View style={{
                                width: '100%',
                                flexDirection: 'column',
                                padding: dimensions.sizeRatio * 10
                            }}>
                                <View style={{
                                    width: '100%',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Text style={{
                                        fontWeight: 'bold', fontSize: dimensions.sizeRatio * 26, color: colors.white, fontFamily: CONSTANTS.DEMI,
                                    }}>{'Update Available'}</Text>
                                    <Text style={{
                                        fontWeight: 'normal', fontSize: dimensions.sizeRatio * 16, color: colors.white, fontFamily: CONSTANTS.DEMI,
                                    }}>{'Current version:' + DeviceInfo.getVersion()}</Text>
                                </View>
                                {/* Center view */}
                                <View
                                    style={{
                                        width: '100%',
                                        alignItems: 'center',
                                        marginTop: 20
                                    }}>
                                    <Image source={require('../../images/logo.png')}
                                        style={{
                                            width: dimensions.sizeRatio * 80,
                                            height: dimensions.sizeRatio * 80,
                                        }} resizeMode={'contain'} />
                                    <Text style={{
                                        width: '100%',
                                        textAlign: 'center',
                                        fontWeight: 'normal',
                                        fontSize: dimensions.sizeRatio * 16,
                                        color: colors.white,
                                        fontFamily: CONSTANTS.DEMI,
                                        marginTop: 20,
                                    }}>{upgradeResponseDataiOS != undefined ? upgradeResponseDataiOS.VUS_MESSAGE : upgradeMessage}</Text>
                                </View>
                            </View>
                        </ScrollView>
                        <View style={{
                            width: '100%',
                            flexDirection: 'column',
                            position: 'absolute',
                            bottom: 0,
                            padding: dimensions.sizeRatio * 10,
                        }}>
                            {upgradeResponseDataiOS != undefined && upgradeResponseDataiOS.VUS_FORCE_UPDATE == 0 ?
                                <TouchableOpacity
                                    activeOpacity={.9}
                                    onPress={() => {
                                        this.setState({
                                            isCheckDontShowMeVisibile: !this.state.isCheckDontShowMeVisibile
                                        })
                                    }}>

                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingVertical: dimensions.sizeRatio * 10,
                                    }}>
                                        {
                                            this.state.isCheckDontShowMeVisibile ?

                                                <View>
                                                    {checkBoxRectON}
                                                </View>
                                                :
                                                <View>
                                                    {checkBoxRectOFF}
                                                </View>
                                        }
                                        <Text style={{
                                            textAlignVertical: 'center',
                                            marginLeft: dimensions.sizeRatio * 10,
                                            fontFamily: CONSTANTS.DEMI,
                                            fontSize: dimensions.sizeRatio * 16,
                                            color: colors.white,
                                            fontFamily: CONSTANTS.DEMI,
                                            marginTop: 3
                                        }}>
                                            {'Do not show me again'}
                                        </Text>
                                    </View>
                                </TouchableOpacity> : null}
                            <View style={{
                                width: '100%',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center'

                            }}>
                                {upgradeResponseDataiOS != undefined && upgradeResponseDataiOS.VUS_FORCE_UPDATE == 0 &&
                                    <TouchableOpacity style={{
                                        width: '49%',
                                        backgroundColor: colors.gray,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: dimensions.sizeRatio * 10
                                    }}
                                        onPress={() => {
                                            if (upgradeResponseDataiOS != undefined && upgradeResponseDataiOS.VUS_FORCE_UPDATE == 0) {
                                                console.log('enter3')
                                                if (this.state.isCheckDontShowMeVisibile) {
                                                    AsyncStorage.setItem('VUS_FORCE_NOT_UPDATE_ASYNC', upgradeResponseDataiOS.VUS_VERSION).then(elementObj => {
                                                        console.log('VUS_FORCE_NOT_UPDATE_ASYNC', elementObj)

                                                    }).catch(err => {
                                                        setTimeout(() => { Toast.show('Network is not available', Toast.CENTER) }, 200)
                                                        console.log('VUS_FORCE_NOT_UPDATE_ASYNC' + err)
                                                    });
                                                }
                                                this.setState({
                                                    isShowUpgadeiOS: false
                                                })
                                            } else {
                                                console.warn('enter4')
                                                BackHandler.exitApp()
                                                return true
                                            }
                                        }}>
                                        <Text style={{
                                            color: colors.white,
                                            fontSize: dimensions.sizeRatio * 22,
                                            fontWeight: '600'
                                        }}>{upgradeResponseDataiOS != undefined && upgradeResponseDataiOS.VUS_FORCE_UPDATE == 0 ? 'Cancel' : 'Exit'}</Text>
                                    </TouchableOpacity>}
                                <TouchableOpacity style={{
                                    width: '50%',
                                    backgroundColor: colors.white,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: dimensions.sizeRatio * 10,
                                    marginLeft: dimensions.sizeRatio * 5
                                }}
                                    onPress={() => {
                                        if (Platform.OS == 'android') {
                                            Linking.openURL(
                                                "https://play.google.com/store/apps/details?id=com.ifasapp&hl=en"
                                            );
                                        } else {
                                            Linking.openURL(
                                                "https://apps.apple.com/in/app/ifas/id1448199555"
                                            );
                                        }
                                    }}>
                                    <Text style={{
                                        color: colors.theme,
                                        fontSize: dimensions.sizeRatio * 22,
                                        fontWeight: '600'
                                    }}>{'Update'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}




// import IoniconsMore from 'react-native-vector-icons/AntDesign';
// import CheckBoxRectOFF from 'react-native-vector-icons/MaterialIcons';
// import CheckBoxRectON from 'react-native-vector-icons/MaterialIcons';
// import NotificationIcon from 'react-native-vector-icons/Ionicons';

// const checkBoxRectOFF = <CheckBoxRectOFF name="check-box-outline-blank" size={24} color={colors.white} />;
// const checkBoxRectON = <CheckBoxRectON name="check-box" size={24} color={colors.white} />;
// const moreICon = <IoniconsMore name="closecircleo" size={26} color={colors.white} />;
// const notiIcon = <NotificationIcon name="ios-notifications-outline" size={28} color={colors.white} />;
// isSessionFocus = false
//     static navigationOptions = (navigation) => {
//         const { state } = navigation;
//         return ({
//             title: 'Free Session',
//             headerStyle: {
//                 backgroundColor: colors.theme,
//                 elevation: 0,
//                 shadowColor: 'transparent',
//                 borderBottomWidth: 0,
//                 shadowOpacity: 0
//             },
//             headerTitleStyle: {
//                 color: colors.white,
//                 textAlign: 'center',
//                 flex: 1
//             },
//             headerBackTitle: null,
//             headerLeft:
//                 <View style={{
//                     flexDirection: 'row'
//                 }}>

//                 </View>,
//             gesturesEnabled: false,
//             headerRight: <View style={{ flexDirection: 'row' }}>
//                 <TouchableOpacity style={{
//                     marginRight: 10,
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                 }}
//                     onPress={() => {
//                         if (!isRecordingGloble) {
//                             navigation.navigation.navigate('Profile')
//                         }
//                     }}>
//                     <Image
//                         source={require('../../images/profile_small.png')}
//                         style={{
//                             width: 24,
//                             height: 20,
//                         }}
//                         resizeMode={'contain'}
//                     />
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                     activeOpacity={.9}
//                     style={{
//                         width: 30,
//                         height: 30,
//                         marginRight: 10,
//                         justifyContent: 'center',
//                         alignItems: 'center'
//                     }}
//                     onPress={() => {
//                         navigation.navigation.navigate('FreeNotification')
//                     }}>
//                     {notiIcon}
//                 </TouchableOpacity>
//             </View>,
//         })

//     };

// <ScrollView style={{
//                         marginTop: dimensions.sizeRatio * -55,
//                         paddingHorizontal: dimensions.sizeRatio * 15,
//                         marginBottom: dimensions.sizeRatio * 10
//                     }}>
//                         <View style={{
//                             flexDirection: 'column'
//                         }}>
//                             <TouchableOpacity
//                                 activeOpacity={.9}
//                                 style={styles.live_session}
//                                 onPress={() => {

//                                 }}>
//                                 <View
//                                     style={{ flex: 1, alignItems: 'center', }}>

//                                     <Image source={require('../../images/live_session.png')} style={styles.live_icon} resizeMode={'contain'} />
//                                     <Text style={styles.live_text}>
//                                         Live FreeSession</Text>
//                                     {/* NO LIVE URL AND NO DATE TIME */}
//                                     {renderIf(this.state.liveUrl == '' && this.state.dateTime == '',
//                                         <View style={{ top: dimensions.sizeRatio * 5, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//                                             <Text style={{ fontSize: dimensions.sizeRatio * 15, color: colors.theme, fontFamily: CONSTANTS.DEMI }}>
//                                                 No live session available.</Text>
//                                         </View>
//                                     )}
//                                 </View>

//                             </TouchableOpacity>

//                             <TouchableOpacity style={styles.recorded_session}
//                                 onPress={() => {
//                                     this.props.navigation.navigate('FreeSubects', { selected_item: {}, screen_name: 'FreeSession' })
//                                 }}>
//                                 <View style={{ flex: 1, alignItems: 'center', }}>
//                                     <Image source={require('../../images/recorded_session.png')}
//                                         //style={styles.recorded_icon} 
//                                         style={styles.live_icon}
//                                         resizeMode={'contain'}
//                                     />
//                                     <Text style={styles.recorded_text}>
//                                         {'Free Video Lectures'}
//                                     </Text>

//                                 </View>
//                             </TouchableOpacity>
//                             <TouchableOpacity
//                                 style={styles.recorded_session}
//                                 onPress={() => {

//                                 }}>
//                                 <View
//                                     style={{
//                                         flex: 1,
//                                         alignItems: 'center',
//                                     }}
//                                 >
//                                     <Image source={require('../../images/live_conf.png')}
//                                         //style={styles.recorded_icon} 
//                                         style={styles.live_icon}
//                                         resizeMode={'contain'} />
//                                     <Text style={styles.recorded_text}>
//                                         {'Live Conference'}
//                                     </Text>
//                                     {/* NO conferencing URL AND NO DATE TIME */}
//                                     {this.state.meetingAvailableObj == undefined &&
//                                         <View style={{ top: dimensions.sizeRatio * 5, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//                                             <Text style={{ fontSize: dimensions.sizeRatio * 15, color: colors.theme, fontFamily: CONSTANTS.DEMI }}>
//                                                 No video conferencing available.</Text>
//                                         </View>
//                                     }
//                                     {/* LIVE conferencing AND DATE TIME */}
//                                     {/* {this.state.meetingAvailableObj != undefined && this.state.meetingAvailableObj != null && this.state.meetingAvailableObj != '' &&
//                                         this._checkTimingConfenrece(this.state.meetingAvailableObj) == true &&
//                                         <View style={{
//                                             marginTop: dimensions.sizeRatio * 15,
//                                             justifyContent: 'center',
//                                             alignItems: 'center',
//                                         }}>
//                                             <BlinkView blinking={true} delay={600}>
//                                                 <Text style={{ fontWeight: 'bold', fontSize: dimensions.sizeRatio * 15, color: colors.theme, fontFamily: CONSTANTS.DEMI, }}>CLICK TO JOIN VIDEO CONFERENCING</Text>
//                                             </BlinkView>
//                                         </View>
//                                     } */}
//                                     {/* LIVE conferencing BUT DATE TIME */}
//                                     {/* {this.state.meetingAvailableObj != undefined && this.state.meetingAvailableObj != null && this.state.meetingAvailableObj != '' &&
//                                         this._checkTimingConfenrece(this.state.meetingAvailableObj) == false &&
//                                         <View style={{
//                                             width: '100%',
//                                             flexDirection: 'column',
//                                             marginTop: dimensions.sizeRatio * 10,
//                                         }}>
//                                             <View style={{ justifyContent: 'center', alignItems: 'center' }} >
//                                                 <Text style={{ fontWeight: 'bold', fontSize: dimensions.sizeRatio * 15, color: colors.theme, fontFamily: CONSTANTS.DEMI, }}>
//                                                     Video conferencing available on:</Text>
//                                             </View>
//                                             <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: dimensions.sizeRatio * 10, }} >
//                                                 <Text style={{ fontWeight: 'bold', fontSize: dimensions.sizeRatio * 15, color: colors.theme, fontFamily: CONSTANTS.DEMI, }}>
//                                                     {''}
//                                                 </Text>
//                                             </View>
//                                         </View>
//                                     } */}
//                                 </View>
//                             </TouchableOpacity>
//                         </View>
//                     </ScrollView>