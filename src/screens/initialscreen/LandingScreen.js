/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { ScrollView, Platform, StatusBar, Text, View, Linking, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator, AsyncStorage, BackHandler } from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';
import colors from '../../resources/colors';
import dimensions from '../../resources/dimension';
import CONSTANTS from '../../resources/constants';
import styles from '../../styles/courses_style.js';
import renderIf from '../../resources/utility.js';
import { showNativeAlert } from '../../resources/app_utility.js';
import PaymentHeaderButton from '../../headers/PaymentHeaderButton';
import { EventRegister } from 'react-native-event-listeners';

import { NavigationEvents } from 'react-navigation';
import Ripple from 'react-native-material-ripple';
import CardView from 'react-native-cardview'
export default class LandingScreen extends Component {
    isSessionFocus = false
    //Navigation Method
    static navigationOptions = (navigation) => {
        return ({
            title: 'Courses',
            gesturesEnabled: false,
            headerTitleStyle: {
                textAlign: 'center',
                flex: 1,
            },
            headerLeft: null,
            headerBackTitle: null,
            headerTintColor: 'black',
        })
    };
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            access_token: '',
            paidCoursesArray: [],
            freeCoursesArray: [],

            //message read or not for paid user
            messageReadStatus: ''
        }
    }
    componentDidMount() {
        this.getAccessToken()
    }
    componentWillUnmount() {
    }

    getAccessToken() {
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                self.setState({
                    access_token: value.slice(1, -1),
                }, () => { self.getCourseApi() })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    getCourseApi() {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        console.log(formData)

        fetch(CONSTANTS.BASE + CONSTANTS.POST_FREE_COURSES_NEW, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.warn('CORUSE_NEW', responseJson)

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else {
                    //FOR SHOWING UPGRADE POPUP WHEN APPLICATION OPEN
                    global.isApplicationOpenUpgradePopup = true;
                    this.setState({
                        isLoading: false,
                        paidCoursesArray: responseJson.data.paid_courses,
                        freeCoursesArray: responseJson.data.free_courses,
                    });
                    global.landingPaidFreeCompleteObj = responseJson.data;
                }


            })
            .catch((error) => {
                // console.error(error);
                // showNativeAlert("Network request failed")
                this.setState({
                    dataSource: [],
                    isLoading: false,

                    errorMessage: 'Failed to fetch your subjects.'
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
        this.clearPreviousStackCourse()

    }

    clearPreviousStackCourse = () => {
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'Courses' })],
        });
        this.props.navigation.dispatch(resetAction);
    }

    getProfile(item) {
        if (this.state.paidCoursesArray.length != 0) {
            const formData = new FormData();
            formData.append('access_token', this.state.access_token);
            formData.append('course_id', item.id);
            console.warn('REQUEST_PRO' + JSON.stringify(formData))

            fetch(CONSTANTS.BASE + CONSTANTS.PROFILE, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            }).then((response) => response.json())
                .then((responseJson) => {
                    console.warn('profile response', responseJson)
                    if (responseJson.code == 201) {
                        this.removeItemValue('ACCESS_TOKEN')
                    } else {
                        this.setState({
                            messageReadStatus: responseJson.data.User.UNREAD_MSG.toString()
                        }, () => {
                            let newItem = item;
                            newItem.courses_name = 'paid';
                            global.landingScreenPaidItem = newItem;
                            global.landingScreenFreeItem = undefined;
                            global.messageReadCount = this.state.messageReadStatus;
                            console.warn('UNREADMSG', global.messageReadCount)
                            //this.props.navigation.navigate('NavigationTab', { selected_item: newItem, screen_name: 'LandingScreen_Paid' })
                            if(item?.is_chat_disable && item?.is_chat_disable == '1'){
                                this.props.navigation.navigate('NavigationTabWIthoutChat', { selected_item: newItem, screen_name: 'LandingScreen_Paid' })
                            
                            }else {
                                this.props.navigation.navigate('NavigationTab', { selected_item: newItem, screen_name: 'LandingScreen_Paid' })    
                            }
                        })
                    }
                })
                .catch((error) => {
                    // console.error(error);
                    // showNativeAlert("Network request failed")
                });
        }
    }
    render() {

        return (
            <View style={{ flex: 1, backgroundColor: colors.white }}>

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

    renderFlatList() {

        // if (this.state.freeCoursesArray.length == 0) {
        //     return (
        //         <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
        //             <Text style={{ fontSize: dimensions.sizeRatio * 16, fontFamily: CONSTANTS.DEMI, color: colors.theme }}>
        //                 {this.state.errorMessage}
        //             </Text>
        //         </View>
        //     )
        // } else {
        return (
            <ScrollView>
                <View style={{ flex: 1, backgroundColor: colors.white, flexDirection: 'column', paddingVertical: 10 }}>
                    {/* Paid subscription */}
                    <View style={{
                        width: '100%',
                        flexDirection: 'column',
                    }}>
                        <Text style={{ fontSize: 16, fontFamily: CONSTANTS.DEMI, color: colors.black, textAlign: 'left', paddingTop: 10, paddingBottom: 5, marginLeft: 15 }}>
                            {'PAID COURSES'}
                        </Text>
                        <View style={{
                            width: '100%',
                            marginTop: 10
                        }}>
                            {this.state.paidCoursesArray.length != 0 ?
                                <FlatList
                                    showsVerticalScrollIndicator={false}
                                    scrollEnabled={false}
                                    numColumns={2}
                                    data={this.state.paidCoursesArray}
                                    renderItem={({ item, index }) => this.renderPaidCoursesItem(item, index)}
                                    extraData={this.state}
                                    keyExtractor={(item, index) => index.toString()}
                                    ItemSeparatorComponent={this.itemSepratorView}
                                />
                                :
                                <View style={{ backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', height: 100 }}>
                                    <Text style={{ fontSize: dimensions.sizeRatio * 16, fontFamily: CONSTANTS.DEMI, color: colors.theme }}>
                                        {'No Record Found'}
                                    </Text>
                                </View>
                            }
                        </View>
                    </View>

                    {/* Demo Lecture: */}
                    <View style={{
                        marginTop: 10,
                        flex: 1,
                        width: '100%',
                        flexDirection: 'column',
                        marginBottom: 15
                    }}>
                        {this.state.freeCoursesArray.length != 0 &&
                            <Text style={{ fontSize: 16, fontFamily: CONSTANTS.DEMI, color: colors.black, textAlign: 'left', padding: 5, marginLeft: 15 }}>
                                {'FREE COURSES'}
                            </Text>
                        }
                        <View style={{
                            width: '100%',
                            marginTop: 10
                        }}>
                            {this.state.freeCoursesArray.length != 0 ?
                                <FlatList
                                    showsVerticalScrollIndicator={false}
                                    scrollEnabled={false}
                                    numColumns={2}
                                    data={this.state.freeCoursesArray}
                                    renderItem={({ item, index }) => this.renderFreeCoursesItem(item, index)}
                                    extraData={this.state}
                                    keyExtractor={(item, index) => index.toString()}
                                    ItemSeparatorComponent={this.itemSepratorView}
                                />
                                :
                                null
                                // <View style={{ backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center',height:100 }}>
                                //     <Text style={{ fontSize: dimensions.sizeRatio * 16, fontFamily: CONSTANTS.DEMI, color: colors.theme }}>
                                //         {'No Record Found'}
                                //     </Text>
                                // </View>
                            }
                        </View>
                    </View>
                </View>
            </ScrollView>
        )
        // }
    }

    renderPaidCoursesItem = (item, index) => {
        console.log('item  ', item)
        return (
            <CardView
                style={{
                    width: dimensions.width / 2 - 22.5,
                    backgroundColor: colors.white,
                    marginBottom: 10,
                    marginLeft: 15
                }}
                cardElevation={3}
                cardMaxElevation={2}
                cornerRadius={5}>
                <Ripple style={{ width: dimensions.width / 2 - 22.5, }}
                    onPress={() => {
                        // const resetAction = StackActions.reset({
                        //     index: 0,
                        //     actions: [NavigationActions.navigate({ routeName: 'PaidSessions' })],
                        // });
                        // this.props.navigation.dispatch(resetAction)
                        this.getProfile(item)

                        // let newItem = item;
                        // newItem.courses_name = 'paid';
                        // global.landingScreenPaidItem = newItem;
                        // global.landingScreenFreeItem = undefined;
                        // this.props.navigation.navigate('NavigationTab', { selected_item: newItem, screen_name: 'LandingScreen_Paid' })
                    }}>
                    <Image
                        source={item.image != '' ? { uri: item.image } : require('../../images/logo2.png')}
                        style={{ width: dimensions.width / 2 - 22.5, height: dimensions.sizeRatio * 125, resizeMode: 'stretch' }}
                    />
                    <Text numberOfLines={1} style={{
                        paddingTop: dimensions.sizeRatio * 10,
                        color: colors.black,
                        paddingLeft: dimensions.sizeRatio * 15,
                        paddingRight: dimensions.sizeRatio * 15,
                        fontSize: dimensions.sizeRatio * 16,
                        fontFamily: CONSTANTS.DEMI
                    }}
                        numberOfLines={2}>
                        {item.name}
                    </Text>
                    <Text numberOfLines={1} style={{
                        color: parseInt(item.expired_in_days) <= 10 ? 'red' : colors.lightblack,
                        paddingLeft: dimensions.sizeRatio * 15,
                        paddingRight: dimensions.sizeRatio * 15,
                        marginTop: dimensions.sizeRatio * 5,
                        fontSize: dimensions.sizeRatio * 10,
                        marginBottom: dimensions.sizeRatio * 10
                    }}
                        numberOfLines={1}>
                        {`Expired on: ${item.expired_at != '' ? item.expired_at : '--'}`}
                    </Text>

                    {/* top right expire */}
                    {parseInt(item.expired_in_days) <= 10 &&
                        <Text numberOfLines={1}
                            style={{
                                color: colors.white,
                                backgroundColor: 'red',
                                paddingHorizontal: dimensions.sizeRatio * 7,
                                paddingVertical: dimensions.sizeRatio * 5,
                                fontSize: dimensions.sizeRatio * 10,
                                borderRadius: 3,
                                marginTop: 3,
                                marginRight: 3,
                                alignSelf: 'center',
                                position: 'absolute',
                                right: 0,
                                top: 0
                            }}>
                            {`Expire Soon`}
                        </Text>
                    }
                </Ripple>
            </CardView>
        )
    }

    renderFreeCoursesItem = (item, index) => {
        console.log('item  ', item)
        return (
            <CardView
                style={{
                    width: dimensions.width / 2 - 22.5,
                    backgroundColor: colors.white,
                    marginBottom: 10,
                    marginLeft: 15
                }}
                cardElevation={3}
                cardMaxElevation={2}
                cornerRadius={5}>
                <TouchableOpacity
                    style={{ width: dimensions.width / 2 - 22.5, }}
                    onPress={() => {
                        // const resetAction = StackActions.reset({
                        //     index: 0,
                        //     actions: [NavigationActions.navigate({ routeName: 'FreeSession' })],
                        // });
                        // this.props.navigation.dispatch(resetAction)
                        let newItem = item;
                        newItem.courses_name = 'free';
                        global.landingScreenFreeItem = newItem;
                        global.landingScreenPaidItem = undefined;
                        this.props.navigation.navigate('TabNavigatorFree', { selected_item: newItem, screen_name: 'LandingScreen_Free' })
                    }}>
                    <Image
                        source={item.image != '' ? { uri: item.image } : require('../../images/logo2.png')}
                        style={{ width: dimensions.width / 2 - 22.5, height: dimensions.sizeRatio * 125, resizeMode: 'stretch' }} />
                    <Text numberOfLines={1}
                        style={{
                            paddingTop: dimensions.sizeRatio * 10,
                            color: colors.black,
                            paddingLeft: dimensions.sizeRatio * 15,
                            paddingRight: dimensions.sizeRatio * 15,
                            fontSize: dimensions.sizeRatio * 16,
                            fontFamily: CONSTANTS.DEMI,
                            height: 50
                        }}
                        numberOfLines={2}>
                        {item.name}
                    </Text>
                    {/* <Text numberOfLines={1} style={{
                        color: colors.lightblack,
                        paddingLeft: dimensions.sizeRatio * 15,
                        paddingRight: dimensions.sizeRatio * 15,
                        marginTop: dimensions.sizeRatio * 5,
                        fontSize: dimensions.sizeRatio * 14,
                    }}
                        numberOfLines={1}>
                        {'₹' + item.fees}
                    </Text> */}

                    {/* <Text numberOfLines={1} style={{
                        color: colors.lightblack,
                        paddingLeft: dimensions.sizeRatio * 15,
                        paddingRight: dimensions.sizeRatio * 15,
                        marginTop: dimensions.sizeRatio * 5,
                        fontSize: dimensions.sizeRatio * 12,
                        marginBottom: dimensions.sizeRatio * 10
                    }}
                        numberOfLines={1}>
                        {item.batch_start_date}
                    </Text> */}
                    {/* <View style={{
                        marginTop: dimensions.sizeRatio * 5,
                        marginBottom: dimensions.sizeRatio * 10,
                        width: dimensions.width / 2 - 40,
                        height: 40,
                        borderRadius: 5,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: colors.theme,
                        alignSelf: 'center',
                        zIndex: 1
                    }}
                        // onPress={() => {
                        //     if(item.payment_link != null && item.payment_link != ''){
                        //     Linking.openURL(item.payment_link)
                        //     }
                        // }}
                        >
                        <Text numberOfLines={1}
                            style={{
                                color: colors.white,
                                fontSize: dimensions.sizeRatio * 14,
                            }}
                            numberOfLines={1}>
                            {'Free Demo'}
                        </Text>
                    </View> */}
                </TouchableOpacity>
            </CardView>
        )
    }

    itemSepratorView = () => {
        return (
            <View
                style={{
                    width: '100%',
                    height: 10,
                    backgroundColor: colors._transparent
                }}
            />
        )
    }
}


// <Image
//                         style={{
//                             position: 'absolute',
//                             alignSelf: 'center',
//                             tintColor: colors.white,
//                             width: 50,
//                             height: 50,
//                             marginTop: (dimensions.sizeRatio * 80) / 2
//                         }}
//                         source={require('../images/play_icon.png')}
//                     />