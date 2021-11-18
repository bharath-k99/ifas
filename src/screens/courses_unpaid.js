/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { AppState, Platform, StatusBar, Text, View, Linking, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator, AsyncStorage, BackHandler } from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import CONSTANTS from '../resources/constants';
import styles from '../styles/courses_style.js';
import renderIf from '../resources/utility.js';
import { showNativeAlert } from '../resources/app_utility.js';
import PaymentHeaderButton from '../headers/PaymentHeaderButton';
import { EventRegister } from 'react-native-event-listeners';

import { NavigationEvents } from 'react-navigation';

import {
    handleAndroidBackButton, exitAlert, removeAndroidBackButtonHandler
} from '../resources/backHandleAction.js';


export default class courses_unpaid extends Component {
    isSessionFocus = false
    //Navigation Method
    static navigationOptions = (navigation) => {
        return ({
            title: 'Select Course',
            gesturesEnabled: false,

            headerTitleStyle: {
                // fontWeight: '200',
                // color: '#2c38ff',
                textAlign: 'center',
                flex: 1,
            },

            headerLeft: null,
            headerBackTitle: null,

            // headerLeft: <BackTopicsButton />,
            headerTintColor: 'black',
            headerRight:
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity hitSlop={{ top: 20, bottom: 20, left: 30, right: 30 }} onPress={() => Linking.openURL('http://ifasonline.com/register.jsp')}>
                        <Image
                            source={require('../images/payment.png')}
                            style={{ width: dimensions.sizeRatio * 45, height: dimensions.sizeRatio * 20, marginRight: dimensions.sizeRatio * 15, marginTop: dimensions.sizeRatio * 3 }}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} onPress={() => navigation.navigation.state.params.showProfile()} style={{ marginLeft: 10 }}>
                        <Image
                            source={require('../images/profile_small.png')}
                            style={{ top: dimensions.sizeRatio * 4, width: dimensions.sizeRatio * 18, height: dimensions.sizeRatio * 18, marginRight: dimensions.sizeRatio * 20, tintColor: 'black' }}
                        />
                    </TouchableOpacity>
                </View>
            ,//Add here
        })
    };
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            isLoggedIn: false,
            dataSource: [],
            errorMessage: 'Failed to fetch courses list.',
            appState: AppState.currentState,
        }


    }

    methodGoToTopics(itemId) {
        this.props.navigation.navigate('FreeVideos', { courseId: itemId.toString(), hideLogin: true })
    }

    //the functionality of the retrieveItem is shown below
    retrieveItem(key) {
        let self = this;
        AsyncStorage.getItem(key).then(value => {
            if (value !== null) {
                let item = JSON.parse(value);

                console.log('VALUE:' + value)
                self.setState({
                    access_token: value.slice(1, -1),
                }, () => { self.getTopics() })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })

    }

    loginStatus(key) {
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                // We have data!!
                self.getCourses()
            } else {
                self.getCourses()
            }
        })

    }

    getAccessToken() {

        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                this.setState({
                    access_token: value.slice(1, -1),
                })
                self.getProfile()
            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    showProfile() {
        this.props.navigation.navigate('Profile')
    }

    getProfile() {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);

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
                console.log(responseJson)
                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else {
                    this.storeItem('ACCESS_TOKEN', this.state.access_token, 'COURSE_PAYMENT_STATUS', responseJson.data.User.COURSE_PAYMENT_STATUS)
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

    storeItem(Accesskey, Accessitem, statusKey, statusItem) {
        let self = this;
        CONSTANTS.IS_LOGGED_IN = true
        AsyncStorage.multiSet([[Accesskey, JSON.stringify(Accessitem)], [statusKey, JSON.stringify(statusItem)]], (response) => {
            //to do something
            console.log(response)
            if (statusItem == 1) {
                self.moveToSession()
            }
        });

    }


    moveToSession() {
        this.unsubscribeAllEvents()
        //this.props.navigation.navigate('Sessions')
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'LandingScreen' })],
        });
        this.props.navigation.dispatch(resetAction)
        //this.props.navigation.navigate('LandingScreen')
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
        this.unsubscribeAllEvents()
        showNativeAlert(CONSTANTS.LOGOUT_MESSAGE)
        CONSTANTS.TOP_SCREEN = ''
        this.props.navigation.popToTop()
        CONSTANTS.IS_LOGGED_IN = false
    }


    _handleAppStateChange = (nextAppState) => {

        if ((this.state.appState === 'background' || this.state.appState === 'inactive') && nextAppState === 'active') {
            //   showNativeAlert('App has come to the foreground!')
            // this.unsubscribeAllEvents()
            this.getAccessToken()
        }
        this.setState({ appState: nextAppState });
    }

    methodGoToSessions() {
        this.props.navigation.navigate('Sessions')
    }

    componentDidMount() {
        global.navigation = this.props.navigation
        this.loginStatus()
        this.props.navigation.setParams({ showProfile: this.showProfile.bind(this) });

        //LISTENER FOR APP STATE
        AppState.addEventListener('change', this._handleAppStateChange);

         
        if (CONSTANTS.APP_HAS_LAUNCHED == true) {
            CONSTANTS.APP_HAS_LAUNCHED = false
            this.getAccessToken()
        }
       
    }

    unsubscribeAllEvents() {
        AppState.removeEventListener('change', this._handleAppStateChange);
        // this.backButtonListener.remove();
        EventRegister.removeEventListener(this.listener)
    }

    componentWillUnmount() {
        this.unsubscribeAllEvents()
    }


    getCourses() {
        return fetch(CONSTANTS.BASE + CONSTANTS.GET_COURSES)
            .then((response) => response.json())
            .then((responseJson) => {
                // showNativeAlert(responseJson.message)
                if (responseJson.code == 1) { //SUCCESS
                    this.setState({
                        isLoading: false,
                        dataSource: responseJson.data.Courses,
                    }, function () {

                    });

                } else {
                    this.setState({
                        isLoading: false,
                    }, function () {

                    });
                }

            })
            .catch((error) => {
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
            // <View style={{flex: 1, padding: 20}}>
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
                    <TouchableOpacity onPress={() => this.methodGoToLogin()} style={{ height: dimensions.sizeRatio * 51, width: dimensions.sizeRatio * 145, backgroundColor: colors.white, borderRadius: dimensions.sizeRatio * 5 }}>
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

    _onDidFocus() {
        console.log('Session controller focused')
        BackHandler.addEventListener('hardwareBackPress', () => {
            console.log('blue whale')
            if (isSessionFocus === true) {
                Alert.alert(
                    'EXIT APP',
                    'Are you sure you want to exit the app?',
                    [
                        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                        { text: 'OK', onPress: () => BackHandler.exitApp() },
                    ],
                    { cancelable: false }
                )
                return true
            }

            return false;
        });
    }

    _didBlur() {
        isSessionFocus = false
        console.log('Session controller _didBlur')
        removeAndroidBackButtonHandler();

    }

    render() {

        return (
            <View style={{ flex: 1, backgroundColor: colors.sessions_bgtheme, paddingTop: dimensions.sizeRatio * 12 }}>
                <NavigationEvents
                    onWillFocus={payload => isSessionFocus = true}
                    onDidFocus={payload => this._onDidFocus()}
                    onWillBlur={payload => console.log('will blur', payload)}
                    onDidBlur={payload => this._didBlur()}
                />
                
                {/* Activity View */}
                {renderIf(this.state.isLoading,
                    this.renderActivityIndicator()
                )}

                {/* List View */}
                {renderIf(this.state.isLoading == false,
                    this.renderFlatList()
                )}

            </View>
        );
    }

}