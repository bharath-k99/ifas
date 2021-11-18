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


export default class ScoreBoard extends Component {

    //Navigation Method
    isSessionFocus = false
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            access_token: '',
            isRecording: false,
            isRecording: '',
            answerArray: this.props.navigation.state.params.answer_array,
            answerResponse: this.props.navigation.state.params.response_array,
            totalTime: 0,
            secondMinuteHourTime: 0,
            secondMinuteHourType: 'Seconds',
            obtainingTimePercetage: 0,
            totalQuestion: 0,
            correctAnswer: 0,
            worngAnswer: 0,
            attemptAnswer: 0,
            subectsArray: [1, 2, 3, 4, 5, 6, 7, 8],
            userProfileData: undefined
        };
    }

    componentDidMount() {
        Orientation.lockToPortrait();
        //this.getAccessToken()
        this.answerArrayHandling(this.state.answerArray)
    }
    componentWillUnmount() {

    }


    answerArrayHandling = (answerArray) => {
        if (answerArray.length != 0) {
            let correctCount = 0;
            let worngCount = 0;
            let totalCount = 0;
            let worngAnswerCount = 0;
            let attemptAnswerCount = 0;
            for (let index = 0; index < answerArray.length; index++) {
                const element = answerArray[index];
                if (element.is_correct === 1) {
                    correctCount = correctCount + 1;
                }
                if (element.is_correct === 0) {
                    worngCount = worngCount + 1;
                }
                if (element.attempt === 1) {
                    attemptAnswerCount = attemptAnswerCount + 1;
                }
                if (element.wrong === 1) {
                    worngAnswerCount = worngAnswerCount + 1;
                }
                totalCount = totalCount + 1;
            }
            this.timeFormatter(this.props.navigation.state.params.total_time?.ES_DURATION, 'totaltime');
            this.obtainTimingFormater(this.props.navigation.state.params.total_time?.ES_DURATION, this.props.navigation.state.params.obtainTime);
            //this.timeFormatter(this.props.navigation.state.params.obtainTime, 'obtaintime');
            this.setState({
                totalQuestion: totalCount,
                correctAnswer: correctCount,
                //worngAnswer: worngCount,
                worngAnswer: attemptAnswerCount - correctCount,
                attemptAnswer: attemptAnswerCount,
                obtainingTimePercetage: ((Number(correctCount) * 100) / Number(totalCount))
            })
        }
    }

    obtainTimingFormater = (totalTime, obtainTime) => {
        let remainingTime = parseFloat(totalTime) - parseFloat(obtainTime);
        const d = Number(remainingTime);
        const h = Math.floor(d / 3600);
        const m = Math.floor((d % 3600) / 60);
        const s = Math.floor((d % 3600) % 60);
        const hDisplay = h > 0 ? `${h.toString().length > 1 ? `${h}` : `${0}${h}`}` : '00';
        const mDisplay = m > 0 ? `${m.toString().length > 1 ? `${m}` : `${0}${m}`}` : '00';
        const sDisplay = s > 0 ? `${s.toString().length > 1 ? `${s}` : `${0}${s}`}` : '00';

        if (hDisplay == '00' && mDisplay == '00' && sDisplay != '00') {
            this.setState({
                secondMinuteHourTime: `${mDisplay}.${sDisplay}`,
                secondMinuteHourType: 'Seconds'
            })
        } else if (hDisplay == '00' && mDisplay != '00') {
            this.setState({
                secondMinuteHourTime: `${mDisplay}.${sDisplay}`,
                secondMinuteHourType: 'Minutes'
            })
        } else {
            this.setState({
                secondMinuteHourTime: `${hDisplay}.${mDisplay}.${sDisplay}`,
                secondMinuteHourType: 'Hours'
            })
        }
    }

    timeFormatter = (seconds, type) => {
        const d = Number(seconds);
        const h = Math.floor(d / 3600);
        const m = Math.floor((d % 3600) / 60);
        const s = Math.floor((d % 3600) % 60);
        const hDisplay = h > 0 ? `${h.toString().length > 1 ? `${h}` : `${0}${h}`}` : '00';
        const mDisplay = m > 0 ? `${m.toString().length > 1 ? `${m}` : `${0}${m}`}` : '00';
        const sDisplay = s > 0 ? `${s.toString().length > 1 ? `${s}` : `${0}${s}`}` : '00';
        if (type === 'totaltime') {
            if (hDisplay == '00' && mDisplay == '00' && sDisplay != '00') {
                this.setState({
                    totalTime: `${mDisplay}.${sDisplay}`,
                    //secondMinuteHourType: 'Seconds'
                })
            }
            else if (hDisplay == '00' && mDisplay != '00') {
                this.setState({
                    totalTime: `${mDisplay}.${sDisplay}`,
                    //secondMinuteHourType: 'Minutes'
                })
            } else {
                this.setState({
                    totalTime: `${hDisplay}.${mDisplay}.${sDisplay}`,
                    //secondMinuteHourType: 'Hours'
                })
            }
        } else {
            if (hDisplay == '00') {
                this.setState({
                    secondMinuteHourTime: `${mDisplay}.${sDisplay}`,
                })
            } else if (hDisplay == '00' && mDisplay != '00') {
                this.setState({
                    secondMinuteHourTime: `${sDisplay}`,
                })
            } else {
                this.setState({
                    secondMinuteHourTime: `${hDisplay}.${mDisplay}.${sDisplay}`,
                })
            }
        }
    }

    getAccessToken() {
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                self.setState({
                    access_token: value.slice(1, -1),
                }, () => {
                    if (global.landingScreenPaidItem != undefined)
                        self.getSubectApi(global.landingScreenPaidItem)
                })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    getSubectApi(item) {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('course_id', item.id);
        formData.append('ebook_or_video', 1);
        console.log(formData)

        fetch(CONSTANTS.BASE + CONSTANTS.POST_FREE_SUBJECT_LIST_NEW, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.warn('SUBJECT_PAID_VIDEO_NEW', responseJson)

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else {
                    this.setState({
                        isLoading: false,
                        subectsArray: responseJson.data.Subjects,
                    });
                    this.getProfile()
                }


            })
            .catch((error) => {
                // console.error(error);
                // showNativeAlert("Network request failed")
                this.setState({
                    subectsArray: [],
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

    quitPress = () => {
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'NavigationTab' })],
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
                <ScrollView
                    style={{
                        flex: 1, backgroundColor: '#EAF3F7'
                    }}>
                    <View style={{ flex: 1, backgroundColor: '#EAF3F7' }}>

                        {/* Header view */}
                        {this.renderHeader()}
                        <View style={{
                            flex: 1,
                            width: '100%',
                            backgroundColor: '#EAF3F7'
                        }}>
                            <View style={{
                                width: '87%',
                                height: 410,
                                paddingVertical: 15,
                                marginTop: -50,
                                backgroundColor: 'white',
                                borderRadius: 7,
                                alignSelf: 'center'
                            }}>
                                {/* Top View score board text */}
                                <View
                                    style={{
                                        width: '80%',
                                        height: 45,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        alignSelf: 'center',
                                        backgroundColor: '#14A27B',
                                        borderRadius: 40,
                                        marginTop: -40
                                    }}>
                                    <Image
                                        style={{
                                            width: '70%',
                                        }}
                                        resizeMode={'contain'}
                                        source={require('../../../images/score5.png')}
                                    />
                                </View>
                                {/* Bellow white box component */}
                                <View
                                    style={{
                                        width: '100%',
                                        flexDirection: 'column',
                                        marginTop: 15
                                    }}>
                                    <Text style={{
                                        fontSize: (dimensions.sizeRatio * 20),
                                        textAlign: "center",
                                        color: colors.gray,
                                        fontFamily: CONSTANTS.MEDIUM
                                    }}>{
                                            'MARKS  OBTAINED'
                                        }</Text>

                                    <Text style={{
                                        fontSize: (dimensions.sizeRatio * 26),
                                        textAlign: "center",
                                        color: colors.black,
                                        fontFamily: CONSTANTS.MEDIUM,
                                        marginTop: 10
                                    }}>{`------ ${this.state.correctAnswer} / ${this.state.totalQuestion} ------`}</Text>
                                    <View
                                        style={{
                                            width: '100%',
                                            height: 1,
                                            backgroundColor: colors.lightgray,
                                            marginTop: 40
                                        }}
                                    />
                                    {/* Current Worng Attempted */}
                                    <View
                                        style={{
                                            width: '100%',
                                            flexDirection: 'row'
                                        }}>
                                        {/* Current */}
                                        <View
                                            style={{
                                                width: '32%',
                                                flexDirection: 'column'
                                            }}>
                                            <Text style={{
                                                fontSize: (dimensions.sizeRatio * 17),
                                                textAlign: "center",
                                                color: 'green',
                                                fontFamily: CONSTANTS.DEMI,
                                                marginTop: 15
                                            }}>{'Correct'}</Text>
                                            <Text style={{
                                                fontSize: (dimensions.sizeRatio * 15),
                                                textAlign: "center",
                                                color: 'grey',
                                                fontFamily: CONSTANTS.MEDIUM,
                                                marginTop: 7
                                            }}>{'Answers'}</Text>
                                            <Text style={{
                                                fontSize: (dimensions.sizeRatio * 26),
                                                textAlign: "center",
                                                color: 'black',
                                                fontFamily: CONSTANTS.DEMI,
                                                marginTop: 7
                                            }}>{this.state.correctAnswer}</Text>
                                        </View>
                                        <View
                                            style={{
                                                width: .5,
                                                height: '90%',
                                                backgroundColor: colors.lightgray,
                                                marginTop: 10
                                            }}
                                        />
                                        {/* Worng */}
                                        <View
                                            style={{
                                                width: '32%',
                                                flexDirection: 'column'
                                            }}>
                                            <Text style={{
                                                fontSize: (dimensions.sizeRatio * 17),
                                                textAlign: "center",
                                                color: 'red',
                                                fontFamily: CONSTANTS.DEMI,
                                                marginTop: 15
                                            }}>{'Wrong'}</Text>
                                            <Text style={{
                                                fontSize: (dimensions.sizeRatio * 15),
                                                textAlign: "center",
                                                color: 'grey',
                                                fontFamily: CONSTANTS.MEDIUM,
                                                marginTop: 7
                                            }}>{'Answers'}</Text>
                                            <Text style={{
                                                fontSize: (dimensions.sizeRatio * 26),
                                                textAlign: "center",
                                                color: 'black',
                                                fontFamily: CONSTANTS.DEMI,
                                                marginTop: 7
                                            }}>{this.state.worngAnswer}</Text>
                                        </View>
                                        <View
                                            style={{
                                                width: .5,
                                                height: '90%',
                                                backgroundColor: colors.lightgray,
                                                marginTop: 10
                                            }}
                                        />
                                        {/* Attempted */}
                                        <View
                                            style={{
                                                width: '32%',
                                                flexDirection: 'column'
                                            }}>
                                            <Text style={{
                                                fontSize: (dimensions.sizeRatio * 17),
                                                textAlign: "center",
                                                color: '#4D3AAF',
                                                fontFamily: CONSTANTS.DEMI,
                                                marginTop: 15
                                            }}>{'Attempted'}</Text>
                                            <Text style={{
                                                fontSize: (dimensions.sizeRatio * 15),
                                                textAlign: "center",
                                                color: 'grey',
                                                fontFamily: CONSTANTS.MEDIUM,
                                                marginTop: 7
                                            }}>{'Answers'}</Text>
                                            <Text style={{
                                                fontSize: (dimensions.sizeRatio * 26),
                                                textAlign: "center",
                                                color: 'black',
                                                fontFamily: CONSTANTS.DEMI,
                                                marginTop: 7
                                            }}>{this.state.attemptAnswer}</Text>
                                        </View>
                                    </View>
                                    <View
                                        style={{
                                            width: '100%',
                                            height: 1,
                                            backgroundColor: colors.lightgray,
                                            marginTop: 15
                                        }}
                                    />

                                    {/* Current Worng Attempted */}
                                    <View
                                        style={{
                                            width: '100%',
                                            flexDirection: 'row'
                                        }}>
                                        {/* Time */}
                                        <View
                                            style={{
                                                width: '49%',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                            <Image
                                                style={{
                                                    width: 45,
                                                    height: 45,
                                                    marginTop: 20
                                                }}
                                                resizeMode={'contain'}
                                                source={require('../../../images/score1.png')}
                                            />
                                            <Text style={{
                                                fontSize: (dimensions.sizeRatio * 15),
                                                textAlign: "center",
                                                color: '#4D3AAF',
                                                fontFamily: CONSTANTS.DEMI,
                                                marginTop: 8
                                            }}>{this.state.secondMinuteHourType}</Text>
                                            <Text style={{
                                                fontSize: (dimensions.sizeRatio * 16),
                                                textAlign: "center",
                                                color: 'black',
                                                fontFamily: CONSTANTS.DEMI,
                                                marginTop: 3
                                            }}>{`${this.state.secondMinuteHourTime}/${this.state.totalTime}`}</Text>
                                        </View>
                                        <View
                                            style={{
                                                width: .5,
                                                height: '90%',
                                                backgroundColor: colors.lightgray,
                                                marginTop: 10
                                            }}
                                        />
                                        {/* Target */}
                                        <View
                                            style={{
                                                width: '49%',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                            <Image
                                                style={{
                                                    width: 45,
                                                    height: 45,
                                                    marginTop: 20
                                                }}
                                                resizeMode={'contain'}
                                                source={require('../../../images/score2.png')}
                                            />
                                            <Text style={{
                                                fontSize: (dimensions.sizeRatio * 15),
                                                textAlign: "center",
                                                color: colors.theme,
                                                fontFamily: CONSTANTS.DEMI,
                                                marginTop: 8
                                            }}>{'Accuracy'}</Text>
                                            <Text style={{
                                                fontSize: (dimensions.sizeRatio * 26),
                                                textAlign: "center",
                                                color: 'black',
                                                fontFamily: CONSTANTS.DEMI,
                                                marginTop: 3
                                            }}>{`${this.state.obtainingTimePercetage.toFixed(2)}%`}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            {/* Bottom view */}
                            <View
                                style={{
                                    width: '100%',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}>
                                <Text style={{
                                    width: '90%',
                                    fontSize: (dimensions.sizeRatio * 14),
                                    textAlign: "center",
                                    color: colors.gray,
                                    fontFamily: CONSTANTS.REGULAR,
                                    marginTop: 25
                                }}>{
                                        parseInt(this.state.obtainingTimePercetage) <= 50 ?
                                            `Let's revise again and clear concpt.` :
                                            parseInt(this.state.obtainingTimePercetage) > 50 && parseInt(this.state.obtainingTimePercetage) < 80 ?
                                                `Good!! Let's once revise to make concept crystal clear.` :
                                                `Excellant !! Your concept for this lecture is Perfect.`}</Text>
                                <View
                                    style={{
                                        width: '90%',
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        marginTop: 25
                                    }}>
                                    {/* <TouchableOpacity
                                        style={{
                                            width: '30%',
                                            height: 50,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: '#4D3AAF',
                                            borderRadius: 5
                                        }}>
                                        <Text style={{
                                            fontSize: (dimensions.sizeRatio * 18),
                                            textAlign: "center",
                                            color: 'white',
                                            fontFamily: CONSTANTS.DEMI,
                                            marginTop: 3
                                        }}>{'RETAKE'}</Text>
                                    </TouchableOpacity> */}
                                    <TouchableOpacity
                                        style={{
                                            width: '30%',
                                            height: 50,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: 'green',
                                            borderRadius: 5,
                                            marginLeft: 15
                                        }}
                                        onPress={()=>{
                                            this.props.navigation.navigate('ReviewTest', { url: '', 
                                            data: {}, 
                                            selected_item: this.props.navigation.state.params.selected_item })
                                        }}>
                                        <Text style={{
                                            fontSize: (dimensions.sizeRatio * 18),
                                            textAlign: "center",
                                            color: 'white',
                                            fontFamily: CONSTANTS.DEMI,
                                            marginTop: 3
                                        }}>{'REVIEW'}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{
                                            width: '30%',
                                            height: 50,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: colors.theme,
                                            borderRadius: 5,
                                            marginLeft: 15
                                        }}
                                        onPress={() => {
                                            this.quitPress()
                                        }}>
                                        <Text style={{
                                            fontSize: (dimensions.sizeRatio * 18),
                                            textAlign: "center",
                                            color: 'white',
                                            fontFamily: CONSTANTS.DEMI,
                                            marginTop: 3
                                        }}>{'QUIT'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            );
        }
    }


    renderHeader = () => {
        return (
            <ImageBackground
                style={{
                    width: '100%',
                    height: 220,
                    //padding: 10,
                    flexDirection: 'column',
                    //borderBottomRightRadius: 50,
                    //borderBottomLeftRadius: 50,
                    //alignItems: 'center'
                }}
                source={require('../../../images/score3.png')}
                resizeMode={'stretch'}>
                <View
                    style={{
                        marginTop: -85,
                        marginLeft: 100
                    }}>
                    <Image
                        style={{
                            width: 120,
                        }}
                        resizeMode={'contain'}
                        source={require('../../../images/score4.png')}
                    />
                </View>
                {/* Absolute */}
                {/* <Ripple
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
                </Ripple> */}
            </ImageBackground>
        )
    }
}