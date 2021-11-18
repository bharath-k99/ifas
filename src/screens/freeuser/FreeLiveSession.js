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
import { StackActions, NavigationActions, NavigationEvents } from 'react-navigation';
import Ripple from 'react-native-material-ripple';

import WebView from 'react-native-webview'
import BackButton from 'react-native-vector-icons/MaterialIcons';
const backButton = <BackButton name="arrow-back" size={28} color={colors.white} />;

export default class FreeLiveSession extends Component {

    constructor(props) {
        super(props);
        this.state = {
            userId: undefined,
            access_token: undefined,
            youtubeURL: '',
            isLoading: false
        }
    }

    componentDidMount() {
        let previousYoutubeURL = this.props.navigation.state.params.youtubeUrl.url + '?rel=0&autoplay=0&showinfo=0&controls=0';
        this.setState({
            youtubeURL: previousYoutubeURL
        })
    }
    componentWillUnmount() {
    }

    handleBackButtonClick = () => {
        //global.isChatLiveSessionVisible = true;
        this.props.navigation.goBack();
        return true;
    }
    render() {
        return (
            <View style={{
                flex: 1,
                width: '100%'
            }}>
                {/* Header view */}
                {this.renderHeader()}
                <WebView
                    style={{ flex: 1 }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    source={{ uri: this.state.youtubeURL }}
                    onLoadStart={() => {
                        this.setState({
                            isLoading: true
                        })
                    }}
                    onLoadEnd={() => {
                        this.setState({
                            isLoading: false
                        })
                    }}
                />
                {this.state.isLoading &&
                    <View style={{
                        flex: 1,
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: 20,
                        backgroundColor: colors.white
                    }}>
                        <ActivityIndicator />
                        <Text style={{ top: 10, fontSize: (dimensions.sizeRatio * 20), textAlignVertical: "center", color: colors.black, fontFamily: CONSTANTS.DEMI }}>
                            Loading session...
                 </Text>
                    </View>
                }
            </View>
        )
    }

    renderHeader = () => {
        return (
            <View
                style={{
                    width: '100%',
                    height: 55,
                    backgroundColor: colors.theme,
                    paddingHorizontal: 10,
                    alignItems: 'center',
                    flexDirection: 'row'
                }}>
                <Ripple
                    onPress={() => {
                        this.handleBackButtonClick()
                    }}>
                    {backButton}
                </Ripple>
                <Text style={{ fontSize: 18, fontFamily: CONSTANTS.DEMI, color: colors.white, textAlign: 'left', marginLeft: 15,  marginTop:5 }}>
                    {'Free Session'}
                </Text>
            </View>
        )
    }
}