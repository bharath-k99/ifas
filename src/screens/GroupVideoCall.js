
import React, { Component } from 'react';
import {
    Platform, StatusBar, AsyncStorage, Text, View,
    Image, TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl, Modal, NativeEventEmitter, NativeModules, Linking, BackHandler,
    PermissionsAndroid
} from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import styles from '../styles/subject_style.js';
import CONSTANTS from '../resources/constants.js'

//Library
import { WebView } from 'react-native-webview';
import Orientation from 'react-native-orientation';
import Toast from 'react-native-tiny-toast';
import { EventRegister } from "react-native-event-listeners";
//import { PERMISSIONS, check, request } from 'react-native-permissions'

//secreate key gMALBFDHHYcjNHRLu8beUlQ7fD0NJY8kkpFm0wr0
//https://meet.ifasonline.com/bigbluebutton/api/join?fullName=praveen&meetingID=gzhbqcfy05yrqlruilmm2igovmz6tur1fxrt0yiz&password=GaHLMNVPyhDD&redirect=true&checksum=441e9ceaa82e4fd298e7001c757cf664c3d52b67
//https://meet.ifasonline.com/bigbluebutton/api/join?fullName=praveen&meetingID=gzhbqcfy05yrqlruilmm2igovmz6tur1fxrt0yiz&password=GaHLMNVPyhDD&redirect=true&checksum=441e9ceaa82e4fd298e7001c757cf664c3d52b67
var bbbJoinUri = 'https://meet.ifasonline.com/bigbluebutton/api/join?'
var fullName = ''
var meetingId = 'gzhbqcfy05yrqlruilmm2igovmz6tur1fxrt0yiz'
var password = 'GaHLMNVPyhDD'
var redirect = true
var checksum = ''
var finalURI = undefined

//Craete SHA1
var sha1 = require('sha1');
export default class GroupVideoCall extends Component {

