/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    Platform, StatusBar, AsyncStorage, Text, View,
    Image, TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl, StyleSheet,
    TextInput, Animated, Keyboard, Dimensions, UIManager, Linking, NativeEventEmitter, NativeModules, Clipboard, KeyboardAvoidingView,
    ScrollView, Modal, PermissionsAndroid, BackHandler
} from 'react-native';

import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import stylesGlobal from '../styles/subject_style.js';
import CONSTANTS, { constantStrings, textInputPlaceholders } from '../resources/constants.js'
import renderIf from '../resources/utility';
import openSettingsPage from '../resources/utility.js';
import ProfileHeaderButton from '../headers/ProfileHeaderButton'
import BackSubjectsButton from '../headers/BackSubjectsButton'
import { showNativeAlert } from '../resources/app_utility.js'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import constants from '../resources/constants.js';
import moment from "moment";
import ImagePicker from 'react-native-image-picker';
import Orientation from 'react-native-orientation';
import NetInfo from "@react-native-community/netinfo";
import RNBackgroundDownloader from 'react-native-background-downloader';

//new image picker
import ImagePicker2 from 'react-native-image-crop-picker';
import { Dialog } from 'react-native-simple-dialogs';
import FastImage from 'react-native-fast-image'
import Ripple from 'react-native-material-ripple';

//sound player
import Sound from 'react-native-sound';
import { AudioRecorder, AudioUtils } from 'react-native-audio';

const leftPadding = 26 * dimensions.sizeRatio;
const topPadding = 19.5 * dimensions.sizeRatio;
import Loader from './loader/Loader'
const { State: TextInputState } = TextInput;
import { Icon, Container, Header, Left, Right, Body, Title, Content, ActionSheet } from 'native-base';
import Toast from 'react-native-tiny-toast';
// import { transcode } from 'react-native-audio-transcoder'

// if (Platform.OS == 'android') {
//     const myFilePath = audioPath;
//     const myNewFile = myFilePath.replace('aac', 'mp3')

//     transcode(myFilePath, myNewFile)
//         .then(() => console.warn('Party!'))
// }

//Using this for handle start conference
import { EventRegister } from 'react-native-event-listeners';
import * as GoToScreen from '../resources/goToScreen'
import AudioRecorderPlayer, {
    AVEncoderAudioQualityIOSType,
    AVEncodingOption,
    AudioEncoderAndroidType,
    AudioSet,
    AudioSourceAndroidType,
    OutputFormatAndroidType,
    AVSampleRateKeyIOS
} from 'react-native-audio-recorder-player';
import RNFetchBlob from 'rn-fetch-blob';
//import TrackPlayer, { usePlaybackState } from "react-native-track-player";

import Download from 'react-native-vector-icons/Ionicons';
const downloadedAudio = <Download name="ios-download" size={36} color={colors.white} />;
import BackButton from 'react-native-vector-icons/MaterialIcons';
const backButton = <BackButton name="arrow-back" size={28} color={colors.white} />;

let keyboardHeight = 0;
export default class MessageChat extends Component {

    //Navigation Method
    static navigationOptions = (navigation) => {
        return ({
            title: navigation.navigation.getParam('title', ''),
            headerStyle: { backgroundColor: colors.theme },
            headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
            headerBackTitle: null,
            headerTintColor: 'white',

            // headerLeft: <BackSubjectsButton />,
            headerRight: <View></View>,

            gesturesEnabled: false,
        })
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            access_token: '',
            // dataSource: [{ message: 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...', created: '2019-12-27 22:12:34', isSender: true }, { message: 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...', created: '2019-12-27 22:12:34', isSender: false }, { message: 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...', created: '2019-12-27 22:12:34', isSender: true }, { message: 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...', created: '2019-12-27 22:12:34', isSender: false }, { message: 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...', created: '2019-12-27 22:12:34', isSender: true }, { message: 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...', created: '2019-12-27 22:12:34', isSender: false }, { message: 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...', created: '2019-12-27 22:12:34', isSender: true }, { message: 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...', created: '2019-12-27 22:12:34', isSender: false }, { message: 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...', created: '2019-12-27 22:12:34', isSender: true }, { message: 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...', created: '2019-12-28 23:12:34', isSender: false }],
            dataSource: '',
            errorMessage: 'No messages available',
            sendMessage: '',
            imageToSend: '',
            shift: new Animated.Value(0),
            fetching_from_server: false,
            subjectId: '',
            topicId: '',
            messageTitle: '',
            // work by PRVN SINGH RATHORE
            isImagePick: false,
            isRecording: false,

            //recoding for send to user
            isShowRecordedView: false,
            isStartRecoding: false,
            isShowPlayingAudioView: false,
            isStartPlaying: false,
            selectedItemForPlaying: undefined,
            //after recording stop user can check play or stop
            isRecordingComStartPlaying: false,
            //commonflag handle playing and recording in one modal
            isCommonHandlePlayingRecording: false,
            recordSecs: 0,
            recordTime: '00:00:00',
            currentPositionSec: 0,
            currentDurationSec: 0,
            playTime: '00:00:00',
            duration: '00:00:00',
            savedaudioFileForApi: undefined,
            //downloading progress
            progress: 0,
            isProgress: false,

            //for ios recording handling clear or not
            isIosRecordingClear: false,

            //new image picker
            isImagePicker: false
        }
        this.offset = 1;
        this.limit = 10000000;
        this.pageCount = 0;
        this.scrollBottom = true;
        this.currentArr = []
        this.currentResponse = []
        this.onEndReached = this.onEndReached.bind(this);
        this.scrollTOBottom = this.scrollTOBottom.bind(this);
        this.indexToScrollTo = 1;

        Orientation.lockToPortrait();

        //sound player
        this.sound = undefined;

        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    handleBackButtonClick = () => {
        console.warn('ENTER HERE paid topic')
        this.props.navigation.goBack();
        return true;
    }
    scrollTOBottom(scrollIndex) {
        console.log('indexToScroll', scrollIndex)
        let self = this;
        setTimeout(function () {
            self.goIndex(scrollIndex)
        }, 200);
    }
    // scrollTOBottom = (scrollIndex) => {
    //     console.log('method')
    //     console.log('indexToScroll', scrollIndex)
    //     let self = this;
    //     setTimeout(function () {
    //         self.goIndex(scrollIndex)
    //     }, 1);
    // }
    onEndReached() {
        if (this.offset <= this.pageCount) {
            this.getChatDetail('');
        }
    }

