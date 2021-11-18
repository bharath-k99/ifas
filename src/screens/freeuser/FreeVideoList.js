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
import VideoIcon from 'react-native-vector-icons/Feather';
const videoIcon = <VideoIcon name="video" size={16} color={colors.lightgray} />;

let isRecordingGloble = false;

export default class FreeVideoList extends Component {

    //Navigation Method
    isSessionFocus = false
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            access_token: '',
            isRecording: false,
            isRecording: '',
            freeVideoArray: []
        };
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
                }, () => { 
                    self.getTopicApi(this.props.navigation.state.params.selected_item) 
                })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    getTopicApi(selectedItem) {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('course_id', selectedItem.course_id);
        formData.append('subject_id', selectedItem.subject_id);
        formData.append('type', this.props.navigation.state.params.type);
        console.log(formData)

        fetch(CONSTANTS.BASE + CONSTANTS.POST_FREE_VIDEOS_LIST_NEW, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.warn('TOPIC_NEW', responseJson)

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else {
                    this.setState({
                        isLoading: false,
                        isRefreshFetching: false,
                        freeVideoArray: responseJson.data,
                    });
                }


            })
            .catch((error) => {
                // console.error(error);
                // showNativeAlert("Network request failed")
                this.setState({
                    dataSource: [],
                    isLoading: false,
                    isRefreshFetching: false,

                    errorMessage: 'Failed to fetch your Topics.'
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

    clearPreviousStackCourse = () =>{
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'Courses' })],
        });
        this.props.navigation.dispatch(resetAction);
    }

    handleBackButtonClick = () => {
        global.isChatLiveSessionVisible = true;
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
                <View style={{ flex: 1, backgroundColor: colors.sessions_bgtheme }}>

                    {/* Header view */}
                    {this.renderHeader()}
                    <View style={{
                        flex: 1,
                        width: '100%',
                        padding: 10,
                    }}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={true}
                            //numColumns={2}
                            data={this.state.freeVideoArray}
                            renderItem={({ item, index }) => this.renderSubjectsList(item, index)}
                            extraData={this.state}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </View>
                </View>
            );
        }
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
                <View style={{
                    width: '100%',
                    flexDirection: 'column'
                }}>
                    <TouchableOpacity
                        activeOpacity={.9}
                        style={{
                            flexDirection: 'row',
                            width: '100%',
                            paddingHorizontal: 10,
                            paddingVertical: 10
                        }}
                        onPress={() => {
                            this.props.navigation.navigate('FreeChildVideoList', { topicChildView: item, screen_name: 'FreeVideoList' })
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
                                {bookIcon}
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
                                    numberOfLines={1}>{item.NAME}</Text>
                                    <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: 5,
                            }}>
                                {videoIcon}
                                <Text style={{
                                    marginLeft: 5,
                                    fontSize: (dimensions.sizeRatio * 12),
                                    color: colors.lightishgray,
                                    fontFamily: CONSTANTS.REGULAR
                                }}
                                    numberOfLines={1}>{item.topic_videos.length == 0 ? 0 : item.topic_videos.length}</Text>
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
                                {(forwordIcon)}
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
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
                    {'Free Topic Videos'}
                </Text>
            </View>
        )
    }
}