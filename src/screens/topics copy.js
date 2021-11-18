/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Platform, AsyncStorage, Text, Button, View, Image, TouchableOpacity, FlatList, NativeModules, Alert, ActivityIndicator, Linking, PermissionsAndroid } from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import styles from '../styles/subject_style.js';
import ProfileHeaderButton from '../headers/ProfileHeaderButton'
import BackTopicsButton from '../headers/BackTopicsButton'
import CONSTANTS from '../resources/constants';
//import ExpandableList from 'react-native-expandable-section-list';
import ExpandableList from 'react-native-expandable-section-flatlist';
import {openSettingsPage } from '../resources/utility.js';

import MockData from '../MockData/mockdata'
import { showNativeAlert } from '../resources/app_utility.js'

// import { escape, unescape } from 'querystring';


const GetYouTubeUrliOS = NativeModules.GetLocalYoutubeLink;
const GetYouTubeUrlAndroid = NativeModules.MyNativeModule;

export default class topics extends Component {

    //Navigation Method
    static navigationOptions = (navigation) => {
        return ({
            title: 'Topics',
            headerStyle: { backgroundColor: colors.theme },
            headerTitleStyle: { color: colors.white, textAlign: 'center', flex: 1 },
            headerBackTitle: null,

            // headerLeft: <BackTopicsButton />,
            headerTintColor: 'white',
            headerRight: <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity hitSlop={{ top: 20, bottom: 20, left: 30, right: 30 }} onPress={() => navigation.navigation.state.params.showProfile()}>
                    <Image
                        source={require('../images/profile_small.png')}
                        style={{ width: dimensions.sizeRatio * 15, height: dimensions.sizeRatio * 17, marginRight: dimensions.sizeRatio * 20 }}
                    />
                </TouchableOpacity>
            </View>,
            gesturesEnabled: false,

        })
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            access_token: '',
            subjectName: '',
            subjectId: this.props.navigation.state.params.subjectId,
            subjectName: this.props.navigation.state.params.subjectName,
            dataSource: [],
            isError: false,
            errorMessage: 'No topics available for the selected subject.'
        };
        this.methodGoToVideoPlayer = this.methodGoToVideoPlayer.bind(this)
        // Alert.alert(this.state.subjectId)
    }

    getAccessToken() {
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                self.setState({
                    access_token: value.slice(1, -1),
                }, () => { self.getTopics() })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }


    _openSettings() {
        this._openAlertView('IFAS', 'Please enable the permission from your device setting to access contact list')
    }

    _openAlertView(title, message) {
        Alert.alert(title, message, [
            { text: 'Open Settings', onPress: () => this._openSettingsPage() }, {
                text: 'Cancel', onPress: () =>
                    this.setState({ isfetchingContact: false, isRefreshFetching: false, isEmptyData: this.state.contactArr == null })
            },
        ])
    }

    _openSettingsPage() {
        openSettingsPage()
    }

    getTopics() {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('subject_id', this.state.subjectId);
        console.log(formData)

        fetch(CONSTANTS.BASE + CONSTANTS.POST_TOPICS, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                //   Alert.alert(responseJson.message)
                console.log(responseJson)

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else if (responseJson.code == 1) {
                    this.setState({
                        isLoading: false,
                        dataSource: responseJson.data.Topics,
                        isError: false,
                    }, function () {

                    });
                }


            })
            .catch((error) => {
                console.error(error);
                this.setState({
                    dataSource: [],
                    isLoading: false,
                    isError: true,
                    errorMessage: 'Failed to load topics.'
                })
            });
    }

    showProfile() {
        this.props.navigation.navigate('Profile')
    }


    logoutUser() {
        showNativeAlert(CONSTANTS.LOGOUT_MESSAGE)
        CONSTANTS.IS_LOGGED_IN = false
        this.props.navigation.popToTop()
    }

    makeLocalUrl(videoUrl, topicId, title) {
        console.log('in function')
        const getVideoLocalUrl = async () => {
            try {
                if (Platform.OS == 'ios') {
                    let urlData = await GetYouTubeUrliOS.getLocalYoutubeUrl('get_video_info')
                    this.processUrl(urlData, topicId, title,this)
                }
                else {
                    var that = this
                    //setTimeout(function(){ 
                    this._requestAndroidPermission(function (status) {
                        console.log('The status is: ', status);
                        NativeModules.MyNative.getVideoInfo(
                            videoUrl,
                            (urlData) => {
                                console.log('urlData', urlData);
                                that.processUrl(urlData, topicId, title, that)
                            }
                        );
                        // NativeModules.OpenSettings.openSettings(urlData => {
                        //     console.log('call back data', urlData);
                        //     that.processUrl(urlData, topicId, title, that)
                        // });
                        // let urlData = await NativeModules.MyNative.getVideoInfo(videoUrl)
                        // that.processUrl(urlData, topicId, title,that)
                        
                    }, function (error) {
                            console.log('There was an error in getting permission');
                            if (error == PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                                that._openSettings()
                            }
                    });
                }               
            } catch (e) {
                console.log(e);
            }
        }
        getVideoLocalUrl()

    }
    
    async _requestAndroidPermission(onSuccess, onFail) {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
                'title': 'IFAS',
                'message': 'IFAS needs permission to read and write the device storage.'
            }
        ).then((granted) => {
            //PermissionStatus = "granted" | "denied" | "never_ask_again";
            if (granted === true || granted === PermissionsAndroid.RESULTS.GRANTED) {
                onSuccess(true);
                
            } else {
                onFail('error', granted)
            }
        })
    }
    processUrl(urlData, topicId,title,that) {
        var obj = JSON.parse(urlData);
        console.log('urldata', obj)
        if (obj[0] == null) {
            showNativeAlert('Something went wrong.')
        }
        else {
            console.log('json object', obj)
            console.log('zeroth object', obj[0].url)
            that.props.navigation.navigate('VideoPlayer', { youtubeUrl: obj[0].url, Headertitle: title, topicId: topicId })
        }
        this.setState({
            isLoading: false,
        })
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
    getVideoInfoFileApiCall(videoUrl) {
        this.getAPiHandler(videoUrl)
            .then(responseJson => {
                console.log('response', responseJson);
                // async function getVideoLocalUrl() {
                //     try {
                //       var urlData = await GetYouTubeUrliOS.getLocalYoutubeUrl('get_video_info')
                //       var obj = JSON.parse(urlData);
                //       console.log('urldata',obj)
                //     } catch (e) {
                //      console.log(e);
                //     }
                //   }
                //   getVideoLocalUrl()
            }).catch(err => {
                console.log(err)
            });
    }
    getAPiHandler(withurl) {
        // let paramsbody = JSON.stringify(serverCommunicator.params);

        console.log('apiurl', withurl);
        return fetch(withurl, { method: 'GET' })
            .then((response) => console.log('response is ; - ', response))
            .then((response) => console.log('response is ; - ', response.text()))
            .catch((error) => {
                console.error(error);
            });


        return

    }


    componentDidMount() {
        global.navigation = this.props.navigation

        this.props.navigation.setParams({ showProfile: this.showProfile.bind(this) });
        this.getAccessToken()
    }

    componentWillUnmount() {
        console.log("Unmounted Topics")
    }

    methodGoToVideoPlayer(url = '', title = 'VideoPlayer', topicId = 0) {
        console.log(url);
        this.setState({
            isLoading: true,
        })
        // if (Platform.OS == 'android') { 
        //     const rnClass = NativeModules.RNScreenDetector;
        //     rnClass.androidNativePlayer(url)
        // } else  { 
        // this.props.navigation.navigate('VideoPlayer', { youtubeUrl: url, Headertitle: title, topicId: topicId })
        var videoToken = ''
        let urlArray = url.split('/')
        var videoToken = urlArray[urlArray.length - 1];    
        if (videoToken == null){
            videoToken = urlArray[urlArray.length - 2];
        }
        console.log('videoToken', videoToken);
        var fixUrl = 'https://www.youtube.com/get_video_info?video_id=J61XNjDuIg8&el=embedded&ps=default&eurl=&gl=US&hl=en'
        var newUrl = `https://www.youtube.com/get_video_info?video_id=${videoToken}&el=embedded&ps=default&eurl=&gl=US&hl=en`
        console.log('new url', newUrl);
        this.makeLocalUrl(newUrl, topicId, title)

        // }

        // 
    }

    //START
    _renderRow = (rowItem, rowId, sectionId) => {
        return (
            <TouchableOpacity key={rowId} onPress={() => { this.methodGoToVideoPlayer(rowItem.URL, rowItem.TITLE, rowItem.ID) }}>
                <View
                    style={{
                        paddingVertical: dimensions.sizeRatio * 20,
                        marginHorizontal: dimensions.sizeRatio * 10,
                        justifyContent: 'space-between', backgroundColor: 'white',
                    }}
                >
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1, paddingLeft: dimensions.sizeRatio * 15 }}>
                            <Image source={require('../images/video_icon.png')} style={{ width: dimensions.sizeRatio * 20, height: dimensions.sizeRatio * 22 }} />
                        </View>
                        <View style={{ flex: 9, }}>
                            <Text style={{ fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 15, color: colors.night, paddingHorizontal: dimensions.sizeRatio * 5, fontFamily: CONSTANTS.DEMI, }}>
                                {rowItem.TITLE}
                            </Text>
                        </View>
                    </View>

                </View>
            </TouchableOpacity>
        )
    };

    _renderSection = (section, sectionId, state) => {
        return (
            <View
                style={{
                    marginVertical: dimensions.sizeRatio * 5, paddingVertical: 20,
                    marginHorizontal: dimensions.sizeRatio * 10,
                    justifyContent: 'space-between', backgroundColor: 'white',
                    borderRadius: dimensions.sizeRatio * 10,
                }}
            >
                <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 8.75 }}>
                        <Text style={Platform.OS == 'ios' ? styles.topic_name_ios : styles.topic_name_android}>
                            {section}
                        </Text>
                    </View>
                    <View style={{ flex: 1.25, alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={require('../images/right_caret.png')} style={styles.indicator_image} />
                    </View>
                </View>

            </View>
        );
    };

    _btnPress = () => {
        console.log(this.ExpandableList);
        this.ExpandableList.setSectionState(0, false);
    };
    //END




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

        if (this.state.dataSource.length == 0 && (this.state.isError == false || this.state.isError == true)) {
            return (
                <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: dimensions.sizeRatio * 16, fontFamily: CONSTANTS.DEMI }}>
                        {this.state.errorMessage}
                    </Text>
                </View>
            )
        }
        else {
            return (

                <View style={{ flex: 1, backgroundColor: colors.sessions_bgtheme }}>
                    <View style={{ height: dimensions.sizeRatio * 30, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ color: colors.lightblack, fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 11 }} >{this.state.subjectName}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                        <View style={{ flex: 1 }}>
                            <ExpandableList
                                ref={instance => this.ExpandableList = instance}
                                dataSource={this.state.dataSource}
                                headerKey="name"
                                memberKey="topic_videos"
                                renderRow={this._renderRow}
                                headerOnPress={(i, state) => console.log(i, state)}
                                renderSectionHeaderX={this._renderSection}
                                openOptions={[]}
                            />
                        </View>
                    </View>

                </View>


            );
        }


    }
}



