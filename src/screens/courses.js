/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StatusBar, Text, View, Linking, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator, AsyncStorage, NativeModules, NativeEventEmitter } from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import CONSTANTS from '../resources/constants';
import styles from '../styles/courses_style.js';
import renderIf from '../resources/utility.js';
import { showNativeAlert } from '../resources/app_utility.js'
import PaymentHeaderCourseButton from '../headers/PaymentHeaderCourseButton';

export default class courses extends Component {

    //Navigation Method
    static navigationOptions = {
        title: 'Select Course',
        headerTitleStyle: {
            // fontWeight: '200',
            // color: '#2c38ff',
            textAlign: 'center',
            flex: 1,
        },
        headerBackTitle: null,

        headerLeft: <View />,
        headerRight: <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity hitSlop={{ top: 20, bottom: 20, left: 30, right: 30 }} onPress={() => Linking.openURL('http://ifasonline.com/onlineClass.jsp')}>
                <Image
                    source={require('../images/payment.png')}
                    style={{ width: dimensions.sizeRatio * 45, height: dimensions.sizeRatio * 20, marginRight: dimensions.sizeRatio * 20 }}
                />
            </TouchableOpacity>
        </View>,
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            isLoggedIn: false,
            dataSource: [],
            errorMessage: 'Failed to fetch courses list.',
            isRecording: false,
        }
    }

    methodGoToTopics(itemId) {
        // Alert.alert(itemId.toString())
        this.props.navigation.navigate('FreeVideos', { courseId: itemId.toString(), hideLogin: false })
    }

    methodGoToLogin() {
        this.props.navigation.navigate('Login')
    }

    methodGoToSessions() {
        //this.props.navigation.navigate('Sessions')
        //this.props.navigation.navigate('LandingScreen')
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'LandingScreen' })],
        });
        this.props.navigation.dispatch(resetAction)
    }

    methodGoToCourseUnpaid() {
        this.props.navigation.navigate('CoursesUnpaid')
    }

    loginStatus() {

        AsyncStorage.multiGet(["ACCESS_TOKEN", "COURSE_PAYMENT_STATUS"]).then(value => {

            let accessKey = value[0][0]
            let accessValue = value[0][1]
            let payKey = value[1][0]
            let payValue = value[1][1]

            console.log(accessKey) // Key1
            console.log(accessValue) // Value1
            console.log(payKey) // Key2
            console.log(payValue) // Value2

            if (accessValue !== null) {
                // We have data!!
                this.getCourses()
                CONSTANTS.IS_LOGGED_IN = true
                if (payValue == 0) { //Unpaid
                    //this.methodGoToCourseUnpaid()
                    this.methodGoToSessions()
                } else {
                    this.methodGoToSessions()
                }
            } else {
                this.getCourses()
            }


        })
    }

    componentDidMount() {

        global.navigation = this.props.navigation

        this.loginStatus()
        // Recording of
        if (Platform.OS == 'ios') {
            this.checkIfRecord()
            this.addListener()
        }
    }

    checkIfRecord() {
        console.warn('CAPTURE_SESSIONS_O' )

        try {
            //NativeModules.ScreenRecorderDetect.addScreenRecorderListner()
            NativeModules.ScreenRecorderDetect.get().then(isRecord => { 
                console.warn('CAPTURE_SESSIONS_A' + '\n\n' + JSON.stringify(isRecord))
                
                if (isRecord == 'YES') {
                    console.warn('CAPTURE_SESSIONS_B' + '\n\n' + JSON.stringify(isRecord) + '\n\n' + this.state.isRecording)
                    this.setState({
                        isRecording: true
                    })
                }
                else {
                    this.setState({ isRecording: false }, () => {
                        console.warn('CAPTURE_SESSIONS_C' + '\n\n' + JSON.stringify(isRecord) + '\n\n' + this.state.isRecording)
                    })
                }
            });
        } catch (e) {
          console.error(e);
        }
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
        console.log("Unmounted Courses")
        if (Platform.OS === "ios") {
            this.screenCaptureEnabled.remove()
        }
    }

    getCourses() {
        console.warn("base url" + CONSTANTS.BASE + CONSTANTS.GET_COURSES)
        return fetch(CONSTANTS.BASE + CONSTANTS.GET_COURSES)
            .then((response) => response.json())
            .then((responseJson) => {
                console.warn('responseJson' + JSON.stringify(responseJson))
                // showNativeAlert(responseJson.message)
                if (responseJson.code == 1) { //SUCCESS
                    this.setState({
                        isLoading: false,
                        dataSource: responseJson.data.Courses,

                    }, function () {

                    });

                    CONSTANTS.ADMIN_EMAIL = responseJson.data.admin_email
                    CONSTANTS.ADMIN_PHONE = responseJson.data.admin_phone

                } else {
                    this.setState({
                        isLoading: false,
                    }, function () {

                    });
                }

            })
            .catch((error) => {

                console.log('error message in json')
                console.error(error);
                // showNativeAlert('Network request failed')
                this.setState({
                    dataSource: [],
                    isLoading: false,
                })
            });
    }

    renderActivityIndicator() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>

                <ActivityIndicator />
                <Text style={{ top: 10, fontSize: (dimensions.sizeRatio * 20), textAlignVertical: "center", color: colors.black, fontFamily: CONSTANTS.DEMI }}>
                    Please wait...
                    </Text>
            </View>
        )
    }

    renderBottomView() {

        return (
            <View style={{ height: ((dimensions.sizeRatio) * 100), flexDirection: 'row', backgroundColor: colors.theme }}>
                {/* Left Row */}
                <View style={{ flex: 1, backgroundColor: 'transparent', paddingLeft: (dimensions.sizeRatio * 15), paddingTop: (dimensions.sizeRatio * 30) }}>
                    <Text style={{ fontSize: (dimensions.sizeRatio * 20), textAlignVertical: "center", color: colors.white, fontFamily: CONSTANTS.DEMI }}>
                        Welcome Back!
                    </Text>
                    <Text style={{ fontSize: (dimensions.sizeRatio * 11), textAlignVertical: "center", color: colors.white, fontFamily: CONSTANTS.REGULAR }}>
                        There is a lot to learn
                    </Text>
                </View>
                {/* Right Row */}
                <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: "center", alignItems: "center" }}>
                    <TouchableOpacity
                        onPress={() => {
                            this.methodGoToLogin()
                        }}
                        style={{
                            height: dimensions.sizeRatio * 51,
                            width: dimensions.sizeRatio * 145,
                            backgroundColor: colors.white,
                            borderRadius: dimensions.sizeRatio * 5
                        }}>
                        <Text style={Platform.OS == 'ios' ? styles.signin_text_ios : styles.signin_text_android}>SIGN IN</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    renderFlatList() {

        if (this.state.dataSource.length == 0) {
            return (
                <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: dimensions.sizeRatio * 16, fontFamily: CONSTANTS.DEMI, color: colors.theme }}>
                        {this.state.errorMessage}
                    </Text>
                </View>
            )
        } else {
            return (

                <View style={{ flex: 1, backgroundColor: colors.sessions_bgtheme }}>
                    <FlatList
                        data={this.state.dataSource}
                        // data={[{title: 'Title Text', key: 'item1'}, {title: 'Title Text', key: 'item2'}, {title: 'Title Text', key: 'item3'}]}
                        keyExtractor={(item, index) => item.id}
                        renderItem={({ item }) =>
                            <TouchableOpacity onPress={() => this.methodGoToTopics(item.id)}>
                                <View
                                    style={{
                                        marginVertical: dimensions.sizeRatio * 5, paddingVertical: dimensions.sizeRatio * 20,
                                        marginHorizontal: dimensions.sizeRatio * 10,
                                        justifyContent: 'space-between', backgroundColor: 'white',
                                        borderRadius: dimensions.sizeRatio * 10,
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <View style={{ flex: 1.5, alignItems: 'center', justifyContent: 'center' }}>
                                            <Image source={{ uri: item.image }} style={{ width: dimensions.sizeRatio * 30, height: dimensions.sizeRatio * 30, resizeMode: 'contain' }} />
                                        </View>
                                        <View style={{ flex: 7 }}>
                                            <Text style={Platform.OS == 'ios' ? styles.course_text_ios : styles.course_text_android}>
                                                {item.name}
                                            </Text>
                                        </View>
                                        <View style={{ flex: 1.5, alignItems: 'center', justifyContent: 'center' }}>
                                            <Image source={require('../images/right_caret.png')} style={styles.indicator_image} />
                                        </View>
                                    </View>

                                </View>
                            </TouchableOpacity>
                        }
                    />
                </View>
            )
        }
    }

    render() {
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
                <View style={{ flex: 1, backgroundColor: colors.sessions_bgtheme, paddingTop: dimensions.sizeRatio * 12 }}>

                    {/* Status Bar */}
                    {/* {renderIf(Platform.OS != 'ios',

                    <StatusBar
                        barStyle="light-content"
                        backgroundColor={colors.primary_dark}
                    />
                )} */}

                    {/* Activity View */}
                    {renderIf(this.state.isLoading,
                        this.renderActivityIndicator()
                    )}

                    {/* List View */}
                    {renderIf(this.state.isLoading == false,
                        this.renderFlatList()
                    )}

                    {/* Bottom View */}
                    {renderIf(this.state.isLoading == false || this.state.isLoading == true,
                        this.renderBottomView()
                    )}
                </View>
            );
        }
    }

}