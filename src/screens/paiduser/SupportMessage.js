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
    Image, TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl, NativeEventEmitter, NativeModules, StyleSheet, TextInput,
    BackHandler
} from 'react-native';
import colors from '../../resources/colors';
import renderIf from '../../resources/utility.js';
import dimensions from '../../resources/dimension';
import CONSTANTS, { constantStrings, textInputPlaceholders } from '../../resources/constants.js'
import { showNativeAlert } from '../../resources/app_utility.js'
import { NavigationEvents } from 'react-navigation';

//Using this for handle start conference
import Orientation from 'react-native-orientation';
import { EventRegister } from 'react-native-event-listeners';
import ImagePicker from 'react-native-image-picker';
import ImagePicker2 from 'react-native-image-crop-picker';
import { Dialog } from 'react-native-simple-dialogs';
import FastImage from 'react-native-fast-image'
import NetInfo from "@react-native-community/netinfo";
import Ripple from 'react-native-material-ripple';
import CardView from 'react-native-cardview';
import Toast from 'react-native-tiny-toast';
import moment from "moment";

import BackButton from 'react-native-vector-icons/MaterialIcons';
import { Item } from 'native-base';
const backButton = <BackButton name="arrow-back" size={28} color={colors.black} />;

let isRecordingGloble = false;
const leftPadding = 26 * dimensions.sizeRatio;
const topPadding = 19.5 * dimensions.sizeRatio;
export default class SupportMessage extends Component {


    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isRecording: false,
            access_token: '',
            dataSource: [],
            dataObject: undefined,
            sendMessage:'',
            imageToSend: '',
            isImagePick: false,
        }
        this.offset = 1;
        this.limit = 10000000;
        this.pageCount = 0;
        this.scrollBottom = true;
        isRecordingGloble = false
        Orientation.lockToPortrait();
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    getAccessToken() {
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                this.offset = 1;
                self.setState({
                    access_token: value.slice(1, -1),
                    dataSource: []
                }, () => { self.getChatDetail() })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

        global.navigation = this.props.navigation

        // Recording of
        if (Platform.OS == 'ios') {
            this.addListener()
        }

        //call api after did Focus
        const { navigation } = this.props;
        this.focusListener = navigation.addListener('didFocus', () => {
            global.isChatLiveSessionVisible = false;
            this.getAccessToken()
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

    getChatDetail() {
        this.setState({
            isLoading: true
        });
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('page', this.offset);
        formData.append('limit', this.limit);
        formData.append('thread_id', this.props.navigation.state.params.selectedMessage);
        console.warn(formData)

        fetch(CONSTANTS.BASE_CHAT + CONSTANTS.POST_SEND_TECH_SUPPORT_LIST_NEW, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.warn('chat detail response', responseJson)
                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                }
                else if (responseJson.code == 220) {
                    this.setState({
                        isLoading: false,
                        isRefreshFetching: false,
                        fetching_from_server: false,
                        dataSource: [],
                        dataObject: responseJson.msgThread,
                    })
                }
                else {
                    this.setState({
                        isLoading: false,
                        isRefreshFetching: false,
                        dataObject: responseJson.msgThread,
                        dataSource: [...responseJson.data],
                        fetching_from_server: false,
                    });
                }
            })
            .catch((error) => {
                this.setState({
                    dataSource: [],
                    isLoading: false,
                    isRefreshFetching: false,
                    errorMessage: 'Failed to fetch your messages.'
                })
            });
    }

    sendMessageApi() {
        let message = this.state.sendMessage
        this.setState({
            isLoading: true
        });

        var data = new FormData();
        data.append("access_token", this.state.access_token);
        data.append('course_id', global.landingScreenPaidItem.id);
        // if (this.state.sendMessage != '') {
        //     data.append("msg", this.state.sendMessage.trim());
        // } else {
        //     data.append("msg", '');
        // }
        data.append("type", this.state.dataObject.TST_TYPE);
        data.append("title", this.state.dataObject.TST_TITLE.trim());
        data.append("mt_id", this.state.dataObject.TST_ID);

        if (this.state.imageToSend != '') {
            var photo = {
                uri: this.state.imageToSend.uri,
                type: 'image/jpeg',
                name: 'ChatImage' + '.jpg',
            };
            data.append("img", photo);
            if (message != undefined && message != '') {
                data.append("msg", message.trim());
            } else {
                data.append("msg", '');
            }
        }
        else if (message != undefined && message != '') {
            data.append("msg", message.trim());
        }
        console.warn('addnew support response', data)
        console.log(CONSTANTS.BASE_CHAT + CONSTANTS.POST_SEND_TECH_SUPPORT_NEW)
        let header = {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
        }
        console.log(header)

        return fetch(CONSTANTS.BASE_CHAT + CONSTANTS.POST_SEND_TECH_SUPPORT_NEW, { method: 'POST', headers: header, body: data })
            .then((response) => response.json())
            .then((responseJson) => {
                console.warn('responseJson' + JSON.stringify(responseJson))
                this.setState({
                    isLoading: false
                });
                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                    console.log('responseJson1')
                } else if (responseJson.code == 1) {
                    this.setState({
                        sendMessage: '',
                        imageToSend: '',
                        isImagePick: false,
                    })
                    this.getChatDetail()
                }
                else if (responseJson.code == 218) {
                    console.log('responseJson3')
                    Alert.alert('IFAS', responseJson.message);
                }
            })
            .catch((err) => {
                console.log('responseJson4' + JSON.stringify(err))
                console.log(err)
                this.setState({
                    isLoading: false
                });
                return err.message
                //return filterError(err.message)
            });
    }
    
    logoutUser() {
        showNativeAlert(CONSTANTS.LOGOUT_MESSAGE)
        CONSTANTS.IS_LOGGED_IN = false
        this.props.navigation.popToTop()

    }
    separatorItemComponent = () => {
        return (
            <View
                style={{
                    width: '100%',
                    height: 3,
                    backgroundColor: colors._transparent,
                }}
            >

            </View>
        );

    }

    selectProfilePic = (selectType) => {
        if (selectType == "Camera") {
            ImagePicker2.openCamera({
                width: 300,
                height: 400,
                compressImageQuality: Platform.OS === 'android' ? .5 : .7,
                cropping: false,
            }).then(image => {
                if (image.path != undefined && image.path != '') {
                    var parts = image.path.split('/');
                    var loc = parts.pop();
                    var tempImageObject = {
                        uri: image.path,
                        type: 'image/jpeg',
                        name: 'abc.jpg'
                    }
                    //alert(tempImageObject)
                    console.warn('image camera' + JSON.stringify(image))
                    this.setState({
                        imageToSend: tempImageObject,
                        isImagePick: true

                    })
                    // this.setState({
                    //     isImageSelectPicker:true,
                    //     imagePath: image.path,
                    //     imageObject: tempImageObject
                    // });
                }

            });
        } else {
            ImagePicker2.openPicker({
                width: 300,
                height: 400,
                compressImageQuality: Platform.OS === 'android' ? .5 : .7,
                cropping: false,
                mediaType: 'photo',
            }).then(image => {
                console.warn('gall', image)
                if (image.path != undefined && image.path != '') {
                    var parts = image.path.split('/');
                    var loc = parts.pop();
                    var tempImageObject = {
                        uri: image.path,
                        type: image.mime,
                        name: loc
                    }
                    console.warn('image gallery' + JSON.stringify(image))
                    this.setState({
                        imageToSend: tempImageObject,
                        isImagePick: true
                    })
                    // this.setState({
                    //     isImageSelectPicker:true,
                    //     imagePath: image.path,
                    //     imageObject: tempImageObject,
                    // });
                }
            });
        }
    }

    handleBackButtonClick = () => {
        this.props.navigation.goBack();
        return true;
    }

    renderFlatListHeader() {
        return (<View style={{ width: '100%', height: 54.5 * dimensions.sizeRatio, backgroundColor: colors.lightgray, justifyContent: 'center' }}>
            <Text style={{
                color: colors.night, fontSize: 15 * dimensions.sizeRatio, fontFamily: CONSTANTS.DEMI, marginTop: 10 * dimensions.sizeRatio,
                marginVertical: 12 * dimensions.sizeRatio,
                marginLeft: 15 * dimensions.sizeRatio,
                alignSelf: "flex-start",
                marginRight: 52.5 * dimensions.sizeRatio
            }}>
                {this.state.dataObject?.tech_support_type?.TST_TITLE}
            </Text>
        </View>)
    }

    deleteMessageApi(item) {

        this.setState({
            isLoading: true
        });

        var data = new FormData();
        data.append("access_token", this.state.access_token);
        //data.append('course_id', global.landingScreenPaidItem.id);
        //type(1=>Message,2=>Support message,3=> Group Message)
        data.append('type', 2);
        data.append('id', item.TSM_ID);

        console.warn('delete_message_request', data)
        console.log(CONSTANTS.BASE_CHAT + CONSTANTS.POST_NORMAL_SUPPORT_GROUP_DELETE_MESSAGE)
        let header = {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
        }
        console.log(header)

        return fetch(CONSTANTS.BASE_CHAT + CONSTANTS.POST_NORMAL_SUPPORT_GROUP_DELETE_MESSAGE, { method: 'POST', headers: header, body: data })
            .then((response) => response.json())
            .then((responseJson) => {
                console.warn('responseJson' + JSON.stringify(responseJson))
                this.setState({
                    isLoading: false
                });
                if (responseJson.code == 201) {
                    console.warn('ENTER_DELETE_1')
                } else {
                    console.warn('ENTER_DELETE_2_SUCESS')
                    //RECALL API
                    this.getChatDetail()
                }
            })
            .catch((err) => {
                console.log('responseJson4' + JSON.stringify(err))
                console.log(err)
                this.setState({
                    isLoading: false
                });
                return err.message
                //return filterError(err.message)
            });
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

        // if (this.state.isLoading) {
        //     return (
        //         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20,backgroundColor:colors._transparent }}>

        //             <ActivityIndicator />

        //             <Text style={{ top: 10, fontSize: (dimensions.sizeRatio * 20), textAlignVertical: "center", color: colors.black, fontFamily: CONSTANTS.DEMI }}>
        //                 Please wait...
        //             </Text>
        //         </View>
        //     )
        // }

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

        console.log('feedback state', this.state.dataSource)
        return (
            <View style={{
                flex: 1,
                width: '100%',
                backgroundColor: colors.sessions_bgtheme
            }}>
                {this.renderHeader()}
                {this.renderFlatListHeader()}
                {/* {this.state.dataSource != undefined && this.state.dataSource.length != 0 && */}
                    <View style={styles.chatContainer}>
                        <FlatList
                            inverted
                            alwaysBounceVertical={false}
                            showsVerticalScrollIndicator={false}
                            ref={(ref) => { this.flatListRef = ref; }}
                            data={this.state.dataSource}
                            renderItem={({ item }) => (
                                (item.TSM_IMAGE != null && item.TSM_IMAGE != '' ? (item.TSM_IMAGE == null && item.TSM_IMAGE == '' ? this.renderImageAloneUI(item) : this.renderMessageImageUI(item))
                                    : this.renderMessageAloneUI(item))
                            )}
                            extraData={this.state}
                            keyExtractor={(item, index) => index.toString()}
                        />
                        <View style={styles.chatSendMessageContainer}>
                            <TouchableOpacity
                            style={{
                                flex: .1,
                                width: 43 * dimensions.sizeRatio,
                                height: 43 * dimensions.sizeRatio,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginLeft: this.state.isImagePick == false ? 0 : 3,
                                marginLeft: 3
                            }}
                            onPress={() => {
                                this.setState({
                                    isImagePicker: true
                                })
                            }}
                        >
                            <Image
                                source={this.state.isImagePick == false ?
                                    require('../../images/MessagePlaceholder.png')
                                    : {
                                        uri: this.state.imageToSend.uri,
                                    }}
                                style={{
                                    width: this.state.isImagePick == false ? 30 * dimensions.sizeRatio : 30 * dimensions.sizeRatio,
                                    height: this.state.isImagePick == false ? 25 * dimensions.sizeRatio : 30 * dimensions.sizeRatio,
                                    alignSelf: 'center',
                                }}
                                resizeMode={this.state.isImagePick == false ? 'contain' : 'cover'}
                            />
                        </TouchableOpacity>
                            <View
                                style={{
                                    flex: .88,
                                    width: '100%',
                                    maxHeight: 100,
                                    paddingLeft: this.state.isImagePick == false ? 0 : 5
                                }}>
                                <TextInput
                                    returnKeyType="default"
                                    autoCapitalize="none"
                                    multiline={true}
                                    defaultWhite={false}
                                    placeholder={textInputPlaceholders.sendMessage}
                                    underlineColorAndroid="transparent"
                                    style={{
                                        width: '100%',
                                        maxHeight: 100,
                                    }}
                                    keyboardType="default"
                                    value={this.state.sendMessage}
                                    onChangeText={sendMessage => this.setState({ sendMessage })}
                                    onSubmitEditing={() => {
                                        Keyboard.dismiss();
                                    }}
                                />
                            </View>
                            <View style={{
                                flex: .12,
                                flexDirection: 'row',
                            }}>
                                <TouchableOpacity
                                    style={{
                                        width: 45 * dimensions.sizeRatio,
                                        height: 45 * dimensions.sizeRatio,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                    onPress={() => {
                                        if (this.state.sendMessage.trim() != '' && this.state.imageToSend != '') {
                                            console.warn('enter1' + this.state.sendMessage.trim())
                                            this.sendMessageApi()
                                        }
                                        else if (this.state.sendMessage.trim() != '') {
                                            console.warn('enter2' + this.state.sendMessage.trim())
                                            this.sendMessageApi()
                                        } else if (this.state.imageToSend != '') {
                                            console.warn('enter3' + this.state.imageToSend)
                                            this.sendMessageApi()
                                        } else if (this.state.savedaudioFileForApi != undefined) {
                                            console.warn('enter4' + this.state.savedaudioFileForApi)
                                            this.sendMessageApi()
                                        }
                                        
                                        // if (this.state.sendMessage.trim() != '') {
                                        //     console.warn('enter2' + this.state.sendMessage.trim())
                                        //     this.sendMessageApi()
                                        // }
                                    }}
                                >
                                    <Image
                                        source={require('../../images/send_message.png')}
                                        style={styles.icSendMessage}
                                        resizeMode={'contain'}
                                    />
                                </TouchableOpacity>
                                {/* here audio recorder icon */}
                            </View>
                        </View>
                    </View>
                {/* } */}
                  {
                        this.dialogForImagePicker()
                    }
            </View>
        );
    }
    keyExtractor = item => {
        return item.subject_id + new Date().getTime().toString() + (Math.floor(Math.random() * Math.floor(new Date().getTime()))).toString();
    };

    renderMessageAloneUI(item) {
        console.warn('msg item',item)

        var gmtDateTime = moment.utc(item.TSM_CREATED_AT)
        //var local = gmtDateTime.local().format('DD-MMM-YYYY hh:mm A');
        var local = moment(item.TSM_CREATED_AT).format('DD-MMM-YYYY hh:mm A');
        return (
            <View>
                {item.IS_SENDER == '1' ?
                    (<TouchableOpacity style={styles.chatMessageSender}
                        onLongPress={() => {
                            Alert.alert(
                                'Delete Message..',
                                'Are you want to delete this message?',
                                [
                                    { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                    {
                                        text: 'OK', onPress: () => {
                                            this.deleteMessageApi(item)
                                        }
                                    },
                                ],
                                { cancelable: false }
                            )
                        }}>
                        <Text selectable={true} style={styles.chatHistoryMessageSender}>
                            {item.TSM_MESSAGE.trim()}
                        </Text>
                        <Text style={styles.textChatTimeSender}>{local}</Text>
                    </TouchableOpacity>) : (
                        <View style={styles.chatMessageReceiver}>
                            <Text selectable={true} style={styles.chatHistoryMessageReceiver}>
                                {item.TSM_MESSAGE.trim()}
                            </Text>
                            <Text style={styles.textChatTimeReceiver}>{local}</Text>
                        </View>
                    )}
            </View>
        )
    }

    renderImageAloneUI(item) {
        let imageUrl = CONSTANTS.BASE_SUPPORT_URL + item.TSM_IMAGE
        console.log('imageUrl', imageUrl)
        return (
            <View>
                {item.IS_SENDER == '1' ?
                    (
                        <View style={styles.chatMessageImageSender}>
                            <TouchableOpacity onPress={() => { this.props.navigation.navigate({ routeName: 'FullPreview', params: imageUrl }) }} 
                            onLongPress={() => {
                                Alert.alert(
                                    'Delete Message..',
                                    'Are you want to delete this message?',
                                    [
                                        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                        {
                                            text: 'OK', onPress: () => {
                                                this.deleteMessageApi(item)
                                            }
                                        },
                                    ],
                                    { cancelable: false }
                                )
                            }}>
                            <Image
                                        source={{ uri: imageUrl }}
                                        defaultSource={require('../../images/logo2.png')}
                                        style={{
                                            width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio, borderRadius: 8 * dimensions.sizeRatio,
                                            //alignSelf:'center'
                                        }}
                                    />

                                {/* <FastImage
                                    style={{ width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio, borderRadius: 8 * dimensions.sizeRatio }}
                                    source={{
                                        uri: imageUrl,
                                        priority: FastImage.priority.normal,
                                    }}
                                    resizeMode={FastImage.resizeMode.cover}
                                /> */}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.chatMessageImageReceiver}>
                            <TouchableOpacity onPress={() => { this.props.navigation.navigate({ routeName: 'FullPreview', params: imageUrl }) }} >
                            <Image
                                        source={{ uri: imageUrl }}
                                        defaultSource={require('../../images/logo2.png')}
                                        style={{
                                            width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio, borderRadius: 8 * dimensions.sizeRatio,
                                            //alignSelf:'center'
                                        }}
                                    />

                                {/* <FastImage
                                    style={{ width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio, borderRadius: 8 * dimensions.sizeRatio }}
                                    source={{
                                        uri: imageUrl,
                                        priority: FastImage.priority.normal,
                                    }}
                                    resizeMode={FastImage.resizeMode.cover}
                                /> */}
                            </TouchableOpacity>
                        </View>
                    )}
            </View>
        )
    }

    renderMessageImageUI(item) {
        var gmtDateTime = moment.utc(item.TSM_CREATED_AT)
        //var local = gmtDateTime.local().format('DD-MMM-YYYY hh:mm A');
        var local = moment(item.TSM_CREATED_AT).format('DD-MMM-YYYY hh:mm A');

        let imageUrl = ''
        if (item.TSM_IMAGE != '') {
            imageUrl = CONSTANTS.BASE_SUPPORT_URL + item.TSM_IMAGE
            console.log('imageUrl', imageUrl)
        }

        return (
            <View>
                {item.IS_SENDER == '1' ?
                    (
                        <View style={styles.chatMessageImageSender}>
                            <TouchableOpacity onPress={() => { this.props.navigation.navigate({ routeName: 'FullPreview', params: imageUrl }) }} 
                            onLongPress={() => {
                                Alert.alert(
                                    'Delete Message..',
                                    'Are you want to delete this message?',
                                    [
                                        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                        {
                                            text: 'OK', onPress: () => {
                                                this.deleteMessageApi(item)
                                            }
                                        },
                                    ],
                                    { cancelable: false }
                                )
                            }}>
                            <Image
                                        source={{ uri: imageUrl }}
                                        defaultSource={require('../../images/logo2.png')}
                                        style={{
                                            width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio, borderRadius: 8 * dimensions.sizeRatio,
                                            alignSelf:'flex-end'
                                        }}
                                    />

                                {/* <FastImage
                                    style={[styles.chatImageSender, { width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio }]}
                                    source={{
                                        uri: imageUrl,
                                        priority: FastImage.priority.normal,
                                    }}
                                    resizeMode={FastImage.resizeMode.cover}
                                /> */}
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={.8}
                                style={{
                                    width: '100%',
                                    flexDirection: 'column',
                                    alignSelf: 'flex-end'
                                }}>
                                <Text selectable={true}
                                    style={styles.chatHistoryMessageSender}>
                                    {item.TSM_MESSAGE.trim()}
                                </Text>
                                <Text style={styles.textChatTimeSender}>{local}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.chatMessageImageReceiver}>
                            <TouchableOpacity onPress={() => { this.props.navigation.navigate({ routeName: 'FullPreview', params: imageUrl }) }} >
                            <Image
                                        source={{ uri: imageUrl }}
                                        defaultSource={require('../../images/logo2.png')}
                                        style={{
                                            width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio, borderRadius: 8 * dimensions.sizeRatio,
                                            alignSelf:'flex-start'
                                        }}
                                    />
                                {/* <FastImage
                                    style={[styles.chatImageReceiver, { width: 221.5 * dimensions.sizeRatio, height: 110 * dimensions.sizeRatio }]}
                                    source={{
                                        uri: imageUrl,
                                        priority: FastImage.priority.normal,
                                    }}
                                    resizeMode={FastImage.resizeMode.cover}
                                /> */}
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={.8}
                                style={{
                                    width: '100%',
                                    flexDirection: 'column',
                                    alignItems: "flex-start",
                                    justifyContent: 'flex-start',
                                }}>
                                <Text selectable={true}
                                    style={styles.chatHistoryMessageReceiver}>
                                    {item.TSM_MESSAGE}
                                </Text>
                                <Text style={styles.textChatTimeReceiver}>{local}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
            </View>
        )
    }

    dialogForImagePicker() {

        return (
            <Dialog
                // ('none', 'slide', 'fade')
                contentStyle={{
                    padding: 0,
                    height: 200,
                    backgroundColor: colors.white
                    //paddingBottom: FONT_AND_SPACE.SPACE_15
                }}
                animationType={'fade'}
                visible={this.state.isImagePicker}
                onTouchOutside={() => {
                    this.setState({
                        isImagePicker: false
                    })
                }
                } >
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        width: '100%',
                        padding: 10,
                        backgroundColor: colors.white
                    }}>
                    <View
                        style={{
                            paddingBottom: 10,
                            justifyContent: 'center'
                        }}>
                        <Text style={{
                            color: colors.black,
                            fontSize: 16,
                            fontWeight: Platform.OS == 'android' ? '700' : '600'
                        }}>
                            {'Select Image From'}</Text>
                    </View>
                    <View
                        style={{
                            flexDirection: 'column',
                            backgroundColor: colors.white
                        }}>
                        <TouchableOpacity
                            activeOpacity={.5}
                            onPress={() => {
                                this.setState({
                                    isImagePicker: false
                                })
                                setTimeout(() => {
                                    this.selectProfilePic("Camera")
                                }, 1000)
                            }}
                            style={{
                                marginTop: 20,
                            }}>
                            <Text style={{
                                color: colors.black,
                                fontSize: 16,
                                fontWeight: Platform.OS == 'android' ? '700' : '600'
                            }}>
                                {'Take Photo'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={.5}
                            onPress={() => {
                                this.setState({
                                    isImagePicker: false
                                })
                                setTimeout(() => {
                                    this.selectProfilePic("Gallery")
                                }, 1000)
                            }}
                            style={{
                                marginTop: 20,
                            }}>
                            <Text style={{
                                color: colors.black,
                                fontSize: 16,
                                fontWeight: Platform.OS == 'android' ? '700' : '600'
                            }}>
                                {'Choose From Gallery'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={.5}
                            onPress={() => {
                                this.setState({
                                    isSingleImage: false,
                                    isImagePicker: false
                                })
                            }}
                            style={{
                                marginTop: 20,
                            }}>
                            <Text style={{
                                color: colors.black_dark,
                                fontSize: 14,
                                fontWeight: '700',
                                textAlign: 'right'
                            }}>
                                {'Cancel'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Dialog>
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
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                    }}>
                    <Ripple
                        onPress={() => {
                            this.handleBackButtonClick()
                        }}>
                        {backButton}
                    </Ripple>
                    <Text style={{ fontSize: 18, fontFamily: CONSTANTS.DEMI, color: colors.black, textAlign: 'left' }}>
                        {this.state.dataObject?.TST_TITLE}
                    </Text>
                </View>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f3f3'
    },
    MessageView: {
        flexDirection: 'row',
        width: '100%',
        height: '100%'
    },
    MessageImageView: {
        width: 59.5 * dimensions.sizeRatio,
        height: '100%'
    },
    Dropdown: {
        width: 10 * dimensions.sizeRatio,
        height: 7 * dimensions.sizeRatio,
        right: 20 * dimensions.sizeRatio,
        position: 'absolute'
    },
    headerTitleStyle: {
        //fontWeight: 'Semibold',
        fontFamily: 'OpenSans-Semibold',
        fontSize: 27.5 * dimensions.sizeRatio,
        position: 'absolute',
        bottom: 16.5,
        left: 23,
    },
    TextInputStyle: {
        fontSize: 17 * dimensions.sizeRatio,
        fontFamily: CONSTANTS.REGULAR,
        color: colors.night,
        flex: 1,
        textAlignVertical: 'top'
    },
    ScrollStyle: {
        flex: 1
    },
    TextInputHeaderStyle: {
        marginTop: topPadding,
        fontSize: 15 * dimensions.sizeRatio,
        fontFamily: CONSTANTS.DEMI,
        color: colors.theme,
        marginHorizontal: leftPadding * dimensions.sizeRatio,

    },
    TextInputBottomBorderStyle: {
        backgroundColor: colors.white,
        marginHorizontal: leftPadding,
        height: 50 * dimensions.sizeRatio,
        paddingVertical: 5 * dimensions.sizeRatio,
        paddingHorizontal: 20 * dimensions.sizeRatio,
        flexDirection: 'row',
        marginTop: 6.5 * dimensions.sizeRatio,
        borderRadius: 5 * dimensions.sizeRatio,
        alignItems: 'center'

    },
    UplodImageText: {
        fontSize: 15 * dimensions.sizeRatio,
        fontFamily: CONSTANTS.DEMI,
        color: colors.uploadGrey,
        marginLeft: 16 * dimensions.sizeRatio

    },
    SubmitButton: {
        marginTop: topPadding * dimensions.sizeRatio,
        borderRadius: 5 * dimensions.sizeRatio,
        backgroundColor: colors.theme,
        marginHorizontal: leftPadding,
        height: 50 * dimensions.sizeRatio,
        justifyContent: 'center',
        alignItems: 'center'
    },
    SubmitText: {
        color: colors.white,
        textAlign: 'center',
        fontSize: 15 * dimensions.sizeRatio,
        fontFamily: CONSTANTS.DEMI
    },
    chatSendMessageContainer: {
        width: "100%",
        minHeight: 54 * dimensions.sizeRatio,
        maxHeight: 100,
        //marginBottom: Platform.OS === "ios" ? keyboardHeight + 54 * dimensions.sizeRatio :0,
        //marginTop: 10 * dimensions.sizeRatio,
        backgroundColor: colors.white,
        flexDirection: "row",
        alignItems: 'center',
    },
    icSendMessage: {
        width: 20 * dimensions.sizeRatio,
        height: 18 * dimensions.sizeRatio,
        resizeMode: "contain",
        alignSelf: 'center',
        // marginRight: 23.5 * dimensions.sizeRatio
    },
    icMessagePlaceholder: {
        width: 20 * dimensions.sizeRatio,
        height: 17 * dimensions.sizeRatio,
        resizeMode: "contain",
        alignSelf: 'center',
    },
    chatMessageSender: {
        backgroundColor: colors.white,
        borderRadius: 8 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio,
        marginRight: 20.5 * dimensions.sizeRatio,
        // padding: 5 * dimensions.sizeRatio,
        alignSelf: "flex-end",
        marginLeft: 60 * dimensions.sizeRatio
    },
    chatMessageReceiver: {
        backgroundColor: '#093679',
        borderRadius: 8 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio,
        marginLeft: 20.5 * dimensions.sizeRatio,
        // padding: 5 * dimensions.sizeRatio,
        alignSelf: "flex-start",
        marginRight: 60 * dimensions.sizeRatio
    },
    chatMessageImageSender: {
        backgroundColor: colors.white,
        borderRadius: 8 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio,
        marginRight: 20.5 * dimensions.sizeRatio,
        // padding: 5 * dimensions.sizeRatio,
        alignSelf: "flex-end",
        marginLeft: 60 * dimensions.sizeRatio
    },

    chatMessageImageReceiver: {
        backgroundColor: '#093679',
        borderRadius: 8 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio,
        marginLeft: 20.5 * dimensions.sizeRatio,
        // padding: 5 * dimensions.sizeRatio,
        alignSelf: "flex-start",
        marginRight: 60 * dimensions.sizeRatio
    },
    chatImageSender: {
        borderRadius: 8 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio,
        marginRight: 13.5 * dimensions.sizeRatio,
        // padding: 5 * dimensions.sizeRatio,
        alignSelf: "flex-end",
        marginLeft: 60 * dimensions.sizeRatio
    },

    chatImageReceiver: {
        borderRadius: 8 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio,
        marginLeft: 13.5 * dimensions.sizeRatio,
        // padding: 5 * dimensions.sizeRatio,
        alignSelf: "flex-start",
        marginRight: 60 * dimensions.sizeRatio
    },

    chatContainer: {
        // width: "100%",
        // height: '100%',
        flex: 1,
        backgroundColor: colors.chatBG,
        //marginBottom: 54 * dimensions.sizeRatio,
    },
    chatHistoryMessageReceiver: {
        color: colors.white,
        fontSize: 17 * dimensions.sizeRatio,
        fontFamily: CONSTANTS.MEDIUM,
        alignSelf: 'flex-start',
        marginRight: 17 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginLeft: 13.5 * dimensions.sizeRatio
    },
    chatHistoryMessageSender: {
        color: colors.night,
        fontSize: 17 * dimensions.sizeRatio,
        fontFamily: CONSTANTS.MEDIUM,
        alignSelf: 'flex-end',
        textAlign: 'right',
        marginRight: 13.5 * dimensions.sizeRatio,
        marginTop: 10 * dimensions.sizeRatio,
        marginLeft: 17 * dimensions.sizeRatio
    },
    textChatMessage: {
        marginHorizontal: 10 * dimensions.sizeRatio,
        flex: 1,
        //flexWrap: "wrap",
        textAlign: "left",
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14 * dimensions.sizeRatio,
        fontFamily: CONSTANTS.DEMI,
        color: colors.black_33
    },
    textChatTimeReceiver: {
        color: colors.white,
        opacity: 0.3,
        fontSize: 15 * dimensions.sizeRatio,
        alignSelf: 'flex-start',
        // padding: 5 * dimensions.sizeRatio,
        fontFamily: CONSTANTS.MEDIUM,
        marginTop: 10.5 * dimensions.sizeRatio,
        // marginLeft: 11 * dimensions.sizeRatio,
        marginHorizontal: 13.5 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio

    },
    textChatTimeSender: {
        color: colors.night,
        opacity: 0.3,
        fontSize: 15 * dimensions.sizeRatio,
        alignSelf: "flex-end",
        // padding: 5 * dimensions.sizeRatio,
        fontFamily: CONSTANTS.MEDIUM,
        marginTop: 10.5 * dimensions.sizeRatio,
        marginHorizontal: 13.5 * dimensions.sizeRatio,
        // marginRight: 13.5 * dimensions.sizeRatio,
        marginBottom: 10 * dimensions.sizeRatio
    }
});
