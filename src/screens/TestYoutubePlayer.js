
import React, { Component } from 'react';
// Bellow Components are using for make design and functionality
import {
    Platform, AsyncStorage, Text, Button, View, Image,
    TouchableOpacity, TextInput, Alert, ActivityIndicator, StatusBar,
    NativeEventEmitter, NativeModules, FlatList
} from 'react-native';
import colors from '../resources/colors';
import CONSTANTS from '../resources/constants';
import dimensions from '../resources/dimension';
import Orientation from 'react-native-orientation';
import { PermissionsAndroid } from 'react-native';
import { NavigationEvents } from 'react-navigation';

import { EventRegister } from 'react-native-event-listeners';
import ytdl from "react-native-ytdl"
import Toast from 'react-native-tiny-toast';
import AndroidPlayer from '../screens/AndroidPlayer';
import Video from 'react-native-video';
import YouTube from 'react-native-youtube'

var forceUpdating = false
export default class TestYoutubePlayer extends Component {

    static navigationOptions = (navigation) => {
        const { state } = navigation;
        if (Platform.OS == 'android') {
            return {
                title: 'Live Streaming',
                header: null,
            }
        }
        return {
            title: 'Live Streaming',
            headerStyle: { backgroundColor: colors.theme },
            headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
            headerBackTitle: null,
            headerLeft: <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <TouchableOpacity
                    //hitSlop={{top: 20, bottom: 20, left: 30, right: 30}} 
                    onPress={() => navigation.navigation.state.params.methodGoBack()}
                    style={{
                        width: dimensions.sizeRatio * 35,
                        height: dimensions.sizeRatio * 25,
                        marginLeft: Platform.OS == 'android' ? dimensions.sizeRatio * 10 : dimensions.sizeRatio * 5,
                        zIndex: 1,
                        padding: dimensions.sizeRatio * 2,
                        //marginBottom: Platform.OS == 'ios' ? dimensions.sizeRatio * 10 : 0,
                        justifyContent: 'center'
                    }}>
                    <Image
                        source={Platform.OS == 'ios' ? require('../images/back.png') : require('../images/back_two.png')}
                        style={{
                            width: Platform.OS == 'android' ? dimensions.sizeRatio * 30 : dimensions.sizeRatio * 25,
                            height: Platform.OS == 'android' ? dimensions.sizeRatio * 20 : dimensions.sizeRatio * 20,
                            //marginTop: Platform.OS == 'android' ? 0 : dimensions.sizeRatio * 5,
                            tintColor: colors.white,
                            alignSelf: 'center'
                            //padding: 5
                        }}
                        resizeMode={Platform.OS == 'android' ? 'contain' : 'center'}
                    />
                </TouchableOpacity>
            </View>,


            headerTintColor: 'white',
            // headerLeft: <BackStreamingButton />,
            gesturesEnabled: false,
            headerRight: <View />
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            youtubeUrl: undefined,
            play: true,
            isVideoLoading: true,
            frameRateDefault: 1.0,
            fullScreeen: true,
            isScreenLandScape: true,
            isScreenLandScapeHideOpenClose: true,
            isCloseOpen: true,
            commentTextInput: '',
            chatArrayList: [{ id: 1, message: 'Hi sir, this is my first message.', type: 'me' },
            { id: 2, message: 'Good Morning sir!! to vese aaj hum kiya padhenge', type: 'other' },
            { id: 3, message: 'Hello sir, I am not hear your voice clear.', type: 'me' },
            { id: 4, message: 'Sir, did not understand the relevane ', type: 'other' }
            ]
        }
    }

    methodGoBack() {
        this.props.navigation.goBack()
        return true
    }

    componentDidMount() {
        this.setState({
            isVideoLoading: true
        })
        this.props.navigation.setParams({ methodGoBack: this.methodGoBack.bind(this) });
        this.youtube_parser('https://www.youtube.com/watch?v=uxWLDCL27rE&t=22s')
        if (Platform.OS == 'android') {
            Orientation.lockToLandscape();
            Orientation.addOrientationListener(this._orientationDidChange);
        } else {
            NativeModules.SFViewControl.rotatePlayerLockUnlock('unloack')
            Orientation.lockToLandscape();
            Orientation.addOrientationListener(this._orientationDidChange);
        }

        //LISTENER FOR PROFILE BUTTON TAP
        this.listener = EventRegister.addEventListener('isStopPlaying', (data) => {

            console.log('handleForceUpdating3' + forceUpdating)
            if (data == 'paused' && forceUpdating == false) {
                forceUpdating = true
                console.log(data)
                this.setState({ play: false })

                console.log('handleForceUpdating4' + forceUpdating)

            } else if (data == 'paused' && forceUpdating == true) {
                console.log('false' + data)
                this.setState({ play: false })
                console.log('handleForceUpdating5' + forceUpdating)
            }
            if (data == 'playing' && Platform.OS == 'ios') {
                forceUpdating = false
                this.setState({ play: true })
                console.log('handleForceUpdating6' + forceUpdating)
            }

        })
    }
    componentWillUnmount() {
        Orientation.removeOrientationListener(this._orientationDidChange);
        if (Platform.OS == 'ios') {
            NativeModules.SFViewControl.rotatePlayerLockUnlock('potrate')
        }
    }

