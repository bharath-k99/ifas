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
    TouchableOpacity, Alert, AsyncStorage, NativeEventEmitter, NativeModules, Modal, FlatList
} from 'react-native';
import colors from '../../resources/colors';
import renderIf from '../../resources/utility.js';
import dimensions from '../../resources/dimension';
import CONSTANTS from '../../resources/constants';
import styles from '../../styles/sessions_style.js';
import { showNativeAlert } from '../../resources/app_utility.js'
import { EventRegister } from 'react-native-event-listeners';
import { NavigationEvents } from 'react-navigation';
import Ripple from 'react-native-material-ripple';
import CardView from 'react-native-cardview';
import Orientation from 'react-native-orientation';
import Toast from 'react-native-tiny-toast';
import RNFetchBlob from 'rn-fetch-blob';
import { Dialog } from 'react-native-simple-dialogs';
import ytdl from "react-native-ytdl"
import NetInfo from "@react-native-community/netinfo";
import RNBackgroundDownloader from 'react-native-background-downloader';

//vector icon
import BookIcon from 'react-native-vector-icons/FontAwesome5';
const bookIcon = <BookIcon name="book-open" size={26} color={colors.theme} />;
import VideoIcon from 'react-native-vector-icons/Feather';
const videoIcon = <VideoIcon name="video" size={16} color={colors.lightgray} />;
import WatchIcon from 'react-native-vector-icons/MaterialIcons';
const watchIcon = <WatchIcon name="access-time" size={16} color={colors.lightgray} />;
import ForwordIcon from 'react-native-vector-icons/MaterialIcons';
const forwordIcon = <ForwordIcon name="arrow-forward" size={24} color={colors.theme} />;
import DownArrowIcon from 'react-native-vector-icons/Feather';
const downArrowIcon = <DownArrowIcon name="arrow-down" size={24} color={colors.theme} />;
import BackButton from 'react-native-vector-icons/MaterialIcons';
const backButton = <BackButton name="arrow-back" size={28} color={colors.black} />;
import Delete from 'react-native-vector-icons/MaterialCommunityIcons';
const deleteAudioVideo = <Delete name="delete-restore" size={24} color={colors.red} />;

import CheckBoxOFF from 'react-native-vector-icons/Ionicons';
import CheckBoxON from 'react-native-vector-icons/Ionicons';
import CheckBoxRectOFF from 'react-native-vector-icons/MaterialIcons';
import CheckBoxRectON from 'react-native-vector-icons/MaterialIcons';
import ClipboardIcon from 'react-native-vector-icons/FontAwesome5';

//vector big icon
import VideoBigIcon from 'react-native-vector-icons/Feather';
const videoBigIcon = <VideoBigIcon name="video" size={22} color={colors.topic_text_color_1} />;
import AudioBigIcon from 'react-native-vector-icons/MaterialIcons';
const audioBigIcon = <AudioBigIcon name="audiotrack" size={22} color={colors.topic_text_color_2} />;

import DownloadVideoBigIcon from 'react-native-vector-icons/FontAwesome5';
const downloadVideoBigIcon = <DownloadVideoBigIcon name="file-video" size={22} color={colors.topic_text_color_3} />;
import DownloadAudioBigIcon from 'react-native-vector-icons/FontAwesome5';
const downloadAudioBigIcon = <DownloadAudioBigIcon name="file-video" size={22} color={colors.topic_text_color_4} />;

import ViewPDFBigIcon from 'react-native-vector-icons/FontAwesome5';
const viewPDFBigIcon = <ViewPDFBigIcon name="file-pdf" size={22} color={colors.topic_text_color_5} />;
import TestPDFBigIcon from 'react-native-vector-icons/AntDesign';
const testPDFBigIcon = <TestPDFBigIcon name="pdffile1" size={22} color={colors.topic_text_color_6} />;


const checkBoxOFF = <CheckBoxOFF name="ios-radio-button-off" size={24} color={colors.theme} />;
const checkBoxON = <CheckBoxON name="ios-radio-button-on" size={24} color={colors.theme} />;

const checkBoxRectOFF = <CheckBoxRectOFF name="check-box-outline-blank" size={24} color={colors.theme} />;
const checkBoxRectON = <CheckBoxRectON name="check-box" size={24} color={colors.theme} />;
const clipboardIcon = <ClipboardIcon name="clipboard-list" size={16} color={colors.topic_text_color_2} />;

//delte icon
import DeleteBigIcon from 'react-native-vector-icons/MaterialIcons';
const deleteBigIcon = <DeleteBigIcon name="delete-forever" size={24} color={'#ff1919'} />;

let isRecordingGloble = false;

let taskStartDownloading = undefined;
export default class PaidTopic extends Component {