    getChatDetail(notiThreadId) {
        this.setState({
            isLoading: true
        });
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('page', this.offset);
        formData.append('limit', this.limit);
        formData.append('thread_id', (notiThreadId == null || notiThreadId == undefined || notiThreadId == '') ? this.props.navigation.state.params.selectedMessage : notiThreadId);
        console.log(formData)

        fetch(CONSTANTS.BASE_CHAT + CONSTANTS.GET_CHAT_DETAIL, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.warn('chat detail response', responseJson)
                //Successful response from the API Call 

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                }
                else if (responseJson.code == 220) {
                    this.setState({
                        isLoading: false,
                        isRefreshFetching: false,
                        fetching_from_server: false,
                        dataSource: [],
                        subjectId: responseJson.msgThread.MT_SUB_ID,
                                topicId: responseJson.msgThread.MT_TOPIC_ID,
                                messageTitle: responseJson.msgThread.MT_TITLE
                    })
                }
                else if (responseJson.code == 220) {
                    this.setState({
                        isLoading: false,
                        isRefreshFetching: false,
                        fetching_from_server: false,
                    })
                }
                else {
                    // this.offset = this.offset + 1;
                    this.pageCount = responseJson.pageObj.totalPageCount
                    this.props.navigation.setParams({
                        'title': responseJson.msgThread.topic != undefined && responseJson.msgThread.topic != null ?
                            responseJson.msgThread.topic.NAME : responseJson.msgThread.subject.NAME
                    })
                    this.currentArr = this.state.dataSource.slice();
                    this.currentResponse = responseJson
                    if (this.offset == 1) {
                        console.warn('in if', this.scrollBottom)
                        let currArr = responseJson.data;
                        //Create new array file for find saved audio file in storage
                        //let newChatArray = currArr.map((element2, index, arary) => {
                        currArr.forEach(element2 => {
                            if (element2.M_AUDIO != null && element2.M_AUDIO != '') {
                                this.checkForAudioLocalPath(element2.M_AUDIO).then((res) => {
                                    if (res) {
                                        const dirs = RNFetchBlob.fs.dirs
                                        let videoPath = dirs.DocumentDir + `/RecordedAudioFiles/${element2.M_AUDIO}`
                                        element2.IS_DOWNLOAD_AUDIO = true
                                        element2.DOWNLOADED_AUDIO_PATH = videoPath
                                        console.warn('video_found_' + res + '.\n\n' + videoPath)
                                    } else {
                                        element2.IS_DOWNLOAD_VIDEO = false
                                        element2.DOWNLOADED_VIDEO_PATH = ''
                                        console.warn('not_found' + 'Not found any downloaded video path!')
                                    }
                                })
                            }
                        })
                        setTimeout(() => {
                            console.warn('AAACC' + JSON.stringify([...currArr]))
                            this.setState({
                                isLoading: false,
                                isRefreshFetching: false,
                                // dataSource: [...responseJson.data.reverse(), ...this.state.dataSource],
                                dataSource: [...responseJson.data, ...this.state.dataSource],
                                fetching_from_server: false,
                                subjectId: responseJson.msgThread.MT_SUB_ID,
                                topicId: responseJson.msgThread.MT_TOPIC_ID,
                                messageTitle: responseJson.msgThread.MT_TITLE
                            }, () => {
                                console.warn('AAACCCC' + JSON.stringify(this.state.dataSource))
                            });
                        }, 500);
                        // this.scrollTOBottom(this.state.dataSource.length - 1)
                    }
                    else {
                        console.warn('in else', this.scrollBottom)
                        var currArr = this.state.dataSource;

                        currArr.unshift.apply(currArr, responseJson.data.reverse());
                        this.setState(state => {
                            dataSource: currArr
                            // currArr.splice(0, 0, responseJson.data[0]);
                            // console.log(currArr)
                            state.isLoading = false
                            isRefreshFetching = false,
                                fetching_from_server = false,
                                subjectId = responseJson.msgThread.MT_SUB_ID,
                                topicId = responseJson.msgThread.MT_TOPIC_ID,
                                messageTitle = responseJson.msgThread.MT_TITLE
                            return state;
                        })
                        // }
                    }

                    if (this.scrollBottom == true) {
                        console.log('this.scrollBottom', this.scrollBottom)
                    }
                }
            })
            .catch((error) => {
                // console.error(error);
                // showNativeAlert("Network request failed")
                this.setState({
                    dataSource: [],
                    isLoading: false,
                    isRefreshFetching: false,

                    errorMessage: 'Failed to fetch your messages.'
                })
            });
    }

    checkForAudioLocalPath = (audioKey) => {

        const dirs = RNFetchBlob.fs.dirs
        let videoPath = '';
        if (Platform.OS == 'android') {
            videoPath = dirs.DocumentDir + `/RecordedAudioFiles/${audioKey}`
        } else {
            videoPath = dirs.DocumentDir + `/RecordedAudioFiles/${audioKey}`
        }
        return RNFetchBlob.fs.exists(videoPath)
            .then((exist) => {
                if (exist) {
                    console.warn('audio_exist' + JSON.stringify(exist) + '\n' + videoPath)
                    return exist
                }
                else {
                    console.warn('audio_not_exist')
                    return false
                }
                //console.log(`file ${exist ? '' : 'not'} exists`)
            })
            .catch((error) => {
                console.WRITE_EXTERNAL_STORAGE('audio_exist_error' + error)
                return false
            })
    }

    getSelectedSubject = (subjectId, subjectName) => {
        console.log('getting back id =', subjectId);
        console.log('subjectName =', subjectName);
        this.setState({
            subjectName: subjectName,
            subjectId: subjectId
        });
    }

    twoButtonAlert(title, message, okButtonTitle, cancelButtonTitle, callback) {
        Alert.alert(
            title ? title : appMsgs.appName,
            message,
            [
                {
                    text: cancelButtonTitle,
                    onPress: () => callback(0),
                    style: 'cancel',
                },
                { text: okButtonTitle, onPress: () => callback(1) },
            ],
            { cancelable: false },
        );
    }

    getAccessToken() {
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                self.setState({
                    access_token: value.slice(1, -1),
                }, () => {
                    if (this.checkIsDirectory()) {
                        this.getChatDetail('')
                    } else {
                        this.createDirectory()
                    }
                })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    prepareRecordingPath() {
        //dirctory path
        const dirs = RNFetchBlob.fs.dirs
        AudioRecorder.prepareRecordingAtPath(dirs.DocumentDir + `/RecordedAudioFiles/audio_file_.mp4`, {
            SampleRate: 22050,
            Channels: 1,
            AudioQuality: "Low",
            AudioEncoding: "aac",
            AudioEncodingBitRate: 32000
        });
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        global.isLiveConfRunningIosForLiveSessionNotHide = true;
        //Not visible notification start popup for this screen
        global.isChatLiveSessionVisible = true;
        global.navigation = this.props.navigation
        global.chatOpen = true;
        global.currentThreadId = this.props.navigation.state.params.selectedMessage
        this.refreshChat = EventRegister.addEventListener('refreshChat', (data) => {
            console.log('refreshChat log in chat', data)
            global.chatOpen = true;
            this.offset = 1;
            this.limit = 10;
            this.pageCount = 0;
            this.setState({

                dataSource: []

            })
            // this.setState({ isLoading: true });
            this.getChatDetail(data);
        })
        this.getAccessToken()
        // this.props.navigation.setParams({ showProfile: this.showProfile.bind(this) });
        // if (Platform.OS === "ios") {
        //     this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        //     this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
        // }

        // Recording of
        if (Platform.OS == 'ios') {
            this.addListener()
        }
        //Check start live conf notification or screen currently visible or not
        // this.listener = EventRegister.addEventListener('start_live_conf_on_notification', (data) => {
        //     console.log('start_live_conf_on_notification getAccessToken ')
        //     GoToScreen.goToWhichScreen('Sessions', this.props)
        // })

        //register track player
        // const playbackState = usePlaybackState();
        // await TrackPlayer.setupPlayer({});

        //Recording start or Stop
        this.audioRecorderStartStop = new AudioRecorderPlayer()
        this.audioRecorderStartStop.setSubscriptionDuration(0.09) // optional. Default is 0.1


        //audio recorder for iOS
        if (Platform.OS == 'ios') {
            AudioRecorder.requestAuthorization().then((isAuthorised) => {
                this.setState({ hasPermission: isAuthorised });

                if (!isAuthorised) return;

                this.prepareRecordingPath();

                AudioRecorder.onProgress = (e) => {
                    //console.warn('AUDIORECORDERPROGRESS', e)
                    if (parseInt(e.currentTime * 1000) >= 120000) {
                        AudioRecorder.stopRecording();
                    } else {
                        this.setState({
                            recordSecs: e.currentTime,
                            recordTime: this.audioRecorderStartStop.mmssss(
                                Math.floor(e.currentTime * 1000),
                            ),
                        })
                    }
                    //this.setState({ currentTime: Math.floor(data.currentTime) });
                };

                AudioRecorder.onFinished = (data) => {
                    // Android callback comes in the form of a promise instead.
                    if (Platform.OS === 'ios') {
                        if (this.state.isIosRecordingClear) {
                            this.setState({
                                recordSecs: 0,
                                recordTime: '00:00:00',
                                isStartRecoding: false,
                                isShowRecordedView: false,
                                savedaudioFileForApi: undefined,
                                isRecordingComStartPlaying: false,
                                isCommonHandlePlayingRecording: false,
                                isIosRecordingClear: false
                            })
                        } else {

                            this.setState({
                                recordSecs: 0,
                                recordTime: '00:00:00',
                                //isStartRecoding: false,
                                //isShowRecordedView: false,
                                savedaudioFileForApi: data.audioFileURL,
                                isCommonHandlePlayingRecording: true
                            })
                            //await AudioRecorder.removeRecordBackListener()
                            //this._finishRecording(data.status === "OK", data.audioFileURL, data.audioFileSize);
                        }
                    }

                };
            });
        }
    }

    addListener = () => {
        console.warn('CAPTURE_SESSIONS')
        let bridge = new NativeEventEmitter(NativeModules.ScreenRecorderDetect);

        this.screenCaptureEnabled = bridge.addListener("isScreenCaptureEnabled", (res) => {
            console.warn('CAPTURE_SESSIONS1' + '\n\n' + JSON.stringify(res))
            if (res.value == true) {
                console.warn('CAPTURE_SESSIONS2' + '\n\n' + JSON.stringify(res) + '\n\n' + this.state.isRecording)
                this.setState({
                    isRecording: true
                })
            }
            else {
                this.setState({ isRecording: false }, () => {
                    console.warn('CAPTURE_SESSIONS3' + '\n\n' + JSON.stringify(res) + '\n\n' + this.state.isRecording)
                })
            }

        })
    }

    componentWillUnmount() {
        global.chatOpen = false;
        // this.keyboardDidShowSub.remove();
        // this.keyboardDidHideSub.remove();
        EventRegister.removeEventListener(this.refreshChat)
        global.navigateAction = null
        // if (Platform.OS === "ios") {
        //     this.keyboardDidShowListener.remove()
        //     this.keyboardDidHideListener.remove()
        //   }
        // console.log("Unmounted Categories")

        if (Platform.OS === "ios") {
            this.screenCaptureEnabled.remove()
        }
        //EventRegister.removeEventListener(this.listener);
    }

    _keyboardDidShow(e) {
        keyboardHeight = e.endCoordinates.height;
        // this.setState({
        //     keyboardHeight: e.endCoordinates.height
        // });
    }

    _keyboardDidHide(e) {
        keyboardHeight = 0;
        //  this.setState({
        //      keyboardHeight: 0
        //     });
    }

    showProfile() {
        this.props.navigation.navigate('Profile')
    }

    handleKeyboardDidHide = (event) => {
        console.log('hide')
        // this.flatListRef.scrollToEnd();
        // return;
        Animated.timing(this.state.shift, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
        }).start();
    };


    logoutUser() {
        showNativeAlert(CONSTANTS.LOGOUT_MESSAGE)
        CONSTANTS.IS_LOGGED_IN = false
        this.props.navigation.popToTop()

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


    sendChatMessage = () => {
        // if (this.state.sendMessage.trim().length == 0 && this.state.imageToSend == '' && this.state.savedaudioFileForApi != undefined) {
        //     return
        // }
        //let savedFileTest = 'file:////data/user/0/com.ifasapp/files/RecordedAudioFiles/audio_file_.mp4'
        console.warn('enter send chat message', this.state.sendMessage.trim() + '\n\n' + this.state.imageToSend + '\n\n' + this.state.savedaudioFileForApi + '\n\n' +
            this.state.access_token + 'n\n' + this.props.navigation.state.params.selectedMessage + '\n\n' + this.state.subjectId)
        let message = this.state.sendMessage
        this.setState({
            isLoading: true,
            sendMessage: ''
        });

        var data = new FormData();
        data.append("access_token", this.state.access_token);
        data.append("mt_id", this.props.navigation.state.params.selectedMessage);
        data.append("subject_id", this.state.subjectId);
        data.append("topic_id", this.state.topicId);
        if (this.state.imageToSend != '') {
            var photo = {
                uri: this.state.imageToSend.uri,
                type: 'image/jpeg',
                name: 'ChatImage' + '.jpg',
            };
            data.append("img", photo);
            if (message != undefined && message != '') {
                data.append("msg", message.trim());
            } else {
                data.append("msg", '');
            }
        }
        else if (message != undefined && message != '') {
            data.append("msg", message.trim());
        }
        else if (this.state.savedaudioFileForApi != undefined) {
            let sendAudioObj = {
                uri:
                    Platform.OS === 'android'
                        ? this.state.savedaudioFileForApi
                        : this.state.savedaudioFileForApi,
                //: this.state.savedaudioFileForApi.replace('file://', ''),
                name: 'audioFile.mp4',
                type: 'audio/mp4'
            }
            data.append("audio", sendAudioObj);
        }

        console.warn('SEND_MESSAGE_DATA' + JSON.stringify(data))
        console.log(CONSTANTS.BASE_CHAT + CONSTANTS.SEND_MESSAGE)
        let header = {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
        }
        console.log(header)

        fetch(CONSTANTS.BASE_CHAT + CONSTANTS.SEND_MESSAGE, { method: 'POST', headers: header, body: data })
            .then((response) => response.json())
            .then((responseJson) => {
                console.warn('enrrrresponsejson', responseJson)
                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else if (responseJson.code == 1) {
                    console.log('in success')
                    this.offset = 1
                    this.scrollBottom = true;
                    // this.addItem(responseJson.data)
                    // var dataArr = this.state.dataSource;
                    // dataArr.splice(0, 0, e);
                    // var self = this;
                    // this.setState({
                    //     dataSource: dataArr
                    // }, () => {
                    //     setTimeout(function () {
                    //         self.flatListRef.scrollToIndex({ animated: true, index: 0 })
                    //     }, 200);
                    // })
                    let currMessageTyped = this.state.sendMessage
                    this.setState({
                        isLoading: false,
                        sendMessage: this.state.imageToSend != '' ? currMessageTyped : '',
                        imageToSend: '',
                        dataSource: [...[responseJson.data], ...this.state.dataSource],
                        // dataSource: '',
                        fetching_from_server: false,
                        isImagePick: false,
                        savedaudioFileForApi: undefined

                    });
                    //   }, () => { this.getChatDetail(true) });
                    // Alert.alert('IFAS', CONSTANTS.MESSAGE_SUCCESS);
                } if (responseJson.code == 201) {
                    this.setState({
                        isLoading: false
                    })
                }
                // if (responseJson.code == 414 || responseJson.code == 521) {
                //     SessionOut();
                // } else if (responseJson.code != 200) {
                //     messageAlert(responseJson)
                // } else {
                //     if (responseJson.data.photo != undefined) {
                //         Global.loginUser.photo = responseJson.data.photo
                //         console.log(Global.loginUser.photo)
                //     }
                //     if (responseJson.data.last_name != undefined) {
                //         Global.loginUser.last_name = responseJson.data.last_name
                //     }
                //     if (responseJson.data.first_name != undefined) {
                //         Global.loginUser.first_name = responseJson.data.first_name
                //     }
                //     let user = JSON.stringify(Global.loginUser);
                //     AsyncStorage.setItem('userdata', user).then(user => {
                //         console.log('profile data save')

                //     }).catch(err => console.log(err));

                // }
                // return responseJson
            })
            .catch((err) => {
                this.setState({
                    isLoading: false
                })
                console.warn('enrrrresponsejson', err)
                //return filterError(err.message)
            });
    }
    addItem(e) {
        // console.log('e new item',e,this.state.dataSource)
        var dataArr = this.state.dataSource;
        dataArr.splice(0, 0, e);
        var self = this;
        this.setState({
            dataSource: dataArr
        }, () => {
            setTimeout(function () {
                self.flatListRef.scrollToIndex({ animated: true, index: 0 })
            }, 200);
        })
        // this.setState(data => {
        // //     var dataArr = data.dataSource;
        // //     dataArr.splice(0, 0, e);
        // //     return dataArr;
        // // }, () => {
        // //         // this.flatListRef.scrollToEnd()
        // //         // this.flatListRef.scrollToIndex({ animated: true, index: 0 });

        // // })

        // var joined = this.state.dataSource.concat(e);
        // this.setState({ dataSource: joined })
        console.log('in add item:' + this.state.dataSource);
    }
    openSettingsPage() {
        if (Platform.OS === 'ios') {
            Linking.canOpenURL('app-settings:').then(supported => {
                if (!supported) {
                } else {
                    return Linking.openURL('app-settings:');
                }
            }).catch(err => console.error('An error occurred', err))
        } else {
            NativeModules.MyNative.openNetworkSettings(data => {
                alert(data)
            })
        }
    }

    choosePhoto = () => {
        const options = {
            title: 'Choose an option',
            //customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
            quality: 0.5,
            // permissionDenied: {
            //   title: 'Error',
            //   text:'hello'
            // }
        };
        var that = this
        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);
            if (response.didCancel) {
                console.log('User cancelled image picker');
                // that.setState({
                //     isLoading: false,
                // });
            } else if (response.error) {
                console.log('ImagePicker Error: ', response);
                var message = 'To be able to take pictures with your camera and choose images from your library.'


                this.twoButtonAlert('Permission denied', message, 'RE-TRY', 'I\'M SURE', function (status) {
                    console.log('The button tapped is: ', status);
                    if (status == 1) {
                        that.openSettingsPage()
                    }
                }, function (error) {
                    console.log('There was an error fetching the location');
                });
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
                // that.setState({
                //   isLoading: true,
                // });
            } else {
                const sourceUri = { uri: response.uri };
                that.setState({
                    // isLoading: false,
                    imageToSend: sourceUri,
                    isImagePick: true
                }, () => {

                    //this.sendChatMessage() 
                });
            }
        });
    }

    postResolvedApi() {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('thread_id', this.props.navigation.state.params.selectedMessage);
        formData.append('is_resolved', 1);
        console.log(formData)

        fetch(CONSTANTS.BASE + CONSTANTS.POST_RESOLVED_CHAT_QUERY_NEW, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.warn('resolved_response', responseJson)

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else {
                    this.handleBackButtonClick()
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }
    renderFlatListHeader() {
        return (<View style={{ width: '100%', height: 54.5 * dimensions.sizeRatio, backgroundColor: colors.white, justifyContent: 'center' }}>
            <Text style={{
                color: colors.night, fontSize: 15 * dimensions.sizeRatio, fontFamily: CONSTANTS.DEMI, marginTop: 10 * dimensions.sizeRatio,
                marginVertical: 12 * dimensions.sizeRatio,
                marginLeft: 15 * dimensions.sizeRatio,
                alignSelf: "flex-start",
                marginRight: 52.5 * dimensions.sizeRatio
            }}>
                {this.state.messageTitle}
            </Text>
        </View>)
    }
    // setClipboardContent = (msg) => {
    //     Alert.alert(msg)
    //     Clipboard.setString(msg);
    // };
    setClipboardContent = async (msg) => {
        //To copy the text to clipboard
        Clipboard.setString(msg);
        Toast.show('Copied to Clipboard!')
        //alert('Copied to Clipboard!');
    };

    renderMessageAloneUI(item) {

        var gmtDateTime = moment.utc(item.M_CREATED_AT)
        //var local = gmtDateTime.local().format('DD-MMM-YYYY hh:mm A');
        var local = moment(item.M_CREATED_AT).format('DD-MMM-YYYY hh:mm A');
        return (
            <View
                // onLongPress={() => {
                //     this.setClipboardContent(item.M_MESSAGE.trim())
                // }}
                >
                {item.IS_SENDER == true ?
                    (<TouchableOpacity style={styles.chatMessageSender}
                        onLongPress={() => {
                            Alert.alert(
                                'Delete Message..',
                                'Are you want to delete this message?',
                                [
                                    { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                    {
                                        text: 'OK', onPress: () => {
                                            this.deleteMessageApi(item)
                                        }
                                    },
                                ],
                                { cancelable: false }
                            )
                        }}>
                        <Text selectable={true} style={styles.chatHistoryMessageSender}>
                            {item.M_MESSAGE.trim()}
                        </Text>
                        <Text style={styles.textChatTimeSender}>{local}</Text>
                    </TouchableOpacity>) : (
                        <View style={styles.chatMessageReceiver}>
                            <Text selectable={true} onLongPress={() => this.setClipboardContent(item.M_MESSAGE.trim())} style={styles.chatHistoryMessageReceiver}>
                                {item.M_MESSAGE.trim()}
                            </Text>
                            <Text style={styles.textChatTimeReceiver}>{local}</Text>
                        </View>
                    )}
            </View>
        )
    }
    renderImageAloneUI(item) {
        let imageUrl = CONSTANTS.BASE_IMG_URL + item.M_IMAGE
        console.log('imageUrl', imageUrl)
        return (
            <View>
                {item.IS_SENDER == true ?
                    (
                        <View style={styles.chatMessageImageSender}>
                            <TouchableOpacity onPress={() => { this.props.navigation.navigate({ routeName: 'FullPreview', params: imageUrl }) }} 
                            onLongPress={() => {
                                Alert.alert(
                                    'Delete Message..',
                                    'Are you want to delete this message?',
                                    [
                                        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                        {
                                            text: 'OK', onPress: () => {
                                                this.deleteMessageApi(item)
                                            }
                                        },
                                    ],
                                    { cancelable: false }
                                )
                            }}>
                                {Platform.OS == 'ios' ?
                                    <Image
                                        source={{ uri: imageUrl }}
                                        style={{
                                            width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio, borderRadius: 8 * dimensions.sizeRatio
                                        }}
                                    />
                                    :
                                    <FastImage
                                        style={{ width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio, borderRadius: 8 * dimensions.sizeRatio }}
                                        source={{
                                            uri: imageUrl,
                                            priority: FastImage.priority.normal,
                                        }}
                                        resizeMode={FastImage.resizeMode.cover}
                                    />
                                }
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.chatMessageImageReceiver}>
                            <TouchableOpacity onPress={() => { this.props.navigation.navigate({ routeName: 'FullPreview', params: imageUrl }) }} >
                                {Platform.OS == 'ios' ?
                                    <Image
                                        source={{ uri: imageUrl }}
                                        style={{
                                            width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio, borderRadius: 8 * dimensions.sizeRatio
                                        }}
                                    />
                                    :
                                    <FastImage
                                        style={{ width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio, borderRadius: 8 * dimensions.sizeRatio }}
                                        source={{
                                            uri: imageUrl,
                                            priority: FastImage.priority.normal,
                                        }}
                                        resizeMode={FastImage.resizeMode.cover}
                                    />
                                }
                            </TouchableOpacity>
                        </View>
                    )}
            </View>
        )
    }

    renderMessageImageUI(item) {
        var gmtDateTime = moment.utc(item.M_CREATED_AT)
        //var local = gmtDateTime.local().format('DD-MMM-YYYY hh:mm A');
        var local = moment(item.M_CREATED_AT).format('DD-MMM-YYYY hh:mm A');

        let imageUrl = ''
        if (item.M_IMAGE != '') {
            imageUrl = CONSTANTS.BASE_IMG_URL + item.M_IMAGE
            console.log('imageUrl', imageUrl)
        }

        return (
            <View>
                {item.IS_SENDER == true ?
                    (
                        <View style={styles.chatMessageImageSender}>
                            <TouchableOpacity onPress={() => { this.props.navigation.navigate({ routeName: 'FullPreview', params: imageUrl }) }} 
                            onLongPress={() => {
                                Alert.alert(
                                    'Delete Message..',
                                    'Are you want to delete this message?',
                                    [
                                        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                        {
                                            text: 'OK', onPress: () => {
                                                this.deleteMessageApi(item)
                                            }
                                        },
                                    ],
                                    { cancelable: false }
                                )
                            }}>
                                {Platform.OS == 'ios' ?
                                    <Image
                                        style={[styles.chatImageSender, { width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio }]}
                                        source={{ uri: imageUrl }}
                                    />
                                    :
                                    <FastImage
                                        style={[styles.chatImageSender, { width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio }]}
                                        source={{
                                            uri: imageUrl,
                                            priority: FastImage.priority.normal,
                                        }}
                                        resizeMode={FastImage.resizeMode.cover}
                                    />
                                }
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={.8}
                                onLongPress={() => {
                                    this.setClipboardContent(item.M_MESSAGE.trim())
                                }}
                                style={{
                                    width: '100%',
                                    flexDirection: 'column',
                                    alignSelf: 'flex-end'
                                }}>
                                <Text selectable={true}
                                    style={styles.chatHistoryMessageSender}>
                                    {item.M_MESSAGE.trim()}
                                </Text>
                                <Text style={styles.textChatTimeSender}>{local}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.chatMessageImageReceiver}>
                            <TouchableOpacity onPress={() => { this.props.navigation.navigate({ routeName: 'FullPreview', params: imageUrl }) }} >
                                {Platform.OS == 'ios' ?
                                    <Image
                                        source={{ uri: imageUrl }}
                                        style={[styles.chatImageReceiver, { width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio }]}
                                    />
                                    :
                                    <FastImage
                                        style={[styles.chatImageReceiver, { width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio }]}
                                        source={{
                                            uri: imageUrl,
                                            priority: FastImage.priority.normal,
                                        }}
                                        resizeMode={FastImage.resizeMode.cover}
                                    />
                                }
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={.8}
                                onLongPress={() => {
                                    this.setClipboardContent(item.M_MESSAGE.trim())
                                }}
                                style={{
                                    width: '100%',
                                    flexDirection: 'column',
                                    alignItems: "flex-end",
                                    justifyContent: 'flex-end',
                                }}>
                                <Text selectable={true}
                                    style={styles.chatHistoryMessageReceiver}>
                                    {item.M_MESSAGE}
                                </Text>
                                <Text style={styles.textChatTimeReceiver}>{local}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
            </View>
        )
    }

    goIndex = (indexToScroll) => {
        console.log('indexToScroll', indexToScroll, this.flatListRef)
        if (this.flatListRef != null) {
            this.flatListRef.scrollToIndex({ animated: false, index: indexToScroll });
        }
    };

    handleScroll = (event) => {

        // console.log('scroll y', event.nativeEvent.contentOffset.y)
        // console.log('this.state.dataSource.length', this.state.dataSource.length, (this.currentArr.length + this.currentResponse.data.length))
        if (event.nativeEvent.contentOffset.y != 0) {
            return
        }
        if (this.offset <= this.pageCount && (this.state.dataSource.length == (this.currentArr.length + this.currentResponse.data.length))) {
            this.scrollBottom = false;
            this.getChatDetail('');
        }
    }


    checkNetInfo = (type, rowItem) => {
        try {
            NetInfo.isConnected.fetch().then(isConnected => {
                if (isConnected) {
                    if (Platform.OS === 'android')
                        this.callExtractorAfterNetChecking(type, rowItem, isConnected)
                    if (Platform.OS === 'ios') {
                        this.callExtractorAfterNetChecking(type, rowItem, isConnected)
                    }
                }
            });

            function handleFirstConnectivityChange(isConnected) {
                if (Platform.OS === 'ios')
                    //this.callExtractorAfterNetChecking(rowURL, audio_id, type, rowItem, isConnected)
                    console.warn('Then, is ' + (isConnected ? 'online' : 'offline'));
                NetInfo.isConnected.removeEventListener(
                    'connectionChange',
                    handleFirstConnectivityChange
                );
            }
            NetInfo.isConnected.addEventListener(
                'connectionChange',
                handleFirstConnectivityChange
            );
        } catch (e) {
            console.log('exception', e);
        }
    }

    callExtractorAfterNetChecking = (type, rowItem, isConnected) => {
        if (isConnected) {
            if (type == 'recording_start') {
                this.onStartRecord()
            } else if (type == 'downloading_file') {
                this.downloadVideoWithProgress(rowItem)
            }
            //this.extractorYoutubeURL(rowItem.URL, ('audio_' + rowItem.ID), 'audio', rowItem)
        } else {
            setTimeout(() => { Toast.show('Network is not available', Toast.BOTTOM) }, 200)
            //alert('Network is not available');
        }
    }

    onStartRecord = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Permissions for write access',
                        message: 'Give permission to your storage to write a file',
                        buttonPositive: 'ok',
                    },
                )
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('You can use the storage')
                } else {
                    console.log('permission denied')
                    return
                }
            } catch (err) {
                console.warn(err)
                return
            }
        }
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    {
                        title: 'Permissions for write access',
                        message: 'Give permission to your storage to write a file',
                        buttonPositive: 'ok',
                    },
                )
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('You can use the camera')
                } else {
                    console.log('permission denied')
                    return
                }
            } catch (err) {
                console.warn(err)
                return
            }
        }
        //dirctory path
        const dirs = RNFetchBlob.fs.dirs
        // const min = 1;
        // const max = 100;
        // const rand = min + Math.random() * (max - min);

        const path = Platform.select({
            ios: `audio_file_.m4a`,
            android: dirs.DocumentDir + `/RecordedAudioFiles/audio_file_.mp4`,
        })
        // const path = Platform.select({
        //     ios: `sdcard/audio_file_${rand}.m4a`,
        //     android: `sdcard/audio_file_${rand}.mp4`,
        // })
        const audioSet = {
            AudioEncoderAndroid: AudioEncoderAndroidType.MPEG_4,
            AudioSourceAndroid: AudioSourceAndroidType.MIC,
            //OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS,
            AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.low,
            AVNumberOfChannelsKeyIOS: 1,
            AVFormatIDKeyIOS: AVEncodingOption.aac,
            AVSampleRateKeyIOS: 22050
        }
        //here isShowRecordedView start recording
        this.setState({
            isStartRecoding: true
        })
        if (Platform.OS == 'android') {
            console.log('audioSet', JSON.stringify(audioSet))
            const uri = await this.audioRecorderStartStop.startRecorder(path)

            this.audioRecorderStartStop.addRecordBackListener((e) => {
                console.log('AUDIOSTARTEDTIME' + JSON.stringify(e))
                if (parseInt(e.current_position) >= 120000) {
                    this.onStopRecord('stop_recording')
                } else {
                    this.setState({
                        recordSecs: e.current_position,
                        recordTime: this.audioRecorderStartStop.mmssss(
                            Math.floor(e.current_position),
                        ),
                    })
                }
            })
            console.log(`uri: ${uri}`)
        } else {
            this.prepareRecordingPath();
            try {
                const filePath = await AudioRecorder.startRecording();
            } catch (error) {
                console.error(error);
            }
        }
    }

    onStopRecord = async (stop_type) => {

        if (stop_type == 'cancel') {
            console.warn('entrr12')
            //here need to work on when user stop running recorder then must need to remove file from storage(for clean space)
            if (this.state.isStartRecoding) {
                console.warn('entrr13')
                if (Platform.OS == 'android') {
                    await this.audioRecorderStartStop.stopRecorder()
                    await this.audioRecorderStartStop.removeRecordBackListener()
                } else {
                    console.warn('entrr14')
                    try {
                        this.setState({
                            isIosRecordingClear: true
                        }, () => {
                            AudioRecorder.stopRecording();
                        })

                    } catch (error) {
                        console.error(error);
                    }
                }
                this.setState({
                    recordSecs: 0,
                    recordTime: '00:00:00',
                    isStartRecoding: false,
                    isShowRecordedView: false,
                    savedaudioFileForApi: undefined,
                    isRecordingComStartPlaying: false,
                    isCommonHandlePlayingRecording: false
                })
            } else {
                console.warn('entrr15')
                this.setState({
                    recordSecs: 0,
                    recordTime: '00:00:00',
                    isStartRecoding: false,
                    isShowRecordedView: false,
                    savedaudioFileForApi: undefined,
                    isRecordingComStartPlaying: false,
                    isCommonHandlePlayingRecording: false
                })
            }
        } else {
            //dirctory path
            const dirs = RNFetchBlob.fs.dirs
            this.setState({
                recordSecs: 0,
                recordTime: '00:00:00',
                //isStartRecoding: false,
                //isShowRecordedView: false,
                //isLoading: true,
                //sendMessage: ''
            });
            if (Platform.OS == 'android') {
                let result = await this.audioRecorderStartStop.stopRecorder()
                await this.audioRecorderStartStop.removeRecordBackListener()

                this.setState({
                    recordSecs: 0,
                    recordTime: '00:00:00',
                    //isStartRecoding: false,
                    //isShowRecordedView: false,
                    savedaudioFileForApi: result,
                    isCommonHandlePlayingRecording: true
                }, () => {
                    //here work on result(send file into api)
                    //this.sendChatMessage()
                })
                console.warn('STOP RESULT' + result + '\n\n' + this.state.savedaudioFileForApi)
            } else {
                try {
                    await AudioRecorder.stopRecording();

                } catch (error) {
                    console.error(error);
                }
            }
        }
        //console.warn('STOP RESULT' + result)
    }

    onStartPlayInRecodingModal = async (audioPath) => {
        console.warn('onStartPlay' + audioPath)
        this.setState({
            isRecordingComStartPlaying: !this.state.isRecordingComStartPlaying
        })

        if (Platform.OS == 'android') {
            await this.audioRecorderStartStop.startPlayer(Platform.OS == 'ios' ? 'file:///' + audioPath : audioPath)
            this.audioRecorderStartStop.setVolume(1.0);
        } else {
            await this.audioRecorderStartStop.startPlayer(audioPath)
            this.audioRecorderStartStop.setVolume(1.0);
            // await TrackPlayer.setupPlayer({});
            // await TrackPlayer.updateOptions({
            //     stopWithApp: true,
            // });

            // // Adds a track to the queue
            // await TrackPlayer.add({
            //     id: 'IFASID',
            //     url: audioPath,
            //     title: 'IFAS',
            //     artist: 'IFAS Artist',
            // });

            // // Starts playing it
            // TrackPlayer.play();
        }
    }

    onStopPlayInRecodingModal = async (close_type) => {
        console.log('onStopPlay')
        if (close_type == 'playing_start') {

            if (Platform.OS == 'android') {
                // Starts playing it
                this.audioRecorderStartStop.stopPlayer();
                this.audioRecorderStartStop.removePlayBackListener();
            } else {
                this.audioRecorderStartStop.stopPlayer();
                this.audioRecorderStartStop.removePlayBackListener();
                //TrackPlayer.stop();
            }
            this.setState({
                isRecordingComStartPlaying: !this.state.isRecordingComStartPlaying
                //isStartRecoding: false,
                //isShowRecordedView: false,
                //savedaudioFileForApi:undefined,
                //isCommonHandlePlayingRecording: false
            })
        } else {
            if (this.state.isRecordingComStartPlaying) {

                if (Platform.OS == 'android') {
                    // Starts playing it
                    this.audioRecorderStartStop.stopPlayer();
                    this.audioRecorderStartStop.removePlayBackListener();
                    //TrackPlayer.stop();
                    this.setState({
                        isStartRecoding: false,
                        isShowRecordedView: false,
                        savedaudioFileForApi: undefined,
                        isRecordingComStartPlaying: false,
                        isCommonHandlePlayingRecording: false
                    })
                } else {
                    try {
                        //TrackPlayer.stop();
                        this.audioRecorderStartStop.stopPlayer();
                        this.audioRecorderStartStop.removePlayBackListener();
                        this.setState({
                            isStartRecoding: false,
                            isShowRecordedView: false,
                            savedaudioFileForApi: undefined,
                            isRecordingComStartPlaying: false,
                            isCommonHandlePlayingRecording: false
                        })
                    } catch (error) {
                        console.error(error);
                    }
                }
            } else {
                if (Platform.OS == 'android') {
                    this.setState({
                        isStartRecoding: false,
                        isShowRecordedView: false,
                        savedaudioFileForApi: undefined,
                        isRecordingComStartPlaying: false,
                        isCommonHandlePlayingRecording: false
                    })
                } else {
                    this.setState({
                        isStartRecoding: false,
                        isShowRecordedView: false,
                        savedaudioFileForApi: undefined,
                        isRecordingComStartPlaying: false,
                        isCommonHandlePlayingRecording: false
                    })
                }
            }
        }

        //this.audioRecorderStartStop.stopPlayer()
        //this.audioRecorderStartStop.removePlayBackListener()
    }

    onStartPlay = async (audioPath) => {
        console.warn('onStartPlay' + audioPath)
        this.setState({
            isStartPlaying: true
        })

        if (Platform.OS == 'android') {
            setTimeout(() => {
                this.sound = new Sound(audioPath, '', (error) => {
                    if (error) {
                        console.warn('failed to load the sound', error);
                    }
                });

                setTimeout(() => {
                    this.sound.setVolume(.5).play((success) => {
                        if (success) {
                            console.warn('successfully finished playing');
                            // this.setState({
                            //     isStartPlaying: false,
                            // })
                        } else {
                            console.warn('playback failed due to audio decoding errors');
                            // this.setState({
                            //     isStartPlaying: false,
                            // })
                        }
                    });
                }, 100);
            }, 100);
        } else {
            await this.audioRecorderStartStop.startPlayer(Platform.OS == 'ios' ? 'file:///' + audioPath : audioPath)
            this.audioRecorderStartStop.setVolume(1.0);
        }
    }

    onStopPlay = async (close_type) => {
        console.log('onStopPlay')
        if (close_type == 'playing_start') {

            if (Platform.OS == 'android') {
                this.sound.stop((data) => {
                    console.warn('stop sucessfully', data);
                })
                this.setState({
                    isStartPlaying: false,
                    //isShowPlayingAudioView: false,
                })
            } else {
                this.audioRecorderStartStop.stopPlayer();
                this.audioRecorderStartStop.removePlayBackListener();
                this.setState({
                    isStartPlaying: false,
                    //isShowPlayingAudioView: false,
                })
            }
        } else if (close_type == 'cancel_in_playing') {
            if (Platform.OS == 'android') {
                this.sound.stop((data) => {
                    console.warn('stop sucessfully', data);
                })
                this.setState({
                    isStartPlaying: false,
                    isShowPlayingAudioView: false,
                })
            } else {
                this.audioRecorderStartStop.stopPlayer();
                this.audioRecorderStartStop.removePlayBackListener();
                this.setState({
                    isStartPlaying: false,
                    isShowPlayingAudioView: false,
                })
            }
        }
        else {
            this.setState({
                isStartPlaying: false,
                isShowPlayingAudioView: false,
            })
        }

        //this.audioRecorderStartStop.stopPlayer()
        //this.audioRecorderStartStop.removePlayBackListener()
    }

    createDirectory = async () => {
        const dirs = RNFetchBlob.fs.dirs
        RNFetchBlob.fs.mkdir(dirs.DocumentDir + '/RecordedAudioFiles')
            .then((res) => {
                console.warn('createDirectory sucess' + JSON.stringify(res))
                this.getChatDetail('')
            })
            .catch((err) => {
                console.warn('createDirectory error' + JSON.stringify(err))
            })
    }
    checkIsDirectory = async () => {
        const dirs = RNFetchBlob.fs.dirs
        return RNFetchBlob.fs.isDir(dirs.DocumentDir + '/RecordedAudioFiles')
            .then((isDir) => {
                console.log('checkIsDirectory' + JSON.stringify(isDir))
                if (isDir) {
                    console.warn('1')
                    return true
                } else {
                    this.createDirectory().then((res) => {

                    })
                    console.warn('2')
                    return false
                }
            })
            .catch((err) => {
                console.warn('checkIsDirectory error' + JSON.stringify(err))
            })
    }

    downloadVideoWithProgress = (rowItem) => {

        this.setState({
            isProgress: true
        })

        const dirs = RNFetchBlob.fs.dirs

        console.log('RNFS PATH' + dirs.DocumentDir)
        let directoryPath = undefined;
        if (Platform.OS == 'android') {
            directoryPath = dirs.DocumentDir + `/RecordedAudioFiles/${rowItem.M_AUDIO}`
        } else {
            directoryPath = dirs.DocumentDir + `/RecordedAudioFiles/${rowItem.M_AUDIO}`
        }

        taskStartDownloading = RNBackgroundDownloader.download({
            id: `file_${rowItem.M_ID}`,
            url: CONSTANTS.BASE_IMG_URL + rowItem.M_AUDIO,
            destination: directoryPath
        }).begin((expectedBytes) => {
            console.log(`Going to download ${expectedBytes} bytes!`);
        }).progress((percent) => {
            console.warn(`Downloaded: ${percent * 100}%`);
            this.setState({
                progress: percent
            })
            let downloadingProgress = Math.floor((percent) * 100)
            if (downloadingProgress != 99) {
                global.VIDEO_AUDIO_DOWNLOADING_PROGRESS = downloadingProgress
            } else {
                global.VIDEO_AUDIO_DOWNLOADING_PROGRESS = undefined
            }
            this.setState({
                progress: percent
            })
        }).done((res) => {
            //console.warn('The file saved to ', JSON.stringify(res))
            Toast.show('Your file has been downloaded successfully.')
            global.VIDEO_AUDIO_DOWNLOADING_PROGRESS = undefined
            this.updateArrayDownloadAudio(rowItem)

        }).error((error) => {
            console.log('Download canceled due to error: ', error);
        });
    }

    updateArrayDownloadAudio = () => {

        let savedMessageChatArray = this.state.dataSource;
        const dirs = RNFetchBlob.fs.dirs
        savedMessageChatArray.forEach(element2 => {


            this.checkForAudioLocalPath(element2.M_AUDIO).then((res) => {
                if (res) {
                    const dirs = RNFetchBlob.fs.dirs
                    let videoPath = '';
                    if (Platform.OS == 'android') {
                        videoPath = dirs.DocumentDir + `/RecordedAudioFiles/${element2.M_AUDIO}`
                    } else {
                        videoPath = dirs.DocumentDir + `/RecordedAudioFiles/${element2.M_AUDIO}`
                    }
                    element2.IS_DOWNLOAD_AUDIO = true
                    element2.DOWNLOADED_AUDIO_PATH = videoPath
                    console.warn('video_found_' + res + '.\n\n' + videoPath)
                } else {
                    element2.IS_DOWNLOAD_VIDEO = false
                    element2.DOWNLOADED_VIDEO_PATH = ''
                    console.warn('not_found' + 'Not found any downloaded video path!')
                }
            })
        });

        setTimeout(() => {

            this.setState({
                dataSource: [...savedMessageChatArray],
                progress: 0,
                isProgress: false
            })
        }, 500);
    }


    selectProfilePic = (selectType) => {
        if (selectType == "Camera") {
            ImagePicker2.openCamera({
                width: 300,
                height: 400,
                compressImageQuality: Platform.OS === 'android' ? .5 : .7,
                cropping: false,
            }).then(image => {
                if (image.path != undefined && image.path != '') {
                    var parts = image.path.split('/');
                    var loc = parts.pop();
                    var tempImageObject = {
                        uri: image.path,
                        type: 'image/jpeg',
                        name: 'abc.jpg'
                    }
                    //alert(tempImageObject)
                    console.warn('image camera' + JSON.stringify(image))
                    this.setState({
                        imageToSend: tempImageObject,
                        isImagePick: true

                    })
                    // this.setState({
                    //     isImageSelectPicker:true,
                    //     imagePath: image.path,
                    //     imageObject: tempImageObject
                    // });
                }

            });
        } else {
            ImagePicker2.openPicker({
                width: 300,
                height: 400,
                compressImageQuality: Platform.OS === 'android' ? .5 : .7,
                cropping: false
            }).then(image => {
                console.warn('gall', image)
                if (image.path != undefined && image.path != '') {
                    var parts = image.path.split('/');
                    var loc = parts.pop();
                    var tempImageObject = {
                        uri: image.path,
                        type: image.mime,
                        name: loc
                    }
                    console.warn('image gallery' + JSON.stringify(image))
                    this.setState({
                        imageToSend: tempImageObject,
                        isImagePick: true
                    })
                    // this.setState({
                    //     isImageSelectPicker:true,
                    //     imagePath: image.path,
                    //     imageObject: tempImageObject,
                    // });
                }
            });
        }
    }

    deleteMessageApi(item) {

        this.setState({
            isLoading: true
        });

        var data = new FormData();
        data.append("access_token", this.state.access_token);
        //data.append('course_id', global.landingScreenPaidItem.id);
        //type(1=>Message,2=>Support message,3=> Group Message)
        data.append('type', 1);
        data.append('id', item.M_ID);

        console.warn('delete_message_request', data)
        console.log(CONSTANTS.BASE_CHAT + CONSTANTS.POST_NORMAL_SUPPORT_GROUP_DELETE_MESSAGE)
        let header = {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
        }
        console.log(header)

        return fetch(CONSTANTS.BASE_CHAT + CONSTANTS.POST_NORMAL_SUPPORT_GROUP_DELETE_MESSAGE, { method: 'POST', headers: header, body: data })
            .then((response) => response.json())
            .then((responseJson) => {
                console.warn('responseJson' + JSON.stringify(responseJson))
                this.setState({
                    isLoading: false
                });
                if (responseJson.code == 201) {
                    console.warn('ENTER_DELETE_1')
                } else {
                    console.warn('ENTER_DELETE_2_SUCESS')
                    this.setState({
                        dataSource: []
                    }, () => {
                        //RECALL API
                        this.getChatDetail('')
                    })
                }
            })
            .catch((err) => {
                console.log('responseJson4' + JSON.stringify(err))
                console.log(err)
                this.setState({
                    isLoading: false
                });
                return err.message
                //return filterError(err.message)
            });
    }
    render() {
        const { shift, isShowPlayingAudioView } = this.state;
        console.log('this.state.dataSource', this.state.dataSource)

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
                        flex: 1,
                        flexDirection: 'column',
                        width: '100%'
                    }}>
                    {/* <KeyboardAvoidingView style={{
                flex: 10,
                alignSelf: 'stretch',
            }} behavior="padding" 
            enabled
            keyboardVerticalOffset={
                Platform.select({
                ios: () => 0,
                android: () => 100
            })()}> */}
                    {this.renderHeader()}
                    {this.renderFlatListHeader()}
                    <View style={styles.chatContainer}>
                        <Loader
                            loading={this.state.isLoading}
                        />
                        <FlatList
                            inverted
                            alwaysBounceVertical={false}
                            showsVerticalScrollIndicator={false}
                            ref={(ref) => { this.flatListRef = ref; }}
                            data={this.state.dataSource}
                            // renderItem={({ item }) => (
                            //     (item.M_IMAGE != '' ? (item.M_MESSAGE == '' ?
                            //         this.renderImageAloneUI(item) : this.renderMessageImageUI(item)) :
                            //         this.renderMessageAloneUI(item))
                            // )}
                            renderItem={({ item }) => (
                                (item.M_IMAGE != '' ? (item.M_MESSAGE == '' ? this.renderImageAloneUI(item) : this.renderMessageImageUI(item))
                                    : item.M_AUDIO != null && item.M_AUDIO != '' ? this.renderAudioAloneUI(item) : this.renderMessageAloneUI(item))
                            )}
                            extraData={this.state}
                            keyExtractor={(item, index) => index.toString()}
                        />
                        {this.props.navigation.state.params?.selectedItemObj?.MT_IS_RESOLVED == 0 &&
                        <View style={styles.chatSendMessageContainer}>
                            <TouchableOpacity
                                activeOpacity={.9}
                                style={{
                                    width: 35 * dimensions.sizeRatio,
                                    height: 35 * dimensions.sizeRatio,
                                    borderRadius: 35 * dimensions.sizeRatio / 2,
                                    backgroundColor: colors.theme,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginLeft: 3
                                }}
                                onPress={() => {
                                    this.setState({
                                        isShowRecordedView: true,
                                    })
                                }}>
                                <Image
                                    styl={{
                                        width: 20,
                                        height: 20,
                                    }}
                                    resizeMode={'center'}
                                    source={require('../images/microphone.png')}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    flex: .1,
                                    width: 43 * dimensions.sizeRatio,
                                    height: 43 * dimensions.sizeRatio,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginLeft: this.state.isImagePick == false ? 0 : 3,
                                    marginLeft: 3
                                }}
                                onPress={() => {
                                    this.setState({
                                        isImagePicker: true
                                    })
                                    // if (this.state.isImagePick == false) {
                                    //     this.choosePhoto()
                                    // }
                                }}
                            >
                                <Image
                                    source={this.state.isImagePick == false ?
                                        require('../images/MessagePlaceholder.png')
                                        : {
                                            uri: this.state.imageToSend.uri,
                                        }}
                                    style={{
                                        width: this.state.isImagePick == false ? 30 * dimensions.sizeRatio : 30 * dimensions.sizeRatio,
                                        height: this.state.isImagePick == false ? 25 * dimensions.sizeRatio : 30 * dimensions.sizeRatio,
                                        alignSelf: 'center',
                                    }}
                                    resizeMode={this.state.isImagePick == false ? 'contain' : 'cover'}
                                />
                            </TouchableOpacity>
                            <View
                                style={{
                                    flex: .88,
                                    width: '100%',
                                    maxHeight: 100,
                                    paddingLeft: this.state.isImagePick == false ? 0 : 10
                                }}>
                                <TextInput
                                    returnKeyType="default"
                                    autoCapitalize="none"
                                    multiline={true}
                                    defaultWhite={false}
                                    placeholder={textInputPlaceholders.sendMessage}
                                    underlineColorAndroid="transparent"
                                    style={{
                                        width: '100%',
                                        maxHeight: 100,
                                    }}
                                    keyboardType="default"
                                    value={this.state.sendMessage}
                                    onChangeText={sendMessage => this.setState({ sendMessage })}
                                    onSubmitEditing={() => {
                                        Keyboard.dismiss();
                                    }}
                                />
                            </View>
                            <View style={{
                                flex: .12,
                                flexDirection: 'row',
                            }}>
                                <TouchableOpacity
                                    style={{
                                        width: 45 * dimensions.sizeRatio,
                                        height: 45 * dimensions.sizeRatio,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                    onPress={() => {
                                        if (this.state.sendMessage.trim() != '' && this.state.imageToSend != '') {
                                            console.warn('enter1' + this.state.sendMessage.trim())
                                            this.sendChatMessage()
                                        }
                                        else if (this.state.sendMessage.trim() != '') {
                                            console.warn('enter2' + this.state.sendMessage.trim())
                                            this.sendChatMessage()
                                        } else if (this.state.imageToSend != '') {
                                            console.warn('enter3' + this.state.imageToSend)
                                            this.sendChatMessage()
                                        } else if (this.state.savedaudioFileForApi != undefined) {
                                            console.warn('enter4' + this.state.savedaudioFileForApi)
                                            this.sendChatMessage()
                                        }
                                    }}
                                >
                                    <Image
                                        source={require('../images/send_message.png')}
                                        style={styles.icSendMessage}
                                        resizeMode={'contain'}
                                    />
                                </TouchableOpacity>
                                {/* here audio recorder icon */}
                            </View>
                        </View>
        }
                    </View>
                    {this.renderRecordedView()}
                    {/* {this.renderPlayingAudioView()} */}
                    {isShowPlayingAudioView &&
                        <Modal
                            visible={isShowPlayingAudioView}
                            transparent={true}
                            onRequestClose={() =>
                                this.setState({ isShowPlayingAudioView: true })
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
                                        height: '30%',
                                        width: '70%',
                                        paddingVertical: 10,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 20,

                                    }}>
                                    <Text style={{
                                        color: colors.white,
                                        fontFamily: CONSTANTS.MEDIUM,
                                        fontSize: dimensions.sizeRatio * 18
                                    }}>{'*Playing Audio*'}</Text>

                                    {this.state.isStartPlaying ?
                                        <TouchableOpacity
                                            activeOpacity={.7}
                                            style={{
                                                width: 100,
                                                height: 100,
                                                maringTop: 10,
                                                //borderRadius: 100 / 2,
                                                //borderWidth: 2,
                                                //borderColor: colors.transparent_theme,
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onPress={() => {
                                                console.warn('eeeee1')
                                                this.onStopPlay('playing_start')
                                            }}>
                                            <Image
                                                styl={{
                                                    width: 60,
                                                    height: 60
                                                }}
                                                resizeMode={'contain'}
                                                source={require('../images/icon_stop_playing.png')}
                                            />
                                        </TouchableOpacity>
                                        :
                                        <TouchableOpacity
                                            activeOpacity={.7}
                                            style={{
                                                width: 100,
                                                height: 100,
                                                maringTop: 10,
                                                //borderRadius: 100 / 2,
                                                //borderWidth: 2,
                                                //borderColor: colors.transparent_theme,
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onPress={() => {
                                                //here start playing maintain flag and etc.
                                                if (this.state.selectedItemForPlaying != undefined) {
                                                    console.warn('eeeee2')
                                                    if (this.state.selectedItemForPlaying.IS_DOWNLOAD_AUDIO) {
                                                        console.warn('eeeee3')
                                                        this.onStartPlay(this.state.selectedItemForPlaying.DOWNLOADED_AUDIO_PATH)
                                                    }
                                                }
                                            }}>
                                            <Image
                                                styl={{
                                                    width: 60,
                                                    height: 60
                                                }}
                                                resizeMode={'contain'}
                                                source={require('../images/icon_start_playing.png')}
                                            />
                                        </TouchableOpacity>
                                    }
                                    {/* <Text style={{
                                        color: colors.white,
                                        fontFamily: CONSTANTS.MEDIUM,
                                        fontSize: dimensions.sizeRatio * 12
                                    }}>{this.state.recordTime}</Text> */}
                                    <TouchableOpacity
                                        activeOpacity={.9}
                                        style={{
                                            marginTop: 20
                                        }}
                                        onPress={() => {
                                            if (this.state.isStartPlaying) {
                                                this.onStopPlay('cancel_in_playing')
                                            } else {
                                                this.onStopPlay('not_playing_start')
                                            }
                                        }}>
                                        <Text style={{
                                            color: colors.white,
                                            fontFamily: CONSTANTS.MEDIUM,
                                            fontSize: dimensions.sizeRatio * 16
                                        }}>
                                            {'Close'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    }

                    {this.state.isProgress &&
                        <View
                            style={{
                                flex: 1,
                                width: '100%',
                                height: '100%',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0,
                                backgroundColor: colors._transparent
                            }}>
                            <View
                                style={{
                                    flex: 1,
                                    width: '100%',
                                    height: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: colors.transparent_theme
                                }}>
                                <ActivityIndicator size="large" color={colors.white} />
                                {this.state.progress != undefined && this.state.progress != null &&
                                    <Text style={{
                                        fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 16, color: colors.white
                                    }}>{Math.floor(this.state.progress * 100)}%</Text>
                                }
                                <Text style={{
                                    fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 16, color: colors.white
                                }}> {'Please wait while downloading audio file'} </Text>
                            </View>
                        </View>
                    }

                    {
                        this.dialogForImagePicker()
                    }
                </View>
            );
        }
    }
    keyExtractor = item => {
        return item.subject_id + new Date().getTime().toString() + (Math.floor(Math.random() * Math.floor(new Date().getTime()))).toString();
    };

    renderHeader = () => {
        return (
            <View
                style={{
                    width: '100%',
                    height: 55,
                    backgroundColor: colors.primary_dark,
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
                <Text style={{ fontSize: 16, fontFamily: CONSTANTS.DEMI, color: colors.white, textAlign: 'left', marginLeft: 15, width: '60%', }} numberOfLines={1}>
                    {this.props.navigation.getParam('title', '')}
                </Text>
                {this.props.navigation.state.params?.selectedItemObj?.MT_IS_RESOLVED == 0 &&
                    <Ripple
                        style={{
                            paddingHorizontal: 15,
                            paddingVertical: 5,
                            backgroundColor: 'red',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'absolute',
                            alignSelf: 'flex-end',
                            right: 0,
                            top: 0,
                            marginTop: 15,
                            marginRight: 10
                        }}
                        onPress={() => {
                            Alert.alert(
                                'IFAS APP',
                                'Are you sure to mark doubt as Resolved?',
                                [
                                    { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                    { text: 'OK', onPress: () => this.postResolvedApi() },
                                ],
                                { cancelable: false }
                            )
                        }}>
                        <Text style={{ fontSize: 13, fontFamily: CONSTANTS.DEMI, color: colors.white }}>
                            {'Resolved'}
                        </Text>
                    </Ripple>
                }
            </View>
        )
    }

    renderAudioAloneUI(item) {
        return (
            <View>

                {item.IS_SENDER == true ?
                    (
                        <View style={styles.chatMessageImageSender}>
                            <TouchableOpacity onPress={() => {
                                this.setState({
                                    selectedItemForPlaying: item,
                                }, () => {
                                    this.setState({
                                        isShowPlayingAudioView: true
                                    })
                                })
                            }} 
                            onLongPress={() => {
                                Alert.alert(
                                    'Delete Message..',
                                    'Are you want to delete this message?',
                                    [
                                        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                        {
                                            text: 'OK', onPress: () => {
                                                this.deleteMessageApi(item)
                                            }
                                        },
                                    ],
                                    { cancelable: false }
                                )
                            }}>
                                <Image
                                    source={require('../images/audio_player.jpg')}
                                    style={{
                                        width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio, borderRadius: 8 * dimensions.sizeRatio
                                    }}
                                />
                                {item.IS_DOWNLOAD_AUDIO == true ?
                                    null
                                    :
                                    <TouchableOpacity
                                        activeOpacity={.9}
                                        style={{
                                            padding: 5,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            position: "absolute",
                                            top: 0,
                                            bottom: 0,
                                            right: 0,
                                            left: 0,
                                            width: 221.5 * dimensions.sizeRatio,
                                            height: 110 * dimensions.sizeRatio,
                                            backgroundColor: colors.transparent_theme
                                        }}
                                        onPress={() => {
                                            this.checkNetInfo('downloading_file', item)
                                            //this.downloadVideoWithProgress(item)
                                        }}>
                                        <Image
                                            style={{
                                                width: 60,
                                                height: 60,
                                            }}
                                            resizeMode={'contain'}
                                            source={require('../images/icon_download_audio.png')}
                                        />
                                    </TouchableOpacity>
                                }
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.chatMessageImageReceiver}>
                            <TouchableOpacity onPress={() => {
                                this.setState({
                                    selectedItemForPlaying: item,
                                }, () => {
                                    this.setState({
                                        isShowPlayingAudioView: true
                                    })
                                })
                            }} >
                                <Image
                                    source={require('../images/audio_player.jpg')}
                                    style={{
                                        width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio, borderRadius: 8 * dimensions.sizeRatio
                                    }}
                                />
                                {item.IS_DOWNLOAD_AUDIO == true ?
                                    null
                                    :
                                    <TouchableOpacity
                                        activeOpacity={.9}
                                        style={{
                                            padding: 5,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            position: "absolute",
                                            top: 0,
                                            bottom: 0,
                                            right: 0,
                                            left: 0,
                                            width: 221.5 * dimensions.sizeRatio,
                                            height: 110 * dimensions.sizeRatio,
                                            backgroundColor: colors.transparent_theme
                                        }}
                                        onPress={() => {
                                            this.checkNetInfo('downloading_file', item)
                                            //this.downloadVideoWithProgress(item)
                                        }}>
                                        <Image
                                            style={{
                                                width: 60,
                                                height: 60,
                                            }}
                                            resizeMode={'contain'}
                                            source={require('../images/icon_download_audio.png')}
                                        />
                                    </TouchableOpacity>
                                }
                            </TouchableOpacity>
                        </View>
                    )}
            </View>
        )
    }

    renderRecordedView = () => {
        const { isShowRecordedView } = this.state;
        //console.warn('render Recorded' + this.state.isShowRecordedView)
        return (
            <Modal
                visible={isShowRecordedView}
                transparent={true}
                onRequestClose={() =>
                    this.setState({ isShowRecordedView: true })
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
                            height: '35%',
                            width: '70%',
                            paddingVertical: 10,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 20,

                        }}>
                        <Text style={{
                            color: colors.white,
                            fontFamily: CONSTANTS.MEDIUM,
                            fontSize: dimensions.sizeRatio * 18
                        }}>{'*Record Audio*'}</Text>
                        {this.state.isCommonHandlePlayingRecording == false ?
                            (this.state.isStartRecoding ?
                                <TouchableOpacity
                                    activeOpacity={.7}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        maringTop: 10,
                                        //borderRadius: 100 / 2,
                                        //borderWidth: 2,
                                        //borderColor: colors.transparent_theme,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onPress={() => {
                                        this.onStopRecord('stop_recording')
                                    }}>
                                    <Image
                                        styl={{
                                            width: 60,
                                            height: 60
                                        }}
                                        resizeMode={'contain'}
                                        source={require('../images/icon_stop_recoding.png')}
                                    />
                                </TouchableOpacity>
                                :
                                <TouchableOpacity
                                    activeOpacity={.7}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        maringTop: 10,
                                        //borderRadius: 100 / 2,
                                        //borderWidth: 2,
                                        //borderColor: colors.transparent_theme,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onPress={() => {
                                        //here start recoding maintain flag and etc.
                                        this.checkNetInfo('recording_start', undefined)
                                        //this.onStartRecord()
                                    }}>
                                    <Image
                                        styl={{
                                            width: 60,
                                            height: 60
                                        }}
                                        resizeMode={'contain'}
                                        source={require('../images/icon_start_recoding.png')}
                                    />
                                </TouchableOpacity>) :
                            (this.state.isRecordingComStartPlaying ?
                                <TouchableOpacity
                                    activeOpacity={.7}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        maringTop: 10,
                                        //borderRadius: 100 / 2,
                                        //borderWidth: 2,
                                        //borderColor: colors.transparent_theme,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onPress={() => {
                                        this.onStopPlayInRecodingModal('playing_start')
                                    }}>
                                    <Image
                                        styl={{
                                            width: 60,
                                            height: 60
                                        }}
                                        resizeMode={'contain'}
                                        source={require('../images/icon_stop_playing.png')}
                                    />
                                </TouchableOpacity>
                                :
                                <TouchableOpacity
                                    activeOpacity={.7}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        maringTop: 10,
                                        //borderRadius: 100 / 2,
                                        //borderWidth: 2,
                                        //borderColor: colors.transparent_theme,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onPress={() => {
                                        //here start playing maintain flag and etc.
                                        if (this.state.savedaudioFileForApi != undefined) {
                                            this.onStartPlayInRecodingModal(this.state.savedaudioFileForApi)
                                        }
                                    }}>
                                    <Image
                                        styl={{
                                            width: 60,
                                            height: 60
                                        }}
                                        resizeMode={'contain'}
                                        source={require('../images/icon_start_playing.png')}
                                    />
                                </TouchableOpacity>)

                        }

                        {this.state.isCommonHandlePlayingRecording == false && <Text style={{
                            color: colors.white,
                            fontFamily: CONSTANTS.MEDIUM,
                            fontSize: dimensions.sizeRatio * 12
                        }}>{this.state.recordTime}</Text>
                        }
                        <View style={{
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: this.state.isCommonHandlePlayingRecording ? 'space-between' : 'center',
                            alignItems: 'center',
                            padding: 5
                        }}>
                            {this.state.isCommonHandlePlayingRecording &&
                                <TouchableOpacity
                                    activeOpacity={.9}
                                    style={{
                                        marginTop: 20
                                    }}
                                    onPress={() => {
                                        if (this.state.isRecordingComStartPlaying) {
                                            if (Platform.OS == 'android') {
                                                this.audioRecorderStartStop.stopPlayer();
                                                this.audioRecorderStartStop.removePlayBackListener();
                                            } else {
                                                // Starts playing it
                                                this.audioRecorderStartStop.stopPlayer();
                                                this.audioRecorderStartStop.removePlayBackListener();
                                                //TrackPlayer.stop();
                                            }
                                        }
                                        this.setState({
                                            isStartRecoding: false,
                                            isShowRecordedView: false,
                                            isRecordingComStartPlaying: false,
                                            isCommonHandlePlayingRecording: false
                                        }, () => {
                                            this.sendChatMessage()
                                        })
                                    }}>
                                    <Text style={{
                                        color: colors.white,
                                        fontFamily: CONSTANTS.MEDIUM,
                                        fontSize: dimensions.sizeRatio * 16,
                                        padding: 5
                                    }}>
                                        {'SEND'}
                                    </Text>
                                </TouchableOpacity>
                            }
                            <TouchableOpacity
                                activeOpacity={.9}
                                style={{
                                    marginTop: 20
                                }}
                                onPress={() => {
                                    if (this.state.isCommonHandlePlayingRecording == false) {
                                        console.warn('entrr1')
                                        this.onStopRecord('cancel')
                                    } else {
                                        console.warn('entrr2')
                                        this.onStopPlayInRecodingModal('cancel')
                                    }
                                }}>
                                <Text style={{
                                    color: colors.white,
                                    fontFamily: CONSTANTS.MEDIUM,
                                    fontSize: dimensions.sizeRatio * 16,
                                    padding: 5
                                }}>
                                    {'CANCEL'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }

    dialogForImagePicker() {

        return (
            <Dialog
                // ('none', 'slide', 'fade')
                contentStyle={{
                    padding: 0,
                    height: 200,
                    backgroundColor: colors.white
                    //paddingBottom: FONT_AND_SPACE.SPACE_15
                }}
                animationType={'fade'}
                visible={this.state.isImagePicker}
                onTouchOutside={() => {
                    this.setState({
                        isImagePicker: false
                    })
                }
                } >
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        width: '100%',
                        padding: 10,
                        backgroundColor: colors.white
                    }}>
                    <View
                        style={{
                            paddingBottom: 10,
                            justifyContent: 'center'
                        }}>
                        <Text style={{
                            color: colors.black,
                            fontSize: 16,
                            fontWeight: Platform.OS == 'android' ? '700' : '600'
                        }}>
                            {'Select Image From'}</Text>
                    </View>
                    <View
                        style={{
                            flexDirection: 'column',
                            backgroundColor: colors.white
                        }}>
                        <TouchableOpacity
                            activeOpacity={.5}
                            onPress={() => {
                                this.setState({
                                    isImagePicker: false
                                })
                                setTimeout(() => {
                                    this.selectProfilePic("Camera")
                                }, 1000)
                            }}
                            style={{
                                marginTop: 20,
                            }}>
                            <Text style={{
                                color: colors.black,
                                fontSize: 16,
                                fontWeight: Platform.OS == 'android' ? '700' : '600'
                            }}>
                                {'Take Photo'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={.5}
                            onPress={() => {
                                this.setState({
                                    isImagePicker: false
                                })
                                setTimeout(() => {
                                    this.selectProfilePic("Gallery")
                                }, 1000)
                            }}
                            style={{
                                marginTop: 20,
                            }}>
                            <Text style={{
                                color: colors.black,
                                fontSize: 16,
                                fontWeight: Platform.OS == 'android' ? '700' : '600'
                            }}>
                                {'Choose From Gallery'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={.5}
                            onPress={() => {
                                this.setState({
                                    isSingleImage: false,
                                    isImagePicker: false
                                })
                            }}
                            style={{
                                marginTop: 20,
                            }}>
                            <Text style={{
                                color: colors.black_dark,
                                fontSize: 14,
                                fontWeight: '700',
                                textAlign: 'right'
                            }}>
                                {'Cancel'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Dialog>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f3f3'
    },
    MessageView: {
        flexDirection: 'row',
        width: '100%',
        height: '100%'
    },
    MessageImageView: {
        width: 59.5 * dimensions.sizeRatio,
        height: '100%'
    },
    Dropdown: {
        width: 10 * dimensions.sizeRatio,
        height: 7 * dimensions.sizeRatio,
        right: 20 * dimensions.sizeRatio,
        position: 'absolute'
    },
    headerTitleStyle: {
        //fontWeight: 'Semibold',
        fontFamily: 'OpenSans-Semibold',
        fontSize: 27.5 * dimensions.sizeRatio,
        position: 'absolute',
        bottom: 16.5,
        left: 23,
    },
    TextInputStyle: {
        fontSize: 17 * dimensions.sizeRatio,
        fontFamily: CONSTANTS.REGULAR,
        color: colors.night,
        flex: 1,
        textAlignVertical: 'top'
    },
    ScrollStyle: {
        flex: 1
    },
    TextInputHeaderStyle: {
        marginTop: topPadding,
        fontSize: 15 * dimensions.sizeRatio,
        fontFamily: CONSTANTS.DEMI,
        color: colors.theme,
        marginHorizontal: leftPadding * dimensions.sizeRatio,

    },
    TextInputBottomBorderStyle: {
        backgroundColor: colors.white,
        marginHorizontal: leftPadding,
        height: 50 * dimensions.sizeRatio,
        paddingVertical: 5 * dimensions.sizeRatio,
        paddingHorizontal: 20 * dimensions.sizeRatio,
        flexDirection: 'row',
        marginTop: 6.5 * dimensions.sizeRatio,
        borderRadius: 5 * dimensions.sizeRatio,
        alignItems: 'center'

    },
    UplodImageText: {
        fontSize: 15 * dimensions.sizeRatio,
        fontFamily: CONSTANTS.DEMI,
        color: colors.uploadGrey,
        marginLeft: 16 * dimensions.sizeRatio

    },
    SubmitButton: {
        marginTop: topPadding * dimensions.sizeRatio,
        borderRadius: 5 * dimensions.sizeRatio,
        backgroundColor: colors.theme,
        marginHorizontal: leftPadding,
        height: 50 * dimensions.sizeRatio,
        justifyContent: 'center',
        alignItems: 'center'
    },
    SubmitText: {
        color: colors.white,
        textAlign: 'center',
        fontSize: 15 * dimensions.sizeRatio,
        fontFamily: CONSTANTS.DEMI
    },
    chatSendMessageContainer: {
        width: "100%",
        minHeight: 54 * dimensions.sizeRatio,
        maxHeight: 100,
        //marginBottom: Platform.OS === "ios" ? keyboardHeight + 54 * dimensions.sizeRatio :0,
        //marginTop: 10 * dimensions.sizeRatio,
        backgroundColor: colors.white,
        flexDirection: "row",
        alignItems: 'center',
    },
    icSendMessage: {
        width: 20 * dimensions.sizeRatio,
        height: 18 * dimensions.sizeRatio,
        resizeMode: "contain",
        alignSelf: 'center',
        // marginRight: 23.5 * dimensions.sizeRatio
    },
    icMessagePlaceholder: {
        width: 20 * dimensions.sizeRatio,
        height: 17 * dimensions.sizeRatio,
        resizeMode: "contain",
        alignSelf: 'center',
    },
    chatMessageSender: {
        backgroundColor: colors.white,
        borderRadius: 8 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio,
        marginRight: 20.5 * dimensions.sizeRatio,
        // padding: 5 * dimensions.sizeRatio,
        alignSelf: "flex-end",
        marginLeft: 60 * dimensions.sizeRatio
    },
    chatMessageReceiver: {
        backgroundColor: '#093679',
        borderRadius: 8 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio,
        marginLeft: 20.5 * dimensions.sizeRatio,
        // padding: 5 * dimensions.sizeRatio,
        alignSelf: "flex-start",
        marginRight: 60 * dimensions.sizeRatio
    },
    chatMessageImageSender: {
        backgroundColor: colors.white,
        borderRadius: 8 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio,
        marginRight: 20.5 * dimensions.sizeRatio,
        // padding: 5 * dimensions.sizeRatio,
        alignSelf: "flex-end",
        marginLeft: 60 * dimensions.sizeRatio
    },

    chatMessageImageReceiver: {
        backgroundColor: '#093679',
        borderRadius: 8 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio,
        marginLeft: 20.5 * dimensions.sizeRatio,
        // padding: 5 * dimensions.sizeRatio,
        alignSelf: "flex-start",
        marginRight: 60 * dimensions.sizeRatio
    },
    chatImageSender: {
        borderRadius: 8 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio,
        marginRight: 13.5 * dimensions.sizeRatio,
        // padding: 5 * dimensions.sizeRatio,
        alignSelf: "flex-end",
        marginLeft: 60 * dimensions.sizeRatio
    },

    chatImageReceiver: {
        borderRadius: 8 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio,
        marginLeft: 13.5 * dimensions.sizeRatio,
        // padding: 5 * dimensions.sizeRatio,
        alignSelf: "flex-start",
        marginRight: 60 * dimensions.sizeRatio
    },

    chatContainer: {
        // width: "100%",
        // height: '100%',
        flex: 1,
        backgroundColor: colors.chatBG,
        //marginBottom: 54 * dimensions.sizeRatio,
    },
    chatHistoryMessageReceiver: {
        color: colors.white,
        fontSize: 17 * dimensions.sizeRatio,
        fontFamily: CONSTANTS.MEDIUM,
        alignSelf: 'flex-start',
        marginRight: 17 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginLeft: 13.5 * dimensions.sizeRatio
    },
    chatHistoryMessageSender: {
        color: colors.night,
        fontSize: 17 * dimensions.sizeRatio,
        fontFamily: CONSTANTS.MEDIUM,
        alignSelf: 'flex-end',
        textAlign: 'right',
        marginRight: 13.5 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginLeft: 17 * dimensions.sizeRatio
    },
    textChatMessage: {
        marginHorizontal: 10 * dimensions.sizeRatio,
        flex: 1,
        //flexWrap: "wrap",
        textAlign: "left",
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14 * dimensions.sizeRatio,
        fontFamily: CONSTANTS.DEMI,
        color: colors.black_33
    },
    textChatTimeReceiver: {
        color: colors.white,
        opacity: 0.3,
        fontSize: 15 * dimensions.sizeRatio,
        alignSelf: 'flex-start',
        // padding: 5 * dimensions.sizeRatio,
        fontFamily: CONSTANTS.MEDIUM,
        marginTop: 10.5 * dimensions.sizeRatio,
        // marginLeft: 11 * dimensions.sizeRatio,
        marginHorizontal: 13.5 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio

    },
    textChatTimeSender: {
        color: colors.night,
        opacity: 0.3,
        fontSize: 15 * dimensions.sizeRatio,
        alignSelf: "flex-end",
        // padding: 5 * dimensions.sizeRatio,
        fontFamily: CONSTANTS.MEDIUM,
        marginTop: 10.5 * dimensions.sizeRatio,
        marginHorizontal: 13.5 * dimensions.sizeRatio,
        // marginRight: 13.5 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio
    }
});



