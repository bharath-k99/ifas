/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StatusBar, Text, View, Button, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, AsyncStorage, NativeEventEmitter, NativeModules } from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import CONSTANTS from '../resources/constants';
import BackProfileButton from '../headers/BackProfileButton'
import renderIf from '../resources/utility.js';
import { showNativeAlert } from '../resources/app_utility.js'
import Profile_Detail from '../components/profile_component.js'
import Profile_Top from '../components/profile_top.js'
import LogoutButton from '../headers/LogoutButton.js'
import Orientation from 'react-native-orientation';
import { StackActions, NavigationActions } from 'react-navigation';

import {
    handleAndroidBackButtonSimple, exitAlert, removeAndroidBackButtonHandler
} from '../resources/backHandleAction.js';

//Using this for handle start conference
import { EventRegister } from 'react-native-event-listeners';
import * as GoToScreen from '../resources/goToScreen'

export default class profile extends Component {

    //Navigation Method
    static navigationOptions = (navigation) => {
        const { state } = navigation;
        return ({
            title: 'Profile',
            headerStyle: { backgroundColor: colors.theme },
            headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
            // headerLeft: <BackProfileButton />,
            headerTintColor: 'white',
            headerRight: <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity hitSlop={{ top: 20, bottom: 20, left: 30, right: 30 }} onPress={() => Alert.alert(
                    'IFAS',
                    'Are you sure you want to logout?',
                    [
                        { text: 'Yes', onPress: () => navigation.navigation.state.params.logoutAPI() },
                        { text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                    ],
                    { cancelable: false }
                )}>
                    <Image
                        source={require('../images/logout.png')}
                        style={{ width: dimensions.sizeRatio * 18, height: dimensions.sizeRatio * 18, marginRight: dimensions.sizeRatio * 20, tintColor: 'white', resizeMode: 'contain' }}
                    />
                </TouchableOpacity>
            </View>,
            gesturesEnabled: false,
        })
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            access_token: '',
            userData: {},
            errorMessage: 'Failed to fetch profile information.',
            isRecording: false,
            //Secon phase
            courseName: ''
        }

        Orientation.lockToPortrait();
    }