    onProgress = (data) => {
        //console.warn('ONPROGRESS' + JSON.stringify(data))
    };

    onLoadStart = (data) => {
        console.warn('On load start fired!');
        if (Platform.OS == 'android') {
            this.setState({ isVideoLoading: true });
        } else {
            this.setState({ isVideoLoading: true });
        }
    }


    onLoad = (data) => {
        // alert('On load fired!')
        console.warn('On load fired!');
        if (Platform.OS == 'android') {
            if (this.state.isVideoLoading == true) {
                this.setState({
                    isVideoLoading: false
                });
            }
        } else {
            if (this.state.isVideoLoading == true) {
                this.setState({
                    isVideoLoading: false
                });
            }
        }
    }
    onBuffer() {
        console.log('On buffer!!');
    }
    videoError(err) {
        console.log(err);
    }

    extractorYoutubeURL = async (youtubeUrl) => {

        //let youtubeUrl2 = 'https://www.youtube.com/watch?v=FEU-LZiZIV4&list=RDFEU-LZiZIV4&start_radio=1';
        //let youtubeUrl2 = 'https://www.youtube.com/watch?v=4XeruKiMbE8';

        console.warn('Format found! url' + JSON.stringify(youtubeUrl));
        let qualityForVideo = '18';
        await ytdl.getInfo(youtubeUrl, {}, (err, info) => {
            //if (err) 

            console.log('format error' + JSON.stringify(err) + '\n\n' + JSON.stringify(info));
            if (info != undefined && info.formats != undefined) {
                //17 video 144
                //18 video 360
                //83 video 240
                //22 video 720
                //137 video 1080
                //101 audio 140
                let format1 = ytdl.chooseFormat(info.formats, { quality: qualityForVideo });

                console.warn('Format found!1' + JSON.stringify(format1));
                let videoURL = undefined;
                if (format1 != undefined && format1.url != undefined) {

                    videoURL = format1.url
                    this.setState({
                        youtubeUrl: format1.url,
                        isVideoLoading: false,
                    })
                    console.warn('Format found!2' + JSON.stringify(format1));
                }
            } else {
                this.setState({
                    isVideoLoading: false,
                })
            }
        });
    }
    youtube_parser(url) {
        var regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
        var match = url.match(regExp);
        if (match != null) {
            this.setState({
                youtubeUrl: match[1],
                isVideoLoading: false,
            })
        } else {
            console.log("The youtube url is not valid.");
            this.setState({
                isVideoLoading: false,
            })
        }
    }

    _onLayout = event => {
        const { width, height } = event.nativeEvent.layout;
        if (width > height) {
            this.setState({ resizeMode: 'stretch' });
        } else {
            this.setState({ resizeMode: 'contain' });
        }
    }

    _orientationDidChange = (orientation) => {
        console.log('handleForceUpdating7')
        Orientation.unlockAllOrientations()
        if (orientation === 'LANDSCAPE') {
            // do something with landscape layout
            console.log('handleForceUpdating8')
            this.setState({
                play: true,
                isScreenLandScape: true,
                isScreenLandScapeHideOpenClose: true
            })
        } else {
            // do something with portrait layout
            console.log('handleForceUpdating9')
            this.setState({
                play: true,
                isScreenLandScape: false,
                isScreenLandScapeHideOpenClose: false
            })
        }
    }

    onCommentSubmit = (message) => {
        if (message != undefined && message != null && message != '') {
            let chatArray = this.state.chatArrayList;
            let chatMessageObject = { id: 5, message: message, type: 'me' }
            chatArray.push(chatMessageObject)
            this.setState({
                chatArrayList: chatArray,
                commentTextInput: ''
            })
        }
    }
    closeOpenChat = (isOpen) => {
        if (isOpen) {
            this.setState({
                isScreenLandScape: true,
                isCloseOpen: isOpen
            })
        } else {
            this.setState({
                isScreenLandScape: false,
                isCloseOpen: isOpen
            })
        }
    }
    methodFullScreen(e) {
        console.log("Method full screen")
    }

    _playAgain() {
        console.log('play again', seekingTime)
        forceUpdating = false
        this.setState({ play: true })
        console.log('handleForceUpdating10' + forceUpdating)
    }


