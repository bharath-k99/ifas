/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    View, Platform, Alert, AsyncStorage, ActivityIndicator, Text, NativeEventEmitter, NativeModules,
    BackHandler, TouchableWithoutFeedback, Image, TouchableOpacity, FlatList, Dimensions
} from 'react-native';
import colors from '../resources/colors';
import YouTube from 'react-native-youtube'
import BackPlayerButton from '../headers/BackPlayerButton'
import { EventRegister } from 'react-native-event-listeners';
import CONSTANTS from '../resources/constants';
import dimensions from '../resources/dimension';
import { showNativeAlert } from '../resources/app_utility';
// import WebView from 'react-native-android-fullscreen-webview-video';
import AndroidPlayer from '../screens/AndroidPlayer';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation';
import { PermissionsAndroid } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import ytdl from "react-native-ytdl"
import Toast from 'react-native-tiny-toast';
import DeviceInfo from 'react-native-device-info';

//this.props.navigation.navigate('VideoPlayerNew', { youtubeUrl: url, item: item })
export default class AudioPlayer extends React.Component {

    static navigationOptions = (navigation) => {
        const { state } = navigation;
        if (Platform.OS == 'android') {
            return {
                title: 'Audio Player',
                header: null,
            }
        }
        // title: `${navigation.state.params.Headertitle}`,
        return {
            title: 'Audio Player', //this.state.headerTitle != undefined && this.state.headerTitle != '' ? this.state.headerTitle : '',
            headerStyle: { backgroundColor: colors.theme },
            headerTintColor: 'white',

            headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
            // headerLeft: <BackPlayerButton />,
            gesturesEnabled: false,
            headerRight: <View />
        }

    };

    constructor(props) {
        super(props);
        this.state = {
            access_token: '',
            youtubeUrl: undefined,
            selected_item: undefined,
            audioUrl: undefined,
            fullScreeen: false,
            errorMessage: 'Failed to load the audio.',
            resizeMode: 'contain',
            isError: false,
            isRecording: false,
            isAudioLoading: true,
            frameRateDefault: 1.0,
            isSpeedSelect: false,
            frameRateArray: [
                { time: 0.25, is_selected: false, id: 1 }, { time: 0.50, is_selected: false, id: 2 },
                { time: 0.75, is_selected: false, id: 3 },
                { time: 1.0, is_selected: true, id: 4 }, { time: 1.25, is_selected: false, id: 5 },
                { time: 1.50, is_selected: false, id: 6 }, { time: 1.75, is_selected: false, id: 7 },
                { time: 2.0, is_selected: false, id: 8 }
            ]
        }
    }

    componentDidMount() {
        //back handler
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);

        global.isLiveConfRunningIosForLiveSessionNotHide = true;
        //Not visible notification start popup for this screen
        global.isChatLiveSessionVisible = true;
        isTopicPlayerVisible = true;
        if (this.props.navigation.state.params.youtubeUrl != undefined && this.props.navigation.state.params.youtubeUrl != null &&
            this.props.navigation.state.params.youtubeUrl != '') {
            this.setState({
                youtubeUrl: undefined,
                selected_item: this.props.navigation.state.params.item,
                audioUrl: this.props.navigation.state.params.audioUrl,
                isError: false,
            }, () => {
                this.extractorYoutubeURL(this.props.navigation.state.params.youtubeUrl)
            })
        } else {
            this.setState({
                isError: true,
            })
        }
        Orientation.lockToPortrait();

