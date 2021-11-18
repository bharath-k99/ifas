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
    Image, TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl, NativeEventEmitter, NativeModules, StyleSheet, TextInput,
    BackHandler, Modal, PermissionsAndroid, Keyboard
} from 'react-native';
import colors from '../../resources/colors';
import renderIf from '../../resources/utility.js';
import dimensions from '../../resources/dimension';
import CONSTANTS, { constantStrings, textInputPlaceholders } from '../../resources/constants.js'
import { showNativeAlert } from '../../resources/app_utility.js'
import { NavigationEvents } from 'react-navigation';

//Using this for handle start conference
import Orientation from 'react-native-orientation';
import { EventRegister } from 'react-native-event-listeners';
import ImagePicker from 'react-native-image-picker';
import ImagePicker2 from 'react-native-image-crop-picker';
import { Dialog } from 'react-native-simple-dialogs';
import FastImage from 'react-native-fast-image'
import NetInfo from "@react-native-community/netinfo";
import Ripple from 'react-native-material-ripple';
import CardView from 'react-native-cardview';
import Toast from 'react-native-tiny-toast';
import moment from "moment";
import RNBackgroundDownloader from 'react-native-background-downloader';
//sound player
import Sound from 'react-native-sound';
import { AudioRecorder, AudioUtils } from 'react-native-audio';
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

import BackButton from 'react-native-vector-icons/MaterialIcons';
import { Item } from 'native-base';
const backButton = <BackButton name="arrow-back" size={28} color={colors.black} />;

let isRecordingGloble = false;
const leftPadding = 26 * dimensions.sizeRatio;
const topPadding = 19.5 * dimensions.sizeRatio;
export default class GroupchatMessage extends Component {


    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isRecording: false,
            access_token: '',
            dataSource: [],
            sendMessage: '',
            imageToSend: '',
            isImagePick: false,

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

