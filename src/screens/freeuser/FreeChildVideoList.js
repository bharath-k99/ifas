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
import Ripple from 'react-native-material-ripple';
import CardView from 'react-native-cardview';
import Orientation from 'react-native-orientation';
import { StackActions, NavigationActions } from 'react-navigation';

//vector icon
import BookIcon from "react-native-vector-icons/FontAwesome5";
const bookIcon = <BookIcon name="book" size={28} color={colors.theme} />;
import ForwordIcon from "react-native-vector-icons/MaterialIcons";
const forwordIcon = (
  <ForwordIcon name="arrow-forward" size={24} color={colors.theme} />
);
import BackButton from "react-native-vector-icons/MaterialIcons";
const backButton = (
  <BackButton name="arrow-back" size={28} color={colors.black} />
);
import ViewPDFIcon from "react-native-vector-icons/FontAwesome5";
const viewPDFIcon = (
  <ViewPDFIcon name="file-pdf" size={16} color={colors.topic_text_color_5} />
);
import VideoIcon from "react-native-vector-icons/Feather";
const videoIcon = (
  <VideoIcon name="video" size={16} color={colors.topic_text_color_6} />
);
import ClipboardIcon from 'react-native-vector-icons/FontAwesome5';
const clipboardIcon = <ClipboardIcon name="clipboard-list" size={16} color={colors.topic_text_color_6} />;
let isRecordingGloble = false;

export default class FreeChildVideoList extends Component {