        this.getAccessToken()
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        Orientation.lockToPortrait();
    }

    getAccessToken() {
        // try {
        console.log('getting access token ')
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                console.log('access token received')
                self.setState({
                    access_token: value.slice(1, -1),
                }, () => {
                    console.log("PLAYER ACCESS TOKEN -- " + self.state.access_token);
                })

            } else {
                showNativeAlert('Not logged-In')
            }
        })
    }

    callExtractionLogApi = (accessToken, errSucess, type, updatedYoutubeURL) => {

        AsyncStorage.getItem('LOGIN_USER_NAME').then(value => {

            if (value != undefined) {
                let loginData = JSON.parse(value)

                let deviceName = '';
                let successData = '';
                let errorData = '';
                try {

                    deviceName = `model_version:${DeviceInfo.getSystemVersion()},device_type:${Platform.OS == 'android' ? 'android' : 'ios'},
                brand_name:${DeviceInfo.getBrand()}, recorded_type:AUDIO`;

                    if (type == 'success') {
                        successData = `url:${errSucess.url}, mimeType:${errSucess.mimeType}, qualityLabel:${errSucess.qualityLabel}, bitrate:${errSucess.bitrate}, itag:${errSucess.itag},
                    width:${errSucess.width}, height:${errSucess.height}, container:${errSucess.container}, quality:${errSucess.quality}`;
                    }

                    if (type == 'error') {
                        errorData = `line:${errSucess.line}, column:${errSucess.column}, sourceURL:${errSucess.sourceURL}, platform:${errSucess.platform}, dev:${errSucess.dev},
                    minify:${errSucess.minify}`;
                    }
                } catch (error) {

                }

                const formData = new FormData();
                formData.append('access_token', accessToken);
                //formData.append('user_id', );
                formData.append('device_name', deviceName);
                formData.append('username', loginData.data.USER_NAME);
                //formData.append('username', 'Puneet');
                //formData.append('video_id', '');
                formData.append('video_url', updatedYoutubeURL);
                formData.append('os', DeviceInfo.getSystemVersion());
                formData.append('type', 2);
                formData.append('success', successData);
                formData.append('error', errorData);
                // formData.append('success', (type == 'success' ? errSucess : ''));
                // formData.append('error', (type == 'error' ? 'test' : ''));
                console.log('EXTACTION_LOG_REQUEST' + JSON.stringify(formData))

                fetch(CONSTANTS.BASE + CONSTANTS.POST_EXTRACTION_LOG, {
                    method: 'post',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'multipart/form-data',
                    },
                    body: formData,
                }).then((response) => response.json())
                    .then((responseJson) => {
                        console.log('extraction log response')
                        console.log('ENTER_EXTRCTOIN' + JSON.stringify(responseJson))
                        if (responseJson.code == 201) {

                        } else {
                            //work here
                        }
                    })
                    .catch((error) => {
                        console.warn('ERROR_EXTRACION' + JSON.stringify(error));
                        //showNativeAlert("Network request failed")
                    });

            }
        })
    }


    extractorYoutubeURL = async (youtubeUrl, videoQuality) => {
        // let selected_item = {
        //     URL: '',
        //     URL2: '',
        //     VIMEO_URL: null,
        //     TMP_AUDIO_URL: 'https://ifas-video.s3.ap-south-1.amazonaws.com/LIFE+SCIENCE+JAN+2020/UNIT+TEST/UNIT+TEST+-+5+PAPER+DISCUSSION+.mp4'}
        const { selected_item } = this.state;
        console.warn('Format found! url' + JSON.stringify(selected_item));
        let qualityForVideo = 140;

        if (selected_item != undefined && selected_item != null &&
            selected_item != '') {
            // Check URL empty
            if (selected_item.URL != null && selected_item.URL != '') {
                 ytdl.getInfo(selected_item.URL).then((info) => {
                    // First URL extract1
                    if (info != undefined && info.formats != undefined) {
                        let format = ytdl.chooseFormat(info.formats, { quality: '140' });
                        console.warn('Format found!1', format);
                        if (format != undefined && format.url != undefined) {
                            this.setState({
                                youtubeUrl: format.url,
                                isError: false,
                            }, () => {
                                this.callExtractionLogApi(this.state.access_token, format, 'success', selected_item.URL)
                            })
                        } else if (selected_item.URL2 != null && selected_item.URL2 != '') {
                             ytdl.getInfo(selected_item.URL2).then((info) => {
                                // First URL extract2
                                if (info != undefined && info.formats != undefined) {
                                    let format = ytdl.chooseFormat(info.formats, { quality: '140' });
                                    console.warn('Format found!10', format);
                                    if (format != undefined && format.url != undefined) {
                                        this.setState({
                                            youtubeUrl: format.url,
                                            isError: false,
                                        }, () => {
                                            this.callExtractionLogApi(this.state.access_token, format, 'success', selected_item.URL2)
                                        })
                                    } else if (selected_item != undefined && selected_item.TMP_AUDIO_URL != '' &&
                                        selected_item.TMP_AUDIO_URL != null) {
                                        this.callExtractionLogApi(this.state.access_token, format, 'error', selected_item.URL2)
                                        console.warn('Format found! 12', format);
                                        this.setState({
                                            youtubeUrl: selected_item.TMP_AUDIO_URL,
                                            isError: false,
                                        })
                                    } else {
                                        if (!selected_item.URL.includes('https://www.youtube.com/')) {
                                            console.warn('Format found! 13');
                                            this.setState({
                                                youtubeUrl: selected_item.URL,
                                                isError: false,
                                            })
                                        } else {
                                            console.warn('Format found! 14');
                                            this.setState({
                                                isError: true,
                                                youtubeUrl: undefined,
                                                errorMessage: 'No audio available. Please contact to admin for more details.'
                                            })
                                        }
                                    }
                                }
                            })
                        } else {
                            console.warn('Format found! error 11', format);
                            this.setState({
                                isError: true,
                                youtubeUrl: undefined,
                                errorMessage: 'No audio available. Please contact to admin for more details.'
                            }, () => {
                                this.callExtractionLogApi(this.state.access_token, format, 'error', selected_item.URL)
                            })
                        }
                    }
                })
            } else if (selected_item.URL2 != null && selected_item.URL2 != '') {
                 ytdl.getInfo(selected_item.URL2).then((info) => {
                    // Second URL extract
                    if (info != undefined && info.formats != undefined) {
                        let format = ytdl.chooseFormat(info.formats, { quality: '140' });
                        console.warn('Format found!20', format);
                        if (format != undefined && format.url != undefined) {
                            this.setState({
                                youtubeUrl: format.url,
                                isError: false,
                            }, () => {
                                this.callExtractionLogApi(this.state.access_token, format, 'success', selected_item.URL2)
                            })
                        } else if (selected_item != undefined && selected_item.TMP_AUDIO_URL != '' &&
                            selected_item.TMP_AUDIO_URL != null) {
                                this.callExtractionLogApi(this.state.access_token, format, 'error', selected_item.URL2)
                            console.warn('Format found! 22', format);
                            this.setState({
                                youtubeUrl: selected_item.TMP_AUDIO_URL,
                                isError: false,
                            })
                        } else {
                            if (!selected_item.URL.includes('https://www.youtube.com/')) {
                                console.warn('Format found! 23');
                                this.setState({
                                    youtubeUrl: selected_item.URL,
                                    isError: false,
                                })
                            } else {
                                console.warn('Format found! 24');
                                this.setState({
                                    isError: true,
                                    youtubeUrl: undefined,
                                    errorMessage: 'No audio available. Please contact to admin for more details.'
                                })
                            }
                        }
                    }
                })
            }else if (global.isVimeoPlayerVisible &&
                selected_item != undefined && selected_item.VIMEO_URL != '' &&
                selected_item.VIMEO_URL != null) {
                //check condition vimeo is visible or not
                console.warn('Format found! 31');
                isVideoRecordingVemio = true
                this.setState({
                    isVimeoURLVisible: true,
                    vimeoVideoIDForPlay: selected_item.VIMEO_URL,
                    isError: false,
                })
            } else if (selected_item != undefined && selected_item.TMP_AUDIO_URL != '' &&
                selected_item.TMP_AUDIO_URL != null) {
                console.warn('Format found! 32');
                this.setState({
                    youtubeUrl: selected_item.TMP_AUDIO_URL,
                    isError: false,
                })
            } else {
                if (!selected_item.URL.includes('https://www.youtube.com/')) {
                    console.warn('Format found! 33');
                    this.setState({
                        youtubeUrl: selected_item.URL,
                        isError: false,
                    })
                } else {
                    console.warn('Format found! 34');
                    this.setState({
                        isError: true,
                        youtubeUrl: undefined,
                        errorMessage: 'No audio available. Please contact to admin for more details.'
                    })
                }
            }
        }
    }

    handleBackButtonClick = () => {
        this.props.navigation.goBack();
        return true;
    }
    _onLayout = event => {
        const { width, height } = event.nativeEvent.layout;
        if (width > height) {
            this.setState({ resizeMode: 'stretch' });
        } else {
            this.setState({ resizeMode: 'contain' });
        }
    }


    _onWillFocus() {
        Orientation.lockToPortrait();
    }

    _onWillBlurr() {
        Orientation.lockToPortrait();
    }

    onLoad = (data) => {
        // alert('On load fired!')
        console.log('On load fired!');
        if (Platform.OS == 'android') {
            if (this.state.isAudioLoading == true) {
                this.setState({
                    isAudioLoading: false
                });
            }
        }else{
            if (this.state.isAudioLoading == true) {
                this.setState({
                    isAudioLoading: false
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

    onLoadStart = (data) => {
        console.log('On load fired!');
        if (Platform.OS == 'android') {
            this.setState({ isAudioLoading: true });
        } else {
            this.setState({ isAudioLoading: true });
        }
    }

    onFullscreenPlayerWillPresent = (event) => {
        console.log(event)
    }

    _onPressButton = (item) => {
        let previousFrameRateArray = this.state.frameRateArray;
        previousFrameRateArray.forEach(element => {
            if (item.id == element.id) {
                element.is_selected = true
            } else {
                element.is_selected = false
            }
        });
        this.setState({
            frameRateDefault: item.time,
            isSpeedSelect: false,
            frameRateArray: [...previousFrameRateArray]
        }, () => {
            Toast.showSuccess(item.time + 'X')
        });
    }

    // extractorYoutubeURL = (youtubeUrl) => {

    //     console.warn('Format found! url' + JSON.stringify(youtubeUrl));

    //     ytdl.getInfo(youtubeUrl, {}, (err, info) => {
    //         console.log('format error' + JSON.stringify(err) + '\n\n' + JSON.stringify(info));
    //         if (info != undefined && info.formats != undefined) {
    //             //101 audio 140
    //             let format = ytdl.chooseFormat(info.formats, { quality: '140' });
    //             console.warn('Format found!' + JSON.stringify(format));
    //             if (format != undefined && format.url != undefined) {

    //                 this.setState({
    //                     youtubeUrl: format.url,
    //                     isAudioLoading: false,
    //                     isError: false,
    //                 })
    //             }
    //             else {
    //                 let format = ytdl.chooseFormat(info.formats, { quality: '139' });
    //                 console.warn('Format found Again18!' + JSON.stringify(format));
    //                 if (format != undefined && format.url != undefined) {

    //                     this.setState({
    //                         youtubeUrl: format.url,
    //                         isAudioLoading: false,
    //                         isError: false,
    //                     })
    //                 } else {
    //                     this.setState({
    //                         isAudioLoading: false,
    //                         isError: false,
    //                     }, () => {
    //                         this.setState({
    //                             youtubeUrl: this.state.audioUrl
    //                         })
    //                     })
    //                 }
    //             }
    //         } else {
    //             this.setState({
    //                 isAudioLoading: false,
    //                 isError: false,
    //             }, () => {
    //                 this.setState({
    //                     youtubeUrl: this.state.audioUrl
    //                 })
    //             })
    //         }
    //     });
    // }

    render() {
        if (this.state.isRecording) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>

                    <NavigationEvents
                        onWillFocus={payload => this._onWillFocus()}
                        onWillBlur={payload => this._onWillBlurr()}
                    />
                    <ActivityIndicator />

                    <Text style={{ top: 10, fontSize: (dimensions.sizeRatio * 15), textAlignVertical: "center", color: colors.black, fontFamily: CONSTANTS.DEMI }}>
                        ⚠️ Audio Recording not allowed!! ⚠️
                    </Text>
                </View>
            )
        }
        if (this.state.isError) {
            return (

                <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10 }}>
                    <NavigationEvents
                        onWillFocus={payload => this._onWillFocus()}
                        onWillBlur={payload => this._onWillBlurr()}
                    />
                    <Text style={{ fontSize: dimensions.sizeRatio * 16, fontFamily: CONSTANTS.DEMI }}>
                        {this.state.errorMessage}
                    </Text>
                </View>
            )
        } else {

            if (Platform.OS == 'android') {
                return (<View style={{ backgroundColor: 'black', flex: 1 }}>

                    <NavigationEvents
                        onWillFocus={payload => this._onWillFocus()}
                        onWillBlur={payload => this._onWillBlurr()}
                    />

                    {/* {
                        this.state.isAudioLoading == true ?
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                                <ActivityIndicator />
                                <Text style={{
                                    top: 10, fontSize: (dimensions.sizeRatio * 14),
                                    textAlignVertical: "center", color: colors.white,
                                    fontFamily: CONSTANTS.DEMI
                                }}>buffering audio...</Text>
                            </View> : null
                    } */}
                    {this.state.youtubeUrl != undefined &&
                        <AndroidPlayer
                            url={this.state.youtubeUrl}
                            rate={this.state.frameRateDefault}
                            poster={'https://media.giphy.com/media/XMaB779YCmP9m/giphy.gif'}
                            buffingName={'audio'}
                        //poster={require('../images/audio_player.jpg')}
                        //selectedVideoTrack={{ type: "resolution", value: 144 }}
                        />
                    }
                    <View
                        style={{
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            position: 'absolute',
                            top: 0,
                            //center: 0,
                            backgroundColor: colors._transparent,
                        }}>
                        {this.state.isSpeedSelect &&
                            <FlatList
                                style={{
                                }}
                                contentContainerStyle={{
                                    flexGrow: 1,
                                    justifyContent: 'flex-end',
                                }}
                                horizontal
                                data={this.state.frameRateArray}
                                keyExtractor={(item, index) => item}
                                renderItem={({ item, index }) => this.renderItemFrameRate(item, index)}
                            />}
                        <TouchableOpacity
                            onPress={() => {
                                this.setState({
                                    isSpeedSelect: !this.state.isSpeedSelect
                                })
                            }}
                            style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 2,
                                borderRadius: 25,
                                width: 44,
                                height: 44,
                                marginRight: 3,
                                marginTop: 3,
                                marginLeft: 10,
                                backgroundColor: colors.theme,
                            }}>
                            <Text style={{
                                fontSize: (dimensions.sizeRatio * 12),
                                textAlignVertical: "center",
                                color: colors.white,
                                fontWeight: 'bold',
                                fontFamily: CONSTANTS.MEDIUM
                            }}>SPEED</Text>
                        </TouchableOpacity>
                    </View>
                </View>)
            } else {
                return (
                    <View style={{ backgroundColor: 'black', flex: 1 }}>

                        <NavigationEvents
                            onWillFocus={payload => this._onWillFocus()}
                            onWillBlur={payload => this._onWillBlurr()}
                        />
                        {this.state.youtubeUrl != undefined &&
                            <Video
                                onLayout={this._onLayout}
                                //source={{ uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' }}   // Can be a URL or a local file.
                                source={{ uri: this.state.youtubeUrl }}   // Can be a URL or a local file.
                                controls={true}
                                //fullscreen={this.state.fullScreeen}
                                resizeMode="contain"
                                onLoadStart={this.onLoadStart}
                                onLoad={this.onLoad}
                                style={{ flex: 1 }}

                                ref={(ref) => {
                                    this.player = ref
                                }}
                                //audioOnly={true}                                      // Store reference
                                onBuffer={this.onBuffer}                // Callback when remote audio is buffering
                                onError={this.videoError}
                                rate={this.state.frameRateDefault}
                                //poster={'https://homepages.cae.wisc.edu/~ece533/images/boat.png'}
                                playInBackground={true}
                                playWhenInactive={true}
                                bufferConfig={{
                                    minBufferMs: 15000,
                                    maxBufferMs: 50000,
                                    bufferForPlaybackMs: 2500,
                                    bufferForPlaybackAfterRebufferMs: 5000
                                  }}
                            />
                        }
                        <View
                            style={{
                                width: '85%',
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                                alignSelf: 'flex-end',
                                alignItems: 'center',
                                position: 'absolute',
                                backgroundColor: colors._transparent,
                            }}>
                            {this.state.isSpeedSelect &&
                                <FlatList
                                    style={{
                                    }}
                                    contentContainerStyle={{
                                        flexGrow: 1,
                                        justifyContent: 'flex-end',
                                    }}
                                    horizontal
                                    data={this.state.frameRateArray}
                                    keyExtractor={(item, index) => item}
                                    renderItem={({ item, index }) => this.renderItemFrameRate(item, index)}
                                />}
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({
                                        isSpeedSelect: !this.state.isSpeedSelect
                                    })
                                }}
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 2,
                                    borderRadius: 25,
                                    width: 44,
                                    height: 44,
                                    marginLeft: 10,
                                    marginRight: 3,
                                    marginTop: 3,
                                    backgroundColor: colors.theme,
                                }}>
                                <Text style={{
                                    fontSize: (dimensions.sizeRatio * 10),
                                    textAlignVertical: "center",
                                    textAlign: 'justify',
                                    marginTop: 3,
                                    color: colors.white,
                                    fontWeight: 'bold',
                                    fontFamily: CONSTANTS.MEDIUM
                                }}>SPEED</Text>
                            </TouchableOpacity>
                        </View>
                        {
                            this.state.isAudioLoading == true ?
                                <View style={{
                                    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, position: 'absolute', alignItems: 'center',
                                    left: 0, right: 0, bottom: 0, top: 0
                                }}>
                                    <ActivityIndicator />
                                    <Text style={{
                                        top: 10, fontSize: (dimensions.sizeRatio * 14),
                                        textAlignVertical: "center", color: colors.white,
                                        fontFamily: CONSTANTS.DEMI
                                    }}>buffering audio...</Text>
                                </View> : null
                        }
                    </View>
                )
            }
        }
    }

    renderItemFrameRate = (item, index) => {
        return (
            <TouchableOpacity
                onPress={() => {
                    this._onPressButton(item)
                }}
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 2,
                    borderRadius: 15,
                    marginLeft: 5,
                    marginRight: Platform.OS === 'ios' ? index == 4 ? 1 : 0 : 0,
                    width: 33,
                    height: 33,
                    backgroundColor: item.is_selected ? colors.white : colors.theme
                }}>
                <Text style={{
                    fontSize: (dimensions.sizeRatio * 12),
                    color: item.is_selected ? colors.theme : colors.white,
                    marginTop: Platform.OS == 'ios' ? 3 : 0,
                    textAlign: 'center',
                    alignSelf: 'center',
                    fontFamily: CONSTANTS.MEDIUM,
                }}>{item.time}</Text>
            </TouchableOpacity>
        )
    }
}



