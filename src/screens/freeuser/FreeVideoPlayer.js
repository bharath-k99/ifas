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
import Orientation from 'react-native-orientation';
import YouTube from 'react-native-youtube'

var seekingTime = 0;
export default class FreeVideoPlayer extends Component {

    //Navigation Method Remove Header in Android

    static navigationOptions = (navigation) => {
        const { state } = navigation;
        if (Platform.OS == 'android') {
            return {
                title: 'Live Streaming',
                header: null,
            }
        }
        return {
            title: 'Free Video',
            headerStyle: { backgroundColor: colors.theme },
            headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
            headerBackTitle: null,
            headerLeft: <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                    //hitSlop={{top: 20, bottom: 20, left: 30, right: 30}} 
                    onPress={() => {
                        navigation.navigation.state.params.methodGoBack()
                    }}
                    style={{
                        width: dimensions.sizeRatio * 35,
                        height: dimensions.sizeRatio * 25,
                        marginLeft: Platform.OS == 'android' ? dimensions.sizeRatio * 10 : dimensions.sizeRatio * 5,
                        zIndex: 1,
                        padding: dimensions.sizeRatio * 2,
                        marginBottom: Platform.OS == 'ios' ? dimensions.sizeRatio * 10 : 0,
                        justifyContent: 'center'
                    }}>
                    <Image
                        source={Platform.OS == 'ios' ? require('../../images/back.png') : require('../../images/back_two.png')}
                        style={{
                            width: Platform.OS == 'android' ? dimensions.sizeRatio * 30 : dimensions.sizeRatio * 25,
                            height: Platform.OS == 'android' ? dimensions.sizeRatio * 20 : dimensions.sizeRatio * 20,
                            marginTop: Platform.OS == 'android' ? 0 : dimensions.sizeRatio * 5,
                            tintColor: colors.white,
                            alignSelf: 'center'
                            //padding: 5
                        }}
                        resizeMode={'contain'}
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
            isLoading: false,
            access_token: '',
            isRecording: false,
            isRecording: '',
            youtubeUrl: '',
            //Previous screen name
            previousScreenName: this.props.navigation.state.params.screen_name,

            //is playing first time
            isPlayingFirstTime: false
        };
    }

    componentDidMount() {
        this.props.navigation.setParams({ methodGoBack: this.methodGoBack.bind(this) });
        if (Platform.OS == 'android')
            Orientation.unlockAllOrientations();

            this.setState({
                youtubeUrl: this.props.navigation.state.params.screen_name == 'FreeVideoList' ?
                 this.youtube_parser(this.props.navigation.state.params.selected_item.URL) :
                 this.props.navigation.state.params.screen_name == 'FreeSession001' ?
                 this.youtube_parser(this.props.navigation.state.params.selected_item.LY_URL) :
                 this.youtube_parser(this.props.navigation.state.params.selected_item.url)
            })
    }
    componentWillUnmount() {
        if (Platform.OS == 'android')
            Orientation.lockToPortrait();
    }

    youtube_parser(url) {
        var regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
        var match = url.match(regExp);
        if (match != null) {
            return match[1]
        } else {
            console.log("The youtube url is not valid.");
            return null;
        }
    }

    methodGoBack() {
        this.props.navigation.goBack()
        return true
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

                    <View style={{
                        flex: 1,
                        width: '100%',
                        justifyContent:'center',
                        alignItems:'center'
                    }}>
                        {this.state.youtubeUrl != '' &&
                            <YouTube
                                ref={component => {
                                    this._youTubeRef = component;
                                }}
                                apiKey="AIzaSyCZs5LGQYP8EL8uQvvpO6SA-cFZs8kHw30"
                                videoId={this.state.youtubeUrl}
                                play={true}
                                //fullscreen={false}
                                //loop={true}
                                //showinfo={false}
                                controls={1}
                                //resumePlayAndroid={true}
                                onError={e => console.log(e)}
                                style={{ flex:1, width:'100%',height:'100%', backgroundColor: 'black' }}
                                //style={{flex:1, width: '100%',backgroundColor: 'black' }}
                                //onChangeQuality={e => this.setState({ quality: e.quality })}
                            />
                        }
                    </View>
                </View>
            );
        }
    }
}