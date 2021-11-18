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
    Image, TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl, NativeEventEmitter, NativeModules, PermissionsAndroid
} from 'react-native';
import colors from '../../resources/colors';
import renderIf from '../../resources/utility.js';
import dimensions from '../../resources/dimension';
import CONSTANTS from '../../resources/constants';
import styles from '../../styles/sessions_style.js';
import { showNativeAlert } from '../../resources/app_utility.js'
import { NavigationEvents } from 'react-navigation';
import Ripple from 'react-native-material-ripple';
import CardView from 'react-native-cardview';
import Toast from 'react-native-tiny-toast';;

//Using this for handle start conference
import Orientation from 'react-native-orientation';
import { EventRegister } from 'react-native-event-listeners';

import BackButton from 'react-native-vector-icons/MaterialIcons';
const backButton = <BackButton name="arrow-back" size={28} color={colors.black} />;

let isRecordingGloble = false;
export default class SupportChatList extends Component {


    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isPagginationLoading: false,
            isRecording: false,
            access_token: '',
            dataSource: [1, 2, 3, 4],
        }
        this.offset = 1;
        this.limit = 10;
        this.pageCount = 0;
        this.selItemId = 0;
        isRecordingGloble = false
        Orientation.lockToPortrait();
    }

    getAccessToken() {
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                this.offset = 1;
                self.setState({
                    access_token: value.slice(1, -1),
                    dataSource: ''
                }, () => { self.getMessages(true) })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    componentDidMount() {
        global.isLiveConfRunningIosForLiveSessionNotHide = true;

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
    }

    getMessages(showLoader) {
        if (showLoader == true) {
            if (this.offset == 1) {
                this.setState({
                    isLoading: true
                });
            } else {
                this.setState({
                    isPagginationLoading: true
                });
            }
        }
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('course_id', global.landingScreenPaidItem.id);
        formData.append('page', this.offset);
        formData.append('limit', this.limit);

        fetch(CONSTANTS.BASE_CHAT + CONSTANTS.POST_SEND_TECH_SUPPORT_THREAD_LIST_NEW, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log('thread response', responseJson)
                //Successful response from the API Call 

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                }
                else if (responseJson.code == 219) {
                    this.setState({
                        isLoading: false,
                        isRefreshFetching: false,
                        fetching_from_server: false,
                    })
                }
                else {
                    this.offset = this.offset + 1;
                    this.pageCount = responseJson.pageObj.totalPageCount
                    if (this.offset == 2) {
                        this.setState({
                            isLoading: false,
                            isRefreshFetching: false,
                            dataSource: responseJson.data,
                            fetching_from_server: false,
                        }, function () {
                            console.log('datasourse after response ', this.state.dataSource)
                        });
                    }
                    else {
                        this.setState({
                            isPagginationLoading: false,
                            isRefreshFetching: false,
                            dataSource: [...this.state.dataSource, ...responseJson.data],
                            fetching_from_server: false,
                        }, function () {
                            console.log('datasourse after response ', this.state.dataSource)
                        });
                    }

                }


            })
            .catch((error) => {
                // console.error(error);
                // showNativeAlert("Network request failed")
                this.setState({
                    dataSource: [],
                    isLoading: false,
                    isPagginationLoading: false,
                    isRefreshFetching: false,

                    errorMessage: 'Failed to fetch your messages.'
                })
            });
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

    onEndReached = () => {
        if (!this.state.isPagginationLoading) {
            if (this.offset <= this.pageCount) {
                this.getMessages(true);
            }
        }
    }
    isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        const paddingToBottom = 20; // how far from the bottom
        return layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;
    };

    _onRefresh() {
        this.offset = 1;
        this.setState({ isRefreshFetching: true }, function () { this.getMessages(true) });
    }
    loadMoreData = () => {
        //On click of Load More button We will call the web API again
        this.setState({ fetching_from_server: true }, () => this.getMessages(true));
    };

    returnLatestMessage(array) {
        let lastMessageObject = ''
        // for (let i = 0; i < array.length; i++){
        let currObject = array[0];
        if (currObject != undefined && currObject.TSM_MESSAGE != undefined && currObject.TSM_MESSAGE != null) {
            if (currObject.TSM_MESSAGE.trim() != '') {
                lastMessageObject = currObject
                // break;
            }
            // }
            console.log('lastMessageObject', lastMessageObject)
            return lastMessageObject.TSM_MESSAGE != undefined &&
                lastMessageObject.TSM_MESSAGE != null &&
                lastMessageObject.TSM_MESSAGE != '' ? lastMessageObject.TSM_MESSAGE.trim() : lastMessageObject.TSM_IMAGE != undefined &&
                    lastMessageObject.TSM_IMAGE != null &&
                    lastMessageObject.TSM_IMAGE != '' ?
                    '[Image attached]' : '[File attached]'
        }
    }

    methodGoToChatDetail(item) {
        this.props.navigation.navigate('SupportMessage', { selectedMessage: item.TST_ID })
    }

    renderFooter = () => {
        //it will show indicator at the bottom of the list when data is loading otherwise it returns null
        if (!this.state.isPagginationLoading) return null;
        return (
            <ActivityIndicator
                style={{
                    color: colors.theme
                }}
                size={'large'}
            />
        );
    };
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

    handleBackButtonClick = () => {
        this.props.navigation.goBack();
        return true;
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
                    {/* <Ripple
                        onPress={() => {
                            this.handleBackButtonClick()
                        }}>
                        {backButton}
                    </Ripple> */}
                    <Text style={{ fontSize: 18, fontFamily: CONSTANTS.DEMI, color: colors.black, textAlign: 'left' }}>
                        {'Support Messages'}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        this.props.navigation.navigate('SupportAddMsg', {})
                    }}>
                    <Image
                        source={require('../../images/Plus.png')}
                        style={{ width: dimensions.sizeRatio * 20, height: dimensions.sizeRatio * 20, tintColor: colors.primary_dark }}
                    />
                </TouchableOpacity>
            </View>
        )
    }

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

        console.log('feedback state', this.state.feedback)
        return (
            <View style={{
                flex: 1,
                width: '100%',
                backgroundColor: colors.sessions_bgtheme
            }}>
                {this.renderHeader()}
                {renderIf(this.state.dataSource.length > 0,
                    <View style={{
                        flex: 1,
                        width: '100%'
                    }}>
                        <View style={{
                            flex: 1,
                            paddingTop: 3,
                        }}>
                            <FlatList
                                data={this.state.dataSource}
                                onScroll={({ nativeEvent }) => {
                                    if (this.isCloseToBottom(nativeEvent)) {
                                        // Dont forget to debounce or throttle this function.
                                        this.onEndReached()
                                    }
                                }}
                                ItemSeparatorComponent={this.separatorItemComponent}
                                ListFooterComponent={this.renderFooter()}
                                renderItem={({ item }) =>
                                    <View style={{
                                        width: '100%',
                                        flexDirection: 'row',
                                        width: dimensions.width,
                                        backgroundColor: 'white',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <TouchableOpacity style={{
                                            marginVertical: dimensions.sizeRatio * 10,
                                            flexDirection: 'row',
                                            borderRadius: dimensions.sizeRatio * 10,
                                            alignItems: 'center',
                                            marginHorizontal: dimensions.sizeRatio * 10,
                                            backgroundColor: 'white'
                                        }}
                                            onPress={() => {
                                                this.methodGoToChatDetail(item)
                                            }} >
                                            <View
                                                style={{
                                                    backgroundColor: 'white',
                                                    flex: 1
                                                }}
                                            >
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Text
                                                        numberOfLines={1}
                                                        ellipsizeMode='tail'
                                                        style={Platform.OS == 'ios' ? styles.category_name_ios : styles.category_name_android}>
                                                        {item.TST_TITLE}
                                                    </Text>
                                                </View>
                                                <Text numberOfLines={1}
                                                    ellipsizeMode='tail'
                                                    style={{
                                                        fontFamily: CONSTANTS.REGULAR,
                                                        fontSize: dimensions.sizeRatio * 14,
                                                        color: colors.night,
                                                        marginTop: dimensions.sizeRatio * 10,
                                                    }}
                                                >
                                                    {item != undefined && item.tech_support_messages != undefined && this.returnLatestMessage(item.tech_support_messages)}
                                                </Text>
                                                <View
                                                    style={{
                                                        flexDirection: 'row',
                                                        width: '100%',
                                                        marginTop: dimensions.sizeRatio * 10,
                                                    }}>
                                                    <View
                                                        style={{
                                                            width: '50%',
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                            justifyContent:'flex-start'
                                                        }}>
                                                        <Text
                                                            numberOfLines={1}
                                                            ellipsizeMode='tail'
                                                            style={{
                                                                fontFamily: CONSTANTS.MEDIUM,
                                                                fontSize: dimensions.sizeRatio * 12.5,
                                                                color: colors.night,
                                                            }}>
                                                            {'Created by:' + ' '}
                                                        </Text>
                                                        <Text
                                                            numberOfLines={1}
                                                            ellipsizeMode='tail'
                                                            style={{
                                                                fontFamily: CONSTANTS.MEDIUM,
                                                                fontSize: dimensions.sizeRatio * 12.5,
                                                                color: colors.black,
                                                            }}>
                                                            {item.CREATED_BY}
                                                        </Text>
                                                    </View>
                                                    <View
                                                        style={{
                                                            width: '50%',
                                                            alignItems: 'flex-end',
                                                            justifyContent:'flex-end'
                                                        }}>
                                                        <Text
                                                            numberOfLines={1}
                                                            ellipsizeMode='tail'
                                                            style={{
                                                                fontFamily: CONSTANTS.MEDIUM,
                                                                fontSize: dimensions.sizeRatio * 14,
                                                                color: colors.black,
                                                            }}>
                                                            {item.TST_STATUS == 0 ? 'Pending' : item.TST_STATUS == 1 ? 'Open' : item.TST_STATUS == 2 ? 'Progress' : 'Resolved'}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                            {/* {renderIf(item.UNREAD_CNT != 0, <View style={{ backgroundColor: colors.red, width: 25 * dimensions.sizeRatio, aspectRatio: 1, borderRadius: (25 * dimensions.sizeRatio) / 2, alignItems: 'center', justifyContent: 'center', marginRight: 2 * dimensions.sizeRatio }}>
                                                <Text style={{
                                                    color: colors.white, fontFamily: CONSTANTS.REGULAR,
                                                    fontSize: dimensions.sizeRatio * 10.5
                                                }}>
                                                    {item.UNREAD_CNT}
                                                </Text>
                                            </View>)} */}
                                        </TouchableOpacity>
                                    </View>

                                }
                                keyExtractor={(item, index) => this.keyExtractor(item)}

                            />
                        </View>
                    </View>
                )}
            </View>
        );
    }
    keyExtractor = item => {
        return item.subject_id + new Date().getTime().toString() + (Math.floor(Math.random() * Math.floor(new Date().getTime()))).toString();
    };
}