// onStartPlay = async (audioPath) => {
//     console.warn('onStartPlay' + audioPath)
//     this.setState({
//         isStartPlaying: true
//     })

//     // Creates the player
//     TrackPlayer.setupPlayer({}).then(async () => {

//         // Adds a track to the queue
//         await TrackPlayer.add({
//             id: 'IFASID',
//             url: audioPath,
//             title: 'IFAS',
//             artist: 'IFAS Artist',
//         });

//         // Starts playing it
//         TrackPlayer.play();

//     });
//     // const path = Platform.select({
//     //     ios: audioPath,
//     //     android: audioPath,
//     // })
//     // this.setState({
//     //     isStartPlaying: true
//     // })
//     // const msg = await this.audioRecorderStartStop.startPlayer(path)
//     // this.audioRecorderStartStop.setVolume(1.0)
//     // console.log(msg)
//     // this.audioRecorderStartStop.addPlayBackListener((e) => {
//     //     if (e.current_position === e.duration) {
//     //         console.log('finished')
//     //         this.audioRecorderStartStop.stopPlayer().then(() => {
//     //             this.setState({
//     //                 isShowPlayingAudioView: false
//     //             })
//     //         })
//     //     }
//     //     // this.setState({
//     //     //     currentPositionSec: e.current_position,
//     //     //     currentDurationSec: e.duration,
//     //     //     playTime: this.audioRecorderStartStop.mmssss(
//     //     //         Math.floor(e.current_position),
//     //     //     ),
//     //     //     duration: this.audioRecorderStartStop.mmssss(Math.floor(e.duration)),
//     //     // })
//     // })
// }





