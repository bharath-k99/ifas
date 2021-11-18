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
import { NavigationEvents } from 'react-navigation';

//Using this for handle start conference
import { EventRegister } from 'react-native-event-listeners';
import * as GoToScreen from '../resources/goToScreen'
import DeviceInfo from 'react-native-device-info';
import Ripple from 'react-native-material-ripple';
import CardView from 'react-native-cardview'

//Vector icon
import EntypoPDF from 'react-native-vector-icons/MaterialCommunityIcons';
import IoniconsMore from 'react-native-vector-icons/MaterialIcons';
const pDF = <EntypoPDF name="file-pdf" size={24} color={colors.theme} />;
const moreICon = <IoniconsMore name="switch-video" size={26} color={colors.white} />;

let isRecordingGloble = false;
export default class NotificationScreen extends Component {

    //Navigation Method
    static navigationOptions = (navigation) => {
        return ({
            title: 'Notifications',
            headerStyle: { backgroundColor: colors.theme },
            headerTitleStyle: { color: colors.white, textAlign: 'center', position:'absolute',alignItems:'center',justifyContent:'center',marginLeft:dimensions.width/4 - 20 },
            headerBackTitle: null,
            headerTintColor: 'white',
            //headerLeft: <BackSubjectsButton />,

            headerRight: <View></View>,
            gesturesEnabled: false,

        })
    };
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isPagginationLoading: false,
            access_token: '',
            notificationArray: [],
            // Tab bar color handling
            isSelectedTabType: 'first',
            firstTabBackGroundColor: colors.theme,
            firstTabTextColor: colors.white,
            secondTabBackGroundColor: colors.white,
            secondTabTextColor: colors.black,
            thirdTabBackGroundColor: colors.white,
            thirdTabTextColor: colors.black,
        }
        isRecordingGloble = false
        this.offset = 1;
        this.limit = 10;
        this.pageCount = 0;
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
                }, () => {
                    self.getNotificationList(true, 1)
                })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }
    componentDidMount() {
        // Recording of
        if (Platform.OS == 'ios') {
            this.addListener()
        }
        this.getAccessToken()
    }

    componentWillUnmount() {
        if (Platform.OS === "ios") {
            this.screenCaptureEnabled.remove()
        }
    }

    getNotificationList(showLoader, type) {
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
        formData.append('type', type);
        formData.append('page', this.offset);
        formData.append('limit', this.limit);
        formData.append('course_id', global.landingScreenPaidItem.id);
        console.log(formData)

        fetch(CONSTANTS.BASE_CHAT + CONSTANTS.POST_NOTIFICATION_LIST, {
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
                    })
                }
                else {
                    //console.log('datasourse before response ', this.state.dataSource)
                    this.offset = this.offset + 1;
                    this.pageCount = responseJson.pageObj.totalPageCount
                    if (this.offset == 2) {
                        this.setState({
                            isLoading: false,
                            notificationArray: responseJson.data,
                        }, function () {
                            console.log('datasourse after response ', this.state.notificationArray)
                        });
                    }
                    else {
                        this.setState({
                            isPagginationLoading: false,
                            notificationArray: [...this.state.notificationArray, ...responseJson.data],
                        }, function () {
                            console.log('datasourse after response ', this.state.notificationArray)
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
        this.props.navigation.popToTop()

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

    onClickTabSelected = (type) => {
        if (type == 'first') {
            this.setState({
                isSelectedTabType: 'first',
                firstTabBackGroundColor: colors.theme,
                firstTabTextColor: colors.white,
                secondTabBackGroundColor: colors.white,
                secondTabTextColor: colors.black,
                thirdTabBackGroundColor: colors.white,
                thirdTabTextColor: colors.black,
            }, () => {
                this.offset = 1;
                this.limit = 10;
                this.pageCount = 0;
                this.getNotificationList(true, 1);

            })
        } else if (type == 'second') {
            this.setState({
                isSelectedTabType: 'second',
                firstTabBackGroundColor: colors.white,
                firstTabTextColor: colors.black,
                secondTabBackGroundColor: colors.theme,
                secondTabTextColor: colors.white,
                thirdTabBackGroundColor: colors.white,
                thirdTabTextColor: colors.black,
            }, () => {
                this.offset = 1;
                this.limit = 10;
                this.pageCount = 0;
                this.getNotificationList(true, 2);
            })
        } else {
            this.setState({
                isSelectedTabType: 'third',
                firstTabBackGroundColor: colors.white,
                firstTabTextColor: colors.black,
                secondTabBackGroundColor: colors.white,
                secondTabTextColor: colors.black,
                thirdTabBackGroundColor: colors.theme,
                thirdTabTextColor: colors.white,
            }, () => {
                this.offset = 1;
                this.limit = 10;
                this.pageCount = 0;
                this.getNotificationList(true, 3);
            })
        }
    }

    _onWillFocus() {
        //this.getAccessToken()
    }

    isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        const paddingToBottom = 20; // how far from the bottom
        return layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;
    };

    onEndReached = () => {
        if (!this.state.isPagginationLoading) {
            if (this.offset <= this.pageCount) {
                if (this.state.isSelectedTabType == 'first') {
                    this.getNotificationList(true, 1);
                } else if (this.state.isSelectedTabType == 'second') {
                    this.getNotificationList(true, 2);
                } else {
                    this.getNotificationList(true, 3);
                }
            }
        }
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

        return (
            <View style={{
                flex: 1,
                width: '100%',
                backgroundColor: colors.sessions_bgtheme
            }}>

                <NavigationEvents
                    onWillFocus={payload => this._onWillFocus()}
                />
                <View style={{
                    flex: 1,
                    flexDirection: 'column',
                    width: '100%',
                }}>
                    {/* Top tab bar make custom tab bar */}
                    <View style={{
                        flexDirection: 'row',
                        width: '100%',
                        borderBottomWidth:.5,
                        borderBottomColor:colors.theme
                    }}>
                        {/* First item */}
                        <Ripple
                            style={{
                                width: '33.3%',
                                backgroundColor: this.state.isSelectedTabType == 'first' ? colors.theme : colors.white,
                                paddingVertical: 15,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                            onPress={() => {
                                this.onClickTabSelected('first')
                            }}>
                            <Text style={{
                                fontSize: (dimensions.sizeRatio * 15),
                                textAlignVertical: "center",
                                color: this.state.isSelectedTabType == 'first' ? colors.white : colors.theme,
                                fontFamily: CONSTANTS.DEMI
                            }}
                            numberOfLines={1}>{'Schedule'}</Text>
                        </Ripple>

                        {/* Second item */}
                        <Ripple
                            style={{
                                width: '33.3%',
                                paddingVertical: 15,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: this.state.isSelectedTabType == 'second' ? colors.theme : colors.white,
                            }}
                            onPress={() => {
                                this.onClickTabSelected('second')
                            }}>
                            <Text style={{
                                fontSize: (dimensions.sizeRatio * 15),
                                textAlignVertical: "center",
                                color: this.state.isSelectedTabType == 'second' ? colors.white : colors.theme,
                                fontFamily: CONSTANTS.DEMI
                            }}
                            numberOfLines={1}>{'Live Conference'}</Text>
                        </Ripple>

                        {/* Third item */}
                        <Ripple
                            style={{
                                width: '33.3%',
                                paddingVertical: 15,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: this.state.isSelectedTabType == 'third' ? colors.theme : colors.white,
                            }}
                            onPress={() => {
                                this.onClickTabSelected('third')
                            }}>
                            <Text style={{
                                fontSize: (dimensions.sizeRatio * 15),
                                textAlignVertical: "center",
                                color: this.state.isSelectedTabType == 'third' ? colors.white : colors.theme,
                                fontFamily: CONSTANTS.DEMI
                            }}
                            numberOfLines={1}>{'Others'}</Text>
                        </Ripple>
                    </View>

                    {/* Flat list */}
                    <View style={{
                        flex: 1,
                        flexDirection: 'column',
                        width: '100%',
                        paddingHorizontal: 5,
                        paddingBottom: 10
                    }}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={true}
                            data={this.state.notificationArray}
                            renderItem={({ item, index }) => this.renderNotificationList(item, index)}
                            extraData={this.state}
                            keyExtractor={(item, index) => index.toString()}
                            ListFooterComponent={this.renderFooter()}
                            onScroll={({ nativeEvent }) => {
                                if (this.isCloseToBottom(nativeEvent)) {
                                    // Dont forget to debounce or throttle this function.
                                    this.onEndReached()
                                }
                            }}
                        />
                    </View>
                </View>
            </View >
        )
    }

    renderNotificationList = (item, index) => {
        console.log('item  ', item)
        return (
            <CardView
                style={{
                    width: '100%',
                    backgroundColor: colors.white,
                    marginTop: 10
                }}
                cardElevation={3}
                cardMaxElevation={2}
                cornerRadius={5}>
                <Ripple style={{
                    flexDirection: 'column',
                    width: '100%',
                    padding: 10
                }}
                    onPress={() => {
                        this.props.navigation.navigate('NotificationDetail', { prop: item })
                    }}>
                    {/* <Text style={{
                        fontSize: (dimensions.sizeRatio * 18),
                        color: colors.black,
                        fontFamily: CONSTANTS.DEMI
                    }}
                        numberOfLines={1}>{'Message title..'}</Text> */}

                    <Text style={{
                        marginTop: 10,
                        fontSize: (dimensions.sizeRatio * 15),
                        color: colors.black,
                        fontFamily: CONSTANTS.MEDIUM
                    }}
                        numberOfLines={2}>{item.UN_MESSAGE}</Text>

                    <Text style={{
                        marginTop: 10,
                        fontSize: (dimensions.sizeRatio * 14),
                        color: colors.gray,
                        fontFamily: CONSTANTS.REGULAR
                    }}
                        numberOfLines={1}>{item.UN_CREATED_AT}</Text>
                </Ripple>
            </CardView>
        )
    }
}