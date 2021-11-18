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
    Image, TouchableOpacity, FlatList, Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import styles from '../styles/subject_style.js';
import CONSTANTS from '../resources/constants.js'
import renderIf from '../resources/utility.js';
import ProfileHeaderButton from '../headers/ProfileHeaderButton'
import BackSubjectsButton from '../headers/BackSubjectsButton'
import { showNativeAlert } from '../resources/app_utility.js'
import { NavigationEvents } from 'react-navigation';
import ImageViewer from 'react-native-image-zoom-viewer';
export default class FullPreview extends Component {

    static navigationOptions = {

        headerBackTitle: '',
        title: '',
        gesturesEnabled: false,
        headerTransparent: true,
        headerTintColor: 'white',

    };

    render() {
        let userImage = this.props.navigation.state.params;
        return (
            <View style={{ flex: 1 }} >
               
                <ImageViewer imageUrls={[{
                    url: userImage,
                }]} />
            </View>
        )
    }
}



