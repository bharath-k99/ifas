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
    Image, TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl, StyleSheet, TextInput, Linking, NativeEventEmitter, NativeModules,
    PermissionsAndroid, BackHandler
} from 'react-native';
import colors from '../../resources/colors';
import renderIf from '../../resources/utility.js';
import dimensions from '../../resources/dimension';
import { showNativeAlert } from '../../resources/app_utility.js'
import CONSTANTS, { constantStrings, textInputPlaceholders } from '../../resources/constants.js'

//Using this for handle start conference
import Ripple from 'react-native-material-ripple';
import CardView from 'react-native-cardview';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { NavigationEvents } from 'react-navigation';
import ImagePicker2 from 'react-native-image-crop-picker';
import { Dialog } from 'react-native-simple-dialogs';
import Toast from 'react-native-tiny-toast';
import Orientation from 'react-native-orientation';
import { EventRegister } from 'react-native-event-listeners';
import ImagePicker from 'react-native-image-picker';
import ActionSheet from 'react-native-actionsheet'

import BackButton from 'react-native-vector-icons/MaterialIcons';
const backButton = <BackButton name="arrow-back" size={28} color={colors.black} />;

const leftPadding = 10 * dimensions.sizeRatio;
const topPadding = 19.5 * dimensions.sizeRatio;
export default class SupportAddMsg extends Component {


    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isRecording: false,
            access_token: '',
            dataSource: [1, 2, 3, 4],
            errorMessage: 'No categories available',
            messageTitle: '',
            messageToSend: '',
            messageImage: require('../../images/MessageImagePlaceholder.png'),
            subjectId: '',
            topicId: '',
            supprtArray: this.newSupportArray(),
            selectedSupprtItem: '',

