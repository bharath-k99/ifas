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

export default class DownloadedAudioPlayer extends React.Component {

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
            youtubeUrl: undefined,
            isGifVisible: false,
            errorMessage: 'Failed to load the audio.',
            resizeMode: 'contain',
            isError: false,
            isRecording: false,
            isAudioLoading: false,
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
                youtubeUrl: this.props.navigation.state.params.youtubeUrl,
                isLoading: true,
                isError: false,
            })
        } else {
            this.setState({
                isError: true,
            })
        }
        Orientation.lockToPortrait();

    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
        Orientation.lockToPortrait();
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

    onLoad(data) {
        // alert('On load fired!')
        console.log('On load fired!');
        if (Platform.OS == 'android') {
        if (this.state.isAudioLoading == true) {
            this.setState({
                isAudioLoading: false,
                isGifVisible: true
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

    onLoadStart(data) {
        console.log('On load fired!');
        if (Platform.OS == 'android') {
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
                <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
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
                                source={{ uri: this.state.youtubeUrl }}   // Can be a URL or a local file.
                                controls={true}
                                fullscreen={this.state.fullScreeen}
                                //resizeMode="contain"
                                onLoadStart={this.onLoadStart}
                                onLoad={this.onLoad}
                                style={{ flex: 1 }}

                                ref={(ref) => {
                                    this.player = ref
                                }}                                      // Store reference
                                onBuffer={this.onBuffer}                // Callback when remote video is buffering
                                onError={this.videoError}
                                rate={this.state.frameRateDefault}
                                playInBackground={true}
                                playWhenInactive={true}
                                //poster={'https://homepages.cae.wisc.edu/~ece533/images/boat.png'}
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
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
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