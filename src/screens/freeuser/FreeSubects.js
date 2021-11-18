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
    TouchableOpacity, Alert, AsyncStorage, NativeEventEmitter, NativeModules, Modal, FlatList, Linking
} from 'react-native';
import colors from '../../resources/colors';
import renderIf from '../../resources/utility.js';
import dimensions from '../../resources/dimension';
import CONSTANTS from '../../resources/constants';
import styles from '../../styles/sessions_style.js';
import { showNativeAlert } from '../../resources/app_utility.js'
import { EventRegister } from 'react-native-event-listeners';
import { NavigationEvents } from 'react-navigation';
import { Dialog } from 'react-native-simple-dialogs';
import Toast from 'react-native-tiny-toast';
import Ripple from 'react-native-material-ripple';
import CardView from 'react-native-cardview';
import Orientation from 'react-native-orientation';
import { StackActions, NavigationActions } from 'react-navigation';

//vector icon
import BookIcon from 'react-native-vector-icons/FontAwesome5';
const bookIcon = <BookIcon name="book" size={28} color={colors.theme} />;
import ForwordIcon from 'react-native-vector-icons/MaterialIcons';
const forwordIcon = <ForwordIcon name="arrow-forward" size={24} color={colors.theme} />;
import BackButton from 'react-native-vector-icons/MaterialIcons';
const backButton = <BackButton name="arrow-back" size={28} color={colors.black} />;
import WatchIcon from 'react-native-vector-icons/MaterialIcons';
const watchIcon = <WatchIcon name="access-time" size={16} color={colors.lightgray} />;
import VideoIcon from 'react-native-vector-icons/Feather';
const videoIcon = <VideoIcon name="video" size={16} color={colors.lightgray} />;

import ViewPDFIcon from 'react-native-vector-icons/FontAwesome5';
const viewPDFIcon = <ViewPDFIcon name="file-pdf" size={16} color={colors.lightgray} />;

import ViewPDFBigIcon from 'react-native-vector-icons/FontAwesome5';
const viewPDFBigIcon = <ViewPDFBigIcon name="file-pdf" size={28} color={colors.theme} />;

import TestPDFIcon from 'react-native-vector-icons/FontAwesome5';
const testPDFIcon = <TestPDFIcon name="clipboard-list" size={16} color={colors.lightgray} />;

import TestPDFBigIcon from 'react-native-vector-icons/FontAwesome5';
const testPDFBigIcon = <TestPDFBigIcon name="clipboard-list" size={28} color={colors.theme} />;

//vector big icon
import VideoBigIcon from 'react-native-vector-icons/Feather';
const videoBigIcon = <VideoBigIcon name="video" size={28} color={colors.theme} />;
let isRecordingGloble = false;

import moment from "moment";
export default class FreeSubects extends Component {

