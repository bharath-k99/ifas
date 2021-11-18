/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Platform, AsyncStorage, Text, Button, View, Image, TouchableOpacity, FlatList, NativeEventEmitter, NativeModules, Alert, ActivityIndicator, BackHandler } from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import styles from '../styles/subject_style.js';
import ProfileHeaderButton from '../headers/ProfileHeaderButton'
import BackTopicsButton from '../headers/BackTopicsButton'
import CONSTANTS from '../resources/constants';
//import ExpandableList from 'react-native-expandable-section-list';
import ExpandableList from 'react-native-expandable-section-flatlist';
import { NavigationEvents } from 'react-navigation';
import { StackActions, NavigationActions } from 'react-navigation';

import {
    handleAndroidBackButton, exitAlert, removeAndroidBackButtonHandler
} from '../resources/backHandleAction.js';

import MockData from '../MockData/mockdata'
import { showNativeAlert } from '../resources/app_utility.js'
import Toast from 'react-native-tiny-toast';
import RNFetchBlob from 'rn-fetch-blob';
import { Dialog } from 'react-native-simple-dialogs';
import ytdl from "react-native-ytdl"
import NetInfo from "@react-native-community/netinfo";
import RNBackgroundDownloader from 'react-native-background-downloader';


//Using this for handle start conference
import { EventRegister } from 'react-native-event-listeners';
import * as GoToScreen from '../resources/goToScreen'

//Vector icon
import EntypoPlayVideo from 'react-native-vector-icons/Entypo';
import EntypoPlayAudio from 'react-native-vector-icons/MaterialIcons';
import EntypoPDF from 'react-native-vector-icons/MaterialCommunityIcons';
import CheckBoxOFF from 'react-native-vector-icons/Ionicons';
import CheckBoxON from 'react-native-vector-icons/Ionicons';
import CheckBoxRectOFF from 'react-native-vector-icons/MaterialIcons';
import CheckBoxRectON from 'react-native-vector-icons/MaterialIcons';
import Download from 'react-native-vector-icons/Ionicons';
import Delete from 'react-native-vector-icons/MaterialCommunityIcons';
const playVideo = <EntypoPlayVideo name="video" size={24} color={colors.theme} />;
const playAudio = <EntypoPlayAudio name="audiotrack" size={24} color={'#35add6'} />;
const pDF = <EntypoPDF name="file-pdf" size={24} color={'#bbe3f1'} />;

const deleteAudioVideo = <Delete name="delete-restore" size={24} color={colors.red} />;

const downloadedVideo = <Download name="md-download" size={24} color={'#329932'} />;
const downloadedAudio = <Download name="ios-download" size={24} color={'#329932'} />;

const downloadVideo = <Download name="md-download" size={24} color={colors.white} />;
const downloadAudio = <Download name="ios-download" size={24} color={colors.white} />;

const checkBoxOFF = <CheckBoxOFF name="ios-radio-button-off" size={24} color={colors.theme} />;
const checkBoxON = <CheckBoxON name="ios-radio-button-on" size={24} color={colors.theme} />;

const checkBoxRectOFF = <CheckBoxRectOFF name="check-box-outline-blank" size={24} color={colors.theme} />;
const checkBoxRectON = <CheckBoxRectON name="check-box" size={24} color={colors.theme} />;

let taskStartDownloading = undefined;
export default class topics extends Component {

