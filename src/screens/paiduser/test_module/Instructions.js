/**
 * Test module
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
    Platform, ScrollView, ActivityIndicator, BackHandler, Text, View, Image, StatusBar,
    TouchableOpacity, Alert, AsyncStorage, NativeEventEmitter, NativeModules, Modal, FlatList,
    ImageBackground
} from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';
import colors from '../../../resources/colors';
import dimensions from '../../../resources/dimension';
import CONSTANTS from '../../../resources/constants';
import { Dialog } from 'react-native-simple-dialogs';
import Toast from 'react-native-tiny-toast';
import Ripple from 'react-native-material-ripple';
import CardView from 'react-native-cardview';
import Orientation from 'react-native-orientation';
import BackButton from 'react-native-vector-icons/MaterialIcons';
const backButton = <BackButton name="arrow-back" size={28} color={colors.white} />;


export default class Instructions extends Component {

    //Navigation Method
    isSessionFocus = false
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            access_token: '',
            isRecording: false,
            isRecording: '',
            instrctionArray: [],
            userProfileData: undefined
        };
    }

    componentDidMount() {
        Orientation.lockToPortrait();
        this.getAccessToken()
    }
    componentWillUnmount() {

    }

    getAccessToken() {
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                self.setState({
                    access_token: value.slice(1, -1),
                }, () => {
                        self.getInstructionApi()
                })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    getInstructionApi() {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('exam_set_id', this.props.navigation.state.params.selected_item.EXAM_SET_ID);
        console.warn('request_data_ins', formData)

        fetch(CONSTANTS.BASE + CONSTANTS.POST_TEST_INSTRUCTION, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.warn('INSTRUCTION_RESPONSE', responseJson)

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else {
                    //Handle here for exam alreay given or not
                    this.setState({
                        isLoading: false,
                        instrctionArray: responseJson.data,
                    });
                }
            })
            .catch((error) => {
                // console.error(error);
                // showNativeAlert("Network request failed")
                this.setState({
                    instrctionArray: [],
                    isLoading: false,
                    errorMessage: 'Failed to fetch your subjects.'
                })
            });
    }

    callEnrollUserExam = () => {
        //console.warn('ENTROLL_ITEM', item)
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('exam_set_id', this.props.navigation.state.params.selected_item.EXAM_SET_ID);
        console.warn('request_data_enr', formData)

        fetch(CONSTANTS.BASE + CONSTANTS.POST_TEST_ENROLLUSER, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.warn('RESPONSE_ENROLL', responseJson)

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else if (responseJson.code == 203) {
                    alert(responseJson.message)
                }else if (responseJson.code == 230) {
                    alert(responseJson.message)
                }
                else {
                    if (responseJson.data != undefined) {
                        //console.warn('SELECTED_ITEMM', parentItem);
                        //this.props.navigation.navigate('Instructions', { data: responseJson.data, selected_item: item, parent_item: parentItem })
                        this.props.navigation.navigate('QuestionAnswer', {
                            url: '', 
                            data: responseJson.data, 
                            selected_item: this.props.navigation.state.params.selected_item 
                        })
                    }
                }


            })
            .catch((error) => {
                // console.error(error);
                // showNativeAlert("Network request failed")
                this.setState({
                    answerArray: [],
                    isLoading: false,
                    errorMessage: 'Failed to fetch your subjects.'
                })
            });
    }

    getProfile() {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);

        fetch(CONSTANTS.BASE + CONSTANTS.PROFILE, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {

                if (responseJson.code == 201) {

                } else {
                    console.warn('PROFILE_DATA', responseJson.data.User)
                    this.setState({
                        userProfileData: responseJson.data.User
                    })
                }


            })
            .catch((error) => {

            });
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

    logoutUser() {
        showNativeAlert(CONSTANTS.LOGOUT_MESSAGE)
        CONSTANTS.IS_LOGGED_IN = false
        this.clearPreviousStackCourse()

    }

    clearPreviousStackCourse = () => {
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'Courses' })],
        });
        this.props.navigation.dispatch(resetAction);
    }

    handleBackButtonClick = () => {
        global.isChatLiveSessionVisible = true;
        this.props.navigation.goBack();
        return true;
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
                <View style={{ flex: 1, backgroundColor: colors.white }}>

                    {/* Header view */}
                    {this.renderHeader(this.props.navigation.state.params.selected_item)}
                    <View
                        style={{
                            width: 180,
                            height: 50,
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            backgroundColor: '#14A27B',
                            borderRadius: 40,
                            marginTop: -25
                        }}>
                        <Text style={{ fontSize: 20, fontFamily: CONSTANTS.DEMI, color: colors.white, textAlign: 'center' }}>
                            {'Instructions'}
                        </Text>
                    </View>
                    <ImageBackground style={{
                        flex: 1,
                        width: '100%',
                    }}
                        source={require('../../../images/test_intro2.png')}>
                        <ScrollView>
                            <View style={{
                                flex: 1,
                                width: '100%',
                                padding: 15
                            }}>
                                {this.state.instrctionArray.length != 0 ?
                                    <View style={{
                                        flex: 1,
                                        paddingBottom: 10
                                    }}>
                                        <FlatList
                                            showsVerticalScrollIndicator={false}
                                            scrollEnabled={false}
                                            data={this.state.instrctionArray}
                                            renderItem={({ item, index }) => this.renderInstrctionList(item, index)}
                                            extraData={this.state}
                                            keyExtractor={(item, index) => index.toString()}
                                        //ItemSeparatorComponent={this.itemSepratorView}
                                        />
                                    </View>
                                    :
                                    <View style={{
                                        flex: 1,
                                        width: '100%',
                                        height: '100%',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Text numberOfLines={1}
                                            style={{
                                                color: colors.black,
                                                fontFamily: CONSTANTS.MEDIUM,
                                                fontSize: dimensions.sizeRatio * 22,
                                            }}
                                            numberOfLines={1}>
                                            {'No record found!'}
                                        </Text>
                                    </View>
                                }
                                {/* Start Button */}
                                <View style={{
                                    padding: 15,
                                    justifyContent: 'center', alignItems: 'center',
                                    backgroundColor: colors.theme,
                                    borderRadius: dimensions.sizeRatio * 5
                                }} >
                                    <TouchableOpacity onPress={() => {
                                        // on press here
                                        this.callEnrollUserExam()
                                    }} hitSlop={{ top: dimensions.sizeRatio * 20, bottom: dimensions.sizeRatio * 20, left: dimensions.sizeRatio * 100, right: dimensions.sizeRatio * 100 }}>
                                        <Text style={{ fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 18, color: colors.white }}>START</Text>
                                    </TouchableOpacity>
                                </View>
                                <Image
                                    style={{
                                        width: 150,
                                        height: 100,
                                        marginTop: 5,
                                        alignSelf:'center'
                                    }}
                                    resizeMode={'contain'}
                                    source={require('../../../images/test_intro.png')}
                                />
                                <View
                                    style={{
                                        width: 150,
                                        height: 5,
                                        backgroundColor: colors.theme,
                                        alignSelf:'center',
                                        marginVertical:5,
                                    }}
                                />
                            </View>
                        </ScrollView>
                    </ImageBackground>
                </View>
            );
        }
    }

    renderInstrctionList = (item, index) => {
        console.log('item  ', item)
        return (
            <Ripple style={{
                flexDirection: 'row',
                width: '100%',
                paddingVertical: 15,
                alignItems: 'center',
            }}
                onPress={() => { }}>
                {/* <Image
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: 30 / 2
                    }}
                    resizeMode={'cover'}
                    source={require('../../../images/logo2.png')}
                /> */}
                <Text style={{
                    fontSize: (dimensions.sizeRatio * 16),
                    color: colors.black,
                    fontFamily: CONSTANTS.MEDIUM,
                    marginLeft: 10
                }}>{item.INS_INSTRUCTION}</Text>
            </Ripple>
        )
    }


    renderHeader = (item) => {
        return (
            <ImageBackground
                style={{
                    width: '100%',
                    height: 180,
                    //padding: 10,
                    flexDirection: 'column',
                    //borderBottomRightRadius: 50,
                    //borderBottomLeftRadius: 50,
                    alignItems: 'center'
                }}
                source={require('../../../images/test_intro1.png')}
                resizeMode={'stretch'}>
                <View
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: 80 / 2
                    }}>
                    <Image
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 80 / 2
                        }}
                        resizeMode={'cover'}
                        source={require('../../../images/logo2.png')}
                    />
                </View>
                <Text style={{ fontSize: 18, fontFamily: CONSTANTS.DEMI, color: colors.white, textAlign: 'center', marginTop: 10 }} numberOfLines={1}>
                    {item?.TITLE ? item?.TITLE : ''}
                </Text>
                {/* Back */}
                <Ripple
                    onPress={() => {
                        this.handleBackButtonClick()
                    }}
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        margin: 15
                    }}>
                    {backButton}
                </Ripple>
            </ImageBackground>
        )
    }

    itemSepratorView = () => {
        return (
            <View
                style={{
                    width: '100%',
                    height: 2,
                    backgroundColor: colors._transparent
                }}
            />
        )
    }
}