    //Navigation Method
    isSessionFocus = false
    constructor(props) {
        super(props);
        this.state = {
            isProgress: false,
            isLoading: true,
            access_token: '',
            subjectName: '',
            subjectId: this.props.navigation.state.params.subjectId,
            subjectName: this.props.navigation.state.params.subjectName,
            dataSource: [],
            isError: false,
            errorMessage: 'No topics available for the selected subject.',
            dialogVisible: false,
            dialogAudioVideoDelete: false,
            qualityArray: [{ id: 1, name: 'Video Quality: 360', value: 360, quality: '18', is_selected: true }, { id: 2, name: 'Video Quality: 720', value: 720, quality: '22', is_selected: false }],
            deleteAudioVideoArray: [{ id: 1, name: 'Audio file', is_selected: false }, { id: 2, name: 'Video file', is_selected: false }],
            selctedItemQuality: '18',
            selectedItemObj: undefined,
            progress: undefined,
            selectedItemForDelete: undefined,
            isDeletingAudioVideo: false,
            downloadingAudioVideoURL: undefined,
            selectedAudioVideoType: undefined,
            isTextVisiblePopupDelete: false,
            downloadingIndicatorMessage: undefined,
            isRecording: false,

        };
        this.screenContext = this;
        taskStartDownloading = undefined;
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    stopDownloadingOnBackPress = async () => {

        //cancel the request, the callback function is optional
        console.warn('DOWNLOADING_STOP_NOTUN1')
        if (taskStartDownloading != undefined && taskStartDownloading != null) {
            console.warn('DOWNLOADING_STOP_NOTUN2' + JSON.stringify(taskStartDownloading))
            await taskStartDownloading.stop();
            //taskStartDownloading.stop((err) => {
            console.warn('DOWNLOADING_STOP_NOTUN3' + JSON.stringify(taskStartDownloading))
            this.listAllTask()
            //taskStartDownloading = undefined;
            //})
        } else {
            console.warn('DOWNLOADING_STOP_UN')
            //Toast.show('Downloading has not started yet. Wait for some time.')
            // setTimeout(() => {
            //     this.deleteAfterStopDownloadingAudioVideo(this.state.selectedItemObj)
            // }, 2000);
        }
    }

    listAllTask = async () => {
        let lostTasks = await RNBackgroundDownloader.checkForExistingDownloads();
        console.log(`lostTasks ${JSON.stringify(lostTasks)}`);
        this.deleteAfterStopDownloadingAudioVideo(this.state.selectedItemObj)
    }

    deleteAfterStopDownloadingAudioVideo = async (rowItem) => {
        const dirs = RNFetchBlob.fs.dirs
        global.VIDEO_AUDIO_DOWNLOADING_PROGRESS = undefined
        AsyncStorage.removeItem('TOPICS_VIDEO_AUDIO_PROGRESS_ASYNC').then(
            () => {
                console.log('TOPICS_VIDEO_AUDIO_PROGRESS_ASYNC_REMOVE' + 'SUCCESS CLEAR')
            },
            () => {
                console.log('rejected back_press')
            }
        )
        console.log('CHECK_ROWITEM' + JSON.stringify(rowItem) + '\n\n' + this.state.selectedAudioVideoType)
        if (rowItem != undefined && this.state.selectedAudioVideoType == 'video') {

            RNFetchBlob.fs.unlink(dirs.DocumentDir + `/IFASVideoLecture/${rowItem.ID}.mp4`)
                .then((res) => {
                    console.warn('topics stop deleteFile sucess video' + JSON.stringify(res))
                    this.props.navigation.goBack();
                    return true;
                })
                .catch((err) => {
                    console.warn('topics stop deleteFile error video' + JSON.stringify(err))
                    this.props.navigation.goBack();
                    return true;
                })
        } else {
            RNFetchBlob.fs.unlink(dirs.DocumentDir + `/IFASVideoLecture/${'audio_' + rowItem.ID}.mp3`)
                .then((res) => {
                    console.warn('topics stop deleteFile sucess audio' + JSON.stringify(res))
                    this.props.navigation.goBack();
                    return true;
                })
                .catch((err) => {
                    console.warn('topics stop deleteFile error audio' + JSON.stringify(err))
                    this.props.navigation.goBack();
                    return true;
                })
        }
    }

    handleBackButtonClick = () => {

        if (this.state.isProgress) {
            Alert.alert(
                'Confirm Stop Downloading',
                'Do you want to stop downloading? If yes than you need to restart downloading.',
                [
                    { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                    {
                        text: 'OK', onPress: () => {
                            this.stopDownloadingOnBackPress()
                        }
                    },
                ],
                { cancelable: false }
            )
        } else {
            console.warn('ENTER HERE paid topic')
            this.props.navigation.goBack();
        }
        return true;
    }

    getAccessToken() {
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                self.setState({
                    access_token: value.slice(1, -1),
                }, () => {
                    if (global.landingScreenPaidItem != undefined)
                        self.getTopicApi(global.landingScreenPaidItem)
                })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    refreshTopicTimer = (time, seletedItem) => {
        console.warn('TOPIC_TIMER' + time + '\n\n' + this.state.access_token + '\n\n' + seletedItem)
        this.setTimerLog(time, seletedItem)
    }

    componentDidMount() {
        global.isLiveConfRunningIosForLiveSessionNotHide = true;
        //Not visible notification start popup for this screen
        global.isChatLiveSessionVisible = true;
        isTopicPlayerVisible = true;
        isTopicsFocus = true
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

        if (global.navigateAction != null) {
        }
        else {
            console.log('Topics controller focused')
            BackHandler.addEventListener('hardwareBackPress', () => {
                console.log('blue whale')
                if (isSessionFocus === true) {
                    if (this.state.isProgress) {
                        Alert.alert(
                            'Confirm Stop Downloading',
                            'Do you want to stop downloading? If yes than you need to restart downloading.',
                            [
                                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                {
                                    text: 'OK', onPress: () => {
                                        this.props.navigation.goBack();
                                        return true;
                                    }
                                },
                            ],
                            { cancelable: false }
                        )
                        return true
                    } else {
                        this.props.navigation.goBack();
                        return true;
                    }
                }

                return false;
            });
        }

        //Remove not completed downloaded video from storage
        AsyncStorage.getItem("VIDEO_AUDIO_PROGRESS_ASYNC").then(elementObj => {
            let item = JSON.parse(elementObj);
            console.log('videoAudioProgressAsync_out' + JSON.stringify(item))
            if (item != undefined && item != null && item != '') {
                console.log('videoAudioProgressAsync_inner')
                this.deleteOnlyFileIfCurrpetedSaved(item)
            } else {
                console.log('videoAudioProgressAsync_not_found')
                this.getAccessToken()
            }
        }).catch(err => {
            console.log(err)
            this.getAccessToken()
        });

        if (global.VIDEO_AUDIO_DOWNLOADING_PROGRESS != undefined) {
            console.warn('ENTER_VID_AUD')
            this.stopDownloadingOnBackPress()
        } else {

        }

        // Recording of
        if (Platform.OS == 'ios') {
            this.addListener()
        }

        //Check start live conf notification or screen currently visible or not
        // this.listener = EventRegister.addEventListener('start_live_conf_on_notification', (data) => {
        //     console.log('start_live_conf_on_notification getAccessToken ')
        //     GoToScreen.goToWhichScreen('Sessions', this.props)
        // })
    }

    componentWillUnmount() {
        console.log("Unmounted Topics")
        console.log("Unmounted Sessions")
        isTopicsFocus = false
        console.log('Topics controller _didBlur')
        //EventRegister.removeEventListener(this.listener);
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        if (Platform.OS === "ios") {
            this.screenCaptureEnabled.remove()
        }
    }

    setTimerLog(timer, seletedItem) {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('topic_video_id', seletedItem.ID);
        formData.append('duration', timer);
        console.warn('timer_request-data--', formData)

        fetch(CONSTANTS.BASE_CHAT + CONSTANTS.POST_PAID_VIDEO_LOG_NEW, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.warn('thread response', responseJson)
                //Successful response from the API Call 

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                }
                else {
                    this.getTopicApi(global.landingScreenPaidItem)
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    deleteOnlyFileIfCurrpetedSaved = async (rowItem) => {
        const dirs = RNFetchBlob.fs.dirs

        if (rowItem != undefined && rowItem.type == 'video') {

            RNFetchBlob.fs.unlink(dirs.DocumentDir + `/IFASVideoLecture/${rowItem.video_key}.mp4`)
                .then((res) => {
                    console.warn('subjects deleteFile sucess video' + JSON.stringify(res))
                })
                .catch((err) => {
                    console.warn('subjects deleteFile error video' + JSON.stringify(err))
                })
        } else {
            RNFetchBlob.fs.unlink(dirs.DocumentDir + `/IFASVideoLecture/${rowItem.video_key}.mp3`)
                .then((res) => {
                    console.warn('subjects deleteFile sucess audio' + JSON.stringify(res))
                })
                .catch((err) => {
                    console.warn('subjects deleteFile error audio' + JSON.stringify(err))
                })
        }

        this.getAccessToken()
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

    getTopicApi(item) {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('course_id', item.id);
        formData.append('subject_id', this.props.navigation.state.params.selected_item.subject_id);
        formData.append('ebook_or_video', 1);
        console.warn('topic_requst_data--', JSON.stringify(formData) + '\n\n' +
            this.props.navigation.state.params.selected_item)

        fetch(CONSTANTS.BASE + CONSTANTS.POST_PAID_VIDEO_TOPIC_LIST_NEW, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.warn('SUBJECT_PAID_VIDEO_NEW', responseJson)

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else if (responseJson.code == 1) {

                    let previousTopicsArray = responseJson.data;
                    //console.warn('ENTER_TOPIC'+JSON.stringify(element))
                    previousTopicsArray.forEach(element => {
                        if (element.topic_videos != undefined && element.topic_videos != null) {
                            element.topic_videos.forEach(element2 => {

                                this.checkForVideoLocalPath(element2.ID).then((res) => {
                                    if (res) {
                                        const dirs = RNFetchBlob.fs.dirs
                                        let videoPath = dirs.DocumentDir + `/IFASVideoLecture/${element2.ID}.mp4`
                                        element2.IS_DOWNLOAD_VIDEO = true
                                        element2.DOWNLOADED_VIDEO_PATH = videoPath
                                        console.log('video_found_' + res + '.\n\n' + videoPath)
                                    } else {
                                        element2.IS_DOWNLOAD_VIDEO = false
                                        element2.DOWNLOADED_VIDEO_PATH = ''
                                        console.log('not_found' + 'Not found any downloaded video path!')
                                    }
                                })

                                this.checkForAudioLocalPath('audio_' + element2.ID).then((res) => {
                                    if (res) {
                                        const dirs = RNFetchBlob.fs.dirs
                                        let audioPath = dirs.DocumentDir + `/IFASVideoLecture/${'audio_' + element2.ID}.mp3`
                                        element2.IS_DOWNLOAD_AUDIO = true
                                        element2.DOWNLOADED_AUDIO_PATH = audioPath
                                    } else {
                                        element2.IS_DOWNLOAD_AUDIO = false
                                        element2.DOWNLOADED_AUDIO_PATH = ''
                                        console.log('not_found' + 'Not found any downloaded audio path!')
                                    }
                                })
                            });
                        }
                    });
                    //dataSource: responseJson.data.Topics,
                    this.setState({
                        isLoading: false,
                        dataSource: [...previousTopicsArray],
                        isError: false,
                    }, () => {
                        console.log('updasted_topic_array' + JSON.stringify(this.state.dataSource))
                    });
                }
            }).catch((error) => {
                console.error(error);
                this.setState({
                    dataSource: [],
                    isLoading: false,
                    isError: true,
                    errorMessage: 'Failed to load topics.'
                })
            });
    }

    checkForVideoLocalPath = (videoKey) => {

        const dirs = RNFetchBlob.fs.dirs
        const videoPath = dirs.DocumentDir + `/IFASVideoLecture/${videoKey}.mp4`
        return RNFetchBlob.fs.exists(videoPath)

            .then((exist) => {
                if (exist) {
                    console.log('video_exist' + JSON.stringify(exist) + '\n' + videoPath)
                    return exist
                }
                else {
                    console.log('video_not_exist')
                    return false
                }
                //console.log(`file ${exist ? '' : 'not'} exists`)
            })
            .catch((error) => {
                console.log('video_exist_error' + error)
                return false
            })
    }
    checkForAudioLocalPath = (videoKey) => {

        const dirs = RNFetchBlob.fs.dirs
        const audioPath = dirs.DocumentDir + `/IFASVideoLecture/${videoKey}.mp3`
        return RNFetchBlob.fs.exists(audioPath)

            .then((exist) => {
                if (exist) {
                    console.log('audio_exist' + JSON.stringify(exist) + '\n' + audioPath)
                    return exist
                }
                else {
                    console.log('audio_not_exist')
                    return false
                }
                //console.log(`file ${exist ? '' : 'not'} exists`)
            })
            .catch((error) => {
                console.log('audio_exist_error' + error)
                return false
            })
    }

    checkNetInfo = (rowURL, audio_id, type, rowItem) => {
        try {
            NetInfo.isConnected.fetch().then(isConnected => {
                if (isConnected) {
                    if (Platform.OS === 'android')
                        this.callExtractorAfterNetChecking(rowURL, audio_id, type, rowItem, isConnected)
                    if (Platform.OS === 'ios') {
                        this.callExtractorAfterNetChecking(rowURL, audio_id, type, rowItem, isConnected)
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

    callExtractorAfterNetChecking = (rowURL, audio_id, type, rowItem, isConnected) => {
        if (isConnected) {
            this.extractorYoutubeURL(rowURL, audio_id, type, rowItem)
            //this.extractorYoutubeURL(rowItem.URL, ('audio_' + rowItem.ID), 'audio', rowItem)
        } else {
            setTimeout(() => { Toast.show('Network is not available', Toast.CENTER) }, 200)
            //alert('Network is not available');
        }
    }

    extractorYoutubeURL = (youtubeUrl, videoKey, type, rowItem) => {


        console.warn('Format found! url' + JSON.stringify(youtubeUrl) + '\n\n' + videoKey + '\n\n' + type);
        let downindicatorMsg = undefined;
        if (type == 'video') {
            downindicatorMsg = 'Please wait while downloading video'
        } else {
            downindicatorMsg = 'Please wait while downloading audio'
        }
        this.setState({
            isProgress: true,
            progress: 0,
            downloadingIndicatorMessage: downindicatorMsg
        })
        if (type == 'video') {
            if (rowItem != null) {
                console.warn('ENTERY', rowItem)
                if (rowItem.URL != null && rowItem.URL != '') {
                    ytdl.getInfo(rowItem.URL).then((info) => {
                        // First URL extract1
                        if (info != undefined && info.formats != undefined) {
                            let format = ytdl.chooseFormat(info.formats, { quality: '18' });
                            console.warn('Format found!1', format);
                            if (format != undefined && format.url != undefined) {
                                this.setState({
                                    downloadingAudioVideoURL: format.url,
                                }, () => {
                                    this.downloadVideoWithProgress(format.url, videoKey, 'video', rowItem)
                                })
                            } else if (rowItem.URL2 != null && rowItem.URL2 != '') {
                                ytdl.getInfo(rowItem.URL2).then((info) => {
                                    // First URL extract2
                                    if (info != undefined && info.formats != undefined) {
                                        let format = ytdl.chooseFormat(info.formats, { quality: '18' });
                                        console.warn('Format found!10', format);
                                        if (format != undefined && format.url != undefined) {
                                            this.setState({
                                                downloadingAudioVideoURL: format.url,
                                            }, () => {
                                                this.downloadVideoWithProgress(format.url, videoKey, 'video', rowItem)
                                            })
                                        } else if (rowItem != undefined && rowItem.TMP_VIDEO_URL != '' &&
                                            rowItem.TMP_VIDEO_URL != null) {
                                            console.warn('Format found! 12', format);
                                            this.setState({
                                                downloadingAudioVideoURL: rowItem.TMP_VIDEO_URL,
                                            }, () => {
                                                this.downloadVideoWithProgress(rowItem.TMP_VIDEO_URL, videoKey, 'video', rowItem)
                                            })
                                        } else {
                                            this.setState({
                                                isProgress: false
                                            })
                                            Toast.show('No video available. Please contact to admin for more details.')
                                        }
                                    }
                                })
                            }
                        }
                    })
                } else if (rowItem.URL2 != null && rowItem.URL2 != '') {
                    ytdl.getInfo(rowItem.URL2).then((info) => {
                        // First URL extract2
                        if (info != undefined && info.formats != undefined) {
                            let format = ytdl.chooseFormat(info.formats, { quality: '18' });
                            console.warn('Format found!2', format);
                            if (format != undefined && format.url != undefined) {
                                this.setState({
                                    downloadingAudioVideoURL: format.url,
                                }, () => {
                                    this.downloadVideoWithProgress(format.url, videoKey, 'video', rowItem)
                                })
                            } else if (rowItem != undefined && rowItem.TMP_VIDEO_URL != '' &&
                                rowItem.TMP_VIDEO_URL != null) {
                                console.warn('Format found! 20', format);
                                this.setState({
                                    downloadingAudioVideoURL: rowItem.TMP_VIDEO_URL,
                                }, () => {
                                    this.downloadVideoWithProgress(rowItem.TMP_VIDEO_URL, videoKey, 'video', rowItem)
                                })
                            } else {
                                this.setState({
                                    isProgress: false
                                })
                                Toast.show('No video available. Please contact to admin for more details.')
                            }
                        }
                    })
                } else if (rowItem != undefined && rowItem.TMP_VIDEO_URL != '' &&
                    rowItem.TMP_VIDEO_URL != null) {
                    console.warn('Format found! 3', format);
                    this.setState({
                        downloadingAudioVideoURL: rowItem.TMP_VIDEO_URL,
                    }, () => {
                        this.downloadVideoWithProgress(rowItem.TMP_VIDEO_URL, videoKey, 'video', rowItem)
                    })
                } else {
                    this.setState({
                        isProgress: false
                    })
                    Toast.show('No video available. Please contact to admin for more details.')
                }
            }
        } else {
            if (rowItem != null) {
                if (rowItem.URL != null && rowItem.URL != '') {
                    ytdl.getInfo(rowItem.URL).then((info) => {
                        // First URL extract1
                        if (info != undefined && info.formats != undefined) {
                            let format = ytdl.chooseFormat(info.formats, { quality: '140' });
                            console.warn('Format found!1', format);
                            if (format != undefined && format.url != undefined) {
                                this.setState({
                                    downloadingAudioVideoURL: format.url,
                                }, () => {
                                    this.downloadVideoWithProgress(format.url, videoKey, 'audio', rowItem)
                                })
                            } else if (rowItem.URL2 != null && rowItem.URL2 != '') {
                                ytdl.getInfo(rowItem.URL2).then((info) => {
                                    // First URL extract2
                                    if (info != undefined && info.formats != undefined) {
                                        let format = ytdl.chooseFormat(info.formats, { quality: '140' });
                                        console.warn('Format found!10', format);
                                        if (format != undefined && format.url != undefined) {
                                            this.setState({
                                                downloadingAudioVideoURL: format.url,
                                            }, () => {
                                                this.downloadVideoWithProgress(format.url, videoKey, 'audio', rowItem)
                                            })
                                        } else if (rowItem != undefined && rowItem.TMP_AUDIO_URL != '' &&
                                            rowItem.TMP_AUDIO_URL != null) {
                                            console.warn('Format found! 12', format);
                                            this.setState({
                                                downloadingAudioVideoURL: rowItem.TMP_AUDIO_URL,
                                            }, () => {
                                                this.downloadVideoWithProgress(rowItem.TMP_AUDIO_URL, videoKey, 'audio', rowItem)
                                            })
                                        } else {
                                            this.setState({
                                                isProgress: false
                                            })
                                            Toast.show('No video available. Please contact to admin for more details.')
                                        }
                                    }
                                })
                            }
                        }
                    })
                } else if (rowItem.URL2 != null && rowItem.URL2 != '') {
                    ytdl.getInfo(rowItem.URL2).then((info) => {
                        // First URL extract2
                        if (info != undefined && info.formats != undefined) {
                            let format = ytdl.chooseFormat(info.formats, { quality: '140' });
                            console.warn('Format found!2', format);
                            if (format != undefined && format.url != undefined) {
                                this.setState({
                                    downloadingAudioVideoURL: format.url,
                                }, () => {
                                    this.downloadVideoWithProgress(format.url, videoKey, 'video', rowItem)
                                })
                            } else if (rowItem != undefined && rowItem.TMP_AUDIO_URL != '' &&
                                rowItem.TMP_AUDIO_URL != null) {
                                console.warn('Format found! 20', format);
                                this.setState({
                                    downloadingAudioVideoURL: rowItem.TMP_AUDIO_URL,
                                }, () => {
                                    this.downloadVideoWithProgress(rowItem.TMP_AUDIO_URL, videoKey, 'audio', rowItem)
                                })
                            } else {
                                this.setState({
                                    isProgress: false
                                })
                                Toast.show('No video available. Please contact to admin for more details.')
                            }
                        }
                    })
                } else if (rowItem != undefined && rowItem.TMP_AUDIO_URL != '' &&
                    rowItem.TMP_AUDIO_URL != null) {
                    console.warn('Format found! 3', format);
                    this.setState({
                        downloadingAudioVideoURL: rowItem.TMP_AUDIO_URL,
                    }, () => {
                        this.downloadVideoWithProgress(rowItem.TMP_AUDIO_URL, videoKey, 'audio', rowItem)
                    })
                } else {
                    this.setState({
                        isProgress: false
                    })
                    Toast.show('No video available. Please contact to admin for more details.')
                }
            }
        }
    }

    downloadVideoWithProgress = (videoUrl, videoKey, type, rowItem) => {

        // this.checkIsDirectory().then((res) => {

        const dirs = RNFetchBlob.fs.dirs

        console.log('VIDEOURL_NAME_COM' + videoUrl + '\n' + videoKey + '\n' + type)
        console.log('RNFS PATH' + dirs.DocumentDir)
        directoryPath = undefined;
        if (type == 'video') {
            //directoryPath = dirs.DocumentDir + `/IFASVideoLectureTemporary/${videoKey}.mp4`
            directoryPath = dirs.DocumentDir + `/IFASVideoLecture/${videoKey}.mp4`
        } else {
            //directoryPath = dirs.DocumentDir + `/IFASVideoLectureTemporary/${videoKey}.mp3`
            directoryPath = dirs.DocumentDir + `/IFASVideoLecture/${videoKey}.mp3`
        }

        taskStartDownloading = RNBackgroundDownloader.download({
            id: `file_${videoKey}`,
            url: videoUrl,
            destination: directoryPath
        }).begin((expectedBytes) => {
            console.log(`Going to download ${expectedBytes} bytes!`);
        }).progress((percent) => {
            //console.warn(`Downloaded: ${percent * 100}%`);
            this.setState({
                progress: percent
            })
            let downloadingProgress = Math.floor((percent) * 100)
            if (downloadingProgress != 99) {
                global.VIDEO_AUDIO_DOWNLOADING_PROGRESS = downloadingProgress
            } else {
                global.VIDEO_AUDIO_DOWNLOADING_PROGRESS = undefined
            }

            let saveAsyncProgressObj = {
                progress: downloadingProgress,
                type: type,
                video_key: videoKey
            }
            AsyncStorage.setItem('VIDEO_AUDIO_PROGRESS_ASYNC', JSON.stringify(saveAsyncProgressObj)).then(elementObj => {
                console.log('VIDEO_AUDIO_PROGRESS_ASYNC', elementObj)

            }).catch(err => {
                setTimeout(() => { Toast.show('Network is not available', Toast.CENTER) }, 200)
                console.log('VIDEO_AUDIO_PROGRESS_ASYNC' + err)
            });

            this.setState({
                progress: percent
            })
        }).done((res) => {
            //console.warn('The file saved to ', JSON.stringify(res))
            Toast.show('Your file has been downloaded successfully.')
            global.VIDEO_AUDIO_DOWNLOADING_PROGRESS = undefined
            this.updateArrayDownloadAudioVideo(rowItem)
            AsyncStorage.removeItem('VIDEO_AUDIO_PROGRESS_ASYNC').then(
                () => {
                    console.log('VIDEO_AUDIO_PROGRESS_ASYNC_REMOVE' + 'SUCCESS CLEAR')
                },
                () => {
                    console.log('rejected back_press')
                }
            )
            //
        }).error((error) => {
            console.log('Download canceled due to error: ', error);
        });
    }

    updateArrayDownloadAudioVideo = (rowItem) => {

        console.warn('updateArrayDownloadAudioVideo_' + JSON.stringify(rowItem))

        const dataSourceArray = this.state.dataSource;

        let newTopicsArray = dataSourceArray;
        const dirs = RNFetchBlob.fs.dirs

        newTopicsArray.forEach(element => {

            if (element.topic_videos != undefined && element.topic_videos != null) {
                element.topic_videos.forEach(element2 => {

                    this.checkForVideoLocalPath(element2.ID).then((res) => {
                        if (res) {
                            let videoPath = dirs.DocumentDir + `/IFASVideoLecture/${element2.ID}.mp4`
                            element2.IS_DOWNLOAD_VIDEO = true
                            element2.DOWNLOADED_VIDEO_PATH = videoPath
                            console.log('updateArrayDownloadAudioVideo_ video_found_' + res + '.\n\n' + videoPath)
                        } else {
                            element2.IS_DOWNLOAD_VIDEO = false
                            element2.DOWNLOADED_VIDEO_PATH = ''
                            console.log('updateArrayDownloadAudioVideo_ video_not_found' + 'Not found any downloaded video path!')
                        }
                    })

                    this.checkForAudioLocalPath('audio_' + element2.ID).then((res) => {
                        if (res) {
                            let audioPath = dirs.DocumentDir + `/IFASVideoLecture/${'audio_' + element2.ID}.mp3`
                            element2.IS_DOWNLOAD_AUDIO = true
                            element2.DOWNLOADED_AUDIO_PATH = audioPath
                            console.log('updateArrayDownloadAudioVideo_ audio_found_' + res + '.\n\n' + audioPath)
                        } else {
                            element2.IS_DOWNLOAD_AUDIO = false
                            element2.DOWNLOADED_AUDIO_PATH = ''
                            console.log('updateArrayDownloadAudioVideo_ audio_not_found' + 'Not found any downloaded audio path!')
                        }
                    })
                });
            }
        });
        //dataSource: responseJson.data.Topics,
        console.log('updateArrayDownloadAudioVideo_array1' + JSON.stringify(this.screenContext.state.dataSource))
        this.screenContext.setState({
            dataSource: [...newTopicsArray],
        }, () => {
            console.log('updateArrayDownloadAudioVideo_array2' + JSON.stringify(this.screenContext.state.dataSource))
            setTimeout(() => {
                //this.forceUpdate()
                this.screenContext.setState({
                    isProgress: false,
                    progress: undefined,
                    isDeletingAudioVideo: false
                })
                console.log('updateArrayDownloadAudioVideo_array3' + JSON.stringify(this.screenContext.state.dataSource))
            }, 2000);
        });
    }

    methodGoToVideoPlayer(item, url = '', title = 'VideoPlayer', topicId = 0) {
        console.log('TOPICSS' + url + '\n\n' + title + '\n\n' + topicId + '\n\n' + JSON.stringify(item));
        // if (Platform.OS == 'android') { 
        //     const rnClass = NativeModules.RNScreenDetector;
        //     rnClass.androidNativePlayer(url)
        // } else  { 
        item.IS_DOWNLOAD_VIDEO == true ?
            this.props.navigation.navigate('DownloadedVideoPlayer', { youtubeUrl: item.DOWNLOADED_VIDEO_PATH, Headertitle: title, topicId: topicId }) :
            this.props.navigation.navigate('VideoPlayerNew', { youtubeUrl: url, item: item })
        // }

        // 
        // this.props.navigation.navigate('VideoStreaming', { youtubeUrl: url.substring(url.lastIndexOf('/')+1), topicId: topicId})
    }

    downloadAudioDialogVisible = (rowItem) => {

        Alert.alert(
            'IFAS',
            'Are you sure you want to download this audio?',
            [
                {
                    text: 'Yes', onPress: () => {
                        this.setState({
                            selectedItemObj: rowItem,
                            selectedAudioVideoType: 'audio'
                        }, () => {
                            this.checkNetInfo(rowItem.URL, ('audio_' + rowItem.ID), 'audio', rowItem)
                            //this.callExtractorAfterNetChecking(rowItem.URL, ('audio_' + rowItem.ID), 'audio', rowItem,isConnected)
                        })
                    }
                },
                { text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
            ],
            { cancelable: false }
        )
    }

    qualityItemSelected = (item) => {

        let previousArray = this.state.qualityArray;
        previousArray.forEach(element => {
            if (item.id == element.id) {
                element.is_selected = true
                this.setState({
                    selctedItemQuality: element.quality,
                })
            } else {
                element.is_selected = false
            }
        });

        this.setState({
            qualityArray: [...previousArray]
        })
    }


    checkIsDirectory = async () => {
        const dirs = RNFetchBlob.fs.dirs
        return RNFetchBlob.fs.isDir(dirs.DocumentDir + '/VideoLectureTemporary')
            .then((isDir) => {
                console.log('checkIsDirectory' + JSON.stringify(isDir))
                if (isDir) {
                    this.deleteFileAndFolder().then((res) => {

                    })
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

    deleteFileAndFolder = async () => {
        const dirs = RNFetchBlob.fs.dirs
        //return RNFetchBlob.fs.unlink(dirs.DocumentDir + '/VideoLectureTemporary')
        return RNFetchBlob.fs.unlink(dirs.DocumentDir + '/VideoLectureTemporary')
            .then((res) => {
                console.warn('deleteFolder sucess' + JSON.stringify(res))
                return true
                //this.createDirectory()
            })
            .catch((err) => {
                console.warn('deleteFolder error' + JSON.stringify(err))
                return false
            })
    }

    createDirectory = async () => {
        const dirs = RNFetchBlob.fs.dirs
        return RNFetchBlob.fs.mkdir(dirs.DocumentDir + '/VideoLectureTemporary')
            .then((res) => {
                //console.warn('createDirectory sucess' + JSON.stringify(res))
                return true
            })
            .catch((err) => {
                console.warn('createDirectory error' + JSON.stringify(err))
                return false
            })
    }

    deleteOnlyFile = async (videoKey, rowItem) => {
        const dirs = RNFetchBlob.fs.dirs

        let newArrayForDelete = this.state.deleteAudioVideoArray;

        this.setState({
            isDeletingAudioVideo: true
        })

        newArrayForDelete.forEach(element => {
            if (element.is_selected && element.id == 2) {

                RNFetchBlob.fs.unlink(dirs.DocumentDir + `/IFASVideoLecture/${videoKey}.mp4`)
                    .then((res) => {
                        console.warn('deleteFolder sucess' + JSON.stringify(res))
                        this.updateArrayDownloadAudioVideo(rowItem)
                        Toast.show('Your file has been deleted successfully.')
                    })
                    .catch((err) => {
                        console.warn('deleteFolder error1' + JSON.stringify(err))
                        this.setState({
                            isDeletingAudioVideo: false
                        })
                    })
            } else if (element.is_selected && element.id == 1) {
                RNFetchBlob.fs.unlink(dirs.DocumentDir + `/IFASVideoLecture/${'audio_' + videoKey}.mp3`)
                    .then((res) => {
                        console.warn('deleteFolder sucess' + JSON.stringify(res))
                        this.updateArrayDownloadAudioVideo(rowItem)
                        Toast.show('Your file has been deleted successfully.')
                    })
                    .catch((err) => {
                        console.warn('deleteFolder error2' + JSON.stringify(err))
                        this.setState({
                            isDeletingAudioVideo: false
                        })
                    })
            }
        });
    }

    selectDeleteAudioVideo = (item) => {

        let previousAudioVideoDelete = this.state.deleteAudioVideoArray;

        previousAudioVideoDelete.forEach(element => {

            if (element.id == item.id) {
                element.is_selected = !element.is_selected
            }
        });

        this.setState({
            deleteAudioVideoArray: previousAudioVideoDelete
        })
    }

    openDeleteAudioVideoDialog = (rowItem) => {

        //deleteAudioVideoArray: [{ id: 1, name: 'Audio', is_selected: false }, { id: 2, name: 'Video', is_selected: false }],
        let newAudioVideoDeleteArray = [];
        console.warn('ENTER_DELETE_DIALOG' + JSON.stringify(rowItem))
        if (rowItem != undefined) {
            if (rowItem.IS_DOWNLOAD_AUDIO) {
                newAudioVideoDeleteArray.push({ id: 1, name: 'Audio file', is_selected: false })
            }
            if (rowItem.IS_DOWNLOAD_VIDEO) {
                newAudioVideoDeleteArray.push({ id: 2, name: 'Video file', is_selected: false })
            }
        }
        this.setState({
            dialogAudioVideoDelete: true,
            deleteAudioVideoArray: newAudioVideoDeleteArray
        })
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

    clickMainViewItem = (item, index) => {
        let savedTopicArray = this.state.dataSource;
        savedTopicArray.map((element) => {
            if (item.ID == element.ID) {
                element.is_selected = true
            } else {
                element.is_selected = false
            }
        })

        this.setState({
            dataSource: [...savedTopicArray]
        })
        // savedTopicArray.forEach(element => {
        //     if(item.ID == element.ID){
        //         element.is_selected = true
        //     }else{
        //         element.is_selected = false
        //     }
        // });

        // setTimeout(() => {
        //     this.setState({
        //         dataSource:[...savedTopicArray]
        //     })
        // }, 500);
    }

    callEnrollUserExam = (item) => {
        console.warn('ENTROLL_ITEM', item)
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('exam_set_id', 1);
        console.log('request_data', formData)

        fetch(CONSTANTS.BASE + CONSTANTS.POST_TEST_ENROLLUSER, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.warn('RESPONSE_ENROLL', responseJson)

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else if (responseJson.code == 203) {
                    alert(responseJson.message)
                }
                else {
                    if (responseJson.data != undefined) {
                        console.warn('SELECTED_ITEMM', parentItem)
                        //this.getInstructionApi(responseJson,item)
                        this.props.navigation.navigate('Instructions', { data: responseJson.data, selected_item: item, parent_item: parentItem })
                    }
                }


            })
            .catch((error) => {
                // console.error(error);
                // showNativeAlert("Network request failed")
                this.setState({
                    answerArray: [],
                    isLoading: false,
                    errorMessage: 'Failed to fetch your subjects.'
                })
            });
    }
    getInstructionApi(item, parentItem) {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('exam_set_id', item.EXAM_SET_ID);
        console.warn('request_data_ins_paid', formData)

        fetch(CONSTANTS.BASE + CONSTANTS.POST_TEST_INSTRUCTION, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.warn('INSTRUCTION_RESPONSE', responseJson)

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else {
                    //Handle here for exam alreay given or not
                    console.warn('LENGTTT', item)
                    if (responseJson.user_exam_obj && responseJson.user_exam_obj.length) {
                        //this.props.navigation.navigate('Instructions', { data: {}, selected_item: item, parent_item: parentItem });
                        this.props.navigation.navigate('ReviewTest', {
                            url: '',
                            data: {},
                            selected_item: responseJson.user_exam_obj[0]
                        })
                    } else {
                        this.props.navigation.navigate('Instructions', { data: {}, selected_item: item, parent_item: parentItem });
                        //this.callEnrollUserExam(item,parentItem)
                    }
                }
            })
            .catch((error) => {
                // console.error(error);
                // showNativeAlert("Network request failed")
                this.setState({
                    instrctionArray: [],
                    isLoading: false,
                    errorMessage: 'Failed to fetch your subjects.'
                })
            });
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

                    {/* Header view */}
                    {this.renderHeader()}
                    <View style={{
                        flex: 1,
                        width: '100%',
                        height: '100%',
                        paddingBottom: 10
                    }}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={true}
                            data={this.state.dataSource}
                            renderItem={({ item, index }) => this.renderTopicMainItem(item, index)}
                            extraData={this.state}
                            keyExtractor={(item, index) => index.toString()}
                        //ItemSeparatorComponent={this.itemSepratorView}
                        />
                    </View>

                    {
                        //"Go to Page..."
                        <Dialog
                            visible={this.state.dialogVisible}
                            title={null}
                            contentStyle={{ padding: 0, backgroundColor: colors.white }}
                            dialogStyle={{ padding: 0, backgroundColor: colors.white }}
                            onTouchOutside={() => this.setState({ dialogVisible: false })} >
                            <View
                                style={{
                                    width: '100%',
                                    height: Platform.OS == 'android' ? 170 : 190,
                                    backgroundColor: colors.white
                                }}>
                                <View style={{
                                    flex: 1,
                                    alignItems: 'flex-start',
                                    marginHorizontal: 10,
                                }}>
                                    <Text style={{
                                        fontFamily: CONSTANTS.DEMI,
                                        fontSize: dimensions.sizeRatio * 16,
                                        color: colors.theme,
                                        fontFamily: CONSTANTS.DEMI,
                                    }}>
                                        {'Select quality for download'}
                                    </Text>
                                    <View
                                        style={{
                                            width: '100%',
                                        }}>
                                        <FlatList
                                            showsVerticalScrollIndicator={false}
                                            data={this.state.qualityArray}
                                            extraData={this.state}
                                            keyExtractor={(item, index) => index.toString()}
                                            renderItem={({ item, index }) => (
                                                <TouchableOpacity
                                                    activeOpacity={.9}
                                                    onPress={() => this.qualityItemSelected(item)}>

                                                    <View style={{
                                                        flexDirection: 'row',
                                                        padding: dimensions.sizeRatio * 10,
                                                        alignItems: 'center'
                                                    }}>
                                                        {
                                                            item.is_selected ?

                                                                <View>
                                                                    {checkBoxON}
                                                                </View>
                                                                :
                                                                <View>
                                                                    {checkBoxOFF}
                                                                </View>
                                                        }
                                                        <Text style={{
                                                            marginLeft: dimensions.sizeRatio * 10,
                                                            fontFamily: CONSTANTS.DEMI,
                                                            fontSize: dimensions.sizeRatio * 16,
                                                            color: colors.theme,
                                                            fontFamily: CONSTANTS.DEMI,
                                                        }}>
                                                            {item.name}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        activeOpacity={.9}
                                        onPress={() => {
                                            this.setState({
                                                dialogVisible: false
                                            }, () => {
                                                this.checkNetInfo(this.state.selectedItemObj.URL, this.state.selectedItemObj.ID, 'video', this.state.selectedItemObj)
                                                //this.extractorYoutubeURL(this.state.selectedItemObj.URL, this.state.selectedItemObj.ID, 'video', this.state.selectedItemObj)
                                            })
                                        }}
                                        style={{
                                            padding: 10,
                                            marginTop: 10,
                                            width: '100%',
                                            justifyContent: 'center', alignItems: 'center',
                                            backgroundColor: colors.theme, borderRadius: dimensions.sizeRatio * 7
                                        }}>
                                        <Text style={{ fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 15, color: colors.white }}>{'DOWNLOAD'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Dialog>
                    }
                    {
                        //"delete audio video."
                        <Dialog
                            visible={this.state.dialogAudioVideoDelete}
                            title={null}
                            contentStyle={{ padding: 0, backgroundColor: colors.white }}
                            dialogStyle={{ padding: 0, backgroundColor: colors.white }}
                            onTouchOutside={() => this.setState({ dialogAudioVideoDelete: false })} >
                            <View
                                style={{
                                    width: '100%',
                                    height: this.state.deleteAudioVideoArray.length == 1 ? this.state.isTextVisiblePopupDelete ? 140 : 130 :
                                        this.state.isTextVisiblePopupDelete ? 180 : 170,
                                    backgroundColor: colors.white
                                }}>
                                <View style={{
                                    flex: 1,
                                    alignItems: 'flex-start',
                                    marginHorizontal: 10,
                                }}>
                                    <Text style={{
                                        fontFamily: CONSTANTS.DEMI,
                                        fontSize: dimensions.sizeRatio * 16,
                                        color: colors.theme,
                                        fontFamily: CONSTANTS.DEMI,
                                    }}>
                                        {'Select for delete'}
                                    </Text>
                                    <View
                                        style={{
                                            width: '100%',
                                        }}>
                                        <FlatList
                                            showsVerticalScrollIndicator={false}
                                            data={this.state.deleteAudioVideoArray}
                                            extraData={this.state}
                                            keyExtractor={(item, index) => index.toString()}
                                            renderItem={({ item, index }) => (
                                                <TouchableOpacity
                                                    activeOpacity={.9}
                                                    onPress={() => this.selectDeleteAudioVideo(item)}>

                                                    <View style={{
                                                        flexDirection: 'row',
                                                        padding: dimensions.sizeRatio * 10,
                                                        alignItems: 'center'
                                                    }}>
                                                        {
                                                            item.is_selected ?

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
                                                            color: colors.theme,
                                                            fontFamily: CONSTANTS.DEMI,
                                                        }}>
                                                            {item.name}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            )}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        activeOpacity={.9}
                                        onPress={() => {

                                            let isOneItemSelect = false;
                                            this.state.deleteAudioVideoArray.forEach(element => {
                                                if (element.is_selected) {
                                                    isOneItemSelect = true
                                                }
                                            });

                                            if (isOneItemSelect) {
                                                this.setState({
                                                    dialogAudioVideoDelete: false
                                                }, () => {
                                                    this.deleteOnlyFile(this.state.selectedItemForDelete.ID, this.state.selectedItemForDelete)
                                                })
                                            } else {
                                                //Toast.show('Select atleast one item!')
                                                this.setState({
                                                    isTextVisiblePopupDelete: true
                                                })
                                                setTimeout(() => {
                                                    this.setState({
                                                        isTextVisiblePopupDelete: false
                                                    })
                                                }, 2000);
                                            }
                                        }}
                                        style={{
                                            padding: 10,
                                            marginTop: 10,
                                            width: '100%',
                                            justifyContent: 'center', alignItems: 'center',
                                            backgroundColor: colors.theme, borderRadius: dimensions.sizeRatio * 7
                                        }}>
                                        <Text style={{ fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 15, color: colors.white }}>{'SUBMIT'}</Text>
                                    </TouchableOpacity>
                                    {this.state.isTextVisiblePopupDelete &&
                                        <View style={{
                                            marginTop: 2
                                        }}>
                                            <Text style={{
                                                marginLeft: dimensions.sizeRatio * 10,
                                                fontFamily: CONSTANTS.DEMI,
                                                fontSize: dimensions.sizeRatio * 14,
                                                color: colors.red,
                                                fontFamily: CONSTANTS.DEMI,
                                            }}>
                                                {'Select atleast one item!'}
                                            </Text>
                                        </View>
                                    }
                                </View>
                            </View>
                        </Dialog>
                    }
                    {this.state.isProgress &&
                        <View
                            style={{
                                flex: 1,
                                width: dimensions.width,
                                height: dimensions.height,
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
                                }}> {this.state.downloadingIndicatorMessage} </Text>
                            </View>
                        </View>
                    }

                    {this.state.isDeletingAudioVideo &&
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
                                <Text style={{
                                    fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 16, color: colors.white
                                }}> Please wait while deleting </Text>
                            </View>
                        </View>
                    }
                </View>
            );
        }
    }


    renderTopicMainItem = (item, index) => {
        console.log('item  ', item)
        return (
            <CardView
                style={{
                    flex: 1,
                    backgroundColor: colors.white,
                    marginHorizontal: 10,
                    marginVertical: 10
                }}
                cardElevation={3}
                cardMaxElevation={2}
                cornerRadius={5}>
                <View style={{
                    width: '100%',
                    flexDirection: 'column'
                }}>
                    <TouchableOpacity
                        activeOpacity={.9}
                        style={{
                            flexDirection: 'row',
                            width: '100%',
                            paddingHorizontal: 10,
                            paddingVertical: 10
                        }}
                        onPress={() => {
                            this.clickMainViewItem(item, index)
                        }}>
                        <View style={{
                            width: '83%',
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            <View style={{
                                flexDirection: 'column',
                                justifyContent: 'center',
                            }}>
                                {bookIcon}
                            </View>
                            <View style={{
                                flexDirection: 'column',
                                justifyContent: 'center',
                                marginTop: 5,
                                marginLeft: 10
                            }}>
                                <Text style={{
                                    fontSize: (dimensions.sizeRatio * 16),
                                    color: colors.black,
                                    fontFamily: CONSTANTS.MEDIUM
                                }}
                                    numberOfLines={1}>{item.topic_name}</Text>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: 5,
                                }}>
                                    {videoIcon}
                                    <Text style={{
                                        marginLeft: 5,
                                        fontSize: (dimensions.sizeRatio * 12),
                                        color: colors.lightishgray,
                                        fontFamily: CONSTANTS.REGULAR
                                    }}
                                        numberOfLines={1}>{item.video_duration != null &&
                                            item.video_cnt + ' videos | ' + ((parseInt(item.video_duration / 60)) > 0 ?
                                                parseInt(item.video_duration / 60) + 'h' : '') + ' ' +
                                            (parseInt(item.video_duration % 60)) + 'm | '
                                        }</Text>
                                    {item.page_name != null && item.page_name != '' &&
                                        <TouchableOpacity
                                            onPress={() => {
                                                let genrateURL = `https://ifasonline.com/login?user=${this.props.navigation.state.params.profile_data.USER_NAME}&&password=${this.props.navigation.state.params.profile_data.PASSWORD}&&pageIfas=${item.page_name}`;
                                                console.warn('WEBVIEW_URL', genrateURL)
                                                this.props.navigation.navigate('PaidTestWebView', { url: genrateURL })
                                            }}
                                            style={{
                                                width: 60,
                                                flexDirection: 'row',
                                                paddingHorizontal: 2,
                                                paddingVertical: 2,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: colors.topic_color_2,
                                            }}>
                                            {clipboardIcon}
                                            <Text style={{
                                                fontSize: (dimensions.sizeRatio * 10),
                                                color: colors.topic_text_color_2,
                                                fontFamily: CONSTANTS.MEDIUM,
                                                marginLeft: 3,
                                                marginTop: 2
                                            }}
                                                numberOfLines={1}>{'TEST'}</Text>
                                        </TouchableOpacity>
                                    }
                                </View>
                                {/* Test view */}
                                {/* {item.page_name != null && item.page_name != '' &&
                                    <TouchableOpacity
                                        onPress={() => {
                                            let genrateURL = `https://ifasonline.com/login?user=${this.props.navigation.state.params.profile_data.USER_NAME}&&password=${this.props.navigation.state.params.profile_data.PASSWORD}&&pageIfas=${item.page_name}`;
                                            console.warn('WEBVIEW_URL', genrateURL)
                                            this.props.navigation.navigate('PaidTestWebView', { url: genrateURL })
                                        }}
                                        style={{
                                            width: 100,
                                            paddingHorizontal: 15,
                                            paddingVertical: 5,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            backgroundColor: colors.primary_dark,
                                            marginTop: 10
                                        }}>
                                        <Text style={{
                                            fontSize: (dimensions.sizeRatio * 12),
                                            color: colors.white,
                                            fontFamily: CONSTANTS.MEDIUM
                                        }}
                                            numberOfLines={1}>{'TEST'}</Text>
                                    </TouchableOpacity>
                                } */}
                            </View>
                        </View>
                        <View style={{
                            width: '17%',
                            alignItems: 'flex-end',
                            justifyContent: 'center'
                        }}>
                            <View style={{
                                width: 30,
                                height: 30,
                                borderRadius: 30 / 2,
                                backgroundColor: colors.theme_very_light,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                {item.is_selected ?
                                    (downArrowIcon)
                                    :
                                    (forwordIcon)
                                }
                            </View>
                        </View>
                    </TouchableOpacity>
                    {/* Sub item map */}
                    {item.is_selected &&
                        <View
                            style={{
                                width: '100%',
                                flexDirection: 'column'
                            }}>
                            <View
                                style={{
                                    width: '90%',
                                    height: 1,
                                    backgroundColor: colors.lightgray,
                                    alignSelf: 'center'
                                }}
                            />
                            {item.topic_videos != undefined && item.topic_videos != null &&
                                item.topic_videos.map(element => {
                                    return (
                                        <View
                                            style={{
                                                width: '100%',
                                                padding: 10,
                                                //marginLeft:40
                                            }}>
                                            {/* Top view */}
                                            <View style={{
                                                width: '100%',
                                                flexDirection: 'row',
                                                justifyContent: 'space-between'
                                            }}>
                                                <View
                                                    style={{
                                                        width: '70%',
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        justifyContent: 'flex-start'
                                                    }}>
                                                    <Text style={{
                                                        fontSize: (dimensions.sizeRatio * 14),
                                                        color: colors.black,
                                                        fontFamily: CONSTANTS.DEMI
                                                    }}
                                                        numberOfLines={1}>{element.TITLE}</Text>
                                                </View>
                                                <View style={{
                                                    width: '30%',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-end'
                                                }}>
                                                    {watchIcon}
                                                    <Text style={{
                                                        marginLeft: 5,
                                                        fontSize: (dimensions.sizeRatio * 12),
                                                        color: colors.lightishgray,
                                                        fontFamily: CONSTANTS.REGULAR
                                                    }}
                                                        numberOfLines={1}>{element.DURATION != null ?
                                                            ((parseInt(element.DURATION / 60)) > 0 ?
                                                                parseInt(element.DURATION / 60) + 'h' : '') + ' ' +
                                                            (parseInt(element.DURATION % 60)) + 'm' : '--'}</Text>
                                                </View>
                                            </View>
                                            {/* Bottom view */}
                                            <View
                                                style={{
                                                    width: '100%',
                                                    flexDirection: 'column'
                                                }}>
                                                {/* Video audio view */}
                                                <View
                                                    style={{
                                                        width: '100%',
                                                        flexDirection: 'row',
                                                        justifyContent: 'space-between',
                                                        marginTop: 5
                                                    }}>
                                                    {/* Video view */}
                                                    <Ripple
                                                        style={{
                                                            width: '45%',
                                                            padding: 10,
                                                            backgroundColor: colors.topic_color_1,
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            justifyContent: 'flex-start'
                                                        }}
                                                        onPress={() => {
                                                            this.props.navigation.navigate('VideoPlayerNew', {
                                                                youtubeUrl: element.URL, item: element,
                                                                onGoBack: this.refreshTopicTimer
                                                            })
                                                        }}>
                                                        {videoBigIcon}
                                                        <Text style={{
                                                            marginLeft: 5,
                                                            fontSize: (dimensions.sizeRatio * 14),
                                                            color: colors.topic_text_color_1,
                                                            fontFamily: CONSTANTS.MEDIUM
                                                        }}
                                                            numberOfLines={1}>{'View Video'}</Text>
                                                    </Ripple>
                                                    <Ripple
                                                        style={{
                                                            width: '45%',
                                                            padding: 10,
                                                            backgroundColor: colors.topic_color_3,
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            justifyContent: 'flex-start'
                                                        }}
                                                        onPress={() => {
                                                            if (element.URL != '' &&
                                                                element.IS_DOWNLOAD_VIDEO == true) {
                                                                this.props.navigation.navigate('DownloadedVideoPlayer', { youtubeUrl: element.DOWNLOADED_VIDEO_PATH, Headertitle: element.TITLE, topicId: element.ID })

                                                            } else {
                                                                if (element.URL != null && element.URL != '') {
                                                                    this.setState({
                                                                        selectedItemObj: element,
                                                                        selectedAudioVideoType: 'video'
                                                                    }, () => {
                                                                        this.setState({
                                                                            dialogVisible: true
                                                                        })
                                                                    })
                                                                } else {
                                                                    setTimeout(() => { Toast.show('Video file not found!', Toast.CENTER) }, 200)
                                                                }
                                                            }
                                                        }}>
                                                        {downloadVideoBigIcon}
                                                        <Text style={{
                                                            marginLeft: 5,
                                                            fontSize: (dimensions.sizeRatio * 14),
                                                            color: colors.topic_text_color_3,
                                                            fontFamily: CONSTANTS.MEDIUM
                                                        }}
                                                            numberOfLines={1}>{'Download Video'}</Text>
                                                    </Ripple>
                                                    {/* Video view */}
                                                    {/* <Ripple
                                                        style={{
                                                            width: '45%',
                                                            padding: 10,
                                                            backgroundColor: colors.topic_color_2,
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            justifyContent: 'flex-start'
                                                        }}
                                                        onPress={() => {
                                                            this.props.navigation.navigate('AudioPlayer', { youtubeUrl: element.URL, item: element, audioUrl: element.TMP_AUDIO_URL })
                                                        }}>
                                                        {audioBigIcon}
                                                        <Text style={{
                                                            marginLeft: 5,
                                                            fontSize: (dimensions.sizeRatio * 14),
                                                            color: colors.topic_text_color_2,
                                                            fontFamily: CONSTANTS.MEDIUM
                                                        }}
                                                            numberOfLines={1}>{'Play Audio'}</Text>
                                                    </Ripple> */}
                                                </View>

                                                {/* Download video audio view */}
                                                {/* <View
                                                    style={{
                                                        width: '100%',
                                                        flexDirection: 'row',
                                                        justifyContent: 'space-between',
                                                        marginTop: 5
                                                    }}> */}
                                                {/* Video view */}
                                                {/* <Ripple
                                                        style={{
                                                            width: '45%',
                                                            padding: 10,
                                                            backgroundColor: colors.topic_color_3,
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            justifyContent: 'flex-start'
                                                        }}
                                                        onPress={() => {
                                                            if (element.URL != '' &&
                                                                element.IS_DOWNLOAD_VIDEO == true) {
                                                                this.props.navigation.navigate('DownloadedVideoPlayer', { youtubeUrl: element.DOWNLOADED_VIDEO_PATH, Headertitle: element.TITLE, topicId: element.ID })

                                                            } else {
                                                                if (element.URL != null && element.URL != '') {
                                                                    this.setState({
                                                                        selectedItemObj: element,
                                                                        selectedAudioVideoType: 'video'
                                                                    }, () => {
                                                                        this.setState({
                                                                            dialogVisible: true
                                                                        })
                                                                    })
                                                                } else {
                                                                    setTimeout(() => { Toast.show('Audio file not found!', Toast.CENTER) }, 200)
                                                                }
                                                            }
                                                        }}>
                                                        {downloadVideoBigIcon}
                                                        <Text style={{
                                                            marginLeft: 5,
                                                            fontSize: (dimensions.sizeRatio * 14),
                                                            color: colors.topic_text_color_3,
                                                            fontFamily: CONSTANTS.MEDIUM
                                                        }}
                                                            numberOfLines={1}>{'Download Video'}</Text>
                                                    </Ripple> */}

                                                {/* Audio view */}
                                                {/* {Platform.OS == 'android' &&
                                                        <Ripple
                                                            style={{
                                                                width: '45%',
                                                                padding: 10,
                                                                backgroundColor: colors.topic_color_4,
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                justifyContent: 'flex-start'
                                                            }}
                                                            onPress={() => {
                                                                if (element.URL != '' &&
                                                                    element.IS_DOWNLOAD_AUDIO == true) {
                                                                    this.props.navigation.navigate('DownloadedAudioPlayer', { youtubeUrl: element.DOWNLOADED_AUDIO_PATH, Headertitle: element.TITLE, audioUrl: element.TMP_AUDIO_URL })

                                                                } else {
                                                                    if (element.URL != null && element.URL != '') {
                                                                        this.downloadAudioDialogVisible(element)
                                                                    } else {
                                                                        setTimeout(() => { Toast.show('Audio file not found!', Toast.CENTER) }, 200)
                                                                    }
                                                                }
                                                            }}>
                                                            {downloadAudioBigIcon}
                                                            <Text style={{
                                                                marginLeft: 5,
                                                                fontSize: (dimensions.sizeRatio * 14),
                                                                color: colors.topic_text_color_4,
                                                                fontFamily: CONSTANTS.MEDIUM
                                                            }}
                                                                numberOfLines={1}>{'Download Audio'}</Text>
                                                        </Ripple>
                                                    }
                                                </View> */}

                                                {/* View pdf test pdf view */}
                                                <View
                                                    style={{
                                                        width: '100%',
                                                        flexDirection: 'row',
                                                        justifyContent: 'space-between',
                                                        marginTop: 5
                                                    }}>
                                                    {/* View PDF */}
                                                    {element.EXAM_SET_ID != null && element.EXAM_SET_ID != 0 ?
                                                        <Ripple
                                                            style={{
                                                                width: '45%',
                                                                padding: 10,
                                                                backgroundColor: colors.topic_color_2,
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                justifyContent: 'flex-start'
                                                            }}
                                                            onPress={() => {
                                                                //this.callEnrollUserExam(element, item)
                                                                this.getInstructionApi(element, item)
                                                            }}>
                                                            {clipboardIcon}
                                                            <Text style={{
                                                                marginLeft: 5,
                                                                fontSize: (dimensions.sizeRatio * 14),
                                                                color: colors.topic_text_color_5,
                                                                fontFamily: CONSTANTS.MEDIUM
                                                            }}
                                                                numberOfLines={1}>{'TEST'}</Text>
                                                        </Ripple>
                                                        :
                                                        element.EBOOK_URL1 != null && element.EBOOK_URL1 != '' &&
                                                        <Ripple
                                                            style={{
                                                                width: '45%',
                                                                padding: 10,
                                                                backgroundColor: colors.topic_color_6,
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                justifyContent: 'flex-start'
                                                            }}
                                                            onPress={() => {
                                                                if (element.EBOOK_URL1 != null && element.EBOOK_URL1 != '') {
                                                                    // let newEbookObj = element;
                                                                    // newEbookObj.EBOOK_URL = element.EBOOK_URL1;
                                                                    this.props.navigation.navigate('PDFViewerScreen', {
                                                                        selected_item: element, screen_name: 'topic',
                                                                        selected_ebook_type: 'test'
                                                                    })
                                                                } else {
                                                                    setTimeout(() => { Toast.show('Test PDF not found!', Toast.CENTER) }, 200)
                                                                }
                                                                // if (element.EBOOK_URL1 != null && element.EBOOK_URL1 != '') {
                                                                //     let newEbookObj = element;
                                                                //     newEbookObj.EBOOK_URL = element.EBOOK_URL1;
                                                                //     this.props.navigation.navigate('PDFViewerScreen', { selected_item: newEbookObj, screen_name: 'topic' })
                                                                // } else {
                                                                //     setTimeout(() => { Toast.show('Test PDF not found!', Toast.CENTER) }, 200)
                                                                // }
                                                            }}>
                                                            {testPDFBigIcon}
                                                            <Text style={{
                                                                marginLeft: 5,
                                                                fontSize: (dimensions.sizeRatio * 14),
                                                                color: colors.topic_text_color_6,
                                                                fontFamily: CONSTANTS.MEDIUM
                                                            }}
                                                                numberOfLines={1}>{'Test PDF'}</Text>
                                                        </Ripple>

                                                    }
                                                    {/* View pdf */}
                                                    {
                                                        element.EBOOK_URL != null && element.EBOOK_URL != '' &&
                                                        <Ripple
                                                            style={{
                                                                width: '45%',
                                                                padding: 10,
                                                                backgroundColor: colors.topic_color_5,
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                justifyContent: 'flex-start'
                                                            }}
                                                            onPress={() => {
                                                                if (element.EBOOK_URL != null && element.EBOOK_URL != '') {
                                                                    this.props.navigation.navigate('PDFViewerScreen', {
                                                                        selected_item: element, screen_name: 'topic',
                                                                        selected_ebook_type: 'view'
                                                                    })
                                                                } else {
                                                                    setTimeout(() => { Toast.show('PDF not found!', Toast.CENTER) }, 200)
                                                                }
                                                            }}>
                                                            {viewPDFBigIcon}
                                                            <Text style={{
                                                                marginLeft: 5,
                                                                fontSize: (dimensions.sizeRatio * 14),
                                                                color: colors.topic_text_color_5,
                                                                fontFamily: CONSTANTS.MEDIUM
                                                            }}
                                                                numberOfLines={1}>{'View PDF'}</Text>
                                                        </Ripple>
                                                    }
                                                </View>

                                                {/* Delete view */}
                                                {element.IS_DOWNLOAD_VIDEO == true &&
                                                    <View
                                                        style={{
                                                            width: '100%',
                                                            flexDirection: 'row',
                                                            justifyContent: 'space-between',
                                                            marginTop: 5
                                                        }}>
                                                        <Ripple
                                                            style={{
                                                                width: '45%',
                                                                padding: 10,
                                                                backgroundColor: '#ffcccc',
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                justifyContent: 'flex-start'
                                                            }}
                                                            onPress={() => {
                                                                this.setState({
                                                                    selectedItemForDelete: element
                                                                }, () => {
                                                                    this.openDeleteAudioVideoDialog(element)
                                                                })
                                                            }}>
                                                            {deleteAudioVideo}
                                                            <Text style={{
                                                                marginLeft: 5,
                                                                fontSize: (dimensions.sizeRatio * 14),
                                                                color: '#ff1919',
                                                                fontFamily: CONSTANTS.MEDIUM
                                                            }}
                                                                numberOfLines={1}>{'Delete'}</Text>
                                                        </Ripple>
                                                    </View>
                                                }

                                                <View style={{
                                                    width: '100%',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    marginTop: 5
                                                }}>
                                                    {watchIcon}
                                                    <Text style={{
                                                        marginLeft: 5,
                                                        fontSize: (dimensions.sizeRatio * 12),
                                                        color: colors.lightishgray,
                                                        fontFamily: CONSTANTS.REGULAR
                                                    }}
                                                        numberOfLines={1}>{'Watch Time: ' + this.secondsToHms(element.WATCH_TIME)}</Text>

                                                    {/* <Text style={{
                                                        marginLeft: 5,
                                                        fontSize: (dimensions.sizeRatio * 12),
                                                        color: colors.lightishgray,
                                                        fontFamily: CONSTANTS.REGULAR
                                                    }}
                                                        numberOfLines={1}>{'Watch Time: ' +
                                                            (element.WATCH_TIME != null ?
                                                                ((parseInt(element.WATCH_TIME / 60)) > 0 ?
                                                                    parseInt(element.WATCH_TIME / 60) + 'h' : '') + ' ' +
                                                                (parseInt(element.WATCH_TIME % 60)) + 'm' : '0m')}</Text> */}
                                                </View>
                                                {/* <View
                                                    style={{
                                                        width: '100%',
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        marginTop: 5
                                                    }}>
                                                    {element.EXAM_SET_ID != null && element.EXAM_SET_ID == 0 &&
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                this.callEnrollUserExam(element)
                                                            }}
                                                            style={{
                                                                width: 60,
                                                                flexDirection: 'row',
                                                                paddingHorizontal: 2,
                                                                paddingVertical: 2,
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                backgroundColor: colors.topic_color_2,
                                                            }}>
                                                            {clipboardIcon}
                                                            <Text style={{
                                                                fontSize: (dimensions.sizeRatio * 10),
                                                                color: colors.topic_text_color_2,
                                                                fontFamily: CONSTANTS.MEDIUM,
                                                                marginLeft: 3,
                                                                marginTop: 2
                                                            }}
                                                                numberOfLines={1}>{'TEST'}</Text>
                                                        </TouchableOpacity>
                                                    }
                                                </View> */}
                                            </View>
                                        </View>
                                    )
                                })
                            }
                        </View>
                    }
                </View>
            </CardView>
        )
    }

    secondsToHms = (d) => {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);

        var hDisplay = h > 0 ? h + (h == 1 ? "h " : "h ") : "";
        var mDisplay = m > 0 ? m + (m == 1 ? "m " : "m ") : "";
        var sDisplay = s > 0 ? s + (s == 1 ? "s" : "s") : "";
        return hDisplay + mDisplay + sDisplay;
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
                    flexDirection: 'row'
                }}>
                <Ripple
                    onPress={() => {
                        this.handleBackButtonClick()
                    }}>
                    {backButton}
                </Ripple>
                <Text style={{ fontSize: 18, fontFamily: CONSTANTS.DEMI, color: colors.black, textAlign: 'left', marginLeft: 15 }}>
                    {'Topic Name'}
                </Text>
            </View>
        )
    }

    itemSepratorView = () => {
        return (
            <View
                style={{
                    width: '100%',
                    height: 2,
                    backgroundColor: colors._transparent
                }}
            />
        )
    }
}


// _renderSection = () => {
//     return (
//         <View
//             style={{
//                 width: '100%',
//             }}>

//             <Text style={{
//                 fontSize: (dimensions.sizeRatio * 16),
//                 color: colors.black,
//                 fontFamily: CONSTANTS.MEDIUM
//             }}
//                 numberOfLines={1}>{'Accounting & Finance'}</Text>
//         </View>
//     )
// }
// <ExpandableList
// ref={instance => this.ExpandableList = instance}
// dataSource={this.state.dataSource}
// headerKey="name"
// memberKey="topic_videos"
// renderRow={this._renderSection}
// headerOnPress={(i, state) => {
//     console.log("headerOnPress" + i, state)
// }}
// renderSectionHeaderX={this.renderTopicMainItem}
// openOptions={[]}
// />