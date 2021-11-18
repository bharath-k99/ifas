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
    Image, TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl, Modal, NativeEventEmitter, NativeModules
} from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import styles from '../styles/subject_style.js';
import CONSTANTS from '../resources/constants.js'
import renderIf from '../resources/utility.js';
import ProfileHeaderButton from '../headers/ProfileHeaderButton'
import BackSubjectsButton from '../headers/BackSubjectsButton'
import { showNativeAlert } from '../resources/app_utility.js'
import RNFetchBlob from 'rn-fetch-blob';
import Orientation from 'react-native-orientation';

//Using this for handle start conference
import { EventRegister } from 'react-native-event-listeners';
import * as GoToScreen from '../resources/goToScreen'
import DeviceInfo from 'react-native-device-info';

//Vector icon
import EntypoPDF from 'react-native-vector-icons/MaterialCommunityIcons';
import IoniconsMore from 'react-native-vector-icons/MaterialIcons';
const pDF = <EntypoPDF name="file-pdf" size={24} color={colors.theme} />;
const moreICon = <IoniconsMore name="switch-video" size={26} color={colors.white} />;
export default class subjects extends Component {

    static navigationOptions = (navigation) => {
        return ({
            title: 'Subjects',
            headerStyle: { backgroundColor: colors.theme },
            headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
            headerBackTitle: null,
            headerTintColor: 'white',

            // headerLeft: <BackSubjectsButton />,
            gesturesEnabled: false,
            // headerRight: (navigation.navigation.state.params.fromPage == null) ? <View style={{ flexDirection: 'row' }}>
            //     <TouchableOpacity
            //         activeOpacity={.9}
            //         hitSlop={{ top: 20, bottom: 20, left: 30, right: 30 }}
            //         //style={{ marginRight: dimensions.sizeRatio * 10 }}
            //         onPress={() => navigation.navigation.state.params.showQualityMenu()}>
            //         {/* {moreICon} */}
            //         <Image
            //             source={require('../images/profile_small.png')}
            //             style={{ width: dimensions.sizeRatio * 15, height: dimensions.sizeRatio * 17, marginRight: dimensions.sizeRatio * 15 }}
            //         />
            //     </TouchableOpacity>
            // </View> : <View></View>,
        })
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            access_token: '',
            dataSource: [],
            errorMessage: 'No subjects available',
            showMenu: false,
            menuTopicArray: [{ name: 'Video Quality: ', value: 360, is_selected: false }, { name: 'Video Quality: ', value: 720, is_selected: false }],
            isRecording: false,
        }
        Orientation.lockToPortrait();

