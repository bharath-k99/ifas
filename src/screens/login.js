/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    Platform, NativeEventEmitter, NativeModules, ActionSheetIOS, Text, ScrollView, StatusBar, AsyncStorage, View, Linking, Image,
    TouchableOpacity, TextInput, Alert, ActivityIndicator, ImageBackground, KeyboardAvoidingView
} from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import styles from '../styles/login_style.js';
import renderIf from '../resources/utility.js';
import { showNativeAlert } from '../resources/app_utility.js'
import CONSTANTS from '../resources/constants.js'
import base64 from 'react-native-base64'
import call from 'react-native-phone-call'
import email from 'react-native-email'
import ImagePicker from 'react-native-image-picker';

import { PermissionsAndroid } from 'react-native';
let isPermissionAlertVisible = false
const GetYouTubeUrliOS = NativeModules.GetLocalYoutubeLink;
const GetYouTubeUrlAndroid = NativeModules.MyNative

export default class login extends Component {

    //Navigation Method
    static navigationOptions = {
        title: 'Login',
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            isRecording: false,
            password: '',
            currentFocus: 'none',
            isLoading: false,
            userToken: '',
            isRecording: false,
            args: {
                number: CONSTANTS.ADMIN_PHONE, // String value with the number to call
                prompt: false // Optional boolean property. Determines if the user should be prompt prior to the call 
            }
        };
    }
    twoButtonAlert(title, message, okButtonTitle, cancelButtonTitle, callback) {
        Alert.alert(
            title ? title : appMsgs.appName,
            message,
            [
                {
                    text: cancelButtonTitle,
                    onPress: () => callback(0),
                    style: 'cancel',
                },
                { text: okButtonTitle, onPress: () => callback(1) },
            ],
            { cancelable: false },
        );
    }
    openSettingsPage() {
        if (Platform.OS === 'ios') {
            Linking.canOpenURL('app-settings:').then(supported => {
                if (!supported) {
                } else {
                    return Linking.openURL('app-settings:');
                }
            }).catch(err => console.error('An error occurred', err))
        } else {
            NativeModules.MyNative.openNetworkSettings(data => {
                alert(data)
            })
        }
    }

    choosePhoto() {
        const options = {
            title: 'Choose an option',
            //customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
            quality: 0.5,
            // permissionDenied: {
            //   title: 'Error',
            //   text:'hello'
            // }
        };
        var that = this
        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);
            if (response.didCancel) {
                console.log('User cancelled image picker');
                // that.setState({
                //     isLoading: false,
                // });
            } else if (response.error) {
                console.log('ImagePicker Error: ', response);
                var message = 'To be able to take pictures with your camera and choose images from your library.'


                this.twoButtonAlert('Permission denied', message, 'RE-TRY', 'I\'M SURE', function (status) {
                    console.log('The button tapped is: ', status);
                    if (status == 1) {
                        that.openSettingsPage()
                    }
                }, function (error) {
                    console.log('There was an error fetching the location');
                });
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
                // that.setState({
                //   isLoading: true,
                // });
            } else {
                const sourceUri = { uri: response.uri };
                that.setState({
                    // isLoading: false,
                    imageToSend: sourceUri
                }, () => { this.sendChatMessage() });
            }
        });
    }
    getUserToken() {
        let self = this;
        AsyncStorage.getItem(self.state.username).then(value => {
            if (value !== null) {
                console.log("USER TOKEN = " + value)
                console.log(base64.decode(value))
                self.setState({
                    userToken: base64.decode(value)
                }, () => self.hitLoginAPI())
            } else {
                console.log("NO USER TOKEN")
                self.setState({
                    userToken: ''
                }, () => self.hitLoginAPI())
            }
        })
    }

    focusUpdate(textInputId) {
        if (textInputId == "0") {
            this.setState({
                currentFocus: 'username'
            })
        } else {
            this.setState({
                currentFocus: 'password'
            })
        }
    }

    noFocus() {
        this.setState({
            currentFocus: 'none'
        })
    }

    validateEmail = (username) => {

        var txtLength = username.length;
        if (txtLength < 6) {
            return true;
        } else {
            return false;
        }
    };

    validatePassword = (password) => {
        var txtLength = password.length;
        if (txtLength < 6) {
            return true;
        } else {
            return false;
        }
    };

    validateLoginCredentials() {
        //this.props.navigation.navigate('TestScreen', { item: {} })
        if (this.state.username == '') {
            showNativeAlert('Username cannot be blank')
            // Alert.alert('Username cannot be blank')
        }
        // else if (this.validateEmail(this.state.username)) {
        //     showNativeAlert('Username should be greater than or equal to 6 characters');
        // }
        else if (this.state.password == '') {
            showNativeAlert('Password cannot be blank')
        }
        // else if (this.validatePassword(this.state.password)) {
        //     showNativeAlert('Password should be greater than or equal to 6 characters')
        // }
        else {
            this.getUserToken()
        }
    }

    // async setValue() {
    //     await AsyncStorage.setItem('ACCESS_TOKEN', JSON.stringify(responseJson.data.ACCESS_TOKEN));
    // }

    storeItem(Accesskey, Accessitem, statusKey, statusItem, key, keyValue) {
        let self = this;
        AsyncStorage.multiSet([[Accesskey, JSON.stringify(Accessitem)], [statusKey, JSON.stringify(statusItem)], [key, base64.encode(keyValue)]], (response) => {
            //to do something
            console.log(response)
            if (statusItem == 1) {
                self.moveToSession()
            } else {
                self.moveToSession()
                //self.moveToCourses()
            }
        });

        // try {
        //     //we want to wait for the Promise returned by AsyncStorage.setItem()
        //     //to be resolved to the actual value before returning the value
        //     var jsonOfAccess = await AsyncStorage.setItem(Accesskey, JSON.stringify(Accessitem));
        //     var jsonOfStatus = await AsyncStorage.setItem(statusKey, JSON.stringify(statusItem));

        //     CONSTANTS.IS_LOGGED_IN = true


        // } catch (error) {
        //     console.log(error.message);
        // }
    }

    // async storeUserToken(key, value) {
    //     try {
    //         //we want to wait for the Promise returned by AsyncStorage.setItem()
    //         //to be resolved to the actual value before returning the value
    //         console.log("BEFORE ENCODING " + value)
    //         console.log("AFTER ENCODING " + base64.encode(value))
    //         var jsonOfAccess = await AsyncStorage.setItem(key, base64.encode(value));

    //     } catch (error) {
    //         console.log(error.message);
    //     }
    // }

    callAdmin = () => {
        // showNativeAlert("Call")
        isPermissionAlertVisible = false
        if (this.state.args.number != undefined && this.state.args.number != null &&
            this.state.args.number != '') {
            call(this.state.args).catch(console.error)
        }
    };

    makeLocalUrl(videoUrl) {
        console.log('in function')
        if (Platform.OS == 'ios') {
            async function getVideoLocalUrl() {
                try {
                    var urlData = await GetYouTubeUrliOS.getLocalYoutubeUrl('get_video_info')
                    var obj = JSON.parse(urlData);
                    console.log('urldata', obj)
                } catch (e) {
                    console.log(e);
                }
            }
            getVideoLocalUrl()
        }
        else {
            async function getVideoLocalUrl() {
                try {
                    var urlData = await NativeModules.MyNative.getVideoInfo(videoUrl)
                    var obj = JSON.parse(urlData);
                    console.log('urldata', obj)
                    this.props.navigation.navigate('VideoStreaming', { youtubeUrl: obj[0].url, topicId: topicId })
                } catch (e) {
                    console.log(e);
                }
            }
            getVideoLocalUrl()
            // NativeModules.MyNative.getVideoInfo(data => {
            //     console.log('call back data', data);
            //     var obj = JSON.parse(data);
            //     console.log('urldata', obj)
            //     console.log('0 url ', obj[0].url)
            //     // this.props.navigation.navigate('VideoStreaming', { youtubeUrl: url.substring(url.lastIndexOf('/')+1), topicId: topicId})
            //     this.props.navigation.navigate('VideoStreaming', { youtubeUrl: obj[0].url, topicId: topicId})
            //   });
        }
    }

    emailAdmin = () => {
        isPermissionAlertVisible = false
        const to = [CONSTANTS.ADMIN_EMAIL] // string or array of email addresses
        email(to, {
            // Optional additional arguments
            subject: 'Subject',
            body: 'Text Message'
        }).catch(console.error)
    };

    showContactAlert = (message = '') => {
        if (isPermissionAlertVisible) {
            return
        } else {
            isPermissionAlertVisible = true
        }

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions({
                title: 'IFAS',
                message: message,
                options: ['📱 Call admin', ' 📧 Email admin', 'Cancel'],
                cancelButtonIndex: 2,
            },
                (buttonIndex) => {
                    if (buttonIndex === 0) { this.callAdmin() }
                    if (buttonIndex === 1) { this.emailAdmin() }
                    if (buttonIndex === 2) { isPermissionAlertVisible = false }
                });

        } else {
            Alert.alert(
                'IFAS',
                message,
                [
                    { text: 'Call admin', onPress: () => this.callAdmin() },
                    { text: 'Email admin', onPress: () => this.emailAdmin() },
                    { text: 'Cancel', onPress: () => isPermissionAlertVisible = false, style: 'cancel' },
                ],
                { cancelable: false }
            )
        }
    };

    hitLoginAPI() {
        this.setState({
            isLoading: true
        })

        let jsonBody = JSON.stringify({
            username: this.state.username,
            password: this.state.password,
            device_token: CONSTANTS.DEVICE_TOKEN,
            device_type: Platform.OS === 'ios' ? CONSTANTS.iOS : CONSTANTS.ANDROID,
            user_device_token: this.state.userToken,
        })
        console.log("jsonBody:");
        console.warn('jsonBodyLogin' + JSON.stringify(jsonBody));
        let self = this;
        // Alert.alert(CONSTANTS.BASE + CONSTANTS.POST_LOGIN)
        fetch(CONSTANTS.BASE + CONSTANTS.POST_LOGIN, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: jsonBody,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson)
                self.setState({
                    isLoading: false,
                })

                if (responseJson.data.ACCESS_TOKEN == null) {
                    if (responseJson.code == "213") { //LOGGED INTO ANOTHER DEVICE
                        self.showContactAlert(responseJson.message)

                    } else {
                        showNativeAlert(responseJson.message)
                    }
                } else {
                    AsyncStorage.setItem('LOGIN_USER_NAME', JSON.stringify(responseJson)).then(elementObj => {
                        console.warn('LOGIN_USER_NAME', elementObj)

                    }).catch(err => console.warn('LOGIN_USER_NAME' + err));
                    // this.storeUserToken(this.state.username, responseJson.data.USER_DEVICE_TOKEN)
                    self.storeItem('ACCESS_TOKEN', responseJson.data.ACCESS_TOKEN, 'COURSE_PAYMENT_STATUS', responseJson.data.COURSE_PAYMENT_STATUS, this.state.username, responseJson.data.USER_DEVICE_TOKEN)
                }

            })
            .catch((error) => {
                console.error(error);
                showNativeAlert("Network request failed")
            });
    }

    moveToSession() {
        this.setQuality()
        //this.props.navigation.navigate('Sessions')
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'LandingScreen' })],
        });
        this.props.navigation.dispatch(resetAction)
        //this.props.navigation.navigate('LandingScreen')
    }

    //Here set default video quality
    async setQuality() {
        let storeQuality = JSON.stringify({ name: 'Video Quality: ', value: 360, is_selected: false })
        await AsyncStorage.setItem(CONSTANTS.STORE_QUALITY, storeQuality);

    }

    moveToCourses() {
        CONSTANTS.NAV_COUNT = 0
        this.props.navigation.navigate('CoursesUnpaid')
    }

    methodGoBack() {
        this.props.navigation.goBack()
    }
    componentDidMount() {
        global.navigation = this.props.navigation

        console.log('in did mount')
        this.loginStatus()
        // this.choosePhoto()
        // this.makeLocalUrl("https://www.youtube.com/get_video_info?video_id=J61XNjDuIg8&el=embedded&ps=default&eurl=&gl=US&hl=en")

        // Recording of
        if (Platform.OS == 'ios') {
            this.addListener()
        }
    }

    addListener = () => {
        NativeModules.ScreenRecorderDetect.addScreenRecorderListner()
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
        console.log("Unmounted login")
        if (Platform.OS === "ios") {
            this.screenCaptureEnabled.remove()
        }
    }

    _scroll = (ref, offset) => {
        setTimeout(() => {
            var scrollResponder = this.myScrollView.getScrollResponder();
            scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
                React.findNodeHandle(ref),
                offset,
                true
            );
        });
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
                CONSTANTS.IS_LOGGED_IN = true
                if (payValue == 0) { //Unpaid
                    //this.methodGoToCourseUnpaid()
                    this.methodGoToSessions()
                } else {
                    this.methodGoToSessions()
                }
            } else {
            }


        })
    }

    methodGoToSessions() {
        //this.props.navigation.navigate('Sessions')
        //this.props.navigation.navigate('LandingScreen')
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'LandingScreen' })],
            //actions: [NavigationActions.navigate({ routeName: 'Instructions' })],
        });
        this.props.navigation.dispatch(resetAction)
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

                <ImageBackground
                    style={{ flex: 1 }}
                    resizeMode={'cover'}
                    source={require('../images/login_bg.png')}>

                    {/* Status Bar */}
                    {/* {renderIf(Platform.OS != 'ios',
                    <StatusBar
                        barStyle="dark-content"
                        backgroundColor={colors.theme}
                    />
                )} */}

                    {/* {renderIf(Platform.OS == 'ios',
                    <StatusBar
                        barStyle="dark-content"
                    // backgroundColor='transparent'
                    />
                )} */}
                    <ScrollView
                        ref={(scrollView) => this.myScrollView = scrollView}
                        scrollEventThrottle={1} // <-- Use 1 here to make sure no events are ever missed
                        keyboardShouldPersistTaps={'always'}
                        bounces={false}
                        style={{
                            flexDirection: "column",
                            width: '100%',
                            flex: 1,
                        }}>
                        {/* <KeyboardAvoidingView
                        style={{
                            flexDirection: "column",
                            width: '100%',
                            flex: 1,
                        }}
                        behavior={(Platform.OS === 'ios') ? 'padding' : null}
                        enabled> */}
                        <View
                            style={{
                                flex: 1,
                                width: '100%',
                                height: '100%'
                            }}>


                            <View style={{ width: dimensions.width, height: dimensions.height, backgroundColor: 'transparent' }} >
                                {/* <KeyboardAwareScrollView 
                            enableResetScrollToCoords={true} 
                            contentContainerStyle={{ flex: 1 }} 
                            enableOnAndroid={true} 
                            innerRef={ref => { this.scroll = ref }}> */}
                                {/* TOP VIEW */}
                                <View style={{
                                    width: dimensions.width,
                                    height: dimensions.height * 0.35,
                                    backgroundColor: 'transparent'
                                }}>
                                    {/* <View style={{ flex: 0.85, backgroundColor: 'transparent' }}>
                                        <View style={{ flex: 1, justifyContent: 'center' }}>
                                            <View style={{
                                                marginLeft: dimensions.sizeRatio * 10,
                                                backgroundColor: 'transparent',
                                                width: dimensions.sizeRatio * 40,
                                                height: dimensions.sizeRatio * 40
                                            }}>
                                                <TouchableOpacity onPress={() => this.methodGoBack()} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                    <Image
                                                        source={require('../images/back.png')}
                                                        style={{ width: dimensions.sizeRatio * 10, height: dimensions.sizeRatio * 15 }}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View> */}

                                    <View style={{
                                        flex: 1.0,
                                        flexDirection: 'row',
                                        backgroundColor: 'transparent'
                                    }}>
                                        <View style={{
                                            flex: 0.35,
                                            backgroundColor: 'transparent'
                                        }}>

                                        </View>
                                        <View style={{ flex: 0.30 }}>
                                            <Image
                                                source={require('../images/logo.png')}
                                                style={{
                                                    flex: 1,
                                                    width: null,
                                                    height: null,
                                                    resizeMode: 'contain'
                                                }} />
                                        </View>
                                        <View style={{ flex: 0.35, backgroundColor: 'transparent' }}>

                                        </View>
                                    </View>

                                    <View style={{ flex: 0.25, backgroundColor: 'transparent' }}>

                                    </View>
                                </View>
                                {/* TOP VIEW END*/}

                                {/* BOTTOM VIEW */}

                                <View style={{
                                    width: dimensions.width,
                                    height: dimensions.height * 0.65,
                                    backgroundColor: 'transparent',
                                    paddingHorizontal: dimensions.sizeRatio * 25
                                }}>

                                    {/* Username text */}
                                    <View style={{ flex: 0.6, backgroundColor: 'transparent', paddingBottom: dimensions.sizeRatio * 2.5 }}>
                                        <View style={{ flex: 1, }}>
                                            <Text style={this.state.currentFocus == 'username' ? styles.username_text_focussed : styles.username_text}>
                                                Username
                                </Text>
                                        </View>
                                    </View>

                                    {/* Username Input */}
                                    <View style={{ flex: 1.5, backgroundColor: 'transparent', }}>
                                        <View style={this.state.currentFocus == 'username' ? styles.username_new_view_focussed : styles.username_new_view}>
                                            <View style={{ flex: 1.5, backgroundColor: 'transparent' }}>
                                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                    <Image source={this.state.currentFocus == 'username' ? require('../images/user_active.png') : require('../images/user_inactive.png')} style={{ width: dimensions.sizeRatio * 15, height: dimensions.sizeRatio * 16 }} />
                                                </View>
                                            </View>
                                            <View style={{ flex: 8.5, backgroundColor: 'transparent' }}>
                                                <View style={{ flex: 1 }}>
                                                    <TextInput
                                                        style={{
                                                            flex: 1, color: 'white',
                                                            fontSize: dimensions.sizeRatio * 17,
                                                            fontFamily: CONSTANTS.REGULAR,
                                                            paddingTop: 0, paddingBottom: 0
                                                        }}

                                                        placeholder="Username" placeholderTextColor='#495F8E'
                                                        onChangeText={(username) => this.setState({ username })}
                                                        onFocus={() => this.focusUpdate("0")}
                                                        onBlur={() => this.noFocus()}
                                                        blurOnSubmit={false}
                                                        keyboardType="email-address"
                                                        returnKeyType="next"
                                                        autoCapitalize="none"
                                                        autoCorrect={false}
                                                        // scrollEnabled={false}
                                                        ref={(input) => this.usernameInput = input}
                                                        onSubmitEditing={() => { this.passwordInput.focus() }
                                                        }

                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Space */}
                                    <View style={{ flex: 0.6, backgroundColor: 'transparent', }}></View>

                                    {/* Password Text */}
                                    <View style={{ flex: 0.6, backgroundColor: 'transparent', paddingBottom: dimensions.sizeRatio * 2.5 }}>
                                        <View style={{ flex: 1, }}>
                                            <Text style={this.state.currentFocus == 'password' ? styles.password_text_focussed : styles.password_text}>Password</Text>
                                        </View>
                                    </View>

                                    <View style={{ flex: 1.5, backgroundColor: 'transparent', }}>
                                        <View style={this.state.currentFocus == 'password' ? styles.password_new_view_focussed : styles.password_new_view}>
                                            <View style={{ flex: 1.5, backgroundColor: 'transparent' }}>
                                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                                    <Image source={this.state.currentFocus == 'password' ? require('../images/password_active.png') : require('../images/password_inactive.png')} style={{ width: dimensions.sizeRatio * 17, height: dimensions.sizeRatio * 17 }} />
                                                </View>
                                            </View>
                                            <View style={{ flex: 8.5, backgroundColor: 'transparent' }}>
                                                <View style={{ flex: 1 }}>
                                                    <TextInput style={{ flex: 1, color: 'white', fontSize: dimensions.sizeRatio * 17, fontFamily: CONSTANTS.REGULAR, paddingTop: 0, paddingBottom: 0 }}
                                                        secureTextEntry={true}
                                                        placeholder="Password" placeholderTextColor='#495F8E'
                                                        // scrollEnabled={false}
                                                        onChangeText={(password) => this.setState({ password })}
                                                        onFocus={() => this.focusUpdate("1")}
                                                        onBlur={() => this.noFocus()}
                                                        ref={(input) => this.passwordInput = input}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Forgot Password */}
                                    <View style={{ flex: 1.5, backgroundColor: 'transparent', flexDirection: 'row' }}>
                                        <View style={{ justifyContent: 'center', width: '40%', alignItems: 'flex-start' }}>
                                            <TouchableOpacity onPress={() => { 
                                                NativeModules.SFViewControl.openURL('http://ifasonline.com/pwdManagement.jsp', {})
                                                //Linking.openURL('http://ifasonline.com/pwdManagement.jsp') 
                                                }}>
                                                <Text style={{ fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 12, color: colors.fb_text }}>Forgot Password?</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ justifyContent: 'center', width: '60%', alignItems: 'flex-end' }}>
                                            <TouchableOpacity onPress={() => { 
                                                NativeModules.SFViewControl.openURL('http://ifasonline.com/register.jsp', {})
                                                //Linking.openURL('http://ifasonline.com/register.jsp') 
                                                }}>
                                                <Text style={{ fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 12, color: colors.fb_text }}>Don't have an account ? Register</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* SIGN IN Button */}
                                    <View style={{ flex: 1.5, backgroundColor: 'transparent', }}>
                                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: dimensions.sizeRatio * 7 }} >
                                            <TouchableOpacity onPress={() => this.validateLoginCredentials()} hitSlop={{ top: dimensions.sizeRatio * 20, bottom: dimensions.sizeRatio * 20, left: dimensions.sizeRatio * 100, right: dimensions.sizeRatio * 100 }}>
                                                <Text style={{ fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 15, color: colors.theme }}>SIGN IN</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={{ flex: 3.2, backgroundColor: 'transparent', }}>
                                        {renderIf(this.state.isLoading,
                                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>

                                                <ActivityIndicator />
                                                <Text style={{ fontSize: (dimensions.sizeRatio * 20), textAlignVertical: "center", color: colors.white, fontFamily: CONSTANTS.DEMI }}>
                                                    Please wait...
                                       </Text>
                                            </View>
                                        )}
                                    </View>

                                </View>
                                {/* BOTTOM VIEW END */}
                                {/* </KeyboardAwareScrollView> */}
                            </View>
                        </View>
                        {/* </KeyboardAvoidingView> */}
                    </ScrollView>
                </ImageBackground>
            );
        }
    }
}



