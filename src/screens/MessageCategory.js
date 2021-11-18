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
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import styles from '../styles/subject_style.js';
import CONSTANTS from '../resources/constants.js'
import renderIf from '../resources/utility.js';
import ProfileHeaderButton from '../headers/ProfileHeaderButton'
import BackSubjectsButton from '../headers/BackSubjectsButton'
import { showNativeAlert } from '../resources/app_utility.js'
import { NavigationEvents } from 'react-navigation';
import RatingView from './RatingView'
import Loader from './loader/Loader'
import Toast from 'react-native-tiny-toast';
import Orientation from 'react-native-orientation';

//Using this for handle start conference
import { EventRegister } from 'react-native-event-listeners';
import * as GoToScreen from '../resources/goToScreen'

let isRecordingGloble = false;
export default class MessageCategory extends Component {

    //Navigation Method

    static navigationOptions = (navigation) => {
        return ({
            title: 'Messages',
            headerStyle: { backgroundColor: colors.theme },
            headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
            headerBackTitle: null,
            headerTintColor: 'white',

            // headerLeft: <BackSubjectsButton />,


            gesturesEnabled: false,
            headerRight: <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity hitSlop={{ top: 20, bottom: 20, left: 30, right: 30 }}
                    onPress={() => {
                        if (!isRecordingGloble) {
                            navigation.navigation.navigate('AddMessage')
                        }
                    }}>
                    <Image
                        source={require('../images/Plus.png')}
                        style={{ width: dimensions.sizeRatio * 20, height: dimensions.sizeRatio * 20, marginRight: dimensions.sizeRatio * 20 }}
                    />
                </TouchableOpacity>
            </View>,
        })
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            access_token: '',
            // dataSource: [{ 'cat_name': 'Accounting and Finance', 'cat_description': 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...' }, { 'cat_name': 'Accounting and Finance', 'cat_description': 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...' }, { 'cat_name': 'Accounting and Finance', 'cat_description': 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...' }, { 'cat_name': 'Accounting and Finance', 'cat_description': 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...' }, { 'cat_name': 'Accounting and Finance', 'cat_description': 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...' }, { 'cat_name': 'Accounting and Finance', 'cat_description': 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...' }],
            dataSource: [],
            errorMessage: 'No messages available',
            fetching_from_server: false,
            feedback: false,
            isPagginationLoading: false,
            isRecording: false,
        }
        this.offset = 1;
        this.limit = 10;
        this.pageCount = 0;
        this.selItemId = 0;
        //this.onEndReached = this.onEndReached.bind(this);

        isRecordingGloble = false