            //is first time loader
            isFirstTimeLoader: true
        }
        this.offset = 1;
        this.limit = 10000000;
        this.pageCount = 0;
        this.scrollBottom = true;
        isRecordingGloble = false
        Orientation.lockToPortrait();
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

        //sound player
        this.sound = undefined;

        this.timerHandle = undefined;
    }

    getAccessToken() {
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                this.offset = 1;
                self.setState({
                    access_token: value.slice(1, -1),
                    dataSource: []
                }, () => {
                    self.getChatDetail()
                })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

        global.navigation = this.props.navigation

        // Recording of
        if (Platform.OS == 'ios') {
            this.addListener()
        }

        //call api after did Focus
        const { navigation } = this.props;
        this.focusListener = navigation.addListener('didFocus', () => {
            global.isChatLiveSessionVisible = false;
            this.getAccessToken()
        })

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

                isRecordingGloble = true
                this.setState({
                    isRecording: true
                })
            }
            else {
                isRecordingGloble = false
                this.setState({ isRecording: false }, () => {
                    console.warn('CAPTURE_SESSIONS3' + '\n\n' + JSON.stringify(res) + '\n\n' + this.state.isRecording)
                })
            }

        })
    }

    componentWillUnmount() {
        console.log("Unmounted Categories")
        this.focusListener.remove();
        EventRegister.removeEventListener(this.listener);
        if (Platform.OS === "ios") {
            this.screenCaptureEnabled.remove()
        }

        if (this.timerHandle) {                  // ***
            // Yes, clear it                     // ***
            clearTimeout(this.timerHandle);      // ***
            this.timerHandle = 0;                // ***
        }
    }

    getChatDetail() {
        if (this.state.isFirstTimeLoader) {
            this.setState({
                isLoading: true
            });
        }
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('course_id', global.landingScreenPaidItem.id);
        console.log(formData)

        fetch(CONSTANTS.BASE_CHAT + CONSTANTS.POST_GROUP_LIST_NEW, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log('chat detail response', responseJson)
                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                }
                else if (responseJson.code == 220) {
                    this.setState({
                        isFirstTimeLoader: false,
                        isLoading: false,
                        isRefreshFetching: false,
                        fetching_from_server: false,
                        dataSource:[]
                    })
                }
                else {
                    let currArr = responseJson.data;
                    //Create new array file for find saved audio file in storage
                    //let newChatArray = currArr.map((element2, index, arary) => {
                    currArr.forEach(element2 => {
                        if (element2.GM_AUDIO != null && element2.GM_AUDIO != '') {
                            this.checkForAudioLocalPath(element2.GM_AUDIO).then((res) => {
                                if (res) {
                                    const dirs = RNFetchBlob.fs.dirs
                                    let videoPath = dirs.DocumentDir + `/RecordedAudioFiles/${element2.GM_AUDIO}`
                                    element2.IS_DOWNLOAD_AUDIO = true
                                    element2.DOWNLOADED_AUDIO_PATH = videoPath
                                    console.log('video_found_' + res + '.\n\n' + videoPath)
                                } else {
                                    element2.IS_DOWNLOAD_VIDEO = false
                                    element2.DOWNLOADED_VIDEO_PATH = ''
                                    console.log('not_found' + 'Not found any downloaded video path!')
                                }
                            })
                        }
                    })
                    setTimeout(() => {
                        this.setState({
                            isFirstTimeLoader: false,
                            isLoading: false,
                            isRefreshFetching: false,
                            dataSource: [...responseJson.data],
                            fetching_from_server: false,
                        });
                    }, 500);
                    this.timerHandle = setTimeout(() => {
                        this.getChatDetail()
                        this.timerHandle = 0;
                    }, 5000);
                }
            })
            .catch((error) => {
                this.setState({
                    dataSource: [],
                    isFirstTimeLoader: false,
                    isLoading: false,
                    isRefreshFetching: false,
                    errorMessage: 'Failed to fetch your messages.'
                })
            });
    }

    sendMessageApi() {
        let message = this.state.sendMessage
        this.setState({
            isLoading: true
        });

        var data = new FormData();
        data.append("access_token", this.state.access_token);
        data.append('course_id', global.landingScreenPaidItem.id);

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
            data.append("msg", '');
        }
        console.warn('addnew support response', data)
        console.log(CONSTANTS.BASE_CHAT + CONSTANTS.POST_GROUP_SEND_NEW)
        let header = {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
        }
        console.log(header)

        return fetch(CONSTANTS.BASE_CHAT + CONSTANTS.POST_GROUP_SEND_NEW, { method: 'POST', headers: header, body: data })
            .then((response) => response.json())
            .then((responseJson) => {
                console.warn('responseJson' + JSON.stringify(responseJson))
                this.setState({
                    isLoading: false
                });
                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                    console.log('responseJson1')
                } else if (responseJson.code == 1) {
                    this.setState({
                        sendMessage: '',
                        imageToSend: '',
                        isImagePick: false,
                    })
                    //this.getChatDetail()
                }
                else if (responseJson.code == 218) {
                    console.log('responseJson3')
                    Alert.alert('IFAS', responseJson.message);
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


    logoutUser() {
        showNativeAlert(CONSTANTS.LOGOUT_MESSAGE)
        CONSTANTS.IS_LOGGED_IN = false
        this.props.navigation.popToTop()

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
                    //console.warn('audio_exist' + JSON.stringify(exist) + '\n' + videoPath)
                    return exist
                }
                else {
                    //console.warn('audio_not_exist')
                    return false
                }
                //console.log(`file ${exist ? '' : 'not'} exists`)
            })
            .catch((error) => {
                console.warn('audio_exist_error' + error)
                return false
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
                    //console.warn('Then, is ' + (isConnected ? 'online' : 'offline'));
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
            //console.warn('entrr12')
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
            directoryPath = dirs.DocumentDir + `/RecordedAudioFiles/${rowItem.GM_AUDIO}`
        } else {
            directoryPath = dirs.DocumentDir + `/RecordedAudioFiles/${rowItem.GM_AUDIO}`
        }

        taskStartDownloading = RNBackgroundDownloader.download({
            id: `file_${rowItem.M_ID}`,
            url: CONSTANTS.BASE_IMG_URL + rowItem.GM_AUDIO,
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


            this.checkForAudioLocalPath(element2.GM_AUDIO).then((res) => {
                if (res) {
                    const dirs = RNFetchBlob.fs.dirs
                    let videoPath = '';
                    if (Platform.OS == 'android') {
                        videoPath = dirs.DocumentDir + `/RecordedAudioFiles/${element2.GM_AUDIO}`
                    } else {
                        videoPath = dirs.DocumentDir + `/RecordedAudioFiles/${element2.GM_AUDIO}`
                    }
                    element2.IS_DOWNLOAD_AUDIO = true
                    element2.DOWNLOADED_AUDIO_PATH = videoPath
                    //console.warn('video_found_' + res + '.\n\n' + videoPath)
                } else {
                    element2.IS_DOWNLOAD_VIDEO = false
                    element2.DOWNLOADED_VIDEO_PATH = ''
                    //console.warn('not_found' + 'Not found any downloaded video path!')
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

    separatorItemComponent = () => {
        return (
            <View
                style={{
                    width: '100%',
                    height: 3,
                    backgroundColor: colors._transparent,
                }}
            >

            </View>
        );

    }

    selectProfilePic = (selectType) => {
        if (selectType == "Camera") {
            ImagePicker2.openCamera({
                width: 300,
                height: 400,
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
                cropping: false,
                mediaType: 'photo',
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

    handleBackButtonClick = () => {
        this.props.navigation.goBack();
        return true;
    }

    deleteMessageApi(item) {

        this.setState({
            isLoading: true
        });

        var data = new FormData();
        data.append("access_token", this.state.access_token);
        //data.append('course_id', global.landingScreenPaidItem.id);
        //type(1=>Message,2=>Support message,3=> Group Message)
        data.append('type', 3);
        data.append('id', item.GM_ID);

        console.warn('delete_message_request'+JSON.stringify(data) + '\n\n' + JSON.stringify(item))
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
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>

                    <ActivityIndicator />

                    <Text style={{ top: 10, fontSize: (dimensions.sizeRatio * 20), textAlignVertical: "center", color: colors.black, fontFamily: CONSTANTS.DEMI }}>
                        Please wait...
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
        }

        console.log('feedback state', this.state.dataSource)
        return (
            <View style={{
                flex: 1,
                width: '100%',
                backgroundColor: colors.sessions_bgtheme
            }}>
                {this.renderHeader()}
                {/* {this.state.dataSource != undefined && this.state.dataSource.length != 0 && */}
                <View style={styles.chatContainer}>
                    <FlatList
                        inverted
                        alwaysBounceVertical={false}
                        showsVerticalScrollIndicator={false}
                        ref={(ref) => { this.flatListRef = ref; }}
                        data={this.state.dataSource}
                        renderItem={({ item }) => (
                            (item.GM_IMAGE != undefined && item.GM_IMAGE != '' ? (item.GM_IMAGE != '' && item.GM_MESSAGE == '' ? this.renderImageAloneUI(item) : this.renderMessageImageUI(item))
                                : item.GM_AUDIO != null && item.GM_AUDIO != '' ? this.renderAudioAloneUI(item) : this.renderMessageAloneUI(item))
                        )}
                        extraData={this.state}
                        keyExtractor={(item, index) => index.toString()}
                    />
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
                                    width: 16,
                                    height: 16,
                                }}
                                resizeMode={'center'}
                                source={require('../../images/icon_start_recoding_small.png')}
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
                            }}
                        >
                            <Image
                                source={this.state.isImagePick == false ?
                                    require('../../images/MessagePlaceholder.png')
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
                                paddingLeft: this.state.isImagePick == false ? 0 : 5
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
                                        this.sendMessageApi()
                                    }
                                    else if (this.state.sendMessage.trim() != '') {
                                        console.warn('enter2' + this.state.sendMessage.trim())
                                        this.sendMessageApi()
                                    } else if (this.state.imageToSend != '') {
                                        console.warn('enter3' + this.state.imageToSend)
                                        this.sendMessageApi()
                                    } else if (this.state.savedaudioFileForApi != undefined) {
                                        console.warn('enter4' + this.state.savedaudioFileForApi)
                                        this.sendMessageApi()
                                    }

                                    // if (this.state.sendMessage.trim() != '') {
                                    //     console.warn('enter2' + this.state.sendMessage.trim())
                                    //     this.sendMessageApi()
                                    // }
                                }}
                            >
                                <Image
                                    source={require('../../images/send_message.png')}
                                    style={styles.icSendMessage}
                                    resizeMode={'contain'}
                                />
                            </TouchableOpacity>
                            {/* here audio recorder icon */}
                        </View>
                    </View>
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
                                            source={require('../../images/icon_stop_playing.png')}
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
                                            source={require('../../images/icon_start_playing.png')}
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
                {/* } */}
                {
                    this.dialogForImagePicker()
                }
            </View>
        );
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
                                        source={require('../../images/icon_stop_recoding.png')}
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
                                        source={require('../../images/icon_start_recoding.png')}
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
                                        source={require('../../images/icon_stop_playing.png')}
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
                                        source={require('../../images/icon_start_playing.png')}
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
                                            this.sendMessageApi()
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
    keyExtractor = item => {
        return item.subject_id + new Date().getTime().toString() + (Math.floor(Math.random() * Math.floor(new Date().getTime()))).toString();
    };

    renderAudioAloneUI(item) {
        var local = moment(item.GM_CREATED_AT).format('DD-MMM-YYYY hh:mm A');
        return (
            <View>

                {item.IS_SENDER == '1' ?
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
                                    source={require('../../images/audio_player.jpg')}
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
                                            source={require('../../images/icon_download_audio.png')}
                                        />
                                    </TouchableOpacity>
                                }
                            </TouchableOpacity>
                            <Text style={styles.textChatTimeReceiver}>{local}</Text>
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
                                    source={require('../../images/audio_player.jpg')}
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
                                            source={require('../../images/icon_download_audio.png')}
                                        />
                                    </TouchableOpacity>
                                }
                            </TouchableOpacity>
                            <Text style={styles.textChatTimeReceiver}>{local}</Text>
                        </View>
                    )}
            </View>
        )
    }

    renderMessageAloneUI(item) {
        var local = moment(item.GM_CREATED_AT).format('DD-MMM-YYYY hh:mm A');
        return (
            <View>
                {item.IS_SENDER == '1' ?
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
                            {item.GM_MESSAGE.trim()}
                        </Text>
                        <Text style={styles.textChatTimeSender}>{local}</Text>
                    </TouchableOpacity>) : (
                        <View style={styles.chatMessageReceiver}>
                            <Text style={{
                                fontSize: 15,
                                color: colors.white
                            }}>{item?.sender?.FIRST_NAME}</Text>
                            <Text selectable={true} style={styles.chatHistoryMessageReceiver}>
                                {item.GM_MESSAGE.trim()}
                            </Text>
                            <Text style={styles.textChatTimeReceiver}>{local}</Text>
                        </View>
                    )}
            </View>
        )
    }

    renderImageAloneUI(item) {
        let imageUrl = CONSTANTS.BASE_GROUP_URL + item.GM_IMAGE
        console.log('imageUrl', imageUrl)
        var local = moment(item.GM_CREATED_AT).format('DD-MMM-YYYY hh:mm A');
        return (
            <View>
                {item.IS_SENDER == '1' ?
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
                                <Image
                                    source={{ uri: imageUrl }}
                                    defaultSource={require('../../images/logo2.png')}
                                    style={{
                                        width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio, borderRadius: 8 * dimensions.sizeRatio,
                                        //alignSelf:'center'
                                    }}
                                />
                                {/* <FastImage
                                    style={{ width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio, borderRadius: 8 * dimensions.sizeRatio }}
                                    source={{
                                        uri: imageUrl,
                                        priority: FastImage.priority.normal,
                                    }}
                                    resizeMode={FastImage.resizeMode.cover}
                                /> */}
                            </TouchableOpacity>
                            <Text style={styles.textChatTimeSender}>{local}</Text>
                        </View>
                    ) : (
                        <View style={styles.chatMessageImageReceiver}>
                            <TouchableOpacity onPress={() => { this.props.navigation.navigate({ routeName: 'FullPreview', params: imageUrl }) }} >
                                <Text style={{
                                    fontSize: 15,
                                    color: colors.white
                                }}>{item?.sender?.FIRST_NAME}</Text>
                                <Image
                                    source={{ uri: imageUrl }}
                                    defaultSource={require('../../images/logo2.png')}
                                    style={{
                                        width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio, borderRadius: 8 * dimensions.sizeRatio,
                                        //alignSelf:'center'
                                    }}
                                />
                                {/* <FastImage
                                    style={{ width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio, borderRadius: 8 * dimensions.sizeRatio }}
                                    source={{
                                        uri: imageUrl,
                                        priority: FastImage.priority.normal,
                                    }}
                                    resizeMode={FastImage.resizeMode.cover}
                                /> */}
                            </TouchableOpacity>
                            <Text style={styles.textChatTimeReceiver}>{local}</Text>
                        </View>
                    )}
            </View>
        )
    }

    renderMessageImageUI(item) {
        var local = moment(item.GM_CREATED_AT).format('DD-MMM-YYYY hh:mm A');

        let imageUrl = ''
        if (item.GM_IMAGE != '') {
            imageUrl = CONSTANTS.BASE_GROUP_URL + item.GM_IMAGE
            console.log('imageUrl', imageUrl)
        }

        return (
            <View>
                {item.IS_SENDER == '1' ?
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
                                <Image
                                    source={{ uri: imageUrl }}
                                    defaultSource={require('../../images/logo2.png')}
                                    style={{
                                        width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio, borderRadius: 8 * dimensions.sizeRatio,
                                        alignSelf: 'flex-end'
                                    }}
                                />
                                {/* <FastImage
                                    style={[styles.chatImageSender, { width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio }]}
                                    source={{
                                        uri: imageUrl,
                                        priority: FastImage.priority.normal,
                                    }}
                                    resizeMode={FastImage.resizeMode.cover}
                                /> */}
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={.8}
                                style={{
                                    width: '100%',
                                    flexDirection: 'column',
                                    alignSelf: 'flex-end'
                                }}>
                                <Text selectable={true}
                                    style={styles.chatHistoryMessageSender}>
                                    {item.GM_MESSAGE.trim()}
                                </Text>
                                <Text style={styles.textChatTimeSender}>{local}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.chatMessageImageReceiver}>
                            <TouchableOpacity onPress={() => { this.props.navigation.navigate({ routeName: 'FullPreview', params: imageUrl }) }} >
                            <Text style={{
                                    fontSize: 15,
                                    color: colors.white
                                }}>{item?.sender?.FIRST_NAME}</Text>
                                <Image
                                    source={{ uri: imageUrl }}
                                    defaultSource={require('../../images/logo2.png')}
                                    style={{
                                        width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio, borderRadius: 8 * dimensions.sizeRatio,
                                        alignSelf: 'flex-start'
                                    }}
                                />
                                {/* <FastImage
                                    style={[styles.chatImageReceiver, { width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio }]}
                                    source={{
                                        uri: imageUrl,
                                        priority: FastImage.priority.normal,
                                    }}
                                    resizeMode={FastImage.resizeMode.cover}
                                /> */}
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={.8}
                                style={{
                                    width: '100%',
                                    flexDirection: 'column',
                                    alignItems: "flex-end",
                                    justifyContent: 'flex-end',
                                }}>
                                <Text selectable={true}
                                    style={styles.chatHistoryMessageReceiver}>
                                    {item.GM_MESSAGE}
                                </Text>
                                <Text style={styles.textChatTimeReceiver}>{local}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
            </View>
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
                    justifyContent: 'space-between'
                }}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                    <Ripple
                        onPress={() => {
                            this.handleBackButtonClick()
                        }}>
                        {backButton}
                    </Ripple>
                    <Text style={{ fontSize: 18, fontFamily: CONSTANTS.DEMI, color: colors.black, textAlign: 'left' }}>
                        {'Group chat'}
                    </Text>
                </View>
            </View>
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
        padding: 5 * dimensions.sizeRatio,
        alignSelf: "flex-end",
        marginLeft: 60 * dimensions.sizeRatio
    },
    chatMessageReceiver: {
        backgroundColor: '#093679',
        borderRadius: 8 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio,
        marginLeft: 20.5 * dimensions.sizeRatio,
        padding: 5 * dimensions.sizeRatio,
        alignSelf: "flex-start",
        marginRight: 60 * dimensions.sizeRatio
    },
    chatMessageImageSender: {
        backgroundColor: colors.white,
        borderRadius: 8 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio,
        marginRight: 20.5 * dimensions.sizeRatio,
        padding: 5 * dimensions.sizeRatio,
        alignSelf: "flex-end",
        marginLeft: 60 * dimensions.sizeRatio
    },

    chatMessageImageReceiver: {
        backgroundColor: '#093679',
        borderRadius: 8 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio,
        marginLeft: 20.5 * dimensions.sizeRatio,
        padding: 5 * dimensions.sizeRatio,
        alignSelf: "flex-start",
        marginRight: 60 * dimensions.sizeRatio
    },
    chatImageSender: {
        borderRadius: 8 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio,
        marginRight: 13.5 * dimensions.sizeRatio,
        padding: 5 * dimensions.sizeRatio,
        alignSelf: "flex-end",
        marginLeft: 60 * dimensions.sizeRatio
    },

    chatImageReceiver: {
        borderRadius: 8 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio,
        marginLeft: 13.5 * dimensions.sizeRatio,
        padding: 5 * dimensions.sizeRatio,
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