            //new image picker
            isImagePicker: false
        }
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
                })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        global.isLiveConfRunningIosForLiveSessionNotHide = true;

        global.navigation = this.props.navigation

        // Recording of
        if (Platform.OS == 'ios') {
            this.addListener()
        }

        //call api after did Focus
        const { navigation } = this.props;
        this.focusListener = navigation.addListener('didFocus', () => {
            global.isChatLiveSessionVisible = false;
        })
        this.getAccessToken()
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

    handleBackButtonClick = () => {
        this.props.navigation.goBack();
        return true;
    }

    newSupportArray = () => {

        let savedSupportArray = global.landingPaidFreeCompleteObj.tech_support_types;
        let newSupportArray = [];
        for (let index = 0; index < savedSupportArray.length; index++) {
            newSupportArray.push(savedSupportArray[index].TST_TITLE)
        }
        return newSupportArray;
    }

    selectSupprtItem = (indexA) => {
        let previousSupportArray = global.landingPaidFreeCompleteObj.tech_support_types;
        let selectedItem = '';

        previousSupportArray.forEach((element, index, array) => {
            if (index == indexA) {
                selectedItem = element;
            }
        });
        setTimeout(() => {
            this.setState({
                selectedSupprtItem: selectedItem
            })
        }, 500);
    }

    checkValidation() {
        if (this.state.selectedSupprtItem == '') {
            Alert.alert('IFAS', 'Please select message type.');
            return false
        }
        if (this.state.messageTitle.trim() == '') {
            Alert.alert('IFAS', CONSTANTS.NO_CHAT_TITLE_MESSAGE);
            return false
        }
        if (this.state.messageToSend.trim() == '') {
            Alert.alert('IFAS', 'Please enter chat message');
            return false
        }
        return true
    }

    sendMessageApi() {
        if (this.checkValidation() == false) {
            return
        }
        this.setState({
            isLoading: true
        });

        var data = new FormData();
        data.append("access_token", this.state.access_token);
        data.append('course_id', global.landingScreenPaidItem.id);
        if (this.state.messageToSend != '' && this.state.messageToSend != undefined) {
            data.append("msg", this.state.messageToSend.trim());
        } else {
            data.append("msg", '');
        }
        data.append("type", this.state.selectedSupprtItem.TST_ID);
        data.append("title", this.state.messageTitle.trim());
        console.warn('ABCDDDD',data)
        if (this.state.messageImage != require('../../images/MessageImagePlaceholder.png')) {
            var photo = {
                uri: this.state.messageImage.uri,
                type: 'image/jpeg',
                name: 'ChatImage' + '.jpg',
            };
            data.append("img", photo);
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
                    console.log('responseJson2')
                    Alert.alert('IFAS', CONSTANTS.MESSAGE_SUCCESS);
                    this.props.navigation.goBack();
                    return true;
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

    selectProfilePic = (selectType) => {
        console.warn('ee')
        if (selectType == "Camera") {
            ImagePicker2.openCamera({
                width: 300,
                height: 400,
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
                        messageImage: tempImageObject
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
                        messageImage: tempImageObject
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
                        {'Add Support Message'}
                    </Text>
                </View>
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
                {this.renderHeader()}
                <View style={{ flex: 1, paddingTop: dimensions.sizeRatio * 12, backgroundColor: colors.sessions_bgtheme }}>

                    <View style={styles.container}>
                        <View style={{ flex: 1, padding: 10 }}>
                            <KeyboardAwareScrollView style={styles.ScrollStyle} showsVerticalScrollIndicator={false} >
                                <View >
                                    <Text style={styles.TextInputHeaderStyle}>{'Support Message Type'}</Text>
                                    <TouchableOpacity onPress={() => {
                                        this.ActionSheet.show()
                                    }}>
                                        <View style={styles.TextInputBottomBorderStyle}>
                                            <Text numberOfLines={1} ellipsizeMode='tail' style={[styles.TextInputStyle,
                                            { textAlignVertical: 'center', color: this.state.selectedSupprtItem == '' ? colors.uploadGrey : colors.night }]}>
                                                {this.state.selectedSupprtItem == '' ? 'Select Message Type' : this.state.selectedSupprtItem.TST_TITLE}
                                            </Text>
                                            <Image
                                                source={require('../../images/Dropdown.png')}
                                                //Image Style
                                                style={styles.Dropdown}
                                            />
                                        </View>
                                    </TouchableOpacity>

                                    <Text style={styles.TextInputHeaderStyle}>{constantStrings.title}</Text>
                                    <View style={styles.TextInputBottomBorderStyle}>
                                        <TextInput
                                            style={[styles.TextInputStyle, { textAlignVertical: 'center' }]}
                                            onChangeText={(text) => { this.setState({ messageTitle: text }) }}
                                            placeholder={textInputPlaceholders.title}
                                            value={this.state.messageTitle}
                                        />
                                    </View>

                                    <Text style={styles.TextInputHeaderStyle}>{constantStrings.message}</Text>
                                    <View style={[styles.TextInputBottomBorderStyle, {
                                        height: 136 * dimensions.sizeRatio, alignItems: 'flex-start'
                                    }]}>
                                        <TextInput
                                            style={[styles.TextInputStyle, { height: 126 * dimensions.sizeRatio }]}
                                            onChangeText={(text) => { this.setState({ messageToSend: text }) }}
                                            placeholder={textInputPlaceholders.message}
                                            multiline={true}
                                            value={this.state.messageToSend}
                                        />
                                    </View>
                                    <TouchableOpacity style={[styles.TextInputBottomBorderStyle, {
                                        height: 59.5 * dimensions.sizeRatio, marginTop: topPadding * dimensions.sizeRatio, paddingVertical: 0,
                                        paddingHorizontal: 0, backgroundColor: 'clear'
                                    }]} activeOpacity={0.5}
                                        onPress={() => {
                                            //this.selectPhotoTapped()
                                            //this.selectProfilePic('Camera')
                                            this.setState({
                                                isImagePicker: true
                                            })
                                        }
                                        }
                                    >
                                        <View style={[styles.MessageView, { alignItems: 'center' }]}>
                                            <Image
                                                source={this.state.messageImage}
                                                //Image Style
                                                style={styles.MessageImageView}
                                            />
                                            <Text style={styles.UplodImageText}>
                                                {constantStrings.uploadImage}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.SubmitButton}
                                        onPress={() => {
                                            this.sendMessageApi()
                                        }}
                                        underlayColor='#ffffff'>
                                        <Text style={styles.SubmitText}>{constantStrings.send}</Text>
                                    </TouchableOpacity>
                                </View>
                            </KeyboardAwareScrollView>
                        </View>
                    </View>
                    {
                        this.dialogForImagePicker()
                    }
                    <ActionSheet
                        ref={o => this.ActionSheet = o}
                        title={'Which one do you like ?'}
                        options={this.state.supprtArray}
                        //cancelButtonIndex={2}
                        //destructiveButtonIndex={1}
                        onPress={(index) => this.selectSupprtItem(index)}
                    />
                </View>
            </View>
        );
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
        textAlignVertical: 'top',
        marginRight: 40 * dimensions.sizeRatio,
        marginLeft: 10 * dimensions.sizeRatio
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
        height: 60 * dimensions.sizeRatio,
        paddingVertical: 5 * dimensions.sizeRatio,
        // paddingHorizontal: 20 * dimensions.sizeRatio,
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
    }
});


