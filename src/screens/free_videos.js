/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, StatusBar, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator, NativeEventEmitter, NativeModules } from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import CONSTANTS from '../resources/constants';
import renderIf from '../resources/utility.js';
import { showNativeAlert } from '../resources/app_utility.js'

export default class free_videos extends Component {

    methodGoToLogin() {
        // Alert.alert('method GO Register')
        this.props.navigation.navigate('Login')
    }


    //Navigation Method
    static navigationOptions = {
        title: 'Free Videos',
        headerBackTitle: null,

        headerTitleStyle: {
            // fontWeight: '200',
            // color: '#2c38ff',
            textAlign: 'center',
            flex: 1,
        },

        headerTintColor: 'black',

        // headerLeft: <View />,
        gesturesEnabled: false,
        headerRight: <View />,
    };

    constructor(props) {
        super(props);
        this.state = {
            courseId: this.props.navigation.state.params.courseId,
            isLoading: true,
            isError: false,
            dataSource: [],
            hideLogin: this.props.navigation.state.params.hideLogin,
            isRecording: false,
        }
    }

    methodStreamVideo(url, item) {
        //console.warn('video url', url + 'ITEM'+JSON.stringify(item));
        // if (Platform.OS == 'android') {
        //     const rnClass = NativeModules.RNScreenDetector;
        //     rnClass.androidNativePlayer(url)
        // } else {
        //this.props.navigation.navigate('VideoPlayer', { youtubeUrl: url, Headertitle: Headertitle, topicId: topicId })
        this.props.navigation.navigate('VideoPlayerNew', { youtubeUrl: url, item: item })
        // }

    }
    componentDidMount() {
        global.navigation = this.props.navigation
        console.log('global.navigation in free', global.navigation)

        // Recording of
        if (Platform.OS == 'ios') {
            this.addListener()
        }
    }

    addListener = () => {
        console.warn('CAPTURE_SESSIONS')
        let bridge = new NativeEventEmitter(NativeModules.ScreenRecorderDetect);

        this.screenCaptureEnabled = bridge.addListener("isScreenCaptureEnabled", (res) => {
            console.warn('CAPTURE_SESSIONS1' + '\n\n' + JSON.stringify(res))
            if (res.value == true) {
                console.warn('CAPTURE_SESSIONS2' + '\n\n' + JSON.stringify(res) + '\n\n' + this.state.isRecording)
                this.setState({
                    isRecording: true
                })
            }
            else {
                this.setState({ isRecording: false }, () => {
                    console.warn('CAPTURE_SESSIONS3' + '\n\n' + JSON.stringify(res) + '\n\n' + this.state.isRecording)
                })
            }

        })
    }

    componentWillUnmount() {
        console.log("Unmounted free video")
        if (Platform.OS === "ios") {
            this.screenCaptureEnabled.remove()
        }
    }

