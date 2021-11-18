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
    TouchableOpacity, Alert, AsyncStorage, NativeEventEmitter, NativeModules, Modal, Linking,
    FlatList
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
import ViewPDFBigIcon from 'react-native-vector-icons/FontAwesome5';
const viewPDFBigIcon = <ViewPDFBigIcon name="file-pdf" size={22} color={colors.topic_text_color_5} />;
import TestPDFBigIcon from 'react-native-vector-icons/AntDesign';
const testPDFBigIcon = <TestPDFBigIcon name="pdffile1" size={22} color={colors.topic_text_color_6} />;

let isRecordingGloble = false;
import moment from "moment";
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
export default class FreeeSession001 extends Component {

    //Navigation Method
    isSessionFocus = false

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            access_token: '',
            isRecording: false,
            isRecording: '',
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
            isCheckDontShowMeVisibile: false,

            //16 Sep 2021 (Change new task)
            liveNowVideo: [],
            upCommingArray: [],
            viewPagerArray: [],
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
    }

    componentWillUnmount() {
        isSessionFocus = false
        BackHandler.removeEventListener('hardwareBackPress', () => { });
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

                    if (responseJson.data.LiveYouTubeNow.length !== 0) {
                        this.setState({
                            liveNowVideo: responseJson.data.LiveYouTubeNow[0]
                        })
                    }
                    if (responseJson.data.LiveYouTubeUpcoming.length !== 0) {
                        this.setState({
                            upCommingArray: responseJson.data.LiveYouTubeUpcoming
                        }, () => {
                            console.warn('UPCOMMM', this.state.upCommingArray)
                        })
                    }
                    if (responseJson.data.PromotionalBanner.length !== 0) {
                        this.setState({
                            viewPagerArray: responseJson.data.PromotionalBanner
                        })
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
                            {/* Free Session Component */}
                            <View style={{
                                width: '100%',
                                flexDirection: 'column',
                                padding: dimensions.sizeRatio * 15
                            }}>
                                {/* Top view */}
                                <View style={{
                                    width: '100%',
                                    flexDirection: 'row',
                                }}>
                                    {/* Left view */}
                                    <TouchableOpacity style={{
                                        width: dimensions.width / 2 - 22.5,
                                        backgroundColor: '#D6FFD4',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: dimensions.sizeRatio * 20,
                                        borderRadius: dimensions.sizeRatio * 5
                                    }}
                                        onPress={() => { this.props.navigation.navigate('FreeSubects', { item: { type: 1 } }) }}>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <Image source={require('../../images/icon_session2.png')}
                                                style={{ width: dimensions.sizeRatio * 55, height: dimensions.sizeRatio * 50, resizeMode: 'contain' }} />
                                            <Text
                                                style={{
                                                    color: colors.theme,
                                                    marginLeft: dimensions.sizeRatio * 5,
                                                    fontSize: dimensions.sizeRatio * 16,
                                                    fontFamily: CONSTANTS.DEMI,
                                                    textAlign: 'center',
                                                }}
                                                numberOfLines={2}>
                                                {'Free \nVideo'}
                                            </Text>
                                        </View>
                                        <View style={{
                                            flexDirection: 'column',
                                            justifyContent: 'flex-start',
                                            alignItems: 'flex-start',
                                        }}>

                                            {this.state.meetingAvailableObj == undefined &&
                                                <Text numberOfLines={1}
                                                    style={{
                                                        color: colors.black,
                                                        marginTop: dimensions.sizeRatio * 5,
                                                        fontSize: dimensions.sizeRatio * 10,
                                                        textAlign: 'center'
                                                    }}
                                                    numberOfLines={2}>
                                                    {''}
                                                </Text>
                                            }
                                            {this.state.meetingAvailableObj != undefined && this.state.meetingAvailableObj != null && this.state.meetingAvailableObj != '' &&
                                                this._checkTimingConfenrece(this.state.meetingAvailableObj) == true &&
                                                <Text numberOfLines={1}
                                                    style={{
                                                        color: colors.black,
                                                        marginTop: dimensions.sizeRatio * 5,
                                                        fontSize: dimensions.sizeRatio * 13,
                                                        textAlign: 'center'
                                                    }}
                                                    numberOfLines={2}>
                                                    {''}
                                                </Text>
                                            }

                                            {this.state.meetingAvailableObj != undefined && this.state.meetingAvailableObj != null && this.state.meetingAvailableObj != '' &&
                                                this._checkTimingConfenrece(this.state.meetingAvailableObj) == false &&
                                                <Text numberOfLines={1}
                                                    style={{
                                                        color: colors.black,
                                                        marginTop: dimensions.sizeRatio * 5,
                                                        fontSize: dimensions.sizeRatio * 12,
                                                        textAlign: 'center'
                                                    }}
                                                    numberOfLines={1}>
                                                    {''}
                                                </Text>
                                            }
                                        </View>
                                    </TouchableOpacity>
                                    {/* Right view */}
                                    <TouchableOpacity style={{
                                        width: dimensions.width / 2 - 22.5,
                                        backgroundColor: '#D3CFFD',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: dimensions.sizeRatio * 20,
                                        marginLeft: dimensions.sizeRatio * 15,
                                        borderRadius: dimensions.sizeRatio * 5
                                    }}
                                        onPress={() => { this.props.navigation.navigate('FreeSubects', { item: { type: 3 } }) }}>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <Image source={require('../../images/icon_session4.png')}
                                                style={{ width: dimensions.sizeRatio * 50, height: dimensions.sizeRatio * 50, resizeMode: 'contain' }} />
                                            <Text
                                                style={{
                                                    color: colors.theme,
                                                    fontSize: dimensions.sizeRatio * 16,
                                                    fontFamily: CONSTANTS.DEMI,
                                                    textAlign: 'center',
                                                    marginLeft: dimensions.sizeRatio * 5
                                                }}
                                                numberOfLines={2}>
                                                {'Free Study \nMaterial'}
                                            </Text>
                                        </View>
                                        <View style={{
                                            flexDirection: 'column',
                                            justifyContent: 'flex-start',
                                            alignItems: 'flex-start',
                                        }}>

                                            {this.state.meetingAvailableObj == undefined &&
                                                <Text numberOfLines={1}
                                                    style={{
                                                        color: colors.black,
                                                        marginTop: dimensions.sizeRatio * 5,
                                                        fontSize: dimensions.sizeRatio * 10,
                                                        textAlign: 'center'
                                                    }}
                                                    numberOfLines={2}>
                                                    {''}
                                                </Text>
                                            }
                                            {this.state.meetingAvailableObj != undefined && this.state.meetingAvailableObj != null && this.state.meetingAvailableObj != '' &&
                                                this._checkTimingConfenrece(this.state.meetingAvailableObj) == true &&
                                                <Text numberOfLines={1}
                                                    style={{
                                                        color: colors.black,
                                                        marginTop: dimensions.sizeRatio * 5,
                                                        fontSize: dimensions.sizeRatio * 13,
                                                        textAlign: 'center'
                                                    }}
                                                    numberOfLines={2}>
                                                    {''}
                                                </Text>
                                            }

                                            {this.state.meetingAvailableObj != undefined && this.state.meetingAvailableObj != null && this.state.meetingAvailableObj != '' &&
                                                this._checkTimingConfenrece(this.state.meetingAvailableObj) == false &&
                                                <Text numberOfLines={1}
                                                    style={{
                                                        color: colors.black,
                                                        marginTop: dimensions.sizeRatio * 5,
                                                        fontSize: dimensions.sizeRatio * 12,
                                                        textAlign: 'center'
                                                    }}
                                                    numberOfLines={1}>
                                                    {''}
                                                </Text>
                                            }
                                        </View>
                                    </TouchableOpacity>
                                </View>

                                {/* Bottom view */}
                                <View style={{
                                    width: '100%',
                                    flexDirection: 'row',
                                    marginTop: dimensions.sizeRatio * 15
                                }}>
                                    {/* Left view */}
                                    <TouchableOpacity style={{
                                        width: dimensions.width / 2 - 22.5,
                                        backgroundColor: '#FED8EA',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: dimensions.sizeRatio * 20,
                                        borderRadius: dimensions.sizeRatio * 5
                                    }}
                                        onPress={() => { this.props.navigation.navigate('FreeSubects', { item: { type: 2 } }) }}>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <Image source={require('../../images/icon_session5.png')}
                                                style={{ width: dimensions.sizeRatio * 55, height: dimensions.sizeRatio * 50, resizeMode: 'contain' }} />
                                            <Text
                                                style={{
                                                    color: colors.theme,
                                                    marginLeft: dimensions.sizeRatio * 5,
                                                    fontSize: dimensions.sizeRatio * 16,
                                                    fontFamily: CONSTANTS.DEMI,
                                                    textAlign: 'center',
                                                }}
                                                numberOfLines={2}>
                                                {'Free Test \nSeries'}
                                            </Text>
                                        </View>
                                        <View style={{
                                            flexDirection: 'column',
                                            justifyContent: 'flex-start',
                                            alignItems: 'flex-start',
                                        }}>

                                            {this.state.meetingAvailableObj == undefined &&
                                                <Text numberOfLines={1}
                                                    style={{
                                                        color: colors.black,
                                                        marginTop: dimensions.sizeRatio * 5,
                                                        fontSize: dimensions.sizeRatio * 10,
                                                        textAlign: 'center'
                                                    }}
                                                    numberOfLines={2}>
                                                    {''}
                                                </Text>
                                            }
                                            {this.state.meetingAvailableObj != undefined && this.state.meetingAvailableObj != null && this.state.meetingAvailableObj != '' &&
                                                this._checkTimingConfenrece(this.state.meetingAvailableObj) == true &&
                                                <Text numberOfLines={1}
                                                    style={{
                                                        color: colors.black,
                                                        marginTop: dimensions.sizeRatio * 5,
                                                        fontSize: dimensions.sizeRatio * 13,
                                                        textAlign: 'center'
                                                    }}
                                                    numberOfLines={2}>
                                                    {''}
                                                </Text>
                                            }

                                            {this.state.meetingAvailableObj != undefined && this.state.meetingAvailableObj != null && this.state.meetingAvailableObj != '' &&
                                                this._checkTimingConfenrece(this.state.meetingAvailableObj) == false &&
                                                <Text numberOfLines={1}
                                                    style={{
                                                        color: colors.black,
                                                        marginTop: dimensions.sizeRatio * 5,
                                                        fontSize: dimensions.sizeRatio * 12,
                                                        textAlign: 'center'
                                                    }}
                                                    numberOfLines={1}>
                                                    {''}
                                                </Text>
                                            }
                                        </View>
                                    </TouchableOpacity>
                                    {/* Right view */}
                                    <TouchableOpacity style={{
                                        width: dimensions.width / 2 - 22.5,
                                        backgroundColor: '#FADBD6',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: dimensions.sizeRatio * 20,
                                        marginLeft: dimensions.sizeRatio * 15,
                                        borderRadius: dimensions.sizeRatio * 5
                                    }}
                                        onPress={() => {
                                            if (this.state.meetingAvailableObj != undefined && this.state.meetingAvailableObj != null && this.state.meetingAvailableObj != '' &&
                                                this._checkTimingConfenrece(this.state.meetingAvailableObj) == true) {
                                                this.joinLiveVideoConferencing()
                                            }
                                        }}>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <Image source={require('../../images/icon_session1.png')}
                                                style={{ width: dimensions.sizeRatio * 55, height: dimensions.sizeRatio * 50, resizeMode: 'contain' }} />
                                            <Text
                                                style={{
                                                    color: colors.theme,
                                                    fontSize: dimensions.sizeRatio * 16,
                                                    fontFamily: CONSTANTS.DEMI,
                                                    textAlign: 'center',
                                                    marginLeft: dimensions.sizeRatio * 5
                                                }}
                                                numberOfLines={2}>
                                                {'Live \nInteraction'}
                                            </Text>
                                        </View>
                                        <View style={{
                                            flexDirection: 'column',
                                            justifyContent: 'flex-start',
                                            alignItems: 'flex-start',
                                        }}>

                                            {this.state.meetingAvailableObj == undefined &&
                                                <Text numberOfLines={1}
                                                    style={{
                                                        color: colors.black,
                                                        marginTop: dimensions.sizeRatio * 5,
                                                        fontSize: dimensions.sizeRatio * 10,
                                                        textAlign: 'center'
                                                    }}
                                                    numberOfLines={2}>
                                                    {'No Live Session Available.'}
                                                </Text>
                                            }
                                            {this.state.meetingAvailableObj != undefined && this.state.meetingAvailableObj != null && this.state.meetingAvailableObj != '' &&
                                                this._checkTimingConfenrece(this.state.meetingAvailableObj) == true &&
                                                <Text numberOfLines={1}
                                                    style={{
                                                        color: colors.black,
                                                        marginTop: dimensions.sizeRatio * 5,
                                                        fontSize: dimensions.sizeRatio * 13,
                                                        textAlign: 'center'
                                                    }}
                                                    numberOfLines={2}>
                                                    {'CLICK TO JOIN'}
                                                </Text>
                                            }

                                            {this.state.meetingAvailableObj != undefined && this.state.meetingAvailableObj != null && this.state.meetingAvailableObj != '' &&
                                                this._checkTimingConfenrece(this.state.meetingAvailableObj) == false &&
                                                <Text numberOfLines={1}
                                                    style={{
                                                        color: colors.black,
                                                        marginTop: dimensions.sizeRatio * 5,
                                                        fontSize: dimensions.sizeRatio * 12,
                                                        textAlign: 'center'
                                                    }}
                                                    numberOfLines={1}>
                                                    {this.state.meetingAvailableObj.CONFERENCES_START}
                                                </Text>
                                            }
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                {/* Live Now */}
                                {/* {this.state.liveUrl != '' && this.state.dateTime != '' && this._checkTimingSession() == true && this.liveNowComponent()} */}
                                {this.state.liveNowVideo.length !== 0 && this.liveNowComponent(this.state.liveNowVideo)}
                                {this.state.upCommingArray.length !== 0 && this.upcommingLectureComponent(this.state.upCommingArray)}
                                {this.state.viewPagerArray.length !== 0 &&
                                    <View style={{
                                        width: '100%',
                                        marginTop: 15
                                    }}>
                                        <FlatList
                                            horizontal={true}
                                            data={this.state.viewPagerArray}
                                            renderItem={(item, index) => this.ifasUpdateComponent(item, index)}
                                            keyExtractor={(item, index) => index.toString()}
                                            pagingEnabled
                                        />
                                        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', marginTop: 5, flexDirection: 'row' }}>
                                            {this.state.viewPagerArray.map(() => (
                                                <View style={{ width: 7, height: 7, borderRadius: 7 / 2, backgroundColor: 'grey', marginRight: 5 }}>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                }
                            </View>
                        </View>
                    </ScrollView>

                    {this.renderUpgradeApp()}
                    {this.renderUpgradeiOSApp()}
                </View>
            );
        }
    }

    ifasUpdateComponent = ({ item, index }) => {
        console.warn('PPB', item)
        return (
            <View style={{
                width: dimensions.width - 30,
                borderRadius: 10,
                marginRight: 10
            }}>
                {/* <PagerView style={{ width: deviceWidth - 20, }} initialPage={0}> */}
                <Image
                    style={{
                        width: dimensions.width - 30, height: 150, borderRadius: 10
                    }}
                    source={{ uri: item.PB_IMAGE }}
                    resizeMode={'cover'}
                />
                {/* </PagerView> */}
            </View>
        )
    }

    upcommingLectureComponent = (upCommingArray) => {
        return (
            <View style={{
                width: '100%',
                flexDirection: 'column',
                paddingVertical: 10
            }}>
                {/* Top heading view */}
                <View style={{ width: '100%', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, fontFamily: CONSTANTS.DEMI, color: 'black' }}>{'Upcomming Lectures Today'}</Text>
                    <TouchableOpacity onPress={() => { }}>
                        <Text style={{ fontSize: 15, color: colors.theme, fontFamily: CONSTANTS.DEMI }}>{'View All'}</Text>
                    </TouchableOpacity>
                </View>
                {/* Bottom scroll view */}
                <ScrollView horizontal style={{ width: '100%', marginTop: 15 }} showsHorizontalScrollIndicator={false}>
                    {upCommingArray.map((item, index) => (
                        <View style={{
                            width: dimensions.width - 30,
                            padding: 7,
                            borderRadius: 7,
                            marginTop: 10,
                            marginRight: 10,
                            borderWidth: 1,
                            borderColor: '#f2f2f2'
                        }}>
                            {/* Top view */}
                            <View style={{
                                width: '100%',
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}>
                                {/* Left view */}
                                <View style={{
                                    width: 55,
                                    height: 55,
                                    borderRadius: 5
                                }}>
                                    <Image
                                        style={{
                                            width: 55,
                                            height: 55,
                                            borderRadius: 5
                                        }}
                                        source={item.LY_THUMBNAIL !== null ? { uri: item.LY_THUMBNAIL } : require('../../images/icon_session1.png')}
                                        resizeMode={'cover'}
                                    />
                                </View>
                                <View style={{ flex: 1, width: '100%', flexDirection: 'column,', flexDirection: 'column', marginLeft: 10 }}>
                                    <View style={{ alignItems: 'center', flexDirection: 'row', }}>
                                        <Text style={{ flex: 1, fontSize: 13, fontFamily: CONSTANTS.DEMI, color: colors.lightishgray }}>{item.LY_TITLE}</Text>
                                        <View style={{ backgroundColor: '#14A27B', borderRadius: 27, width: 55, height: 27, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 9, fontFamily: CONSTANTS.REGULAR, color: colors.white }}>{moment(item.LY_START_DATE).format('hh:mm A')}</Text>
                                        </View>
                                    </View>
                                    <Text style={{ fontSize: 12, fontFamily: CONSTANTS.DEMI, color: 'black', marginTop: 1 }} numberOfLines={2}>{item.LY_SUB_TITLE}</Text>
                                    <Text style={{ fontSize: 11, fontFamily: CONSTANTS.REGULAR, color: colors.lightishgray, marginTop: 5 }}>{'04 hour-By' + item.LY_TEACHER_NAME !== null ? item.LY_TEACHER_NAME : '--'}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
        )
    }

    liveNowComponent = (liveNowVideo) => {
        return (
            <View style={{
                width: '100%',
                flexDirection: 'column',
                paddingVertical: 10
            }}>
                <Text style={{ fontSize: 16, fontFamily: CONSTANTS.DEMI, color: 'black' }}>{'Live Now'}</Text>
                {/* Live view item */}
                <CardView
                    style={{
                        width: '100%',
                        backgroundColor: colors.white,
                        marginTop: 10,
                    }}
                    cardElevation={3}
                    cardMaxElevation={2}
                    cornerRadius={5}>

                    <View style={{
                        width: '100%',
                        flexDirection: 'column',
                    }}>
                        <Image
                            style={{
                                width: '100%',
                                height: 170,
                                borderTopLeftRadius: 7,
                                borderTopRightRadius: 7,
                            }}
                            source={liveNowVideo.LY_THUMBNAIL !== null ? { uri: liveNowVideo.LY_THUMBNAIL } : require('../../images/icon_session1.png')}
                            resizeMode={'cover'}
                        />
                        <View style={{
                            width: '100%',
                            padding: 10,
                            flexDirection: 'column',
                        }}>
                            <Text style={{ fontSize: 14, fontFamily: CONSTANTS.DEMI, color: colors.lightishgray }}>{liveNowVideo.LY_TITLE}</Text>
                            <Text style={{ fontSize: 13, fontFamily: CONSTANTS.DEMI, color: 'black', marginTop: 5, marginRight: 10 }} numberOfLines={2}>{liveNowVideo.LY_SUB_TITLE}</Text>
                            <Text style={{ fontSize: 11, fontFamily: CONSTANTS.REGULAR, color: colors.lightishgray, marginTop: 5 }}>{'04 hour-By' + liveNowVideo.LY_TEACHER_NAME !== null ? liveNowVideo.LY_TEACHER_NAME : '--'}</Text>
                            <TouchableOpacity style={{ width: 150, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.theme, borderRadius: 7, marginTop: 10 }}
                                onPress={() => {
                                    //this._getVideoSessionTiming('') 
                                    this.props.navigation.navigate('FreeVideoPlayer', { selected_item: liveNowVideo, screen_name: 'FreeSession001' })
                                    // if (liveNowVideo.LY_URL !== null) {
                                    //     Linking.openURL(
                                    //         liveNowVideo.LY_URL
                                    //     );
                                    // }
                                }}>
                                <Text style={{ fontSize: 11, color: 'white' }}>{'Join Now'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </CardView>
            </View>
        )
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
                        flexDirection: 'row',
                        alignItems: 'center'
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
                            marginRight: 5
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