    render() {
        return (
            <View
                style={{
                    flex: 1,//for cover full screen height and width
                }}>
                {
                        <View style={{
                            flex: 1
                        }}>
                            <View style={{
                                backgroundColor: 'black',
                                flex: 1,
                            }}>
                                {this.state.youtubeUrl != undefined &&
                                    <View style={{
                                        backgroundColor: 'black',
                                        flex: 1,
                                        width: '100%',
                                        flexDirection: 'row'
                                    }}>
                                        <View style={{
                                            //width: this.state.isScreenLandScape ? '65%' : '100%'
                                            width: '100%'
                                        }}>
                                            <YouTube
                                                ref={component => {
                                                    this._youTubeRef = component;
                                                }}
                                                apiKey="AIzaSyCZs5LGQYP8EL8uQvvpO6SA-cFZs8kHw30"
                                                videoId={'uxWLDCL27rE'} // The YouTube video ID
                                                //play={this.state.play}
                                                play={true}
                                                fullscreen={false}
                                                loop={true}
                                                showinfo={false}
                                                controls={0}
                                                resumePlayAndroid={true}
                                                // modestbranding={false}
                                                onError={e => {
                                                    console.log('errrrrr',e)
                                                }}
                                                style={{ alignSelf: 'stretch', height: '100%', top: 0 }}
                                                onChangeFullscreen={e => this.methodFullScreen(e)}
                                                style={{ 
                                                    //height: dimensions.width - 30, 
                                                    backgroundColor: 'black', 
                                                    justifyContent: 'center', }}
                                                // onChangeState={(e) => {
                                                //     EventRegister.emit('isStopPlaying', e.state)
                                                // }}
                                            />
                                            {/* {
                                                forceUpdating == true ?
                                                    <View style={{
                                                        flex: 1, 
                                                        //height: dimensions.width - 30, 
                                                        width: isLandscape === false ? dimensions.width : dimensions.height,
                                                        justifyContent: 'center', alignItems: 'center', position: 'absolute', 
                                                        backgroundColor: 'rgba(0,0,0,0.5)'
                                                    }}>
                                                        <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', width: 100, height: 100 }}
                                                            onPress={this._playAgain.bind(this)}>
                                                            <Image source={require('../images/play_icon.png')}
                                                                style={{ justifyContent: 'center', tintColor: 'white', alignItems: 'center', width: 50, height: 50, resizeMode: 'contain' }} />
                                                        </TouchableOpacity>
                                                    </View> : null
                                            } */}
                                        </View>
                                        {/* Right View */}
                                    </View>
                                }
                            </View>
                        </View>
                }
            </View>
        )
    }
    keyExtractor = item => {
        return item.toString();
    };
} 









{/* Right chat view */}
{/* <View style={{
    flex: 1,
    width: this.state.isScreenLandScape ? '35%' : 0,
    backgroundColor: colors.white
}}>
    <View style={{
        flex: 1
    }}>
        <FlatList
            data={this.state.chatArrayList}
            renderItem={({ item }) =>
                <View style={{
                    flexDirection: 'row',
                    width: '100%',
                    backgroundColor: 'white',
                    alignItems: 'center',
                    padding: 7
                }}>
                    <Text
                        style={{
                            fontSize: 14,
                            color: item.type == 'me' ? colors.theme : colors.gray,
                            fontWeight: '700',
                            textAlign: 'left'
                        }}>
                        {item.type == 'me' ? `You:` : `Puneet AY:`}
                        <Text
                            style={{
                                fontSize: 13,
                                color: colors.black,
                                fontWeight: '600'
                            }}>
                            {item.type == 'me' ? item.message : item.message}
                        </Text>
                    </Text>
                </View>
            }
            keyExtractor={(item, index) => this.keyExtractor(item)}
        />
    </View>
    <View style={{
        width: '100%',
        height: 50,
        backgroundColor: colors.lightgray,
        justifyContent: 'center',
        padding: 10,
    }}>
        <View style={{
            width: '100%',
            height: 40,
            borderColor: colors.gray,
            borderWidth: 1,
            borderRadius: 25,
            backgroundColor: colors.white,
            justifyContent: 'center',
            paddingHorizontal: 10
        }}>
            <TextInput
                style={{
                    flex: 1, color: colors.black,
                    fontSize: 14,
                    fontFamily: CONSTANTS.REGULAR,
                    paddingTop: 0,
                    paddingBottom: 0,
                }}
                placeholder="Comment"
                placeholderTextColor='#495F8E'
                onChangeText={(commentTextInput) => this.setState({ commentTextInput })}
                value={this.state.commentTextInput}
                blurOnSubmit={false}
                keyboardType="default"
                returnKeyType="done"
                autoCapitalize="none"
                autoCorrect={false}
                // scrollEnabled={false}
                ref={(input) => this.commentInput = input}
                onSubmitEditing={() => {
                    this.onCommentSubmit(this.state.commentTextInput)
                }}
                numberOfLines={1}
            />
        </View>
    </View>
    {this.state.isScreenLandScapeHideOpenClose &&
        <TouchableOpacity
            activeOpacity={.9}
            onPress={() => {
                this.closeOpenChat(!this.state.isCloseOpen)
            }}
            style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: colors.transparent_theme,
                position: 'absolute',
                top: 0,
                left: 0,
                marginLeft: -25,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
            <Image
                style={{
                    width: 35,
                    height: 35,
                    color: colors.theme
                }}
                source={require('../images/icon_close.png')}
                resizeMode={'contain'}
            />
        </TouchableOpacity>
    }
</View> */}