// renderPlayingAudioView = () => {
//     const { isShowPlayingAudioView } = this.state;
//     console.warn('render Playing' + this.state.isShowPlayingAudioView)
//     return (
//         <Modal
//             visible={isShowPlayingAudioView}
//             transparent={true}
//             onRequestClose={() =>
//                 this.setState({ isShowPlayingAudioView: true })
//             }
//         >
//             <View
//                 style={{
//                     flex: 1,
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                 }}>
//                 <View
//                     style={{
//                         backgroundColor: colors.theme,
//                         height: '30%',
//                         width: '70%',
//                         paddingVertical: 10,
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                         borderRadius: 20,

//                     }}>
//                     <Text style={{
//                         color: colors.white,
//                         fontFamily: CONSTANTS.MEDIUM,
//                         fontSize: dimensions.sizeRatio * 18
//                     }}>{'*Playing Audio*'}</Text>

//                     {this.state.isStartPlaying ?
//                         <TouchableOpacity
//                             activeOpacity={.7}
//                             style={{
//                                 width: 100,
//                                 height: 100,
//                                 maringTop: 10,
//                                 //borderRadius: 100 / 2,
//                                 //borderWidth: 2,
//                                 //borderColor: colors.transparent_theme,
//                                 alignItems: 'center',
//                                 justifyContent: 'center'
//                             }}
//                             onPress={()=>{
//                                 if(this.state.isStartPlaying){
//                                 this.onStopPlay('playing_start')
//                                 }else{
//                                     this.onStopPlay('not_playing_start')
//                                 }
//                             }}>
//                             <Image
//                                 styl={{
//                                     width: 60,
//                                     height: 60
//                                 }}
//                                 resizeMode={'contain'}
//                                 source={require('../images/icon_stop_playing.png')}
//                             />
//                         </TouchableOpacity>
//                         :
//                         <TouchableOpacity
//                             activeOpacity={.7}
//                             style={{
//                                 width: 100,
//                                 height: 100,
//                                 maringTop: 10,
//                                 //borderRadius: 100 / 2,
//                                 //borderWidth: 2,
//                                 //borderColor: colors.transparent_theme,
//                                 alignItems: 'center',
//                                 justifyContent: 'center'
//                             }}
//                             onPress={() => {
//                                 //here start playing maintain flag and etc.
//                                 this.setState({
//                                     isStartPlaying: true
//                                 })
//                             }}>
//                             <Image
//                                 styl={{
//                                     width: 60,
//                                     height: 60
//                                 }}
//                                 resizeMode={'contain'}
//                                 source={require('../images/icon_start_playing.png')}
//                             />
//                         </TouchableOpacity>
//                     }
//                     <Text style={{
//                         color: colors.white,
//                         fontFamily: CONSTANTS.MEDIUM,
//                         fontSize: dimensions.sizeRatio * 12
//                     }}>{this.state.recordTime}</Text>
//                     <TouchableOpacity
//                         activeOpacity={.9}
//                         style={{
//                             marginTop: 20
//                         }}
//                         onPress={() => {
//                             this.setState({
//                                 isShowPlayingAudioView: false
//                             })
//                         }}>
//                         <Text style={{
//                             color: colors.white,
//                             fontFamily: CONSTANTS.MEDIUM,
//                             fontSize: dimensions.sizeRatio * 16
//                         }}>
//                             {'Close'}
//                         </Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         </Modal>
//     )
// }

    // handleKeyboardDidShow = (event) => {
    //     console.log('show')
    //     // this.flatListRef.scrollToEnd();
    //     // return
    //     console.log('key')
    //     const { height: windowHeight } = Dimensions.get("window");
    //     const keyboardHeight = event.endCoordinates.height;
    //     const currentlyFocusedField = TextInputState.currentlyFocusedField();
    //     UIManager.measure(
    //         currentlyFocusedField,
    //         (originX, originY, width, height, pageX, pageY) => {
    //             const fieldHeight = height;
    //             const fieldTop = pageY;
    //             const gap = windowHeight - keyboardHeight - (fieldTop + fieldHeight);
    //             if (gap >= 0) {
    //                 return;
    //             }
    //             Animated.timing(this.state.shift, {
    //                 toValue: gap,
    //                 duration: 0,
    //                 useNativeDriver: true
    //             }).start();
    //         }
    //     );
    // };



  // <Animated.View
            //     style={[
            //         styles.chatContainer,
            //         { transform: [{ translateY: shift }] }
            //     ]}
            // >
            //     <View style={styles.chatContainer}>
            //     <Loader
            //         loading={this.state.isLoading}
            //     />
            //     {this.renderFlatListHeader()}
            //     <View style={{
            //             marginTop: 0,
            //             width: "100%",
            //             paddingBottom: 50 * dimensions.sizeRatio,
            //             // backgroundColor:'red',
            //             flexGrow: 0
            //         }}>
            //         <FlatList
            //             inverted
            //             ref={(ref) => { this.flatListRef = ref; }}
            //             scrollEnabled={true}
            //             // initialNumToRender={this.limit}
            //             // initialNumToRender={this.indexToScrollTo + 1}
            //             showsVerticalScrollIndicator={false}
            //             data={this.state.dataSource}
            //             // initialScrollIndex={this.state.dataSource.length - 1}
            //             extraData={this.state}
            //             style={{
            //                 marginTop: 0,
            //                 width: "100%",
            //                 marginBottom: 64 * dimensions.sizeRatio,
            //                 flexGrow: 0
            //                 // backgroundColor: 'red'
            //             }}
            //             renderItem={({ item }) => (
            //                 (item.M_IMAGE != '' ? (item.M_MESSAGE == '' ? this.renderImageAloneUI(item) : this.renderMessageImageUI(item)) : this.renderMessageAloneUI(item))

            //                 /*<View>
            //                     {item.IS_SENDER == true ? (item.M_IMAGE == '' ? (
            //                         <View style={styles.chatMessageSender}>
            //                             <Text style={styles.chatHistoryMessageSender}>
            //                                 {item.M_MESSAGE}
            //                             </Text>
            //                             <Text style={styles.textChatTimeSender}>{moment(item.M_CREATED_AT).format('DD-MMM-YYYY hh:mm A')}</Text>
            //                         </View>
            //                     ) : (
            //                             <View style={styles.chatMessageImageSender}>
            //                                 <Image
            //                                     source={require('../images/MessagePlaceholder.png')}
            //                                     style={{height:'100%',width:'100%'}}
            //                                 />
            //                             </View>
            //                         )) : (item.M_IMAGE == '' ? (
            //                             <View style={styles.chatMessageReceiver}>
            //                                 <Text style={styles.chatHistoryMessageReceiver}>
            //                                     {item.M_MESSAGE}
            //                                 </Text>
            //                                 <Text style={styles.textChatTimeReceiver}>{moment(item.M_CREATED_AT).format('DD-MMM-YYYY hh:mm A')}</Text>
            //                             </View>
            //                         ) : (
            //                                 <View style={styles.chatMessageImageReceiver}>
            //                                     <Image
            //                                         source={require('../images/MessagePlaceholder.png')}
            //                                         style={{ height: '100%', width: '100%' }}
            //                                     />
            //                                 </View>
            //                             ))}
            //                 </View>*/
            //             )}
            //             keyExtractor={(item, index) => index.toString()}
            //             numColumns={1}
            //             // onEndReachedThreshold={0.3}
            //             // onEndReached={this.onEndReached}
            //             // onContentSizeChange={this.scrollBottom == true ? this.scrollTOBottom(this.state.dataSource.length - 1) : this.scrollTOBottom(this.limit)}
            //             // onScroll={this.handleScroll}
            //             // onScrollToIndexFailed={(error) => {
            //             //     // this.flatListRef.scrollToOffset({ offset: error.averageItemLength * error.index, animated: false });
            //             //     setTimeout(() => {
            //             //         console.log('this.state.dataSource', this.state.dataSource,this.scrollBottom)
            //             //         if (this.state.dataSource.length !== 0 && this.flatListRef !== null) {
            //             //             this.flatListRef.scrollToIndex({ index:this.scrollBottom == true ? this.scrollTOBottom(this.state.dataSource.length - 1) : this.scrollTOBottom(1), animated: false });
            //             //         }
            //             //     }, 200);
            //             // }}
            //             />
            //         </View>

            //     <View style={styles.chatSendMessageContainer}>
            //         <TouchableOpacity
            //             style={{
            //                 width: 43 * dimensions.sizeRatio,
            //                 height: 43 * dimensions.sizeRatio,
            //                 justifyContent: 'center',
            //                 alignItems: 'center',
            //                 position: "absolute",
            //                 left: 0
            //             }}
            //             onPress={this.choosePhoto.bind(this)}
            //         >
            //             <Image
            //                 source={require('../images/MessagePlaceholder.png')}
            //                 style={styles.icMessagePlaceholder}
            //             />
            //         </TouchableOpacity>
            //         <TextInput
            //             returnKeyType="done"
            //             multiline={true}
            //             defaultWhite={false}
            //             placeholder={textInputPlaceholders.sendMessage}
            //             underlineColorAndroid="transparent"
            //             style={styles.textChatMessage}
            //             keyboardType="default"
            //             value={this.state.sendMessage}
            //             onChangeText={sendMessage => this.setState({ sendMessage })}
            //             onSubmitEditing={() => {
            //                 Keyboard.dismiss();
            //             }}
            //         />

            //         <TouchableOpacity
            //             style={{
            //                 width: 43 * dimensions.sizeRatio,
            //                 height: 43 * dimensions.sizeRatio,
            //                 justifyContent: 'center',
            //                 alignItems: 'center',
            //                 position: "absolute",
            //                 right: 0
            //             }}
            //             onPress={this.sendChatMessage()}
            //         >
            //             <Image
            //                 source={require('../images/send_message.png')}
            //                 style={styles.icSendMessage}
            //             />
            //         </TouchableOpacity>
            //     </View>
            //     </View>
            // </Animated.View>



        // else {
        //     if (this.offset <= 2) {
        //         return
        //     }
        //     this.setState(state => {
        //         var currArr = state.dataSource;

        //         // currArr.unshift.apply(currArr, responseJson.data);
        //         currArr.splice(0, 0, this.currentResponse.data[this.state.dataSource.length -this.currentArr.length]);
        //         console.log(currArr)
        //         state.isLoading = false
        //         isRefreshFetching = false,
        //             fetching_from_server = false,
        //             subjectId = this.currentResponse.msgThread.MT_SUB_ID,
        //             messageTitle = this.currentResponse.msgThread.MT_TITLE
        //         return state;
        //     }) 
        // }
        // this.flatListRef.scrollToOffset(false, (1000 + this.state.dataSource.length))
        // this.scrollTOBottom(1)