    constructor(props) {
        super(props);
        this.state = {
            meetingGenratedURL:undefined
        }
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    async componentDidMount() {
        global.isLiveConfRunningIosForLiveSessionNotHide = false;
        //Not visible notification start popup for this screen
        global.isChatLiveSessionVisible = true;
        Orientation.unlockAllOrientations();
        this.props.navigation.setParams({ handleBackButtonClick: this.handleBackButtonClick.bind(this) });
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        if (this.props.navigation.state.params.meetingGenratedURL != undefined && this.props.navigation.state.params.meetingGenratedURL != null &&
            this.props.navigation.state.params.meetingGenratedURL != '') {
            this.setState({
                meetingGenratedURL: this.props.navigation.state.params.meetingGenratedURL,
            })
        }

        // For handle back to dashboard if conferencing is end
        global.isAndroidConferenceOpen = true;
        this.backToDashboard = EventRegister.addEventListener('backToDashboard', (data) => {
            console.warn('backToDashboard log in chat', data)
            this.signoutMeeting()
        })
    }

    componentWillUnmount() {
        //Not visible notification start popup for this screen
        global.isChatLiveSessionVisible = false;
        Orientation.lockToPortrait();
        global.isAndroidConferenceOpen = false;
        EventRegister.removeEventListener(this.backToDashboard)
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick = () => {

        Alert.alert(
            'Confirm Leave Conference.',
            'Are you sure you want to leave conference?.',
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                {
                    text: 'OK', onPress: () => {
                        this.signoutMeeting()
                    }
                },
            ],
            { cancelable: false }
        )
        return true;
    }

    requestCameraPermission = async () => {
        if (Platform.OS == 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: "IFAS App Camera Permission",
                        message:
                            "IFAS App needs access to your camera.",
                        //buttonNeutral: "Ask Me Later",
                        //buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.warn("You can use the camera");
                } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
                    Toast.show("Permission to access video is required !!")
                    console.warn("Camera permission denied");
                }
            } catch (err) {
                console.warn(err);
            }
        } else {
            // const res = await check(PERMISSIONS.IOS.CAMERA);

            // if (res === RESULTS.GRANTED) {
            //     setCameraGranted(true);
            // } else if (res === RESULTS.DENIED) {
            //     const res2 = await request(PERMISSIONS.IOS.CAMERA);
            // }
        }
    }

    requestAudioPermission = async () => {
        if (Platform.OS == 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    {
                        title: "IFAS App Audio Permission",
                        message:
                            "IFAS App needs access to your audio.",
                        //buttonNeutral: "Ask Me Later",
                        //buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("You can use the audio");
                } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
                    Toast.show("Permission to access audio is required !!")
                    console.log("Audio permission denied");
                }
            } catch (err) {
                console.warn(err);
            }
        } else {

        }
    }

    handleClick = () => {
        Linking.canOpenURL(this.state.checkSumKey).then(supported => {
            if (supported) {
                Linking.openURL(this.state.checkSumKey);
            } else {
                console.log("Don't know how to open URI: " + this.state.checkSumKey);
            }
        });
    };

    signoutMeeting = () => {

        fetch('https://meet.ifasonline.com/bigbluebutton/api/signOut')
        .then((resp)=>{ 
            //return resp.text() 
            console.warn('two'+resp.text())
            Orientation.lockToPortrait()
            this.props.navigation.goBack();
            return true;
        })
        .then((text)=>{ 
            console.warn('one'+text)
            Orientation.lockToPortrait()
            this.props.navigation.goBack();
            return true;
         })
         .catch((e)=>{
             console.warn('exception',e)
             Orientation.lockToPortrait()
            this.props.navigation.goBack();
            return true;
         })
    }

    _onNavigationStateChange(webViewState){
        // {
        //     canGoBack: bool,
        //     canGoForward: bool,
        //     loading: bool,
        //     target: number,
        //     title: string,
        //     url: string,
        //   }
        console.warn('webviewurl'+JSON.stringify(webViewState))
        if(webViewState != undefined){
            if(webViewState.canGoBack == true){
                this.props.navigation.goBack();
                return true;
            }
        }
      }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: colors.sessions_bgtheme }}>
                {this.state.meetingGenratedURL != undefined &&
                    <WebView
                        audio={this.requestAudioPermission()}
                        camera={this.requestCameraPermission()}
                        originWhitelist={['*']}
                        javaScriptEnabled
                        mediaPlaybackRequiresUserAction={true}
                        allowsFullscreenVideo={true}
                        source={{
                            uri: this.state.meetingGenratedURL
                        }}
                        onNavigationStateChange={this._onNavigationStateChange.bind(this)}
                    //style={{ marginTop: 40 }}
                    />
                }
            </View>
        )
    }
}








    // static navigationOptions = (navigation) => {
    //     return ({
    //         title: 'IFAS Conference',
    //         headerStyle: { backgroundColor: colors.theme },
    //         headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
    //         headerBackTitle: null,
    //         headerLeft: <View style={{ flexDirection: 'row' }}>
    //         <TouchableOpacity
    //             //hitSlop={{top: 20, bottom: 20, left: 30, right: 30}} 
    //             onPress={() => navigation.navigation.state.params.handleBackButtonClick()}
    //             style={{
    //                 width: dimensions.sizeRatio * 35,
    //                 height: dimensions.sizeRatio * 25,
    //                 marginLeft: Platform.OS == 'android' ? dimensions.sizeRatio * 10 : dimensions.sizeRatio * 5,
    //                 zIndex: 1,
    //                 padding: dimensions.sizeRatio * 2,
    //                 marginBottom: Platform.OS == 'ios' ? dimensions.sizeRatio * 10 : 0
    //             }}>
    //             <Image
    //                 source={Platform.OS == 'ios' ? require('../images/back.png') : require('../images/back_two.png')}
    //                 style={{
    //                     width: Platform.OS == 'android' ? dimensions.sizeRatio * 30 : dimensions.sizeRatio * 25,
    //                     height: Platform.OS == 'android' ? dimensions.sizeRatio * 20 : dimensions.sizeRatio * 20,
    //                     tintColor: colors.white
    //                     //padding: 5
    //                 }}
    //                 //resizeMode={'contain'}
    //             />
    //         </TouchableOpacity>
    //     </View>,
    //         headerTintColor: 'white',
    //         gesturesEnabled: false,
    //         checkSumKey: undefined
    //     })
    // };

                 // await AsyncStorage.getItem('LOGIN_USER_NAME').then(value => {
        //     let loginData = JSON.parse(value)
        //     console.warn('LoginData1' + JSON.stringify(loginData))
        //     var apiName = "join"
        //     var joinApi = `fullName=${loginData.data.USER_NAME}&meetingID=gzhbqcfy05yrqlruilmm2igovmz6tur1fxrt0yiz&password=GaHLMNVPyhDD&redirect=true`
        //     var sharedSecret = "gMALBFDHHYcjNHRLu8beUlQ7fD0NJY8kkpFm0wr0"
        //     checksum = sha1(apiName + joinApi + sharedSecret);
        //     finalURI = bbbJoinUri + 'fullName=' + loginData.data.USER_NAME + '&meetingID=' + meetingId +
        //         '&password=' + password + '&redirect=' + redirect + '&checksum='
        //     this.setState({
        //         checkSumKey: finalURI + sha1(apiName + joinApi + sharedSecret)
        //     }, () => {
        //         console.warn('fullurlsession' + JSON.stringify(this.state.checkSumKey))
        //     })
        //     console.warn('shaaaa  ' + sha1(apiName + joinApi + sharedSecret))
        // })
        // fetch('https://meet.ifasonline.com/bigbluebutton/api/signOut', {
        //     method: 'GET',
        //     header:{ 'Accept': 'application/application/x-www-form-urlencoded', 'Content-type': 'application/application/x-www-form-urlencoded' },
        // }).then((response) => response.json())
        //     .then((res) => {
        //         //alert(JSON.stringify(responseJson.body))
        //         Orientation.lockToPortrait()
        //         this.props.navigation.goBack();
        //         return true;
        //     })
        //     .catch((error) => {
        //         console.error('ERROR' + error);
        //     });
// cameraPermission = async () => { 

//     check(PERMISSIONS.ANDROID.CAMERA)
//     .then((result) => {
//       switch (result) {
//         case RESULTS.UNAVAILABLE:
//           console.log(
//             'This feature is not available (on this device / in this context)',
//           );
//           break;
//         case RESULTS.DENIED:
//             alert("Permission to access video is required !!");
//           console.log(
//             'The permission has not been requested / is denied but requestable',
//           );
//           break;
//         case RESULTS.GRANTED:
//           console.log('The permission is granted');
//           break;
//       }
//     })
//     .catch((error) => {
//       // …
//     });

//     // if(permissionResult.granted == false){
//     //     alert("Permission to access video is required !!");
//     //     return; 
//     // }  
//   };


// audioPermission = async () => { 

//     check(PERMISSIONS.ANDROID.RECORD_AUDIO)
//     .then((result) => {
//       switch (result) {
//         case RESULTS.UNAVAILABLE:
//           console.log(
//             'This feature is not available (on this device / in this context)',
//           );
//           break;
//         case RESULTS.DENIED:
//             alert("Permission to access audio is required !!");
//           console.log(
//             'The permission has not been requested / is denied but requestable',
//           );
//           break;
//         case RESULTS.GRANTED:
//           console.log('The permission is granted');
//           break;
//       }
//     })
//     .catch((error) => {
//       // …
//     }); 
//   };