    isTopicsFocus = false
    //Navigation Method
    static navigationOptions = (navigation) => {
        return ({
            title: 'Topics',
            headerStyle: { backgroundColor: colors.theme },
            headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
            headerBackTitle: null,

            headerLeft: <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                    //hitSlop={{top: 20, bottom: 20, left: 30, right: 30}} 
                    onPress={() => navigation.navigation.state.params.handleBackButtonClick()}
                    style={{
                        width: dimensions.sizeRatio * 35,
                        height: dimensions.sizeRatio * 25,
                        marginLeft: Platform.OS == 'android' ? dimensions.sizeRatio * 10 : dimensions.sizeRatio * 5,
                        zIndex: 1,
                        padding: dimensions.sizeRatio * 2,
                        marginBottom: Platform.OS == 'ios' ? dimensions.sizeRatio * 10 : 0
                    }}>
                    <Image
                        source={Platform.OS == 'ios' ? require('../images/back.png') : require('../images/back_two.png')}
                        style={{
                            width: Platform.OS == 'android' ? dimensions.sizeRatio * 40 : dimensions.sizeRatio * 25,
                            height: Platform.OS == 'android' ? dimensions.sizeRatio * 25 : dimensions.sizeRatio * 20,
                            tintColor: colors.white
                            //padding: 5
                        }}
                        resizeMode={'contain'}
                    />
                </TouchableOpacity>
            </View>,
            headerTintColor: 'white',
            // headerRight: <View style={{ flexDirection: 'row' }}>
            //     <TouchableOpacity hitSlop={{ top: 20, bottom: 20, left: 30, right: 30 }} onPress={() => navigation.navigation.state.params.showProfile()}>
            //         <Image
            //             source={require('../images/profile_small.png')}
            //             style={{ width: dimensions.sizeRatio * 15, height: dimensions.sizeRatio * 17, marginRight: dimensions.sizeRatio * 15 }}
            //         />
            //     </TouchableOpacity>
            // </View>,
            gesturesEnabled: false,

        })
    };

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
        // Alert.alert(this.state.subjectId)

        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        taskStartDownloading = undefined;
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
            console.warn('ENTER HERE')
            this.props.navigation.goBack();
        }
        return true;
    }

    componentDidMount() {
        global.isLiveConfRunningIosForLiveSessionNotHide = true;
         //Not visible notification start popup for this screen
         global.isChatLiveSessionVisible = true;
         isTopicPlayerVisible = true;
        global.navigation = this.props.navigation
        isTopicsFocus = true

        this.props.navigation.setParams({ showProfile: this.showProfile.bind(this) });
        this.props.navigation.setParams({ handleBackButtonClick: this.handleBackButtonClick.bind(this) });
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

    getAccessToken() {
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                self.setState({
                    access_token: value.slice(1, -1),
                }, () => { self.getTopics() })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    getTopics() {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('subject_id', this.state.subjectId);
        console.log(formData)

        fetch(CONSTANTS.BASE + CONSTANTS.POST_TOPICS, {
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

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else if (responseJson.code == 1) {

                    let previousTopicsArray = responseJson.data.Topics;

                    previousTopicsArray.forEach(element => {

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


            })
            .catch((error) => {
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
            ytdl.getInfo(youtubeUrl, {}, (err, info) => {
                console.log('format error video1' + JSON.stringify(err) + '\n\n' + JSON.stringify(info));
                if (info != undefined && info.formats != undefined) {
                    //101 audio 140
                    let format = ytdl.chooseFormat(info.formats, { quality: this.state.selctedItemQuality });
                    console.warn('Format found! video2' + JSON.stringify(format.url));
                    if (format != undefined && format.url != undefined) {
                        console.warn('Format found! video3' + JSON.stringify(format));
                        this.setState({
                            downloadingAudioVideoURL: format.url
                        })
                        this.downloadVideoWithProgress(format.url, videoKey, 'video', rowItem)
                    } else {
                        let format = ytdl.chooseFormat(info.formats, { quality: '18' });
                        console.warn('Format found! video else1' + JSON.stringify(format.url));
                        if (format != undefined && format.url != undefined) {
                            console.warn('Format found! video else2' + JSON.stringify(format));
                            this.setState({
                                downloadingAudioVideoURL: format.url
                            })
                            this.downloadVideoWithProgress(format.url, videoKey, 'video', rowItem)
                        } else {

                            console.warn('Format found! video else3');
                            //Check here temp_url isEmpty
                            if (rowItem.TMP_VIDEO_URL != '' && rowItem.TMP_VIDEO_URL != null) {
                                console.warn('Format found! video else4');
                                this.setState({
                                    downloadingAudioVideoURL: rowItem.TMP_VIDEO_URL
                                })
                                this.downloadVideoWithProgress(rowItem.TMP_VIDEO_URL, videoKey, 'video', rowItem)
                            } else {
                                console.warn('Format found! video else5');
                                //Check here main url is youtube or not
                                if (!youtubeUrl.includes('https://www.youtube.com/')) {
                                    console.warn('Format found! video else6');
                                    this.setState({
                                        downloadingAudioVideoURL: youtubeUrl
                                    })
                                    this.downloadVideoWithProgress(youtubeUrl, videoKey, 'video', rowItem)
                                } else {
                                    console.warn('Format found! video else55');
                                    this.setState({
                                        isProgress: false
                                    })
                                    Toast.show('No video available. Please contact to admin for more details.')
                                }
                                // else{
                                //     this.downloadVideoWithProgress(youtubeUrl, videoKey, 'video', rowItem)   
                                // }
                            }
                        }
                    }
                } else {
                    console.warn('Format found! video else7');
                    if (rowItem.TMP_VIDEO_URL != '' && rowItem.TMP_VIDEO_URL != null) {
                        console.warn('Format found! video else8');
                        this.setState({
                            downloadingAudioVideoURL: rowItem.TMP_VIDEO_URL
                        })
                        this.downloadVideoWithProgress(rowItem.TMP_VIDEO_URL, videoKey, 'video', rowItem)
                    } else {
                        console.warn('Format found! video else9');
                        //Check here main url is youtube or not
                        if (!youtubeUrl.includes('https://www.youtube.com/')) {
                            console.warn('Format found! video else10');
                            this.setState({
                                downloadingAudioVideoURL: youtubeUrl
                            })
                            this.downloadVideoWithProgress(youtubeUrl, videoKey, 'video', rowItem)
                        } else {
                            console.warn('Format found! video else11');
                            this.setState({
                                isProgress: false
                            })
                            Toast.show('No video available. Please contact to admin for more details.')
                        }
                    }
                    //Toast.show('This video/audio is not downloadable. Please contact to admin for more details.')
                }
            });
        } else {
            ytdl.getInfo(youtubeUrl, {}, (err, info) => {
                console.log('format error audio' + JSON.stringify(err) + '\n\n' + JSON.stringify(info));
                if (info != undefined && info.formats != undefined) {
                    //101 audio 140
                    let format = ytdl.chooseFormat(info.formats, { quality: '140' });
                    console.warn('Format found! audio' + JSON.stringify(format.url));
                    if (format != undefined && format.url != undefined) {
                        this.setState({
                            downloadingAudioVideoURL: format.url
                        })
                        this.downloadVideoWithProgress(format.url, videoKey, 'audio', rowItem)
                    } else {
                        if (rowItem.TMP_AUDIO_URL != '' && rowItem.TMP_AUDIO_URL != null) {
                            this.setState({
                                downloadingAudioVideoURL: rowItem.TMP_AUDIO_URL
                            })
                            this.downloadVideoWithProgress(rowItem.TMP_AUDIO_URL, videoKey, 'audio', rowItem)
                        } else {
                            //Check here main url is youtube or not
                            if (!youtubeUrl.includes('https://www.youtube.com/')) {
                                this.setState({
                                    downloadingAudioVideoURL: youtubeUrl
                                })
                                this.downloadVideoWithProgress(youtubeUrl, videoKey, 'audio', rowItem)
                            } else {
                                this.setState({
                                    isProgress: false
                                })
                                Toast.show('No audio available. Please contact to admin for more details.')
                            }
                        }
                    }
                } else {
                    if (rowItem.TMP_AUDIO_URL != '' && rowItem.TMP_AUDIO_URL != null) {
                        this.setState({
                            downloadingAudioVideoURL: rowItem.TMP_AUDIO_URL
                        })
                        this.downloadVideoWithProgress(rowItem.TMP_AUDIO_URL, videoKey, 'audio', rowItem)
                    } else {
                        //Check here main url is youtube or not
                        if (!youtubeUrl.includes('https://www.youtube.com/')) {
                            this.setState({
                                downloadingAudioVideoURL: youtubeUrl
                            })
                            this.downloadVideoWithProgress(youtubeUrl, videoKey, 'audio', rowItem)
                        } else {
                            this.setState({
                                isProgress: false
                            })
                            Toast.show('No audio available. Please contact to admin for more details.')
                        }
                    }
                    //Toast.show('This video/audio is not downloadable. Please contact to admin for more details.')
                }
            });
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

    showProfile() {
        this.props.navigation.navigate('Profile')
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

    //START
    _renderRow = (rowItem, rowId, sectionId) => {
        return (
            <View
                style={{
                    flexDirection: 'column',
                    paddingVertical: dimensions.sizeRatio * 10,
                    marginHorizontal: dimensions.sizeRatio * 10,
                    backgroundColor: colors.white,
                }}>
                <View
                    style={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{
                            flex: 1,
                            paddingLeft: dimensions.sizeRatio * 15,
                            paddingRight: dimensions.sizeRatio * 15,
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <Image source={require('../images/video_icon.png')} style={{ width: dimensions.sizeRatio * 20, height: dimensions.sizeRatio * 22 }} />
                            <Text style={{
                                fontFamily: CONSTANTS.DEMI,
                                fontSize: dimensions.sizeRatio * 16,
                                color: colors.night,
                                paddingLeft: dimensions.sizeRatio * 10,
                                paddingRight: dimensions.sizeRatio * 10,
                                fontFamily: CONSTANTS.DEMI,
                            }}
                                numberOfLines={2}>
                                {rowItem.TITLE}
                            </Text>
                        </View>
                        {/* <View style={{
                            flex: 2.50,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Text style={{ 
                                fontFamily: CONSTANTS.DEMI, 
                                fontSize: dimensions.sizeRatio * 12, 
                                color: colors.gray, 
                                paddingHorizontal: dimensions.sizeRatio * 5, 
                                fontFamily: CONSTANTS.DEMI, 
                                }}>
                                {'*Downloaded'}
                            </Text>
                        </View> */}
                    </View>
                </View>
                <View
                    style={{
                        //width:rowItem.EBOOK_URL == '' || rowItem.TMP_AUDIO_URL == '' ? '56.5%' : rowItem.EBOOK_URL == '' && rowItem.TMP_AUDIO_URL == '' ? '28.5%' : '85%',
                        width: '85%',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        //justifyContent:rowItem.EBOOK_URL == '' || rowItem.TMP_AUDIO_URL == '' ? 'space-evenly' : rowItem.EBOOK_URL == '' && rowItem.TMP_AUDIO_URL == '' ? 'flex-start' : 'space-evenly',
                        marginTop: dimensions.sizeRatio * 5,
                    }}>
                    {rowItem.URL != '' &&
                        <TouchableOpacity
                            style={{
                                padding: dimensions.sizeRatio * 5,
                                backgroundColor: colors.white,
                                borderRadius: dimensions.sizeRatio * 30,
                                borderColor: colors.theme,
                                borderWidth: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: dimensions.sizeRatio * 40,
                                height: dimensions.sizeRatio * 40,
                                marginLeft: dimensions.sizeRatio * 15
                            }}
                            onPress={() => { this.methodGoToVideoPlayer(rowItem, rowItem.URL, rowItem.TITLE, rowItem.ID) }}>
                            {playVideo}
                        </TouchableOpacity>
                    }
                    {/* {rowItem.TMP_AUDIO_URL != '' && */}
                    {Platform.OS == 'android' && rowItem.URL != '' &&
                        <TouchableOpacity
                            style={{
                                padding: 5,
                                backgroundColor: colors.white,
                                borderRadius: dimensions.sizeRatio * 30,
                                borderColor: '#35add6',
                                borderWidth: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: dimensions.sizeRatio * 40,
                                height: dimensions.sizeRatio * 40,
                                marginLeft: dimensions.sizeRatio * 15
                            }}
                            onPress={() => {
                                rowItem.IS_DOWNLOAD_AUDIO == true ?
                                    this.props.navigation.navigate('DownloadedAudioPlayer', { youtubeUrl: rowItem.DOWNLOADED_AUDIO_PATH, Headertitle: rowItem.TITLE, audioUrl: rowItem.TMP_AUDIO_URL }) :
                                    this.props.navigation.navigate('AudioPlayer', { youtubeUrl: rowItem.URL, item: rowItem, audioUrl: rowItem.TMP_AUDIO_URL })
                            }}>
                            {playAudio}
                        </TouchableOpacity>
                    }
                    {rowItem.EBOOK_URL != '' &&
                        <TouchableOpacity
                            activeOpacity={.9}
                            style={{
                                padding: 5,
                                backgroundColor: colors.white,
                                borderRadius: dimensions.sizeRatio * 30,
                                borderColor: '#35add6',
                                borderWidth: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: dimensions.sizeRatio * 40,
                                height: dimensions.sizeRatio * 40,
                                marginLeft: dimensions.sizeRatio * 15
                            }}
                            onPress={() => {
                                this.props.navigation.navigate('PDFViewerScreen', { selected_item: rowItem, screen_name: 'topic' })
                            }}>
                            {pDF}
                        </TouchableOpacity>
                    }
                    {rowItem.URL != '' ?
                        rowItem.IS_DOWNLOAD_VIDEO == true ?
                            null
                            // <TouchableOpacity
                            //     activeOpacity={.9}
                            //     style={{
                            //         padding: 5,
                            //         backgroundColor: '#329932',
                            //         borderRadius: dimensions.sizeRatio * 30,
                            //         borderColor: '#329932',
                            //         borderWidth: 1,
                            //         justifyContent: 'center',
                            //         alignItems: 'center',
                            //         width: dimensions.sizeRatio * 40,
                            //         height: dimensions.sizeRatio * 40,
                            //         marginLeft: dimensions.sizeRatio * 15
                            //     }}
                            //     onPress={() => {
                            //         this.checkForVideoLocalPath(rowItem.ID).then((res) => {
                            //             //alert(res)
                            //         })
                            //     }}>
                            //     {downloadVideo}
                            // </TouchableOpacity>
                            :
                            <TouchableOpacity
                                activeOpacity={.9}
                                style={{
                                    padding: 5,
                                    backgroundColor: colors.white,
                                    borderRadius: dimensions.sizeRatio * 30,
                                    borderColor: '#329932',
                                    borderWidth: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: dimensions.sizeRatio * 40,
                                    height: dimensions.sizeRatio * 40,
                                    marginLeft: dimensions.sizeRatio * 15
                                }}
                                onPress={() => {
                                    // this.checkForVideoLocalPath(rowItem.ID).then((res)=>{
                                    //     alert(res)
                                    // })
                                    this.setState({
                                        selectedItemObj: rowItem,
                                        selectedAudioVideoType: 'video'
                                    }, () => {
                                        this.setState({
                                            dialogVisible: true
                                        })
                                    })
                                }}>
                                {downloadedVideo}
                            </TouchableOpacity> : null
                    }
                    {Platform.OS == 'android' && rowItem.URL != '' ?
                        rowItem.IS_DOWNLOAD_AUDIO == true ?
                            null
                            // <TouchableOpacity
                            //     activeOpacity={.9}
                            //     style={{
                            //         padding: 5,
                            //         backgroundColor: '#329932',
                            //         borderRadius: dimensions.sizeRatio * 30,
                            //         borderColor: '#329932',
                            //         borderWidth: 1,
                            //         justifyContent: 'center',
                            //         alignItems: 'center',
                            //         width: dimensions.sizeRatio * 40,
                            //         height: dimensions.sizeRatio * 40,
                            //         marginLeft: dimensions.sizeRatio * 15
                            //     }}
                            //     onPress={() => {
                            //        // alert('click')
                            //     }}>
                            //     {downloadAudio}
                            // </TouchableOpacity>
                            :
                            <TouchableOpacity
                                activeOpacity={.9}
                                style={{
                                    padding: 5,
                                    backgroundColor: colors.white,
                                    borderRadius: dimensions.sizeRatio * 30,
                                    borderColor: '#329932',
                                    borderWidth: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: dimensions.sizeRatio * 40,
                                    height: dimensions.sizeRatio * 40,
                                    marginLeft: dimensions.sizeRatio * 15
                                }}
                                onPress={() => {
                                    this.downloadAudioDialogVisible(rowItem)
                                }}>
                                {downloadedAudio}
                            </TouchableOpacity> : null
                    }
                    {rowItem.IS_DOWNLOAD_VIDEO != '' || rowItem.IS_DOWNLOAD_AUDIO != '' ?

                        <TouchableOpacity
                            activeOpacity={.9}
                            style={{
                                padding: 5,
                                backgroundColor: colors.white,
                                borderRadius: dimensions.sizeRatio * 30,
                                borderColor: colors.red,
                                borderWidth: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: dimensions.sizeRatio * 40,
                                height: dimensions.sizeRatio * 40,
                                marginLeft: dimensions.sizeRatio * 15
                            }}
                            onPress={() => {
                                this.setState({
                                    selectedItemForDelete: rowItem
                                }, () => {
                                    this.openDeleteAudioVideoDialog(rowItem)
                                })
                            }}>
                            {deleteAudioVideo}
                        </TouchableOpacity> : null
                    }
                </View>
            </View>
        )
    };

    _renderSection = (section, sectionId, state) => {
        return (
            <View
                style={{
                    marginVertical: dimensions.sizeRatio * 5,
                    paddingVertical: 10,
                    marginHorizontal: dimensions.sizeRatio * 10,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: dimensions.sizeRatio * 10,
                }}
            >
                <View style={{ flexDirection: 'row' }}>
                    <View style={{
                        flex: 8.75,
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}>
                        <Text style={Platform.OS == 'ios' ? styles.topic_name_ios : styles.topic_name_android}>
                            {section}
                        </Text>
                        {/* <TouchableOpacity
                        style={{
                            width: '20%',
                            paddingHorizontal: 15,
                            paddingVertical: 3,
                            backgroundColor: colors.white,
                            borderRadius: dimensions.sizeRatio * 10,
                            borderColor: colors.theme,
                            borderWidth: 1,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: 15,
                            marginTop: 5
                        }}>
                        <Text style={{
                            fontFamily: CONSTANTS.DEMI,
                            fontSize: dimensions.sizeRatio * 14,
                            color: colors.theme,
                            fontFamily: CONSTANTS.DEMI,
                        }}>
                            {'PDF'}
                        </Text>
                    </TouchableOpacity> */}
                    </View>
                    <View style={{ flex: 1.25, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={require('../images/right_caret.png')} style={{
                            width: dimensions.sizeRatio * 10,
                            height: dimensions.sizeRatio * 15,
                            transform: [{ rotate: '90deg' }]
                        }} />
                    </View>
                </View>

            </View>
        );
    };

    _btnPress = () => {
        console.log(this.ExpandableList);
        this.ExpandableList.setSectionState(0, false);
    };
    //END


    render() {
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

        if (this.state.dataSource.length == 0 && (this.state.isError == false || this.state.isError == true)) {
            return (
                <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>

                    <Text style={{ fontSize: dimensions.sizeRatio * 16, fontFamily: CONSTANTS.DEMI }}>
                        {this.state.errorMessage}
                    </Text>
                </View>
            )
        }
        else {
            return (

                <View style={{ flex: 1, backgroundColor: colors.sessions_bgtheme }}>
                    {/* <View style={{ height: dimensions.sizeRatio * 30, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: colors.lightblack, fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 11 }} >{this.state.subjectName}</Text>
                    </View> */}

                    <View style={{ flex: 1 }}>
                        <View style={{ flex: 1 }}>
                            <ExpandableList
                                ref={instance => this.ExpandableList = instance}
                                dataSource={this.state.dataSource}
                                headerKey="name"
                                memberKey="topic_videos"
                                renderRow={this._renderRow}
                                headerOnPress={(i, state) => {
                                    console.log("headerOnPress" + i, state)
                                }}
                                renderSectionHeaderX={this._renderSection}
                                openOptions={[]}
                            />
                        </View>
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
}





// taskStartDownloading = RNFetchBlob
//         .config({
//             //fileCache : true,
//             // by adding this option, the temp files will have a file extension
//             //appendExt : 'mp4',
//             path: directoryPath,
//             IOSBackgroundTask:true,
//             IOSDownloadTask : true,
//             fileCache: true
//         })
//             .fetch('GET', videoUrl, {
//                 //some headers ..
//                 //'Content-length': 0,
//                 //'Transfer-Encoding' : 'Chunked',     
//             });
//         // listen to download progress event
//         taskStartDownloading.progress((received, total) => {
//             console.log('progress', received / total, taskStartDownloading)
//             this.setState({
//                 progress: received / total
//             })
//             let downloadingProgress = Math.floor((received / total) * 100)
//             if (downloadingProgress != 99) {
//                 global.VIDEO_AUDIO_DOWNLOADING_PROGRESS = downloadingProgress
//             } else {
//                 global.VIDEO_AUDIO_DOWNLOADING_PROGRESS = undefined
//             }

//             let saveAsyncProgressObj = {
//                 progress: downloadingProgress,
//                 type: type,
//                 video_key: videoKey
//             }
//             AsyncStorage.setItem('VIDEO_AUDIO_PROGRESS_ASYNC', JSON.stringify(saveAsyncProgressObj)).then(elementObj => {
//                 console.log('VIDEO_AUDIO_PROGRESS_ASYNC', elementObj)

//             }).catch(err => {
//                 console.log('VIDEO_AUDIO_PROGRESS_ASYNC' + err)
//                 this.setState({
//                     isProgress: false
//                 })
//             });

//         });
//         taskStartDownloading.then((res) => {

//             let status = res.info().status;
//             //if(status === 200) {
//             console.warn('The file saved to ', res.path())
//             Toast.show('Your file has been downloaded successfully.')
//             global.VIDEO_AUDIO_DOWNLOADING_PROGRESS = undefined
//             this.updateArrayDownloadAudioVideo(rowItem)
//             AsyncStorage.removeItem('VIDEO_AUDIO_PROGRESS_ASYNC').then(
//                 () => {
//                     console.log('VIDEO_AUDIO_PROGRESS_ASYNC_REMOVE' + 'SUCCESS CLEAR')
//                 },
//                 () => {
//                     console.log('rejected back_press')
//                 }
//             )
//             // RNFetchBlob.fs.mv(dirs.DocumentDir + `/IFASVideoLectureTemporary/${videoKey}`, dirs.DocumentDir + `/IFASVideoLecture/${videoKey}`)
//             //     .then((res) => {
//             //         console.log('Move sucess ', res)
//             //         this.setState({
//             //             isProgress: false
//             //         })
//             //         this.updateArrayDownloadAudioVideo(rowItem)
//             //     })
//             //     .catch((error) => {
//             //         console.log('Move error ', error)
//             //         this.setState({
//             //             isProgress: false
//             //         })
//             //     })
//             // }else {
//             //     console.warn('Invalid RN-blob status ' + status);
//             // }
//         })
//             .catch(err => {
//                 console.warn('error with download' + err)
//                 this.setState({
//                     isProgress: false
//                 })
//             })

//         // })