        //alert(JSON.stringify(DeviceInfo.getSystemVersion())+ '\n\n'+DeviceInfo.getDeviceType() + '\n\n'+ DeviceInfo.getModel() + '\n\n'+DeviceInfo.getDeviceId())
    }

    methodGoToTopics(subjectId, subjectName) {
        if (this.props.navigation.state.params.onGoBack) {
            this.props.navigation.goBack()
            this.props.navigation.state.params.onGoBack(subjectId, subjectName);
        }
        else {
            this.props.navigation.navigate('Topics', { subjectId: subjectId.toString(), subjectName: subjectName })
        }
    }

    getSubjects() {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        console.log(formData)

        fetch(CONSTANTS.BASE + CONSTANTS.POST_SUBJECTS, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson)

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else {
                    this.setState({
                        isLoading: false,
                        isRefreshFetching: false,
                        dataSource: responseJson.data.Subjects,
                    }, function () {

                    });
                }


            })
            .catch((error) => {
                // console.error(error);
                // showNativeAlert("Network request failed")
                this.setState({
                    dataSource: [],
                    isLoading: false,
                    isRefreshFetching: false,

                    errorMessage: 'Failed to fetch your subjects.'
                })
            });
    }

    getAccessToken() {
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                self.setState({
                    access_token: value.slice(1, -1),
                }, () => { self.getSubjects() })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    async setQuality(item) {
        let storeQuality = JSON.stringify(item)
        await AsyncStorage.setItem(CONSTANTS.STORE_QUALITY, storeQuality);

    }

    getQuality = () => {
        let self = this;
        AsyncStorage.getItem(CONSTANTS.STORE_QUALITY).then(value => {
            //console.log('CONSTANTS.STORE_QUALITY1:' + value)
            if (value != undefined) {
                //console.log('CONSTANTS.STORE_QUALITY2:' + value)
                let storeQuality = JSON.parse(value)
                this.slectedMenuItemShow(storeQuality)

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    slectedMenuItemShow = (item) => {
        let previousMenuItem = this.state.menuTopicArray;
        previousMenuItem.forEach(element => {

            if (element.value == item.value) {
                element.is_selected = true
            } else {
                element.is_selected = false
            }
        });

        this.setState({
            menuTopicArray: previousMenuItem
        })
    }

    componentDidMount() {
        global.isLiveConfRunningIosForLiveSessionNotHide = true;

        global.navigation = this.props.navigation

        this.getAccessToken()
        //this.props.navigation.setParams({ showQualityMenu: this.showQualityMenu.bind(this) });

        this.getQuality()

        console.warn('PROGRESS_DOWNLOAD' + global.VIDEO_AUDIO_DOWNLOADING_PROGRESS)

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

        //Check start live conf notification or screen currently visible or not
        this.listener = EventRegister.addEventListener('start_live_conf_on_notification', (data) => {
            console.log('start_live_conf_on_notification getAccessToken ')
            GoToScreen.goToWhichScreen('Sessions', this.props)
        })

        //call api after did Focus
        const { navigation } = this.props;
        this.focusListener = navigation.addListener('didFocus', () => {
            global.isChatLiveSessionVisible = false;
            isTopicPlayerVisible = false;
        })
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
        console.log("Unmounted Subjects")
        this.focusListener.remove();
        EventRegister.removeEventListener(this.listener);
        if (Platform.OS === "ios") {
            this.screenCaptureEnabled.remove()
        }
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

    showQualityMenu() {
        // this.setState({
        //     showMenu: true
        // })
        this.props.navigation.navigate('Profile')

    }

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


    _onRefresh() {
        this.setState({ isRefreshFetching: true }, function () { this.getSubjects() });
    }

    menuItemPress = (item) => {

        if (item.value == 360) {
            this.slectedMenuItemShow(item)
            this.setQuality(item)
        } else {
            this.slectedMenuItemShow(item)
            this.setQuality(item)
        }
    }

    goToWhichScreen = (screenName) => {
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: screenName })],
        });
        this.props.navigation.dispatch(resetAction);
    }

    render() {
        let arrowComponent = this.props.navigation.state.params.fromPage == null ?
            <View style={{ flex: 1.25, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={require('../images/right_caret.png')} style={styles.indicator_image} />
            </View> : null

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

        return (
            <View style={{ flex: 1, paddingTop: dimensions.sizeRatio * 12, backgroundColor: colors.sessions_bgtheme }}>


                {renderIf(this.state.dataSource.length > 0,
                    <FlatList
                        data={this.state.dataSource}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.isRefreshFetching}
                                onRefresh={this._onRefresh.bind(this)}
                                title="Refreshing..."
                                tintColor="#fff"
                                titleColor="#fff"
                                colors={["#ffffff", "#FF0000"]}
                            />
                        }
                        renderItem={({ item }) =>
                            <TouchableOpacity
                                activeOpacity={.9}
                                onPress={() =>
                                    this.methodGoToTopics(item.subject_id, item.subject_name)
                                } >
                                <View
                                    style={{
                                        marginVertical: dimensions.sizeRatio * 5, paddingVertical: dimensions.sizeRatio * 15,
                                        marginHorizontal: dimensions.sizeRatio * 10,
                                        justifyContent: 'space-between', backgroundColor: 'white',
                                        borderRadius: dimensions.sizeRatio * 10,
                                    }}
                                >
                                    <View style={{ flexDirection: 'row' }}>

                                        <View style={{
                                            flex: 8.75,
                                            flexDirection: 'column',
                                            justifyContent: 'center'
                                        }}>
                                            <View style={{ flex: 1, justifyContent: 'center', }}>
                                                <Text style={Platform.OS == 'ios' ? styles.subjects_name_ios : styles.subjects_name_android}>
                                                    {item.subject_name}
                                                </Text>
                                                {item.ebook != '' &&
                                                    <TouchableOpacity
                                                        activeOpacity={.9}
                                                        style={{
                                                            padding: 5,
                                                            backgroundColor: colors.white,
                                                            borderRadius: dimensions.sizeRatio * 30,
                                                            borderColor: colors.theme,
                                                            borderWidth: 1,
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            width: dimensions.sizeRatio * 40,
                                                            height: dimensions.sizeRatio * 40,
                                                            marginLeft: 15,
                                                            marginTop: 5
                                                        }}
                                                        onPress={() => {
                                                            console.warn('PDFViewerScreen subject item' + item)
                                                            this.props.navigation.navigate('PDFViewerScreen', { selected_item: item, screen_name: 'subject' })
                                                        }}>
                                                        {pDF}
                                                    </TouchableOpacity>
                                                }
                                            </View>
                                        </View>
                                        {arrowComponent}
                                    </View>

                                </View>
                            </TouchableOpacity>
                        }
                        keyExtractor={(item, index) => this.keyExtractor(item)}

                    />
                )}

                {renderIf(this.state.dataSource.length == 0,
                    <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: dimensions.sizeRatio * 16, fontFamily: CONSTANTS.DEMI }}>
                            {this.state.errorMessage}
                        </Text>
                    </View>
                )}


                {
                    this.state.showMenu ? (
                        <Modal visible={this.state.showMenu}
                            transparent={true}
                            animationType="none"
                            onRequestClose={() => this.setState({
                                showMenu: false
                            })}
                        >
                            <TouchableOpacity onPress={() => this.setState({
                                showMenu: false
                            })}
                                style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%'
                                }}>
                                <View style={{
                                    position: 'absolute',
                                    backgroundColor: 'white',
                                    justifyContent: 'center',
                                    alignSelf: 'auto', height: 'auto',
                                    width: 'auto',
                                    top: 55,
                                    right: 10,
                                    minWidth: 140
                                }}>
                                    <FlatList
                                        showsVerticalScrollIndicator={false}
                                        data={this.state.menuTopicArray}
                                        extraData={this.state}
                                        keyExtractor={(item, index) => index.toString()}
                                        renderItem={({ item, index }) => (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    this.setState({
                                                        showMenu: false
                                                    })
                                                    this.menuItemPress(item)
                                                }}>

                                                <View style={{
                                                    flexDirection: 'column',
                                                    borderWidth: 1,
                                                    borderRadius: 1,
                                                    borderColor: '#f1f1f1'
                                                }}>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        paddingHorizontal: 10,
                                                        paddingVertical: 10,
                                                        backgroundColor: item.is_selected ? colors.lightgray : colors.white
                                                    }}>
                                                        <Text style={{ fontSize: 14, fontWeight: '500', color: 'black' }}>{item.name + item.value}</Text>
                                                    </View>
                                                    <View style={{
                                                        width: 'auto', height: .2,
                                                        backgroundColor: '#f1f1f1'
                                                    }} />
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            </TouchableOpacity>
                        </Modal>) : null
                }
            </View>
        );
    }
    keyExtractor = item => {
        return item.subject_id + new Date().getTime().toString() + (Math.floor(Math.random() * Math.floor(new Date().getTime()))).toString();
    };
}



