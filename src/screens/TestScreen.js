
import React, { Component } from 'react';
// Bellow Components are using for make design and functionality
import {
    Platform, AsyncStorage, Text, Button, View, Image,
    TouchableOpacity, TextInput, Alert, ActivityIndicator, StatusBar,
    NativeEventEmitter, NativeModules, FlatList, Keyboard, Dimensions,
    ScrollView
} from 'react-native';
import colors from '../resources/colors';
import CONSTANTS from '../resources/constants';
import dimensions from '../resources/dimension';
import Orientation from 'react-native-orientation';
import { PermissionsAndroid } from 'react-native';
import { NavigationEvents } from 'react-navigation';
import { EventRegister } from 'react-native-event-listeners';
import { showNativeAlert } from '../resources/app_utility';

import WebView from 'react-native-webview'

export default class TestScreen extends Component {

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
                            width: Platform.OS == 'android' ? dimensions.sizeRatio * 30 : dimensions.sizeRatio * 20,
                            height: Platform.OS == 'android' ? dimensions.sizeRatio * 20 : dimensions.sizeRatio * 20,
                            //marginTop: Platform.OS == 'android' ? 0 : dimensions.sizeRatio * 5,
                            tintColor: colors.white,
                            alignSelf: 'center'
                            //padding: 5
                        }}
                        resizeMode={Platform.OS == 'android' ? 'contain' : 'contain'}
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
            userId: undefined,
            access_token: undefined,
        }
    }

    methodGoBack() {
        this.props.navigation.goBack()
        return true
    }

    componentDidMount() {

    }
    componentWillUnmount() {
    }



    render() {
        return (
            <View style={{
                flex: 1,
                width: '100%'
            }}>
                <WebView
                    style={{ flex: 1 }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    source={{ uri: 'https://www.youtube.com/watch?v=8zlpXoEqp7I?rel=0&autoplay=0&showinfo=0&controls=0' }}
                />
            </View>
        )
    }
}