//Design part


        // if (this.state.isLoading) {
        //     return (
        //         <Loader
        //             loading={this.state.isLoading}
        //         /> 
        //         // <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        //         //     {renderIf(Platform.OS != 'ios',
        //         //         <StatusBar
        //         //             barStyle="dark-content"
        //         //             backgroundColor={colors.theme}
        //         //         />
        //         //     )}
        //         //     <ActivityIndicator />
        //         //     <Text style={{ top: 10, fontSize: (dimensions.sizeRatio * 20), textAlignVertical: "center", color: colors.black, fontFamily: CONSTANTS.DEMI }}>
        //         //         Please wait...
        //         //     </Text>


        //         // </View>




        //     )
        // }

            // <Container>
            //     {this.renderFlatListHeader()}
            //     <Content
            //         alwaysBounceVertical={false}
            //         contentContainerStyle={{ flex: 1 }}>
            //         <View style={styles.chatContainer}>
            //             <Loader
            //                 loading={this.state.isLoading}
            //             />
            //             <FlatList
            //                 inverted
            //                 alwaysBounceVertical={false}
            //                 showsVerticalScrollIndicator={false}
            //                 ref={(ref) => { this.flatListRef = ref; }}
            //                 data={this.state.dataSource}
            //                 renderItem={({ item }) => (
            //                     (item.M_IMAGE != '' ? (item.M_MESSAGE == '' ? this.renderImageAloneUI(item) : this.renderMessageImageUI(item)) : this.renderMessageAloneUI(item))
            //                 )}
            //                 keyExtractor={(item, index) => index.toString()}
            //                 numColumns={1}

            //             />

            //             <View style={styles.chatSendMessageContainer}>
            //                 <TouchableOpacity
            //                     style={{
            //                         width: 43 * dimensions.sizeRatio,
            //                         height: 43 * dimensions.sizeRatio,
            //                         justifyContent: 'center',
            //                         alignItems: 'center',
            //                         marginLeft: 0
            //                     }}
            //                     onPress={() => {
            //                         if (this.state.isImagePick == false) {
            //                             this.choosePhoto()
            //                         }
            //                     }}
            //                 >
            //                     <Image
            //                         source={this.state.isImagePick == false ?
            //                             require('../images/MessagePlaceholder.png')
            //                             : {
            //                                 uri: this.state.imageToSend.uri,
            //                             }}
            //                         style={styles.icMessagePlaceholder}
            //                     />
            //                 </TouchableOpacity>

            //                 <TextInput
            //                     returnKeyType="done"
            //                     multiline={true}
            //                     defaultWhite={false}
            //                     placeholder={textInputPlaceholders.sendMessage}
            //                     underlineColorAndroid="transparent"
            //                     style={styles.textChatMessage}
            //                     keyboardType="default"
            //                     value={this.state.sendMessage}
            //                     onChangeText={sendMessage => this.setState({ sendMessage })}
            //                     onSubmitEditing={() => {
            //                         Keyboard.dismiss();
            //                     }}
            //                 />

            //                 <TouchableOpacity
            //                     style={{
            //                         width: 43 * dimensions.sizeRatio,
            //                         height: 43 * dimensions.sizeRatio,
            //                         justifyContent: 'center',
            //                         alignItems: 'center',
            //                         position: "absolute",
            //                         right: 0
            //                     }}
            //                     onPress={this.sendChatMessage()}
            //                 >
            //                     <Image
            //                         source={require('../images/send_message.png')}
            //                         style={styles.icSendMessage}
            //                     />
            //                 </TouchableOpacity>
            //             </View>
            //         </View>
            //     </Content>
            // </Container>