    //Navigation Method
    isSessionFocus = false
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            access_token: '',
            isRecording: false,
            isRecording: '',
            freeVideoArray: this.props.navigation.state.params.topicChildView.topic_videos
        };
    }

    componentDidMount() {

    }
    componentWillUnmount() {
    }
    handleBackButtonClick = () => {
        global.isChatLiveSessionVisible = true;
        this.props.navigation.goBack();
        return true;
    }
    getInstructionApi(item, parentItem) {
        const formData = new FormData();
        formData.append("access_token", this.state.access_token);
        formData.append("exam_set_id", item.EXAM_SET_ID);
        console.warn("request_data_ins_paid", formData);

        fetch(CONSTANTS.BASE + CONSTANTS.POST_TEST_INSTRUCTION, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "multipart/form-data",
            },
            body: formData,
        })
            .then((response) => response.json())
            .then((responseJson) => {
                console.warn("INSTRUCTION_RESPONSE", responseJson);

                if (responseJson.code == 201) {
                    this.removeItemValue("ACCESS_TOKEN");
                } else {
                    global.isFreeVideoList001 = true;
                    //Handle here for exam alreay given or not
                    console.warn("LENGTTT", item);
                    if (responseJson.user_exam_obj && responseJson.user_exam_obj.length) {
                        //this.props.navigation.navigate('Instructions', { data: {}, selected_item: item, parent_item: parentItem });
                        this.props.navigation.navigate("ReviewTest", {
                            url: "",
                            data: {},
                            selected_item: responseJson.user_exam_obj[0],
                        });
                    } else {
                        this.props.navigation.navigate("Instructions", {
                            data: {},
                            selected_item: item,
                            parent_item: parentItem,
                        });
                        //this.callEnrollUserExam(item,parentItem)
                    }
                }
            })
            .catch((error) => {
                // console.error(error);
                // showNativeAlert("Network request failed")
                this.setState({
                    isLoading: false,
                    errorMessage: "Failed to fetch your subjects.",
                });
            });
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

                    {/* Header view */}
                    {this.renderHeader()}
                    <View style={{
                        flex: 1,
                        width: '100%',
                        padding: 10,
                    }}>
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={true}
                            //numColumns={2}
                            data={this.state.freeVideoArray}
                            renderItem={({ item, index }) => this.renderSubjectsList(item, index)}
                            extraData={this.state}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </View>
                </View>
            );
        }
    }

    renderSubjectsList = (item, index) => {
        console.log('item  ', item)
        return (
            <CardView
                style={{
                    width: '100%',
                    //width: dimensions.width / 2 - 22.5,
                    backgroundColor: colors.white,
                    marginBottom: 10,
                    //marginLeft: 15
                }}
                cardElevation={3}
                cardMaxElevation={2}
                cornerRadius={5}>
                <TouchableOpacity style={{ width: '100%', }}
                    onPress={() => {
                        this.props.navigation.navigate('FreeVideoPlayer', { selected_item: item, screen_name: 'FreeVideoList' })
                    }}>
                    <Image
                        defaultSource={require('../../images/logo2.png')}
                        source={{
                            uri: item.IMAGE
                        }}
                        style={{ width: '100%', height: dimensions.sizeRatio * 160, resizeMode: 'cover' }} />
                    <Text numberOfLines={1} style={{
                        paddingTop: dimensions.sizeRatio * 10,
                        color: colors.black,
                        paddingLeft: dimensions.sizeRatio * 15,
                        paddingRight: dimensions.sizeRatio * 15,
                        fontSize: dimensions.sizeRatio * 16,
                        fontFamily: CONSTANTS.DEMI
                    }}
                        numberOfLines={2}>
                        {item.TITLE}
                    </Text>
                    <Text numberOfLines={1} style={{
                        color: colors.lightblack,
                        paddingLeft: dimensions.sizeRatio * 15,
                        paddingRight: dimensions.sizeRatio * 15,
                        marginTop: dimensions.sizeRatio * 5,
                        fontSize: dimensions.sizeRatio * 14,
                        marginBottom: dimensions.sizeRatio * 10
                    }}
                        numberOfLines={1}>
                        {item.DURATION != null ?
                            ((parseInt(item.DURATION / 60)) > 0 ?
                                parseInt(item.DURATION / 60) + 'h' : '') + ' ' +
                            (parseInt(item.DURATION % 60)) + 'm' : '--'
                        }
                    </Text>
                    <View
                        style={{
                            width: "100%",
                            flexDirection: "row",
                            padding: 10,
                        }}
                    >
                        {item.EBOOK_URL !== null && item.EBOOK_URL !== "" && (
                            <Ripple
                                style={{
                                    width: "45%",
                                    padding: 10,
                                    backgroundColor: colors.topic_color_5,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                }}
                                onPress={() => {
                                    if (item.EBOOK_URL != null && item.EBOOK_URL != "") {
                                        this.props.navigation.navigate("PDFViewerScreen", {
                                            selected_item: item,
                                            screen_name: "topic",
                                            selected_ebook_type: "view",
                                        });
                                    } else {
                                        setTimeout(() => {
                                            Toast.show("PDF not found!", Toast.CENTER);
                                        }, 200);
                                    }
                                }}
                            >
                                {viewPDFIcon}
                                <Text
                                    style={{
                                        marginLeft: 5,
                                        fontSize: dimensions.sizeRatio * 14,
                                        color: colors.topic_text_color_5,
                                        fontFamily: CONSTANTS.MEDIUM,
                                    }}
                                    numberOfLines={1}
                                >
                                    {"View PDF"}
                                </Text>
                            </Ripple>
                        )}
                        {item.EBOOK_URL !== null && item.EBOOK_URL !== "" ? (
                            <View
                                style={{
                                    width: "10%",
                                }}
                            />
                        ) : null}

                        {item.EXAM_SET_ID !== null &&
                            item.EXAM_SET_ID !== "" &&
                            item.EXAM_SET_ID !== 0 && (
                                <Ripple
                                    style={{
                                        width: "45%",
                                        padding: 10,
                                        backgroundColor: colors.topic_color_6,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "flex-start",
                                    }}
                                    onPress={() => {
                                        this.getInstructionApi(item, item);
                                    }}
                                >
                                    {clipboardIcon}
                                    <Text
                                        style={{
                                            marginLeft: 5,
                                            fontSize: dimensions.sizeRatio * 14,
                                            color: colors.topic_text_color_6,
                                            fontFamily: CONSTANTS.MEDIUM,
                                        }}
                                        numberOfLines={1}
                                    >
                                        {"Test"}
                                    </Text>
                                </Ripple>
                            )}
                    </View>
                </TouchableOpacity>
            </CardView>
        )
    }

    renderHeader = () => {
        return (
            <View
                style={{
                    width: '100%',
                    height: 55,
                    backgroundColor: colors.white,
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
                <Text style={{ fontSize: 18, fontFamily: CONSTANTS.DEMI, color: colors.black, textAlign: 'left', marginLeft: 15 }}>
                    {'Free Videos'}
                </Text>
            </View>
        )
    }
}