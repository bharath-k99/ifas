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
import Ripple from 'react-native-material-ripple';
import CardView from 'react-native-cardview';
import Toast from 'react-native-tiny-toast';

//vector icon
import BookIcon from 'react-native-vector-icons/FontAwesome5';
const bookIcon = <BookIcon name="book-open" size={26} color={colors.theme} />;
import VideoIcon from 'react-native-vector-icons/Feather';
const videoIcon = <VideoIcon name="video" size={16} color={colors.lightgray} />;
import WatchIcon from 'react-native-vector-icons/MaterialIcons';
const watchIcon = <WatchIcon name="access-time" size={16} color={colors.lightgray} />;
import ForwordIcon from 'react-native-vector-icons/MaterialIcons';
const forwordIcon = <ForwordIcon name="arrow-forward" size={24} color={colors.theme} />;
import DownArrowIcon from 'react-native-vector-icons/Feather';
const downArrowIcon = <DownArrowIcon name="arrow-down" size={24} color={colors.theme} />;
import BackButton from 'react-native-vector-icons/MaterialIcons';
const backButton = <BackButton name="arrow-back" size={28} color={colors.black} />;

export default class PaidTopicMsgSelection extends Component {

    //Navigation Method
    isSessionFocus = false
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            access_token: '',
            dataSource: [],
            isRecording: false,

        };
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    handleBackButtonClick = () => {
        console.warn('ENTER HERE paid topic')
        this.props.navigation.goBack();
        return true;
    }

    getAccessToken() {
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                self.setState({
                    access_token: value.slice(1, -1),
                }, () => {
                    if (global.landingScreenPaidItem != undefined)
                        self.getTopicApi(global.landingScreenPaidItem)
                })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        this.getAccessToken()
    }

    componentWillUnmount() {
        console.log("Unmounted Topics")
    }

    getTopicApi(item) {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('course_id', item.id);
        formData.append('subject_id', this.props.navigation.state.params.selected_item.subject_id);
        formData.append('ebook_or_video', 1);
        console.warn('topic_requst_data--', formData + '\n\n' +
            this.props.navigation.state.params.selected_item)

        fetch(CONSTANTS.BASE + CONSTANTS.POST_PAID_VIDEO_TOPIC_LIST_NEW, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.warn('SUBJECT_PAID_TOPIC_NEW', responseJson)

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else if (responseJson.code == 1) {

                    this.setState({
                        isLoading: false,
                        dataSource: [...responseJson.data],
                        isError: false,
                    }, () => {
                        console.log('updasted_topic_array' + JSON.stringify(this.state.dataSource))
                    });
                }
            }).catch((error) => {
                console.error(error);
                this.setState({
                    dataSource: [],
                    isLoading: false,
                    isError: true,
                    errorMessage: 'Failed to load topics.'
                })
            });
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
                    <View style={{
                        flex: 1,
                        width: '100%',
                        height: '100%',
                        paddingBottom: 10
                    }}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={true}
                            data={this.state.dataSource}
                            renderItem={({ item, index }) => this.renderTopicMainItem(item, index)}
                            extraData={this.state}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </View>
                </View>
            );
        }
    }

    renderTopicMainItem = (item, index) => {
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
                            if (this.props.navigation.state.params.onGoBack) {
                                this.props.navigation.goBack()
                                this.props.navigation.state.params.onGoBack(item.ID, item.topic_name);
                            }
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
                                    numberOfLines={1}>{item.topic_name}</Text>
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
                                        numberOfLines={1}>{item.video_duration != null &&
                                            item.video_cnt + ' videos | ' + ((parseInt(item.video_duration / 60)) > 0 ?
                                                parseInt(item.video_duration / 60) + 'h' : '') + ' ' +
                                            (parseInt(item.video_duration % 60)) + 'm'
                                        }</Text>
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
                                {item.is_selected ?
                                    (downArrowIcon)
                                    :
                                    (forwordIcon)
                                }
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
                    {'Topic Name'}
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