    getAccessToken() {
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                self.setState({
                    access_token: value.slice(1, -1),
                }, () => { self.getProfile() })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })

    }

    componentDidMount() {
        global.isLiveConfRunningIosForLiveSessionNotHide = true;

        global.navigation = this.props.navigation

        this.getAccessToken()
        // handleAndroidBackButtonSimple(this.props.navigation)
        this.props.navigation.setParams({ logoutAPI: this.logoutAPI.bind(this) });

        // Recording of
        if (Platform.OS == 'ios') {
            this.addListener()
        }

        //Check start live conf notification or screen currently visible or not
        this.listener = EventRegister.addEventListener('start_live_conf_on_notification', (data) => {
            console.log('start_live_conf_on_notification getAccessToken ')
            GoToScreen.goToWhichScreen('Sessions', this.props)
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
        // removeAndroidBackButtonHandler()
        EventRegister.removeEventListener(this.listener);
        if (Platform.OS === "ios") {
            this.screenCaptureEnabled.remove()
        }
    }

    logoutUser(isButtonPressed = true) {
        if (isButtonPressed == false) {
            showNativeAlert(CONSTANTS.LOGOUT_MESSAGE)
        }

        CONSTANTS.IS_LOGGED_IN = false
        CONSTANTS.TOP_SCREEN = ''
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

    logoutAPI() {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);

        fetch(CONSTANTS.BASE + CONSTANTS.LOGOUT, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {

                if (responseJson.code == 1) {
                    this.removeItemValue('ACCESS_TOKEN', true)
                } else {
                    showNativeAlert(CONSTANTS.SWW_MESSAGE)
                }


            })
            .catch((error) => {
                // console.error(error);
                showNativeAlert("Network request failed")
            });
    }

    getProfile() {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        // if(global.landingScreenPaidItem != undefined && global.landingScreenPaidItem != null){
        // formData.append('course_id', global.landingScreenPaidItem.id);
        // }
        // else{
        // formData.append('course_id', global.landingScreenFreeItem.id);
        // }

        console.log(formData)

        fetch(CONSTANTS.BASE + CONSTANTS.PROFILE, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson.data.User)
                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN', false)
                } else {
                    console.warn('PROFILE_DATA', responseJson)
                    this.setState({
                        isLoading: false,
                        userData: responseJson.data.User,
                    });
                    let name = '';
                    if (responseJson.data.User != undefined && responseJson.data.User.COURSES != null &&
                        responseJson.data.User.COURSES.length != 0) {
                        responseJson.data.User.COURSES.forEach((element, item, array) => {
                            if (item == 0) {
                                name = element.course.NAME
                            } else {
                                name += ', ' + element.course.NAME
                            }
                        });
                        this.setState({
                            courseName: name
                        }, () => {
                            console.warn('COURSE_NAME', this.state.courseName)
                        })
                    }
                }


            })
            .catch((error) => {
                // console.error(error);
                // showNativeAlert("Network request failed")
                this.setState({
                    userData: {},
                    isLoading: false,
                })
            });
    }

    removeItemValue(key, isButtonPressed = true) {
        let self = this;
        AsyncStorage.removeItem(key).then(
            () => {
                self.logoutUser(isButtonPressed)
            },
            () => {
                console.log('rejected')
            }
        )
    }



    render() {

        if (this.state.isLoading == true) {
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

        if (Object.keys(this.state.userData).length == 0) {
            return (
                <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: dimensions.sizeRatio * 16, fontFamily: CONSTANTS.DEMI, }}>
                        {this.state.errorMessage}
                    </Text>
                </View>
            )
        }
        let middleName = this.state.userData.MIDDLE_NAME == null ? '' : this.state.userData.MIDDLE_NAME
        return (

            <ScrollView>
                <View style={{ flex: 1 }}>

                    <View style={{ flex: 0, marginTop: dimensions.sizeRatio * 20 }}>
                        <Profile_Top name={this.state.userData.FIRST_NAME + ' ' + middleName + ' ' + this.state.userData.LAST_NAME} email={this.state.userData.EMAIL} />
                    </View>

                    <View style={{
                        flex: 0, paddingVertical: dimensions.sizeRatio * 15, backgroundColor: colors.sessions_bgtheme, marginHorizontal: dimensions.sizeRatio * 25, marginTop: dimensions.sizeRatio * 25, borderRadius: dimensions.sizeRatio * 10, shadowColor: '#000000',
                        shadowOffset: {
                            width: 0,
                            height: 0
                        },
                        shadowRadius: 3,
                        shadowOpacity: 0.4
                    }}>

                        <Profile_Detail title='Username' value={this.state.userData.USER_NAME} imagePath={require('../images/user_profile.png')} />
                        <Profile_Detail title='Phone' value={this.state.userData.PHONE} imagePath={require('../images/phone.png')} />
                        {/* Course */}
                        <View
                            style={{
                                paddingVertical: 10,
                                flexDirection: 'row',
                                paddingHorizontal:20,
                            }}>
                            <Image
                                source={require('../images/address.png')}
                                style={{ width: dimensions.sizeRatio * 16, height: dimensions.sizeRatio * 15, marginTop:15 }}
                                resizeMode='contain' />
                            <View
                                style={{
                                    width: '100%',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    paddingHorizontal:20
                                }}>
                                <Text style={{ fontFamily: CONSTANTS.REGULAR, fontSize: dimensions.sizeRatio * 14, color: colors.lightblack }}>
                                    {'Course'}
                                </Text>
                                <Text style={{ fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 17,marginTop:10 }}>
                                    {this.state.courseName}
                                </Text>
                            </View>
                        </View>
                        {/* <Profile_Detail title='Course' value={this.state.courseName} imagePath={require('../images/address.png')} /> */}
                        <Profile_Detail title='District' value={this.state.userData.DISTRICT.trim()} imagePath={require('../images/location.png')} />
                        <TouchableOpacity
                            style={{
                                width: '100%',
                                flexDirection: 'row',
                                paddingHorizontal: 22,
                                marginTop: 10,
                                alignItems: 'center',
                            }}
                            onPress={() => {
                                Alert.alert(
                                    'IFAS',
                                    'Are you sure you want to logout?',
                                    [
                                        { text: 'Yes', onPress: () => this.logoutAPI() },
                                        { text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                    ],
                                    { cancelable: false }
                                )
                            }}>
                            <Image source={require('../images/logout.png')} style={{ width: dimensions.sizeRatio * 16, height: dimensions.sizeRatio * 15, tintColor: 'grey' }} resizeMode='contain' />
                            <Text style={{ fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 17, marginLeft: 20 }}>
                                {'Logout'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        );
    }

}
