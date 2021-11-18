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
const backButton = <BackButton name="arrow-back" size={28} color={colors.black} />;

// Question
import QuestionComponent from './components/AllWithTypeQuestion';
import AnswerComponent from './components/AllWithTypeAnswer';
import AllWithTypeSolution from './components/AllWithTypeSolution';

export default class ReviewTest extends Component {

    //Navigation Method
    isSessionFocus = false
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            access_token: '',
            isCorrect: true,
            isWrong: false,
            isSkip: false,
            reviewTestArray: [],
            correctArray: [],
            wrongArray: [],
            skipArray: [],
            visibleArrayAtATime: []
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
                    self.getQuestionAnswerApi()
                })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    getQuestionAnswerApi() {
        this.setState({
            isLoading: true
        })
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('exam_set_id', this.props.navigation.state.params.selected_item.UE_EXAM_SET_ID);
        formData.append('user_exam_id', this.props.navigation.state.params.selected_item.UE_ID);
        console.warn('request_question', this.props.navigation.state.params.selected_item, formData)

        fetch(CONSTANTS.BASE + CONSTANTS.POST_TEST_QUESTIONS, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.warn('RESPONSE_QUE_ANS', responseJson)

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else {
                    if (responseJson.data[0]?.questions.length > 0) {
                        this.setState({
                            isLoading: false,
                        });
                        this.handlequestionResponse(responseJson.data[0]?.questions)
                    } else {
                        this.setState({
                            isLoading: false,
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

    handlequestionResponse = (quArray) => {
        let queAnsArray = quArray;

        for (let index = 0; index < queAnsArray.length; index++) {
            const element = queAnsArray[index];
            for (let index = 0; index < element.question_options.length; index++) {
                const elementQuestion = element.question_options[index];
                if (element.Q_TYPE === 3) {
                    if (element?.user_exam_answer !== null) {
                        if (element?.user_exam_answer?.UEA_ANSWER_CUSTIOM !== null && element?.user_exam_answer?.UEA_ANSWER_CUSTIOM !== '') {
                            elementQuestion.QO_ANSWER_CWS = element?.user_exam_answer?.UEA_ANSWER1 !== null ?
                                element?.user_exam_answer?.UEA_ANSWER1 : null
                            elementQuestion.QO_ANSWER_CWS_STRING = element?.user_exam_answer?.UEA_ANSWER_CUSTIOM
                        } else {
                            elementQuestion.QO_ANSWER_CWS = null
                            elementQuestion.QO_ANSWER_CWS_STRING = ''
                        }
                    } else {
                        elementQuestion.QO_ANSWER_CWS = null
                        elementQuestion.QO_ANSWER_CWS_STRING = ''
                    }
                } else {
                    if (element?.user_exam_answer !== null) {
                        // uea1
                        if (index === 0) {
                            if (element?.user_exam_answer?.UEA_ANSWER1 !== null) {
                                elementQuestion.QO_ANSWER_CWS = element?.user_exam_answer?.UEA_ANSWER1
                            } else {
                                elementQuestion.QO_ANSWER_CWS = null
                            }
                        } else if (index === 1) {
                            // uea2
                            if (element?.user_exam_answer?.UEA_ANSWER2 !== null) {
                                console.warn('enter1', element?.user_exam_answer?.UEA_ANSWER2)
                                elementQuestion.QO_ANSWER_CWS = element?.user_exam_answer?.UEA_ANSWER2
                            } else {
                                console.warn('enter2', element?.user_exam_answer?.UEA_ANSWER2)
                                elementQuestion.QO_ANSWER_CWS = null
                            }
                        } else if (index === 2) {
                            // uea3
                            if (element?.user_exam_answer?.UEA_ANSWER3 !== null) {
                                elementQuestion.QO_ANSWER_CWS = element?.user_exam_answer?.UEA_ANSWER3
                            } else {
                                elementQuestion.QO_ANSWER_CWS = null
                            }
                        } else if (index === 3) {
                            // uea4
                            if (element?.user_exam_answer?.UEA_ANSWER4 !== null) {
                                elementQuestion.QO_ANSWER_CWS = element?.user_exam_answer?.UEA_ANSWER4
                            } else {
                                elementQuestion.QO_ANSWER_CWS = null
                            }
                        }
                    } else {
                        elementQuestion.QO_ANSWER_CWS = null
                    }
                }
            }
        }

        let correctArr = [];
        let wrongArr = [];
        let skipArr = [];
        // type handling 1, 2, 3
        for (let index = 0; index < queAnsArray.length; index++) {
            const element = queAnsArray[index];
            //Single selection
            if (element.Q_TYPE === 1) {
                if (element.user_exam_answer && element.user_exam_answer?.UEA_IS_CORRECT == 1) {
                    correctArr.push(element);
                } else if (element.user_exam_answer && element.user_exam_answer?.UEA_IS_CORRECT == 0) {
                    if (element.user_exam_answer?.UEA_ANSWER1 != null) {
                        wrongArr.push(element);
                    }
                    if (element.user_exam_answer?.UEA_ANSWER2 != null) {
                        wrongArr.push(element);
                    }
                    if (element.user_exam_answer?.UEA_ANSWER3 != null) {
                        wrongArr.push(element);
                    }
                    if (element.user_exam_answer?.UEA_ANSWER4 != null) {
                        wrongArr.push(element);
                    }
                    if (element.user_exam_answer?.UEA_ANSWER1 == null
                        && element.user_exam_answer?.UEA_ANSWER2 == null
                        && element.user_exam_answer?.UEA_ANSWER3 == null
                        && element.user_exam_answer?.UEA_ANSWER4 == null) {
                        skipArr.push(element);
                    }
                }
            }
            //Multi selection
            else if (element.Q_TYPE === 2) {
                if (element.user_exam_answer && element.user_exam_answer?.UEA_IS_CORRECT == 1) {
                    correctArr.push(element);
                } else if (element.user_exam_answer && element.user_exam_answer?.UEA_IS_CORRECT == 0) {
                    if (element.user_exam_answer?.UEA_ANSWER1 != null) {
                        wrongArr.push(element);
                    }
                    if (element.user_exam_answer?.UEA_ANSWER2 != null) {
                        wrongArr.push(element);
                    }
                    if (element.user_exam_answer?.UEA_ANSWER3 != null) {
                        wrongArr.push(element);
                    }
                    if (element.user_exam_answer?.UEA_ANSWER4 != null) {
                        wrongArr.push(element);
                    }
                    if (element.user_exam_answer?.UEA_ANSWER1 == null
                        && element.user_exam_answer?.UEA_ANSWER2 == null
                        && element.user_exam_answer?.UEA_ANSWER3 == null
                        && element.user_exam_answer?.UEA_ANSWER4 == null) {
                        skipArr.push(element);
                    }
                }
            }
            else if (element.Q_TYPE === 3) {
                if (element.user_exam_answer && element.user_exam_answer?.UEA_IS_CORRECT == 1) {
                    correctArr.push(element);
                } else if (element.user_exam_answer && element.user_exam_answer?.UEA_IS_CORRECT == 0) {
                    if (element.user_exam_answer?.UEA_ANSWER_CUSTIOM != '') {
                        wrongArr.push(element);
                    } else {
                        skipArr.push(element);
                    }
                }
            }
        }

        setTimeout(() => {
            console.warn('REVIEWARARY0' + JSON.stringify(correctArr) + '\n\n' + JSON.stringify(wrongArr) + '\n\n' + skipArr);
            this.setState({
                reviewTestArray: queAnsArray,
                correctArray: correctArr,
                wrongArray: wrongArr,
                skipArray: skipArr,
                visibleArrayAtATime: correctArr
            })
        }, 1000);
    }

    handleBackButtonClick = () => {
        global.isChatLiveSessionVisible = true;
        this.props.navigation.goBack();
        return true;
    }
    handleHeightQueAnswer = (selectedQuestionObj) => {
        // let value = (this.state.selectedQuestionObj && this.state.selectedQuestionObj?.Q_QUESTION.length > 35 ? 
        // (parseInt(this.state.selectedQuestionObj?.Q_QUESTION.length / 45) + 2) : 2);
        let finalLineCount = 0;
        if (selectedQuestionObj && selectedQuestionObj.length > 35) {
            let lineCount = selectedQuestionObj.length / 42;
            if (lineCount <= 10) {
                finalLineCount = lineCount + 2;
            } else if (lineCount >= 10 && lineCount < 15) {
                finalLineCount = lineCount + 1;
            } else if (lineCount >= 15 && lineCount < 20) {
                finalLineCount = lineCount + 2;
            } else if (lineCount >= 20 && lineCount < 25) {
                finalLineCount = lineCount + .5;
            } else if (lineCount >= 25 && lineCount < 30) {
                finalLineCount = lineCount + .5;
            } else if (lineCount >= 30 && lineCount < 35) {
                finalLineCount = lineCount + .5;
            } else if (lineCount >= 35 && lineCount < 40) {
                finalLineCount = lineCount + 1.5;
            } else if (lineCount >= 40 && lineCount < 45) {
                finalLineCount = lineCount + 1.5;
            } else if (lineCount >= 45 && lineCount < 50) {
                finalLineCount = lineCount + 2;
            } else if (lineCount >= 50 && lineCount < 55) {
                finalLineCount = lineCount + 2;
            } else if (lineCount >= 55 && lineCount < 60) {
                finalLineCount = lineCount - 4.5;
            } else if (lineCount >= 60 && lineCount < 65) {
                finalLineCount = lineCount - 4.5;
            } else if (lineCount >= 65 && lineCount < 70) {
                finalLineCount = lineCount - 5.5;
            } else if (lineCount >= 70 && lineCount < 75) {
                finalLineCount = lineCount - 5.5;
            } else if (lineCount >= 75 && lineCount < 80) {
                finalLineCount = lineCount - 6.5;
            } else if (lineCount >= 80 && lineCount < 85) {
                finalLineCount = lineCount - 6.5;
            } else if (lineCount >= 85 && lineCount < 90) {
                finalLineCount = lineCount - 7.5;
            } else if (lineCount >= 90 && lineCount < 95) {
                finalLineCount = lineCount - 7.5;
            } else if (lineCount >= 95 && lineCount < 100) {
                finalLineCount = lineCount - 7.5;
            } else if (lineCount >= 100 && lineCount < 105) {
                finalLineCount = lineCount - 14;
            } else if (lineCount >= 105 && lineCount < 110) {
                finalLineCount = lineCount - 9;
            } else if (lineCount >= 110 && lineCount < 115) {
                finalLineCount = lineCount - 9;
            } else if (lineCount >= 115 && lineCount < 120) {
                finalLineCount = lineCount - 10;
            } else if (lineCount >= 125 && lineCount < 130) {
                finalLineCount = lineCount - 10;
            } else if (lineCount >= 130 && lineCount < 135) {
                finalLineCount = lineCount - 10;
            } else if (lineCount >= 135 && lineCount < 140) {
                finalLineCount = lineCount - 11;
            } else if (lineCount >= 140 && lineCount < 145) {
                finalLineCount = lineCount - 12;
            } else if (lineCount >= 145 && lineCount < 150) {
                finalLineCount = lineCount - 14;
            }
        } else {
            finalLineCount = 2;
        }
        return finalLineCount;
    }

    handleHeightAnswer = (selectedQuestionObj) => {
        // let value = (this.state.selectedQuestionObj && this.state.selectedQuestionObj?.Q_QUESTION.length > 35 ? 
        // (parseInt(this.state.selectedQuestionObj?.Q_QUESTION.length / 45) + 2) : 2);
        let finalLineCount = 0;
        if (selectedQuestionObj && selectedQuestionObj.length > 35) {
            let lineCount = selectedQuestionObj.length / 42;
            if (lineCount <= 10) {
                finalLineCount = lineCount + 3.5;
            } else if (lineCount >= 10 && lineCount < 15) {
                finalLineCount = lineCount + 4.5;
            } else if (lineCount >= 15 && lineCount < 20) {
                finalLineCount = lineCount + 4.5;
            } else if (lineCount >= 20 && lineCount < 25) {
                finalLineCount = lineCount + 4.5;
            } else if (lineCount >= 25 && lineCount < 30) {
                finalLineCount = lineCount + 4.5;
            } else if (lineCount >= 30 && lineCount < 35) {
                finalLineCount = lineCount + 4.5;
            } else if (lineCount >= 35 && lineCount < 40) {
                finalLineCount = lineCount + 4.5;
            } else if (lineCount >= 40 && lineCount < 45) {
                finalLineCount = lineCount + 4.5;
            } else if (lineCount >= 45 && lineCount < 50) {
                finalLineCount = lineCount + 5;
            } else if (lineCount >= 50 && lineCount < 55) {
                finalLineCount = lineCount + 5;
            } else if (lineCount >= 55 && lineCount < 60) {
                finalLineCount = lineCount - 4.8;
            } else if (lineCount >= 60 && lineCount < 65) {
                finalLineCount = lineCount - 4.8;
            } else if (lineCount >= 65 && lineCount < 70) {
                finalLineCount = lineCount - 5.5;
            } else if (lineCount >= 70 && lineCount < 75) {
                finalLineCount = lineCount - 5.5;
            } else if (lineCount >= 75 && lineCount < 80) {
                finalLineCount = lineCount - 6.5;
            } else if (lineCount >= 80 && lineCount < 85) {
                finalLineCount = lineCount - 6.5;
            } else if (lineCount >= 85 && lineCount < 90) {
                finalLineCount = lineCount - 7.5;
            } else if (lineCount >= 90 && lineCount < 95) {
                finalLineCount = lineCount - 7.5;
            } else if (lineCount >= 95 && lineCount < 100) {
                finalLineCount = lineCount - 7.5;
            } else if (lineCount >= 100 && lineCount < 105) {
                finalLineCount = lineCount - 14;
            } else if (lineCount >= 105 && lineCount < 110) {
                finalLineCount = lineCount - 9;
            } else if (lineCount >= 110 && lineCount < 115) {
                finalLineCount = lineCount - 9;
            } else if (lineCount >= 115 && lineCount < 120) {
                finalLineCount = lineCount - 10;
            } else if (lineCount >= 125 && lineCount < 130) {
                finalLineCount = lineCount - 10;
            } else if (lineCount >= 130 && lineCount < 135) {
                finalLineCount = lineCount - 10;
            } else if (lineCount >= 135 && lineCount < 140) {
                finalLineCount = lineCount - 11;
            } else if (lineCount >= 140 && lineCount < 145) {
                finalLineCount = lineCount - 12;
            } else if (lineCount >= 145 && lineCount < 150) {
                finalLineCount = lineCount - 14;
            }
        } else {
            finalLineCount = 2;
        }
        return finalLineCount;
    }
    render() {
        const { isCorrect, isWrong, isSkip } = this.state;
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

                <View
                    style={{
                        flex: 1, backgroundColor: '#EAF3F7'
                    }}>
                    {/* Header view */}
                    {this.renderHeader()}
                    {/* Tab bar */}
                    {this.tabBarView(isCorrect, isWrong, isSkip)}
                    {/* <ScrollView style={{ flex: 1, backgroundColor: '#EAF3F7' }}> */}

                    <View style={{
                        flex: 1,
                        width: '100%',
                        backgroundColor: '#EAF3F7'
                    }}>
                        {/* Test View Flat list */}
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={true}
                            data={this.state.visibleArrayAtATime}
                            renderItem={({ item, index }) => this.renderItem(item, index)}
                            extraData={this.state}
                            keyExtractor={(item, index) => index.toString()}
                        //ItemSeparatorComponent={this.itemSepratorView}
                        />
                    </View>
                    {/* </ScrollView> */}
                </View>
            );
        }
    }

    renderItem = (item, index) => {
        let parentItem = item;
        console.warn('RENDER_REVIEW__', parentItem)
        return (
            <View style={{
                flex: 1,
                width: '100%',
                marginTop: 10
            }}>
                <View
                    style={{
                        width: '100%',
                        flexDirection: 'row',
                    }}>
                    <View
                        style={{
                            width: '10%',
                            height: 50,
                            alignItems: 'center',
                        }}>
                        <View
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 5,
                                backgroundColor: colors.session_color_4,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                            <View style={{
                                backgroundColor: colors.theme,
                                width: 25,
                                height: 25,
                                borderRadius: 5,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Text style={{
                                    fontSize: (dimensions.sizeRatio * 14),
                                    color: colors.white,
                                    fontFamily: CONSTANTS.DEMI,
                                }}>
                                    {/* {index + 1} */}
                                    {item?._joinData?.ESQT_QUESTION_ORDER}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View
                        style={{
                            width: '88%'
                        }}>
                        <QuestionComponent
                            //heightMath={item?.Q_QUESTION.length > 35 ? (parseInt(item?.Q_QUESTION.length / 35) + 2) : 2}
                            heightMath={this.handleHeightQueAnswer(item?.Q_QUESTION)}
                            heightSecondMath={item?.Q_QUESTION_EXTRA != null &&
                                item?.Q_QUESTION_EXTRA != '' ? (this.handleHeightQueAnswer(item?.Q_QUESTION_EXTRA) + 1.5) : 0}
                            question={item?.Q_QUESTION}
                            questionObj={item}
                            type={'html'}
                            navigation={this.props.navigation} />
                    </View>
                </View>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                    data={item?.question_options}
                    renderItem={({ item, index }) => this.renderAswerItem(parentItem, item, index)}
                    extraData={this.state}
                    keyExtractor={(item, index) => index.toString()}
                //ItemSeparatorComponent={this.itemSepratorView}
                />
                {item.Q_SOLUTION_DESC != null && item.Q_SOLUTION_DESC != '' &&
                    <View
                        style={{
                            width: '100%',
                            paddingVertical: 10,
                            backgroundColor: 'white'
                            //marginLeft: 5
                        }}>
                        <Text style={{ fontSize: (dimensions.sizeRatio * 13), color: colors.black, fontFamily: CONSTANTS.DEMI, marginLeft: 10, borderColor: colors.lightgray, borderWidth: 1, padding: 5, width: 100, textAlign: 'center' }}>
                            {'Solution:'}
                        </Text>
                        <AllWithTypeSolution
                            //heightMath={item?.Q_SOLUTION_DESC.length > 35 ? (parseInt(item?.Q_SOLUTION_DESC.length / 35) + 2) : 2}
                            heightMath={this.handleHeightQueAnswer(item?.Q_SOLUTION_DESC)}
                            question={item?.Q_SOLUTION_DESC}
                            questionObj={item}
                            type={'html'}
                            navigation={this.props.navigation} />
                        {item.Q_SOLUTION_IMAGE !== null &&
                            item.Q_SOLUTION_IMAGE !== '' &&
                            <Image
                                style={{
                                    width: '100%',
                                    height: 150,
                                    marginTop: 10,
                                    alignSelf: 'center'
                                }}
                                resizeMode={'contain'}
                                //source={{uri:this.props.questionObj?.QO_OPTIONS_IMAGE}}
                                source={{ uri: CONSTANTS.BASE_QUESTION_URL + item.Q_SOLUTION_IMAGE }}
                            />
                        }
                    </View>
                }
                <View
                    style={{
                        width: '100%',
                        height: 2,
                        backgroundColor: colors.theme,
                        marginVertical: 5
                    }}
                />
            </View>
        )
    }

    renderAswerItem = (parentItem, item, index) => {
        //console.warn('RENDER_ITEM', item)
        if (parentItem !== undefined && parentItem.Q_TYPE === 3) {
            return (
                <View style={{
                    width: '100%',
                    flexDirection: 'column'
                }}>
                    <View style={{
                        width: '100%',
                        paddingVertical: 5,
                        alignItems: 'center',
                        flexDirection: 'row'
                    }}>
                        {/* Left view */}
                        <View
                            style={{
                                width: '10%',
                                height: 50,
                                alignItems: 'center',
                                //marginLeft: 5,
                                //justifyContent: 'center'
                            }}>
                            <View style={{
                                backgroundColor: item.QO_ANSWER_CWS_STRING == '' ? colors.lightgray :
                                    item.QO_ANSWER_CWS_STRING.toLowerCase() != item.QO_OPTIONS_DESC.toLowerCase() ? colors.red : 'green',
                                width: 30,
                                height: 30,
                                borderRadius: 30 / 2,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Text style={{
                                    fontSize: (dimensions.sizeRatio * 16),
                                    color: item.QO_STATUS ? colors.black : colors.white,
                                    fontFamily: CONSTANTS.DEMI,
                                }}>{index + 1}</Text>
                            </View>
                        </View>
                        {/* Right view */}
                        <View
                            style={{
                                width: '88%',
                                //marginLeft: 5
                            }}>
                            <Text style={{ bottom: 10, fontSize: (dimensions.sizeRatio * 15), textAlignVertical: "center", color: colors.black, fontFamily: CONSTANTS.DEMI }}>
                                {parentItem?.user_exam_answer != null && parentItem?.user_exam_answer?.UEA_ANSWER_CUSTIOM != '' ? parentItem?.user_exam_answer?.UEA_ANSWER_CUSTIOM : '--No Answer--'}
                            </Text>
                        </View>
                    </View>
                    <View
                        style={{
                            width: '100%',
                            //marginLeft: 5
                        }}>
                        <Text style={{ marginTop: 10, fontSize: (dimensions.sizeRatio * 16), textAlignVertical: "center", color: colors.black, fontFamily: CONSTANTS.DEMI }}>
                            {'CORRECT ANSWER: ' + item.QO_OPTIONS_DESC}
                        </Text>
                    </View>
                </View>
            )
        }
        else {
            return (
                <View style={{
                    width: '100%',
                    flexDirection: 'column'
                }}>
                    <View style={{
                        flexDirection: 'row',
                        width: '100%',
                        paddingVertical: 5,
                        justifyContent: 'center',
                    }}>
                        {/* Left view */}
                        <View
                            style={{
                                width: '10%',
                                height: 50,
                                alignItems: 'center',
                                //marginLeft: 5,
                                //justifyContent: 'center'
                            }}>
                            <View style={{
                                backgroundColor: parentItem.Q_TYPE == 3 ?
                                    (item.QO_ANSWER_CWS_STRING == null &&
                                        item.QO_ANSWER_CWS_STRING == '' ? colors.lightgray :
                                        item.QO_ANSWER_CWS_STRING.toLowerCase() != item.QO_OPTIONS_DESC.toLowerCase() ? colors.red : 'green')
                                    :
                                    (item.QO_ANSWER_CWS == null && item.QO_IS_CORRECT == 0 ? colors.lightgray :
                                        item.QO_ANSWER_CWS == item.QO_OPTIONS_NUMBER && item.QO_IS_CORRECT == 1 ? 'green' :
                                            item.QO_ANSWER_CWS == null && item.QO_IS_CORRECT == 1 ? 'green' :
                                                item.QO_IS_CORRECT == 1 ? 'green' :
                                                    colors.red),
                                width: 30,
                                height: 30,
                                borderRadius: 30 / 2,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Text style={{
                                    fontSize: (dimensions.sizeRatio * 16),
                                    color: item.QO_STATUS ? colors.black : colors.white,
                                    fontFamily: CONSTANTS.DEMI,
                                }}>{index + 1}</Text>
                            </View>
                        </View>
                        {/* Right view */}
                        <View
                            style={{
                                width: '88%',
                                //marginLeft: 5
                            }}>
                            <AnswerComponent
                                //heightMath={item?.QO_OPTIONS_DESC.length > 35 ? (parseInt(item?.QO_OPTIONS_DESC.length / 35) + 2) : 2}
                                heightMath={this.handleHeightAnswer(item?.QO_OPTIONS_DESC)}
                                question={item.QO_OPTIONS_DESC}
                                questionObj={item}
                                type={'html'}
                                navigation={this.props.navigation} />
                        </View>
                    </View>
                </View>
            )
        }
    }

    tabBarView = (isCorrect, isWrong, isSkip) => {
        return (
            <View
                style={{
                    width: '100%',
                    flexDirection: 'row',
                }}>
                {/* First view */}
                <TouchableOpacity
                    style={{
                        width: '33.33%',
                        padding: 10,
                        backgroundColor: isCorrect ? colors.theme : colors.white,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={() => {
                        this.setState({
                            isCorrect: true,
                            isWrong: false,
                            isSkip: false,
                            visibleArrayAtATime: this.state.correctArray
                        })
                    }}>
                    <Text style={{ fontSize: (dimensions.sizeRatio * 15), color: isCorrect ? colors.white : colors.theme, fontFamily: CONSTANTS.DEMI }}>
                        {'Correct'}
                    </Text>
                </TouchableOpacity>
                {/* Second view */}
                <TouchableOpacity
                    style={{
                        width: '33.33%',
                        padding: 10,
                        backgroundColor: isWrong ? colors.theme : colors.white,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={() => {
                        console.warn('WRONG', this.state.wrongArray)
                        this.setState({
                            isCorrect: false,
                            isWrong: true,
                            isSkip: false,
                            visibleArrayAtATime: this.state.wrongArray
                        })
                    }}>
                    <Text style={{ fontSize: (dimensions.sizeRatio * 15), color: isWrong ? colors.white : colors.theme, fontFamily: CONSTANTS.DEMI }}>
                        {'Wrong'}
                    </Text>
                </TouchableOpacity>
                {/* Third view */}
                <TouchableOpacity
                    style={{
                        width: '33.33%',
                        padding: 10,
                        backgroundColor: isSkip ? colors.theme : colors.white,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onPress={() => {
                        this.setState({
                            isCorrect: false,
                            isWrong: false,
                            isSkip: true,
                            visibleArrayAtATime: this.state.skipArray
                        })
                    }}>
                    <Text style={{ fontSize: (dimensions.sizeRatio * 15), color: isSkip ? colors.white : colors.theme, fontFamily: CONSTANTS.DEMI }}>
                        {'Skip'}
                    </Text>
                </TouchableOpacity>
            </View>
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
                    {'Review Test'}
                </Text>
            </View>
        )
    }
}




// parentItem.user_exam_answer !== null &&
//                                 parentItem.user_exam_answer?.UEA_ANSWER1 !== null &&
//                                 parentItem.user_exam_answer?.UEA_ANSWER1 === item.QO_OPTIONS_NUMBER ? 'green' :
//                                 parentItem.user_exam_answer !== null &&
//                                     parentItem.user_exam_answer?.UEA_ANSWER1 === null ? colors.lightgray :

//                                     parentItem.user_exam_answer !== null &&
//                                         parentItem.user_exam_answer?.UEA_ANSWER2 !== null &&
//                                         parentItem.user_exam_answer?.UEA_ANSWER2 === item.QO_OPTIONS_NUMBER ? 'green' :
//                                         parentItem.user_exam_answer !== null &&
//                                             parentItem.user_exam_answer?.UEA_ANSWER2 === null ? colors.lightgray :

//                                             parentItem.user_exam_answer !== null &&
//                                                 parentItem.user_exam_answer?.UEA_ANSWER3 !== null &&
//                                                 parentItem.user_exam_answer?.UEA_ANSWER3 === item.QO_OPTIONS_NUMBER ? 'green' :
//                                                 parentItem.user_exam_answer !== null &&
//                                                     parentItem.user_exam_answer?.UEA_ANSWER3 === null ? colors.lightgray :

//                                                     parentItem.user_exam_answer !== null &&
//                                                         parentItem.user_exam_answer?.UEA_ANSWER4 !== null &&
//                                                         parentItem.user_exam_answer?.UEA_ANSWER4 === item.QO_OPTIONS_NUMBER ? 'green' :
//                                                         parentItem.user_exam_answer !== null &&
//                                                             parentItem.user_exam_answer?.UEA_ANSWER4 === null ? colors.lightgray : colors.lightgray,