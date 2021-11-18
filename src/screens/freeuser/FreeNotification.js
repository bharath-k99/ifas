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
import { StackActions, NavigationActions, NavigationEvents } from 'react-navigation';

import DeviceInfo from 'react-native-device-info';
import Ripple from 'react-native-material-ripple';
import CardView from 'react-native-cardview';
import Orientation from 'react-native-orientation';

//Vector icon
import EntypoPDF from 'react-native-vector-icons/MaterialCommunityIcons';
import IoniconsMore from 'react-native-vector-icons/MaterialIcons';
const pDF = <EntypoPDF name="file-pdf" size={24} color={colors.theme} />;
const moreICon = <IoniconsMore name="switch-video" size={26} color={colors.white} />;

let isRecordingGloble = false;
export default class FreeNotification extends Component {

    //Navigation Method
    static navigationOptions = (navigation) => {
        return ({
            title: 'Free Notifications',
            headerStyle: { backgroundColor: colors.theme },
            headerTitleStyle: { color: colors.white, textAlign: 'center', position: 'absolute', alignItems: 'center', justifyContent: 'center', marginLeft: dimensions.width / 4 - 30 },
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
            notificationArray: [1, 2, 3],
        }
        isRecordingGloble = false
        this.offset = 1;
        this.limit = 10;
        this.pageCount = 0;
    }

    componentDidMount() {
        this.getAccessToken()
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

    getAccessToken() {
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                self.setState({
                    access_token: value.slice(1, -1),
                }, () => {
                    if (global.landingScreenFreeItem != undefined)
                        self.getNotificationListApi(true, global.landingScreenFreeItem)
                })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    getNotificationListApi(showLoader, item) {
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
        formData.append('course_id', item.id);
        formData.append('type', 1);
        formData.append('page', this.offset);
        formData.append('limit', this.limit);
        console.log(formData)

        fetch(CONSTANTS.BASE_CHAT + CONSTANTS.POST_FREE_NOTIFICATION_LIST_NEW, {
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
                    notificationArray: [],
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


    isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        const paddingToBottom = 20; // how far from the bottom
        return layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;
    };

    onEndReached = () => {
        if (!this.state.isPagginationLoading) {
            if (this.offset <= this.pageCount) {
                this.getNotificationListApi(false, global.landingScreenFreeItem);
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
                <View style={{
                    flex: 1,
                    flexDirection: 'column',
                    width: '100%',
                }}>

                    {/* Flat list */}
                    {this.state.notificationArray.length != 0 ?
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
                        this.props.navigation.navigate('FreeNotificationDetail', { selected_item: item })
                    }}>

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