    //Navigation Method
    isSessionFocus = false
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            access_token: '',
            isRecording: false,
            isRecording: '',
            subectsArray: [],
            optionalPackage: [],
            //previousScreenData
            previousScreenObj: global.landingScreenFreeItem
        };
    }

    componentDidMount() {
        Orientation.lockToPortrait();
        this.getAccessToken()
        // Recording of
        if (Platform.OS == 'ios') {
            this.addListener()
        }
        console.warn('this.props.navigation.state.params.item.type', this.props.navigation.state.params.item.type)
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
                        self.getSubectApi(global.landingScreenFreeItem)
                })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    getSubectApi(item) {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('course_id', item.id);
        formData.append('ebook_or_video', 1);
        formData.append('package_type', this.props.navigation.state.params.item.type);
        console.log(formData)

        fetch(CONSTANTS.BASE + CONSTANTS.POST_FREE_SUBJECT_LIST_NEW, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.warn('SUBJECT_NEW', responseJson)

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else {
                    this.setState({
                        isLoading: false,
                        isRefreshFetching: false,
                        subectsArray: responseJson.data.Subjects,
                        optionalPackage: responseJson.data.OptionalPackage
                    });
                }


            })
            .catch((error) => {
                // console.error(error);
                // showNativeAlert("Network request failed")
                this.setState({
                    subectsArray: [],
                    isLoading: false,
                    isRefreshFetching: false,

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

    handleBackButtonClick = () => {
        //global.isChatLiveSessionVisible = true;
        this.props.navigation.goBack();
        return true;
    }
    render() {

        if (this.state.isLoading) {
            return (

                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: colors._transparent,
                    padding: 20
                }}>
                    <ActivityIndicator />
                    <Text style={{ top: 10, fontSize: (dimensions.sizeRatio * 20), textAlignVertical: "center", color: colors.black, fontFamily: CONSTANTS.DEMI }}>
                        Loading session...
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
        } else {
            return (
                <View style={{ flex: 1, backgroundColor: colors.white }}>

                    {/* Header view */}
                    {this.renderHeader()}
                    {this.state.subectsArray.length != 0 ?
                        <View style={{
                            flex: 1,
                            width: '100%',
                            height: '100%',
                            paddingBottom: 10
                        }}>
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                scrollEnabled={true}
                                data={this.state.subectsArray}
                                ListHeaderComponent={this.upcommingLectureComponent}
                                renderItem={({ item, index }) => this.renderSubjectsList(item, index)}
                                extraData={this.state}
                                keyExtractor={(item, index) => index.toString()}
                            //ItemSeparatorComponent={this.itemSepratorView}
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
            );
        }
    }

    upcommingLectureComponent = () => {
        return (
            <View style={{
                width: '100%',
                flexDirection: 'column',
                paddingHorizontal: 10
            }}>
                {this.state.optionalPackage.length !== 0 && this.state.optionalPackage.map((item, index) => (
                    <View style={{
                        padding: 7,
                        borderRadius: 7,
                        marginTop: 10,
                        backgroundColor: this.props.navigation.state.params.item.type === 1 ? '#D6FFD4' :
                            this.props.navigation.state.params.item.type === 2 ? '#FED8EA' : '#D3CFFD'
                    }}>
                        {/* Top view */}
                        <View style={{
                            width: '100%',
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}>
                            {/* Left view */}
                            <View style={{
                                width: 55,
                                height: 55,
                                borderRadius: 5
                            }}>
                                <Image
                                    style={{
                                        width: 55,
                                        height: 55,
                                        borderRadius: 5
                                    }}
                                    source={item.OP_IMAGE !== null ? { uri: item.OP_IMAGE } : require('../../images/icon_session1.png')}
                                    resizeMode={'cover'}
                                />
                            </View>
                            <View style={{ flex: 1, width: '100%', flexDirection: 'row', marginLeft: 10, alignItems: 'center' }}>
                                <View style={{
                                    flex: 1,
                                    flexDirection: 'column'
                                }}>
                                    <Text style={{ flex: 1, fontSize: 13, fontFamily: CONSTANTS.DEMI, color: colors.theme }}>{item.OP_TITLE}</Text>
                                    <Text style={{ fontSize: 14, fontFamily: CONSTANTS.DEMI, color: 'black', marginTop: 1 }} numberOfLines={2}>{item.OP_FEES}</Text>
                                    <Text style={{ fontSize: 11, fontFamily: CONSTANTS.REGULAR, color: colors.lightishgray, marginTop: 5 }}>{item.OP_START_DATE ? moment(item.OP_START_DATE).format('DD-MMM-YYYY') : ''}</Text>
                                </View>
                                <TouchableOpacity style={{ width: 110, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.theme, borderRadius: 2, marginTop: 10 }}
                                    onPress={() => {
                                        if (item.OP_PAYMENT_LINK !== null) {
                                            Linking.openURL(
                                                item.OP_PAYMENT_LINK
                                            );
                                        }
                                    }}>
                                    <Text style={{ fontSize: 11, color: 'white' }}>{'Pay Now'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))
                }
            </View>
        )
    }
    renderSubjectsList = (item, index) => {
        console.log('item  ', item)
        return (
            <CardView
                style={{
                    flex: 1,
                    backgroundColor: colors.white,
                    marginHorizontal: 10,
                    marginVertical: 10
                }}
                cardElevation={3}
                cardMaxElevation={2}
                cornerRadius={5}>
                <Ripple style={{
                    flexDirection: 'row',
                    width: '100%',
                    paddingHorizontal: 10,
                    paddingVertical: 10
                }}
                    onPress={() => {
                        if (this.props.navigation.state.params.item.type === 1)
                            this.props.navigation.navigate('FreeVideoList', { selected_item: item, screen_name: 'FreeSubjects', type: this.props.navigation.state.params.item.type })
                        else
                            this.props.navigation.navigate('FreeVideoList001', { selected_item: item, screen_name: 'FreeSubjects', type: this.props.navigation.state.params.item.type })
                    }}>
                    <View style={{
                        width: '83%',
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                        <View style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}>
                            {this.props.navigation.state.params.item.type === 1 ? videoBigIcon
                                : this.props.navigation.state.params.item.type === 2 ? viewPDFBigIcon :
                                    viewPDFBigIcon}
                        </View>
                        <View style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            marginTop: 5,
                            marginLeft: 10
                        }}>
                            <Text style={{
                                fontSize: (dimensions.sizeRatio * 16),
                                color: colors.black,
                                fontFamily: CONSTANTS.MEDIUM
                            }}
                                numberOfLines={1}>{item.subject_name}</Text>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 5,
                            }}>
                                {/* {watchIcon} */}
                                {this.props.navigation.state.params.item.type === 1 ? videoIcon
                                    : this.props.navigation.state.params.item.type === 2 ? viewPDFIcon :
                                        viewPDFIcon}
                                <Text style={{
                                    marginLeft: 5,
                                    fontSize: (dimensions.sizeRatio * 12),
                                    color: colors.lightishgray,
                                    fontFamily: CONSTANTS.REGULAR
                                }}
                                    numberOfLines={1}>{item.video_cnt}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{
                        width: '17%',
                        alignItems: 'flex-end',
                        justifyContent: 'center'
                    }}>
                        <View style={{
                            width: 30,
                            height: 30,
                            borderRadius: 30 / 2,
                            backgroundColor: colors.theme_very_light,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {forwordIcon}
                        </View>
                    </View>
                </Ripple>
            </CardView>
        )
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
                    flexDirection: 'row'
                }}>
                <Ripple
                    onPress={() => {
                        this.handleBackButtonClick()
                    }}>
                    {backButton}
                </Ripple>
                <Text style={{ fontSize: 18, fontFamily: CONSTANTS.DEMI, color: colors.black, textAlign: 'left', marginLeft: 15 }}>
                    {'Subjects'}
                </Text>
            </View>
        )
    }

    itemSepratorView = () => {
        return (
            <View
                style={{
                    width: '100%',
                    height: 2,
                    backgroundColor: colors._transparent
                }}
            />
        )
    }
}