    componentWillMount() {
        //LISTENER FOR FILTER BUTTON TAP  
        global.navigation = this.props.navigation
        console.log('global.navigation in free', global.navigation)

        fetch(CONSTANTS.BASE + CONSTANTS.POST_FREE_VIDEOS, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                course_id: this.state.courseId,
            }),
        }).then((response) => response.json())
            .then((responseJson) => {
                console.warn('free video response', responseJson)
                this.setState({
                    isLoading: false,
                    dataSource: responseJson.data.TopicVideos,
                    isError: false,
                }, function () {

                });
            })
            .catch((error) => {
                this.setState({
                    dataSource: [],
                    isLoading: false,
                    isError: true,
                })
            });
    }
    renderFlatList() {

        if (this.state.dataSource.length == 0 && this.state.isError == false) {
            return (
                <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: dimensions.sizeRatio * 14, fontFamily: CONSTANTS.DEMI, }}>
                        No Free videos available for the selected course.
                    </Text>
                </View>
            )
        } else if (this.state.dataSource.length == 0 && this.state.isError == true) {
            return (
                <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: dimensions.sizeRatio * 14, fontFamily: CONSTANTS.DEMI }}>
                        Failed to fetch free videos for the selected course.
                    </Text>
                </View>
            )
        } else {
            return (
                <View style={{ flex: 1, backgroundColor: colors.white }}>

                    <FlatList
                        data={this.state.dataSource}

                        renderItem={({ item }) =>
                            <TouchableOpacity onPress={() => this.methodStreamVideo(item.URL, item)} >
                                <View style={{ height: dimensions.sizeRatio * 190 }}>
                                    <Image source={{ uri: item.image }} style={{ width: dimensions.width, height: dimensions.sizeRatio * 125, resizeMode: 'cover' }} />
                                    <Text numberOfLines={1} style={{
                                        paddingTop: dimensions.sizeRatio * 10,
                                        color: colors.black,
                                        paddingLeft: dimensions.sizeRatio * 15,
                                        paddingRight: dimensions.sizeRatio * 15,
                                        fontSize: dimensions.sizeRatio * 14,
                                        height: dimensions.sizeRatio * 28,
                                        fontFamily: CONSTANTS.DEMI
                                    }}>
                                        {item.topic_name}
                                    </Text>
                                    <Text numberOfLines={1} style={{
                                        color: colors.lightblack,
                                        paddingLeft: dimensions.sizeRatio * 15,
                                        paddingRight: dimensions.sizeRatio * 15,
                                        fontSize: dimensions.sizeRatio * 11,
                                        height: dimensions.sizeRatio * 28
                                    }}>
                                        {item.title}
                                    </Text>
                                    <Text numberOfLines={1} style={{
                                        color: colors.black,
                                        backgroundColor: colors.freeVideosSeparator,
                                        paddingLeft: dimensions.sizeRatio * 15,
                                        paddingRight: dimensions.sizeRatio * 15,
                                        fontSize: dimensions.sizeRatio * 11,
                                        height: dimensions.sizeRatio * 10
                                    }}>
                                    </Text>
                                    {/* <View style={{height: dimensions.sizeRatio * 10, backgroundColor: colors.freeVideosSeparator}}> {item.key} </View> */}
                                </View>
                            </TouchableOpacity>
                        }
                        keyExtractor={(item, index) => this.keyExtractor(item)}

                    />
                </View>
            )
        }
    }

    keyExtractor = item => {
        return item.topic_id + new Date().getTime().toString() + (Math.floor(Math.random() * Math.floor(new Date().getTime()))).toString();
    };
    renderActivityIndicator() {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>

                <ActivityIndicator />
                <Text style={{ top: 10, fontSize: (dimensions.sizeRatio * 20), textAlignVertical: "center", color: colors.black, fontFamily: CONSTANTS.DEMI }}>
                    Please wait...
                    </Text>
            </View>
        )
    }

    renderBottomView() {
        return (
            <View style={{ height: ((dimensions.sizeRatio) * 100), flexDirection: 'row', backgroundColor: colors.theme }}>
                {/* Left Row */}
                <View style={{ flex: 1, backgroundColor: 'transparent', paddingLeft: (dimensions.sizeRatio * 15), paddingTop: (dimensions.sizeRatio * 30) }}>
                    <Text style={{ fontSize: (dimensions.sizeRatio * 20), textAlignVertical: "center", color: colors.white, fontFamily: CONSTANTS.DEMI, }}>
                        Welcome Back!
                </Text>
                    <Text style={{ fontSize: (dimensions.sizeRatio * 11), textAlignVertical: "center", color: colors.white, fontFamily: CONSTANTS.REGULAR }}>
                        There is a lot to learn
                </Text>
                </View>
                {/* Right Row */}
                <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: "center", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => this.methodGoToLogin()} style={{ height: dimensions.sizeRatio * 51, width: dimensions.sizeRatio * 145, backgroundColor: colors.white, borderRadius: dimensions.sizeRatio * 5 }}>
                        <Text style={Platform.OS == 'ios' ? styles.signin_text_ios : styles.signin_text_android}>SIGN IN</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    render() {
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
                <View style={{ flex: 1 }}>

                    {/* Activity View */}
                    {renderIf(this.state.isLoading,
                        this.renderActivityIndicator()
                    )}

                    {/* List View */}
                    {renderIf(this.state.isLoading == false,
                        this.renderFlatList()
                    )}

                    {/* Bottom View */}
                    {renderIf(this.state.hideLogin == false,
                        this.renderBottomView()
                    )}

                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },

    signin_text_ios: {
        color: colors.theme,
        fontSize: dimensions.sizeRatio * 15,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        paddingTop: dimensions.sizeRatio * 20,
        fontFamily: CONSTANTS.DEMI,
    },

    signin_text_android: {
        color: colors.theme,
        fontSize: dimensions.sizeRatio * 15,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        paddingTop: dimensions.sizeRatio * 16,
        fontFamily: CONSTANTS.DEMI,
    },

});
