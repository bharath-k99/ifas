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
import { StackActions, NavigationActions } from 'react-navigation';
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
import Ripple from 'react-native-material-ripple';
import CardView from 'react-native-cardview';
import Orientation from 'react-native-orientation';
import RNFetchBlob from 'rn-fetch-blob';

//vector icon
import BookIcon from 'react-native-vector-icons/FontAwesome5';
const bookIcon = <BookIcon name="book" size={28} color={colors.theme} />;
import VideoIcon from 'react-native-vector-icons/Feather';
const videoIcon = <VideoIcon name="video" size={16} color={colors.lightgray} />;
import ForwordIcon from 'react-native-vector-icons/MaterialIcons';
const forwordIcon = <ForwordIcon name="arrow-forward" size={20} color={colors.theme} />;
import BackButton from 'react-native-vector-icons/MaterialIcons';
const backButton = <BackButton name="arrow-back" size={28} color={colors.black} />;

let isRecordingGloble = false;

export default class PaidSubjects extends Component {

    //Navigation Method
    isSessionFocus = false
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            access_token: '',
            isRecording: false,
            isRecording: '',
            subectsArray: [],
            userProfileData:undefined
        };
    }

    componentDidMount() {
        Orientation.lockToPortrait();
        this.getAccessToken()

        //Remove not completed downloaded video from storage
        AsyncStorage.getItem("VIDEO_AUDIO_PROGRESS_ASYNC").then(elementObj => {
            let item = JSON.parse(elementObj);
            console.log('videoAudioProgressAsync_out' + JSON.stringify(item))
            if (item != undefined && item != null && item != '') {
                console.log('videoAudioProgressAsync_inner')
                this.deleteOnlyFile(item)
            } else {
                console.log('videoAudioProgressAsync_not_found')
            }
        }).catch(err => {
            console.log(err)
        });

        // Recording of
        if (Platform.OS == 'ios') {
            this.addListener()
        }
    }
    componentWillUnmount() {
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

    deleteOnlyFile = async (rowItem) => {
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
                        self.getSubectApi(global.landingScreenPaidItem)
                })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    getSubectApi(item) {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('course_id', item.id);
        formData.append('ebook_or_video', 1);
        console.log(formData)

        fetch(CONSTANTS.BASE + CONSTANTS.POST_FREE_SUBJECT_LIST_NEW, {
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
                } else {
                    this.setState({
                        isLoading: false,
                        subectsArray: responseJson.data.Subjects,
                    });
                    this.getProfile()
                }


            })
            .catch((error) => {
                // console.error(error);
                // showNativeAlert("Network request failed")
                this.setState({
                    subectsArray: [],
                    isLoading: false,
                    errorMessage: 'Failed to fetch your subjects.'
                })
            });
    }

    getProfile() {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);

        fetch(CONSTANTS.BASE + CONSTANTS.PROFILE, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {

                if (responseJson.code == 201) {

                } else {
                    console.warn('PROFILE_DATA', responseJson.data.User)
                    this.setState({
                        userProfileData:responseJson.data.User
                    })
                }


            })
            .catch((error) => {

            });
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

    handleBackButtonClick = () => {
        global.isChatLiveSessionVisible = true;
        this.props.navigation.goBack();
        return true;
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
                    {this.state.subectsArray.length != 0 ?
                    <View style={{
                        flex: 1,
                        width: '100%',
                        height: '100%',
                        paddingBottom: 10
                    }}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={true}
                            data={this.state.subectsArray}
                            renderItem={({ item, index }) => this.renderSubjectsList(item, index)}
                            extraData={this.state}
                            keyExtractor={(item, index) => index.toString()}
                        //ItemSeparatorComponent={this.itemSepratorView}
                        />
                    </View>
                    :
                    <View style={{
                        flex: 1,
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Text numberOfLines={1}
                            style={{
                                color: colors.black,
                                fontFamily: CONSTANTS.MEDIUM,
                                fontSize: dimensions.sizeRatio * 22,
                            }}
                            numberOfLines={1}>
                            {'No record found!'}
                        </Text>
                    </View>
                    }
                </View>
            );
        }
    }

    renderSubjectsList = (item, index) => {
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
                <Ripple style={{
                    flexDirection: 'row',
                    width: '100%',
                    paddingHorizontal: 10,
                    paddingVertical: 10
                }}
                    onPress={() => {
                        if (this.props.navigation.state.params.onGoBack) {
                            this.props.navigation.goBack()
                            this.props.navigation.state.params.onGoBack(item.subject_id, item.subject_name);
                        }
                        else {
                            this.props.navigation.navigate('PaidTopic', { selected_item: item, screen_name: 'PaidSubjects',profile_data:this.state.userProfileData })
                        }
                        //this.props.navigation.navigate('Topics', { subjectId: item.subject_id, subjectName: item.subject_name })
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
                                numberOfLines={1}>{item.subject_name}</Text>
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
                                    numberOfLines={1}>{item.video_duration != null ?
                                        item.video_cnt + ' videos | ' + ((parseInt(item.video_duration / 60)) > 0 ?
                                            parseInt(item.video_duration / 60) + 'h' : '') + ' ' +
                                        (parseInt(item.video_duration % 60)) + 'm' : ' --'
                                    }</Text>
                            </View>
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
                            {forwordIcon}
                        </View>
                    </View>
                </Ripple>
            </CardView>
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
                    flexDirection: 'row'
                }}>
                <Ripple
                    onPress={() => {
                        this.handleBackButtonClick()
                    }}>
                    {backButton}
                </Ripple>
                <Text style={{ fontSize: 18, fontFamily: CONSTANTS.DEMI, color: colors.black, textAlign: 'left', marginLeft: 15 }}>
                    {'Video Lectures'}
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