// headerView = () => {
//     return (
//         <View
//             style={{
//                 flexDirection: 'row',
//                 width: '100%',
//                 height: Platform.OS == 'android' ? dimensions.sizeRatio * 55 : dimensions.sizeRatio * 55,
//                 backgroundColor: colors.theme,
//                 justifyContent: 'space-between',
//                 alignItems: Platform.OS == 'android' ? 'center' : 'flex-end',
//             }}>
//             {/* Left back icon */}
//             <TouchableOpacity
//                 //hitSlop={{ top: 20, bottom: 20, left: 30, right: 30 }} 
//                 onPress={() => {
//                     this.handleBackButtonClick()
//                 }}
//                 style={{
//                     width: dimensions.sizeRatio * 35,
//                     height: dimensions.sizeRatio * 25,
//                     marginLeft: Platform.OS == 'android' ? dimensions.sizeRatio * 10 : dimensions.sizeRatio * 5,
//                     zIndex: 1,
//                     padding: dimensions.sizeRatio * 2,
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     marginBottom: Platform.OS == 'ios' ? dimensions.sizeRatio * 12.5 : 0
//                 }}>
//                 <Image
//                     source={Platform.OS == 'ios' ? require('../../images/back.png') : require('../../images/back_two.png')}
//                     style={{
//                         width: Platform.OS == 'android' ? dimensions.sizeRatio * 35 : dimensions.sizeRatio * 25,
//                         height: Platform.OS == 'android' ? dimensions.sizeRatio * 25 : dimensions.sizeRatio * 20,
//                         tintColor: colors.white,
//                         //padding: 5
//                     }}
//                     resizeMode={'contain'}
//                 />
//             </TouchableOpacity>
//             {/* Center Heading and page count */}
//             <View
//                 style={{
//                     width: '100%',
//                     flexDirection: 'column',
//                     position: 'absolute',
//                     center: 0,
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                 }}>
//                 <Text style={{
//                     fontFamily: CONSTANTS.DEMI,
//                     fontSize: dimensions.sizeRatio * 16,
//                     color: colors.white,
//                     fontFamily: CONSTANTS.DEMI,
//                     marginBottom: Platform.OS == 'ios' ? dimensions.sizeRatio * 12.5 : 0
//                 }}>{'Subjects'}
//                 </Text>
//             </View>
//         </View>
//     )
// }