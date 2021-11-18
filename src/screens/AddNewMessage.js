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
    PermissionsAndroid
} from 'react-native';

import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import stylesGlobal from '../styles/subject_style.js';
import CONSTANTS, { constantStrings, textInputPlaceholders } from '../resources/constants.js'
import renderIf from '../resources/utility';
import openSettingsPage from '../resources/utility.js';
import ProfileHeaderButton from '../headers/ProfileHeaderButton'
import BackSubjectsButton from '../headers/BackSubjectsButton'
import { showNativeAlert } from '../resources/app_utility.js'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import ImagePicker from 'react-native-image-picker';
//new image picker
import ImagePicker2 from 'react-native-image-crop-picker';
import { Dialog } from 'react-native-simple-dialogs';
import Toast from 'react-native-tiny-toast';

//Using this for handle start conference
import { EventRegister } from 'react-native-event-listeners';
import * as GoToScreen from '../resources/goToScreen'

const leftPadding = 10 * dimensions.sizeRatio;
const topPadding = 19.5 * dimensions.sizeRatio;
export default class AddNewMessage extends Component {

    //Navigation Method
    static navigationOptions = (navigation) => {
        return ({
            title: 'New Message',
            headerStyle: { backgroundColor: colors.theme },
            headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
            headerBackTitle: null,
            headerTintColor: 'white',

            // headerLeft: <BackSubjectsButton />,
            headerRight: <View></View>,

            gesturesEnabled: false
        })
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            access_token: '',
            dataSource: [{ 'cat_name': 'Accounting and Finance', 'cat_description': 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...' }, { 'cat_name': 'Accounting and Finance', 'cat_description': 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...' }, { 'cat_name': 'Accounting and Finance', 'cat_description': 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...' }, { 'cat_name': 'Accounting and Finance', 'cat_description': 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...' }, { 'cat_name': 'Accounting and Finance', 'cat_description': 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...' }, { 'cat_name': 'Accounting and Finance', 'cat_description': 'Lorem ipsum dolor sit amet, consectetur adipis cing elit, sed do eiusmod tempor incididunt ut...' }],
            errorMessage: 'No categories available',
            subjectName: '',
            topicName: '',
            messageTitle: '',
            messageToSend: '',
            messageImage: require('../images/MessageImagePlaceholder.png'),
            subjectId: '',
            topicId: '',
            isRecording: false,

            //new image picker
            isImagePicker:false
        }
    }

    methodGoToTopics(subjectId, subjectName) {
        //this.props.navigation.navigate('Topics', { subjectId: subjectId.toString(), subjectName: subjectName })
        if(this.state.subjectId != ''){
        this.props.navigation.navigate('PaidTopicMsgSelection', { fromPage: 'AddMessage', onGoBack: this.getSelectedTopic, selected_item: {subject_id: this.state.subjectId} })
        }else{
            Toast.show('Please select subject!');
        }
    }
    methodGoToSubjects() {
        //this.props.navigation.navigate('PaidSubjects', { item: {} })
        this.props.navigation.navigate('PaidSubjects', { fromPage: 'AddMessage', onGoBack: this.getSelectedSubject })
    }

    getSelectedSubject = (subjectId, subjectName) => {
        console.warn('getting back id =', subjectId);
        console.warn('subjectName =', subjectName);
        this.setState({
            subjectName: subjectName,
            subjectId: subjectId
        });
    }

    getSelectedTopic = (topicId, topicName) => {
        console.warn('getting back topic id  =', topicId);
        console.warn('topicName =', topicName);
        this.setState({
            topicName: topicName,
            topicId: topicId
        });
    }
    getCategories() {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        console.log(formData)

        fetch(CONSTANTS.BASE + CONSTANTS.POST_SUBJECTS, {
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
                    this.setState({
                        isLoading: false,
                        isRefreshFetching: false,
                        dataSource: responseJson.data.Subjects,
                    }, function () {

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

                    errorMessage: 'Failed to fetch your subjects.'
                })
            });
    }
    checkValidation() {
        if (this.state.subjectName == '') {
            Alert.alert('IFAS', CONSTANTS.NO_SUBJECT_MESSAGE);
            return false
        }
        if (this.state.messageTitle.trim() == '') {
            Alert.alert('IFAS', CONSTANTS.NO_CHAT_TITLE_MESSAGE);
            return false
        }
        if (this.state.messageToSend.trim() == '') {
            if (this.state.messageImage == require('../images/MessageImagePlaceholder.png')) {
                Alert.alert('IFAS', CONSTANTS.NO_CHAT_MESSAGE_OR_IMAGE);
                return false
            }
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
        if (this.state.messageToSend != '' && this.state.messageToSend != undefined) {
            data.append("msg", this.state.messageToSend.trim());
        } else {
            data.append("msg", '');
        }
        data.append("subject_id", this.state.subjectId);
        data.append("topic_id", this.state.topicId);
        data.append("title", this.state.messageTitle.trim());
        if (this.state.messageImage != require('../images/MessageImagePlaceholder.png')) {
            var photo = {
                uri: this.state.messageImage.uri,
                type: 'image/jpeg',
                name: 'ChatImage' + '.jpg',
            };
            data.append("img", photo);
        }

        console.warn('addnew response', data)
        console.log(CONSTANTS.BASE_CHAT + CONSTANTS.POST_PAID_MESSAGE_SEND_NEW)
        let header = {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
        }
        console.log(header)

        return fetch(CONSTANTS.BASE_CHAT + CONSTANTS.POST_PAID_MESSAGE_SEND_NEW, { method: 'POST', headers: header, body: data })
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
                    // this.setState({
                    //     isLoading: false
                    // });
                    Alert.alert('IFAS', CONSTANTS.MESSAGE_SUCCESS);
                    this.props.navigation.goBack();
                    return true;
                }
                else if (responseJson.code == 218) {
                    console.log('responseJson3')
                    // this.setState({
                    //     isLoading: false
                    // });
                    Alert.alert('IFAS', responseJson.message);
                }
                // if (responseJson.code == 414 || responseJson.code == 521) {
                //     SessionOut();
                // } else if (responseJson.code != 200) {
                //     messageAlert(responseJson)
                // } else {
                //     if (responseJson.data.photo != undefined) {
                //         Global.loginUser.photo = responseJson.data.photo
                //         console.log(Global.loginUser.photo)
                //     }
                //     if (responseJson.data.last_name != undefined) {
                //         Global.loginUser.last_name = responseJson.data.last_name
                //     }
                //     if (responseJson.data.first_name != undefined) {
                //         Global.loginUser.first_name = responseJson.data.first_name
                //     }
                //     let user = JSON.stringify(Global.loginUser);
                //     AsyncStorage.setItem('userdata', user).then(user => {
                //         console.log('profile data save')

                //     }).catch(err => console.log(err));

                // }
                // return responseJson
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

    selectPhotoTapped() {
        // this.setState({
        //     isLoading: true,
        // });
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
                    messageImage: sourceUri
                });
            }
        });
    }


    sendMessage() {

    }

    getAccessToken() {
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                self.setState({
                    access_token: value.slice(1, -1),
                }, () => { self.getCategories() })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    componentDidMount() {
        global.isLiveConfRunningIosForLiveSessionNotHide = true;
        global.navigation = this.props.navigation
        this.getAccessToken()
        // this.props.navigation.setParams({ showProfile: this.showProfile.bind(this) });

        // Recording of
        if (Platform.OS == 'ios') {
            this.addListener()
        }

        //Check start live conf notification or screen currently visible or not
        this.listener = EventRegister.addEventListener('start_live_conf_on_notification', (data) => {
            console.log('start_live_conf_on_notification getAccessToken ')
            GoToScreen.goToWhichScreen('Sessions', this.props)
        })

        //this.androidCameraStoragePermission()
    }

    androidCameraStoragePermission = async () =>{
        try {
            // const granted = await PermissionsAndroid.request(
            //   PermissionsAndroid.PERMISSIONS.CAMERA,
            //   {
            //     'title': 'IFAS App Camera Permission',
            //     'message': 'IFAS App needs access to your camera ' +
            //                'so you can take awesome pictures.'
            //   }
            // )

            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                  'title': 'IFAS App Storage Permission',
                  'message': 'IFAS App needs access to your Storage ' +
                             'so you can take awesome pictures.'
                }
              )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              console.warn("You can use the camera")
            } else if (PermissionsAndroid.RESULTS.DENIED){
              console.warn("Camera permission denied")
            }
          } catch (err) {
            console.warn(err)
          }
    }

    addListener = () => {
        console.warn('CAPTURE_NEW_MESSAGE')
        let bridge = new NativeEventEmitter(NativeModules.ScreenRecorderDetect);

        this.screenCaptureEnabled = bridge.addListener("isScreenCaptureEnabled", (res) => {
            console.warn('CAPTURE_NEW_MESSAGE1' + '\n\n' + JSON.stringify(res))
            if (res.value == true) {
                console.warn('CAPTURE_NEW_MESSAGE2' + '\n\n' + JSON.stringify(res) + '\n\n' + this.state.isRecording)
                this.setState({
                    isRecording: true
                })
            }
            else {
                this.setState({ isRecording: false }, () => {
                    console.warn('CAPTURE_NEW_MESSAGE3' + '\n\n' + JSON.stringify(res) + '\n\n' + this.state.isRecording)
                })
            }

        })
    }

    componentWillUnmount() {
        console.log("Unmounted Categories")
        EventRegister.removeEventListener(this.listener);
        if (Platform.OS === "ios") {
            this.screenCaptureEnabled.remove()
        }
    }

    showProfile() {
        this.props.navigation.navigate('Profile')
    }

    logoutUser() {
        showNativeAlert(CONSTANTS.LOGOUT_MESSAGE)
        CONSTANTS.IS_LOGGED_IN = false
        this.props.navigation.popToTop()

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


    _onRefresh() {
        this.setState({ isRefreshFetching: true }, function () { this.getCategories() });
    }

    selectProfilePic = (selectType) => {
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
                cropping: false
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
        else {
            return (
                <View style={{ flex: 1, paddingTop: dimensions.sizeRatio * 12, backgroundColor: colors.sessions_bgtheme }}>

                    <View style={styles.container}>
                        <View style={{ flex: 1, padding: 10 }}>
                            <KeyboardAwareScrollView style={styles.ScrollStyle} showsVerticalScrollIndicator={false} >
                                <View >
                                    <Text style={styles.TextInputHeaderStyle}>{constantStrings.subject}</Text>
                                    <TouchableOpacity onPress={() => this.methodGoToSubjects()}>
                                        <View style={styles.TextInputBottomBorderStyle}>
                                            <Text numberOfLines={1} ellipsizeMode='tail' style={[styles.TextInputStyle, { textAlignVertical: 'center', color: this.state.subjectName == '' ? colors.uploadGrey : colors.night }]}>
                                                {this.state.subjectName == '' ? textInputPlaceholders.subName : this.state.subjectName}
                                            </Text>
                                            {/* <TextInput
                                        numberOfLines={1}
                                        style={[styles.TextInputStyle,{textAlignVertical:'center'}]}
                                        editable={false}
                                        placeholder={textInputPlaceholders.subName}
                                        value={this.state.subjectName}
                                    /> */}
                                            <Image
                                                source={require('../images/Dropdown.png')}
                                                //Image Style
                                                style={styles.Dropdown}
                                            />
                                        </View>
                                    </TouchableOpacity>

                                    <Text style={styles.TextInputHeaderStyle}>{'Topic'}</Text>
                                    <TouchableOpacity onPress={() => this.methodGoToTopics()}>
                                        <View style={styles.TextInputBottomBorderStyle}>
                                            <Text numberOfLines={1} ellipsizeMode='tail' style={[styles.TextInputStyle, { textAlignVertical: 'center', color: this.state.topicName == '' ? colors.uploadGrey : colors.night }]}>
                                                {this.state.topicName == '' ? 'Select topic name' : this.state.topicName}
                                            </Text>
                                            {/* <TextInput
                                        numberOfLines={1}
                                        style={[styles.TextInputStyle,{textAlignVertical:'center'}]}
                                        editable={false}
                                        placeholder={textInputPlaceholders.subName}
                                        value={this.state.subjectName}
                                    /> */}
                                            <Image
                                                source={require('../images/Dropdown.png')}
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
                                            isImagePicker:true
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
                                        onPress={() => this.sendMessageApi()}
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
                </View>
            );
        }
    }
    keyExtractor = item => {
        return item.subject_id + new Date().getTime().toString() + (Math.floor(Math.random() * Math.floor(new Date().getTime()))).toString();
    };


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
                            fontWeight:Platform.OS == 'android' ? '700' :'600'
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
                                fontWeight:Platform.OS == 'android' ? '700' :'600'
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
                                fontWeight:Platform.OS == 'android' ? '700' :'600'
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
                                fontWeight:'700',
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