        Orientation.lockToPortrait();
    }

    methodGoToChatDetail(item) {
        this.props.navigation.navigate('MessageChat', { selectedMessage: item.MT_ID, selectedItemObj: item  })
    }

    _onWillFocus() {
        this.getAccessToken()
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
        formData.append('page', this.offset);
        formData.append('limit', this.limit);
        console.log(formData)

        fetch(CONSTANTS.BASE_CHAT + CONSTANTS.GET_MESSAGE_LIST, {
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
                    //console.log('datasourse before response ', this.state.dataSource)
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

    sendFeedback(threadId, rating, message) {
        this.setState({
            isLoading: true
        });
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('thread_id', threadId);
        formData.append('rating', rating);
        formData.append('message', message);


        console.log(formData)

        fetch(CONSTANTS.BASE_CHAT + CONSTANTS.SEND_FEEDBACK, {
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
                else if (responseJson.code == 1) {
                    Alert.alert('IFAS', CONSTANTS.FEEDBACK_SUCCESS);
                    this.offset = 1;
                    this.getMessages(false)
                }
                else {
                    this.setState({
                        isLoading: false
                    });
                    Alert.alert('IFAS', responseJson.message);
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
        // this.getAccessToken()
        // this.props.navigation.setParams({ showProfile: this.showProfile.bind(this) });

        //Check start live conf notification or screen currently visible or not
        this.listener = EventRegister.addEventListener('start_live_conf_on_notification', (data) => {
            console.log('start_live_conf_on_notification getAccessToken ')
            GoToScreen.goToWhichScreen('Sessions', this.props)
        })

        //call api after did Focus
        const { navigation } = this.props;
        this.focusListener = navigation.addListener('didFocus', () => {
            global.isChatLiveSessionVisible = false;
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

    gotoNewMessageScreen() {
        this.props.navigation.navigate('AddMessage')
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

    returnLatestMessage(array) {
        let lastMessageObject = ''
        // for (let i = 0; i < array.length; i++){
        let currObject = array[0];
        if (currObject != undefined && currObject.M_MESSAGE != undefined && currObject.M_MESSAGE != null) {
            if (currObject.M_MESSAGE.trim() != '') {
                lastMessageObject = currObject
                // break;
            }
            // }
            console.log('lastMessageObject', lastMessageObject)
            return lastMessageObject.M_MESSAGE != undefined &&
                lastMessageObject.M_MESSAGE != null &&
                lastMessageObject.M_MESSAGE != '' ? lastMessageObject.M_MESSAGE.trim() : lastMessageObject.M_IMAGE != undefined &&
                    lastMessageObject.M_IMAGE != null &&
                    lastMessageObject.M_IMAGE != '' ?
                    '[Image attached]' : '[File attached]'

        }
    }
    feedbackAction = (threadId, id, message) => {
        console.warn('id is printing : -' + threadId + '\n\n' + id + '\n\n' + message)
        if (id == '' && id == 0) {
            Toast.show(CONSTANTS.NO_FEEDBACK_RATE)
            //Alert.alert('IFAS', CONSTANTS.NO_FEEDBACK_RATE);
        } else {
            this.setState({
                feedback: false
            })
            this.sendFeedback(threadId, id, message)
        }
    }

    dismissRatingDialog = () => {
        this.setState({
            feedback: false
        })
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
            ></View>
        );

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
                    justifyContent:'space-between'
                }}>

                <Text style={{ fontSize: 18, fontFamily: CONSTANTS.DEMI, color: colors.black, textAlign: 'left' }}>
                    {'Messages'}
                </Text>
                <TouchableOpacity
                    onPress={() => {
                        if (!isRecordingGloble) {
                            this.props.navigation.navigate('AddMessage')
                        }
                    }}>
                    <Image
                        source={require('../images/Plus.png')}
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

                <NavigationEvents
                    onWillFocus={payload => this._onWillFocus()}
                />
                {renderIf(this.state.dataSource.length > 0,
                    <View style={{
                        flex: 1,
                        width: '100%'
                    }}>
                        {this.renderHeader()}
                        <View style={{
                            flex:1,
                            paddingTop: 3,
                        }}>
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
                                onScroll={({ nativeEvent }) => {
                                    if (this.isCloseToBottom(nativeEvent)) {
                                        // Dont forget to debounce or throttle this function.
                                        this.onEndReached()
                                    }
                                }}
                                ItemSeparatorComponent={this.separatorItemComponent}
                                ListFooterComponent={this.renderFooter()}
                                //onEndReached={this.onEndReached}
                                //onEndReachedThreshold={0.3}
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
                                            width: dimensions.width - (20 * dimensions.sizeRatio), backgroundColor: 'white'
                                        }}
                                            //onPress={() => this.methodGoToChatDetail(item)} 
                                            onPress={() => {
                                                if (item.MT_IS_RESOLVED == 0) {
                                                    this.methodGoToChatDetail(item)
                                                }else{
                                                    alert('Your query already resolved.')
                                                    this.methodGoToChatDetail(item)
                                                }
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
                                                        {item.MT_TITLE}
                                                    </Text>
                                                </View>
                                                <Text numberOfLines={1}
                                                    ellipsizeMode='tail'
                                                    style={{
                                                        fontFamily: CONSTANTS.REGULAR,
                                                        fontSize: dimensions.sizeRatio * 14,
                                                        color: colors.night,
                                                        marginHorizontal: dimensions.sizeRatio * 14,
                                                        marginTop: dimensions.sizeRatio * 10,
                                                    }}
                                                //style={Platform.OS == 'ios' ? styles.category_descrtiption_ios : styles.category_descrtiption_android}
                                                >
                                                    {this.returnLatestMessage(item.messages)}
                                                </Text>
                                                {item.IS_SENDER == false &&
                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            width: '100%',
                                                            marginHorizontal: dimensions.sizeRatio * 14,
                                                            marginTop: dimensions.sizeRatio * 10,
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
                                                    </View>}
                                            </View>
                                            {renderIf(item.UNREAD_CNT != 0, <View style={{ backgroundColor: colors.red, width: 25 * dimensions.sizeRatio, aspectRatio: 1, borderRadius: (25 * dimensions.sizeRatio) / 2, alignItems: 'center', justifyContent: 'center', marginRight: 2 * dimensions.sizeRatio }}>
                                                <Text style={{
                                                    color: colors.white, fontFamily: CONSTANTS.REGULAR,
                                                    fontSize: dimensions.sizeRatio * 10.5
                                                }}>
                                                    {item.UNREAD_CNT}
                                                </Text>
                                            </View>)}
                                            <TouchableOpacity style={{
                                                marginRight: 0, width: 60 * dimensions.sizeRatio,
                                                height: 60 * dimensions.sizeRatio,
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }} onPress={() => {
                                                this.selItemId = item.MT_ID
                                                console.log('this.selItemId', this.selItemId)
                                                if (item.IS_SENDER == false) {
                                                    Alert.alert('IFAS', CONSTANTS.FEEDBACK_TEACHER_ERROR);
                                                }
                                                else if (item.IS_RESPOND == true) {
                                                    Alert.alert('IFAS', CONSTANTS.FEEDBACK_ALREADY_ERROR);
                                                }
                                                else {
                                                    this.setState({
                                                        feedback: true
                                                    })
                                                }
                                            }}>
                                                <Image
                                                    style={{ width: 35 * dimensions.sizeRatio, height: 35 * dimensions.sizeRatio }}
                                                    source={require('../images/review.png')}
                                                    resizeMode='contain'
                                                />
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                        {/* <TouchableOpacity style={{ width: 60 * dimensions.sizeRatio, height: 60 * dimensions.sizeRatio, right: dimensions.sizeRatio * 60, position: 'absolute', alignItems: 'center', justifyContent: 'center', marginTop: ((dimensions.sizeRatio * 25) - ((25 * dimensions.sizeRatio) / 2) + 5),backgroundColor:'blue' }} onPress={() => {
                                    this.selItemId = item.MT_ID
                                    console.log('this.selItemId', this.selItemId)
                                    this.setState({
                                        feedback: true
                                    })
                                }}>
                                    <Image
                                        style={{ width: 30 * dimensions.sizeRatio, height: 30 * dimensions.sizeRatio }}
                                        source={require('../images/review.png')}
                                        resizeMode='contain'
                                    />
                                </TouchableOpacity> */}
                                        {/* {renderIf(item.UNREAD_CNT != 0, <View style={{ backgroundColor: colors.red, width: 25 * dimensions.sizeRatio, aspectRatio: 1, right: dimensions.sizeRatio * 15, position: 'absolute', borderRadius: (25 * dimensions.sizeRatio) / 2, alignItems: 'center', justifyContent: 'center', marginTop: ((dimensions.sizeRatio * 25) - ((25 * dimensions.sizeRatio) / 2) + 5) }}>
                                                <Text style={{
                                                    color: colors.white, fontFamily: CONSTANTS.REGULAR,
                                                    fontSize: dimensions.sizeRatio * 10.5
                                                }}>
                                                    {item.UNREAD_CNT}
                                                </Text>
                                            </View>)} */}
                                    </View>

                                }
                                keyExtractor={(item, index) => this.keyExtractor(item)}

                            />
                        </View>
                    </View>
                )}

                {renderIf(this.state.dataSource.length == 0,
                    <View style={{ flex: 1, backgroundColor: 'transparent', }}>
                        {this.renderHeader()}
                        <View
                        style={{
                            flex:1,
                            width:'100%',
                            justifyContent: 'center', 
                            alignItems: 'center'
                        }}>
                        <Text style={{ fontSize: dimensions.sizeRatio * 16, fontFamily: CONSTANTS.DEMI }}>
                            {this.state.errorMessage}
                        </Text>
                        </View>
                    </View>
                )}
                <RatingView
                    feedback={this.state.feedback}
                    selThreadId={this.selItemId}
                    selectOption={this.feedbackAction}
                    dismissRatingDialog={this.dismissRatingDialog}
                    opacityArray={[0.4, 0.4, 0.4, 0.4, 0.4]}
                    updateProps={true}
                />
            </View>
        );
    }
    keyExtractor = item => {
        return item.subject_id + new Date().getTime().toString() + (Math.floor(Math.random() * Math.floor(new Date().getTime()))).toString();
    };
}