// extractorYoutubeURL = (youtubeUrl) => {

//     this.setState({
//         isError: true,
//         errorMessage: 'Please wait...'
//     })

//     console.warn('Format found! url' + JSON.stringify(youtubeUrl));

//     ytdl.getInfo(youtubeUrl, {}, (err, info) => {

//         console.log('format error' + JSON.stringify(err) + '\n\n' + JSON.stringify(info));

//         if (info != undefined && info.formats != undefined) {
//             let format = ytdl.chooseFormat(info.formats, { quality: '140' });
//             console.warn('Format found1' + JSON.stringify(format));
//             if (format != undefined && format.url != undefined) {

//                 this.setState({
//                     youtubeUrl: format.url,
//                     isError: false,
//                 })
//             }
//             else {
//                 console.warn('Format found2' + JSON.stringify(format));
//                 if (this.state.selected_item != undefined && this.state.selected_item.TMP_AUDIO_URL != '' &&
//                     this.state.selected_item.TMP_AUDIO_URL != null) {
//                     console.warn('Format found! audio else3');
//                     this.setState({
//                         youtubeUrl: this.state.selected_item.TMP_AUDIO_URL,
//                         isError: false,
//                     })
//                 } else {
//                     console.warn('Format found! audio else4');
//                     //Check here main url is youtube or not
//                     if (!youtubeUrl.includes('https://www.youtube.com/')) {
//                         console.warn('Format found! audio else5');
//                         this.setState({
//                             youtubeUrl: youtubeUrl,
//                             isError: false,
//                         })
//                     } else {
//                         console.warn('Format found! audio else6');
//                         this.setState({
//                             isError: true,
//                             youtubeUrl: undefined,
//                             errorMessage: 'No audio available. Please contact to admin for more details.'
//                         })
//                     }
//                 }
//             }
//         } else {
//             console.warn('Format found! audio else7');
//             if (this.state.selected_item != undefined && this.state.selected_item.TMP_AUDIO_URL != '' &&
//                 this.state.selected_item.TMP_AUDIO_URL != null) {
//                 console.warn('Format found! audio else8');
//                 this.setState({
//                     youtubeUrl: this.state.selected_item.TMP_AUDIO_URL,
//                     isError: false,
//                 })
//             } else {
//                 console.warn('Format found! audio else9');
//                 //Check here main url is youtube or not
//                 if (!youtubeUrl.includes('https://www.youtube.com/')) {
//                     console.warn('Format found! audio else10');
//                     this.setState({
//                         youtubeUrl: youtubeUrl,
//                         isError: false,
//                     })
//                 } else {
//                     console.warn('Format found! audio else11');
//                     this.setState({
//                         isError: true,
//                         youtubeUrl: undefined,
//                         errorMessage: 'No audio available. Please contact to admin for more details.'
//                     })
//                 }
//             }
//         }
//     });
// }



// {
    //import FastImage from 'react-native-fast-image'
//     <View
//         style={{
//             width: '100%',
//             height: dimensions.height / 3,
//             marginTop: dimensions.height / 3,
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             bottom: 0,
//             right: 0,
//             //marginTop: Orientation.getInitialOrientation() === 'PORTRAIT' ? dimensions.height/3 : 100
//         }}>
//         <FastImage
//             style={{
//                 width: '100%',
//                 height: dimensions.height / 3,
//             }}
//             source={{
//                 uri: 'https://media.giphy.com/media/fVGq42k85nDs4/giphy.gif',
//                 headers: { Authorization: 'someAuthToken' },
//                 priority: FastImage.priority.normal,
//             }}
//             resizeMode={FastImage.resizeMode.contain}
//         />
//     </View>
// }