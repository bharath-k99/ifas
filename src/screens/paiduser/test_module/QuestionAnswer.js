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
    ImageBackground, TextInput, Keyboard, Dimensions
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
import ArrowButton from 'react-native-vector-icons/Ionicons';
import ClipboardIcon from 'react-native-vector-icons/FontAwesome5';
const backButton = <BackButton name="arrow-back" size={28} color={colors.white} />;
const rightTickButton = <BackButton name="check" size={24} color={colors.white} />;
const clipboardIcon = <ClipboardIcon name="clipboard-list" size={28} color={colors.white} />;

const arrowLeftButton = <ArrowButton name="arrow-back" size={24} color={colors.black} />;
const arrowRightButton = <ArrowButton name="chevron-forward" size={24} color={colors.black} />;
const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

// Question
import QuestionComponent from './components/AllWithTypeQuestion';
import AnswerComponent from './components/AllWithTypeAnswer';

let selectSubmitAnswerItem = undefined;
let timeoutVariable = null;
export default class QuestionAnswer extends Component {

    //Navigation Method
    isSessionFocus = false
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            access_token: '',
            isRecording: false,
            isRecording: '',
            timeFormate: '00:00:00',
            seconds: 0,
            savedSeconds: 0,
            questionApiResponse: undefined,
            answerArray: [],
            // 19 AUG 2021
            bottomAnswerArray: [],
            questionArrayCount: 0,
            countOfPositionQue: 1,
            selectedQuestionObj: undefined,
            userProfileData: undefined,
            txtAnswer: '',
            //handle multiple questions
            /*types: ˛html, htmlwithimage, htmlwithimagehtml */
            // 1 = singleSelection, 2 = Multi, 3 = Textfiled
            isQuestionAnswerFlag: 'html',
            submitAnswerArray: [{
                "q_no": 1,
                "ans_no1": 0,
                "ans_no2": 1,
                "ans_no3": 0,
                "ans_no4": 0,
                "ans_custom": "my str",
                "is_correct": 1
            }],
            scrollViewWidth: 0,
            currentXOffset: 0,
            //is type 3 test input answer given by user but not done and next then using this state value
            isTextBeforeSubmit: false
        };
    }

    componentDidMount() {
        Orientation.lockToPortrait();
        this.getAccessToken()
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick = () => {

        Alert.alert(
            'Confirm Stop Test',
            'Do you want to exit from exam?',
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                {
                    text: 'OK', onPress: () => {
                        if (timeoutVariable !== null) {
                            clearTimeout(timeoutVariable);
                        }
                        global.isChatLiveSessionVisible = true;
                        const resetAction = StackActions.reset({
                            index: 0,
                            actions: [NavigationActions.navigate({ routeName: 'NavigationTab' })],
                        });
                        this.props.navigation.dispatch(resetAction);

                        //this.props.navigation.goBack();
                    }
                },
            ],
            { cancelable: false }
        )
        return true;
    }

    getAccessToken() {
        let self = this;
        AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
            if (value !== null) {
                console.log('VALUE:' + value)
                self.setState({
                    access_token: value.slice(1, -1),
                }, () => {
                    self.setState({
                        isLoading: true
                    })
                    self.getQuestionAnswerApi()
                })

            } else {
                // showNativeAlert('Not logged-In')
            }
        })
    }

    getQuestionAnswerApi() {
        const formData = new FormData();
        formData.append('access_token', this.state.access_token);
        formData.append('exam_set_id', this.props.navigation.state.params.selected_item.EXAM_SET_ID);
        //formData.append('user_exam_id', 1);
        console.warn('request_question', this.props.navigation.state.params.selected_item.EXAM_SET_ID, formData)

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
                    this.setState({
                        isLoading: false
                    })
                    if (responseJson.data[0]?.questions.length != 0) {
                        // 19 Aug 2021
                        //this.bottomArrayAddKeyAfterGetQue(responseJson.data[0]?.questions, true)
                        this.setState({
                            isLoading: false,
                            answerArray: responseJson.data[0]?.questions,
                            questionArrayCount: responseJson.data[0]?.questions.length,
                            selectedQuestionObj: responseJson.data[0]?.questions[0],
                            questionApiResponse: responseJson.data[0],
                            seconds: Number(responseJson.data[0].ES_DURATION),
                            savedSeconds: Number(responseJson.data[0].ES_DURATION),
                            //seconds: 1000,
                            //savedSeconds: 1000,
                        }, () => {
                            this.callTimerAndTick(responseJson)
                        });

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
                    // 19 aug 2021
                    bottomAnswerArray: [],
                    isLoading: false,
                    errorMessage: 'Failed to fetch your subjects.'
                })
            });
    }

    callTimerAndTick = (responseJson) => {
        this.timeFormatter(responseJson.data[0].ES_DURATION)
        this.tick()
    }

    timeFormatter = (seconds) => {
        const d = Number(seconds);
        const h = Math.floor(d / 3600);
        const m = Math.floor((d % 3600) / 60);
        const s = Math.floor((d % 3600) % 60);
        const hDisplay = h > 0 ? `${h.toString().length > 1 ? `${h}` : `${0}${h}`}` : '00';
        const mDisplay = m > 0 ? `${m.toString().length > 1 ? `${m}` : `${0}${m}`}` : '00';
        const sDisplay = s > 0 ? `${s.toString().length > 1 ? `${s}` : `${0}${s}`}` : '00';

        this.setState({
            timeFormate: `${hDisplay}:${mDisplay}:${sDisplay}`
        }, () => {
            //console.warn('TIMEFORMATE', this.state.timeFormate)
        })
    }

    tick = () => {
        if (this.state.seconds !== undefined) {

            for (var i = 1; i <= this.state.savedSeconds; i++) {
                timeoutVariable = setTimeout(() => {
                    //do your stuff here
                    if (this.state.seconds > 1) {
                        this.setState(prevState => ({
                            seconds: prevState.seconds - 1
                        }), () => {
                            this.timeFormatter(this.state.seconds);
                        });
                    } else {
                        clearTimeout(timeoutVariable);
                        this.finalSubmitAnswer();
                    }
                }, i * 1000);
            }
        }

        // this.interval = setInterval(() => {
        //     if (this.state.seconds >= 1) {
        //         this.setState(prevState => ({
        //             seconds: prevState.seconds - 1
        //         }), () => {
        //             this.timeFormatter(this.state.seconds);
        //         });
        //     } else {
        //         clearInterval(this.interval);
        //         this.finalSubmitAnswer()
        //     }
        // }, 1000);
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
                    //console.warn('PROFILE_DATA', responseJson.data.User)
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
        alert(CONSTANTS.LOGOUT_MESSAGE)
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

    // handleBackButtonClick = () => {
    //     if (timeoutVariable !== null) {
    //         clearTimeout(timeoutVariable);
    //     }
    //     global.isChatLiveSessionVisible = true;
    //     this.props.navigation.goBack();
    //     return true;
    // }

    nextPreviousQueHandler = (type) => {
        if (type === 'next') {

            //Bellow method for type 3 (Textinput ) when user give answer without click submit then answer automatically saved
            if (this.state.selectedQuestionObj !== undefined && this.state.selectedQuestionObj.Q_TYPE === 3) {
                this.submitAnswer(selectSubmitAnswerItem, this.state.selectedQuestionObj.Q_TYPE)
            }
            if (this.state.selectedQuestionObj !== undefined && this.state.selectedQuestionObj.Q_TYPE === 1) {
                this.bottomArrayAddKeyAfterGetQue(selectSubmitAnswerItem, this.state.selectedQuestionObj.Q_TYPE)
            }
            if (this.state.selectedQuestionObj !== undefined && this.state.selectedQuestionObj.Q_TYPE === 2) {
                this.bottomArrayAddKeyAfterGetQue(selectSubmitAnswerItem, this.state.selectedQuestionObj.Q_TYPE)
            }


            if (this.state.countOfPositionQue < this.state.answerArray.length) {
                let queArray = this.state.answerArray;
                this.setState({
                    countOfPositionQue: this.state.countOfPositionQue + 1,
                    selectedQuestionObj: queArray[Number(this.state.countOfPositionQue)],
                })
                // saved type 3 textAnswer
                if (queArray[Number(this.state.countOfPositionQue)].Q_TYPE === 3) {
                    let answerWritten = queArray[Number(this.state.countOfPositionQue)]?.question_options[0].QO_STATUS === 0 ?
                        queArray[Number(this.state.countOfPositionQue)]?.question_options[0].QO_ANSWER_WRITTEN : '';
                    console.warn('NEXT_TEXTINPUT', answerWritten);
                    this.setState({
                        txtAnswer: queArray[Number(this.state.countOfPositionQue)]?.question_options[0].QO_STATUS === 0 ?
                            queArray[Number(this.state.countOfPositionQue)]?.question_options[0].QO_ANSWER_WRITTEN : ''
                    })
                }
            }
        } else {
            if (this.state.countOfPositionQue > 1) {
                let queArray = this.state.answerArray;
                this.setState({
                    countOfPositionQue: this.state.countOfPositionQue - 1,
                    selectedQuestionObj: queArray[Number(this.state.countOfPositionQue - 2)],

                })
                // saved type 3 textAnswer
                if (queArray[Number(this.state.countOfPositionQue - 2)].Q_TYPE === 3) {
                    let answerWritten = queArray[Number(this.state.countOfPositionQue - 2)]?.question_options[0].QO_STATUS === 0 ?
                        queArray[Number(this.state.countOfPositionQue - 2)]?.question_options[0].QO_ANSWER_WRITTEN : '';
                    console.warn('PREVIOUS_TEXTINPUT', answerWritten);
                    this.setState({
                        txtAnswer: queArray[Number(this.state.countOfPositionQue - 2)]?.question_options[0].QO_STATUS === 0 ?
                            queArray[Number(this.state.countOfPositionQue - 2)]?.question_options[0].QO_ANSWER_WRITTEN : ''
                    })
                }
            }
        }
    }
    //Bottom count item click
    roundBottomClick = (item, index) => {

        let queArray = this.state.answerArray;
        // 24 AUG 2021
        //Bellow method for type 3 (Textinput ) when user give answer without click submit then answer automatically saved
        if (this.state.selectedQuestionObj !== undefined && this.state.selectedQuestionObj.Q_TYPE === 3) {
            this.submitAnswer(selectSubmitAnswerItem, this.state.selectedQuestionObj.Q_TYPE)
        }
        if (this.state.selectedQuestionObj !== undefined && this.state.selectedQuestionObj.Q_TYPE === 1) {
            this.bottomArrayAddKeyAfterGetQue(selectSubmitAnswerItem, this.state.selectedQuestionObj.Q_TYPE)
        }
        if (this.state.selectedQuestionObj !== undefined && this.state.selectedQuestionObj.Q_TYPE === 2) {
            this.bottomArrayAddKeyAfterGetQue(selectSubmitAnswerItem, this.state.selectedQuestionObj.Q_TYPE)
        }

        this.setState({
            countOfPositionQue: index + 1,
            selectedQuestionObj: queArray[Number(index)]
        });
        if (queArray[Number(index)].Q_TYPE === 3) {
            this.setState({
                txtAnswer: queArray[Number(index)]?.question_options[0].QO_STATUS === 0 ?
                    queArray[Number(index)]?.question_options[0].QO_ANSWER_WRITTEN : ''
            })
        }
    }

    callSubmitAnswerApi(answerArray, finalSubForScoreArray) {
        let formObj = {
            access_token: this.state.access_token,
            user_exam_id: this.props.navigation.state.params.data.UE_ID,
            answer: answerArray,
        }
        //console.warn('REQUEST_DATA1', formObj)
        const formData = new FormData();
        // for (const [key, value] of Object.entries(formObj)) {
        //     formData.append(`${key}`, value);
        // }
        formData.append('access_token', this.state.access_token);
        //formData.append('exam_set_id', 11);
        formData.append('user_exam_id', this.props.navigation.state.params.data.UE_ID);
        // for (var itemIndex in answerArray) {
        //         var keyName = 'answer[' + itemIndex + ']';
        //         formData.append(keyName, answerArray[itemIndex]);
        //         //console.log('data[key][itemIndex] Key: '+JSON.stringify(formData))
        //     }
        formData.append('answer', JSON.stringify(answerArray));
        console.warn('request_Submit_Ans', formData)
        fetch(CONSTANTS.BASE + CONSTANTS.POST_TEST_SAVE_ANSWER, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data',
                //'Content-Type': 'multipart/form-data',
            },
            body: formData,
        }).then((response) => response.json())
            .then((responseJson) => {
                console.warn('RESPONSE_Submit_Ans', responseJson)

                if (responseJson.code == 201) {
                    this.removeItemValue('ACCESS_TOKEN')
                } else {
                    console.warn('SUBMIT_DATA', this.props.navigation.state.params.data)
                    this.props.navigation.navigate('ScoreBoard',
                        {
                            answer_array: finalSubForScoreArray,
                            response_array: responseJson,
                            total_time: this.state.questionApiResponse,
                            obtainTime: this.state.seconds,
                            selected_item: this.props.navigation.state.params.data
                        })
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
    // 19 aug 2021 bottom array functionality, handle user view question answer or not
    bottomArrayAddKeyAfterGetQue = (item, type) => {
        const { selectedQuestionObj } = this.state;
        let queAnsArray = this.state.answerArray;
        for (let index = 0; index < queAnsArray.length; index++) {
            const element = queAnsArray[index];
            if (selectedQuestionObj.Q_ID === element.Q_ID) {
                element.IS_VISIBLE_BY_USER = true;
            }
        }
        setTimeout(() => {
            this.setState({
                answerArray: [...queAnsArray],
            })
        }, 100);
    }

    submitAnswer = (item, type) => {
        const { selectedQuestionObj } = this.state;
        let queAnsArray = this.state.answerArray;
        if (type === 1) {
            //Single selection for loop
            for (let index = 0; index < selectedQuestionObj.question_options.length; index++) {
                const element = selectedQuestionObj.question_options[index];
                if (item.QO_OPTIONS_NUMBER === element.QO_OPTIONS_NUMBER) {
                    element.QO_STATUS = 0
                } else {
                    element.QO_STATUS = 1
                }
            }

            for (let index = 0; index < queAnsArray.length; index++) {
                const element = queAnsArray[index];
                if (selectedQuestionObj.Q_ID === element.Q_ID) {
                    element.question_options = selectedQuestionObj.question_options
                    element.is_selected = true
                    element.IS_VISIBLE_BY_USER = true;
                }
            }

            setTimeout(() => {
                this.setState({
                    answerArray: [...queAnsArray]
                })
            }, 500);
        } else if (type === 2) {
            for (let index = 0; index < selectedQuestionObj.question_options.length; index++) {
                const element = selectedQuestionObj.question_options[index];
                if (item.QO_OPTIONS_NUMBER === element.QO_OPTIONS_NUMBER) {
                    element.QO_STATUS = item.QO_STATUS === 0 ? 1 : 0
                }
            }

            for (let index = 0; index < queAnsArray.length; index++) {
                const element = queAnsArray[index];
                if (selectedQuestionObj.Q_ID === element.Q_ID) {
                    //Here check in multi selection answer of type 2, if one answer has selected by user 
                    //then element.is_selected is true other wise is false or undefined
                    let isSingleSelInMultiArr = false;
                    for (let index = 0; index < selectedQuestionObj.question_options.length; index++) {
                        const element = selectedQuestionObj.question_options[index];
                        if (element.QO_STATUS === 0) {
                            isSingleSelInMultiArr = true
                        }
                    }

                    element.question_options = selectedQuestionObj.question_options
                    element.is_selected = isSingleSelInMultiArr
                    if (isSingleSelInMultiArr) {
                        element.IS_VISIBLE_BY_USER = true;
                    } else {
                        element.IS_VISIBLE_BY_USER = false;
                    }
                }
            }

            setTimeout(() => {
                this.setState({
                    answerArray: [...queAnsArray]
                })
            }, 500);
        } else {
            let WrittenAnswer = this.state.txtAnswer;
            if (WrittenAnswer !== '') {
                //Answer written by user in text input of type 3
                for (let index = 0; index < selectedQuestionObj.question_options.length; index++) {
                    const element = selectedQuestionObj.question_options[index];
                    element.QO_STATUS = 0;
                    element.QO_ANSWER_WRITTEN = WrittenAnswer;
                }
                for (let index = 0; index < queAnsArray.length; index++) {
                    const element = queAnsArray[index];
                    if (selectedQuestionObj.Q_ID === element.Q_ID) {
                        element.question_options = selectedQuestionObj.question_options
                        element.is_selected = true;
                        element.IS_VISIBLE_BY_USER = true;
                    }
                }

                setTimeout(() => {
                    this.setState({
                        answerArray: [...queAnsArray],
                        //txtAnswer: ''
                    })
                }, 500);
            } else {
                //Answer written by user in text input of type 3
                for (let index = 0; index < selectedQuestionObj.question_options.length; index++) {
                    const element = selectedQuestionObj.question_options[index];
                    element.QO_STATUS = 1;
                    element.QO_ANSWER_WRITTEN = '';
                }

                for (let index = 0; index < queAnsArray.length; index++) {
                    const element = queAnsArray[index];
                    if (selectedQuestionObj.Q_ID === element.Q_ID) {
                        element.question_options = selectedQuestionObj.question_options
                        element.is_selected = false
                        element.IS_VISIBLE_BY_USER = false;
                    }
                }

                setTimeout(() => {
                    this.setState({
                        answerArray: [...queAnsArray],
                        txtAnswer: ''
                    })
                }, 500);
            }
        }
        setTimeout(() => {
            if (this.state.isTextBeforeSubmit === true) {
                this.finalSubmitAnswer()
                this.setState({
                    isTextBeforeSubmit: false
                })
            }
        }, 500)
    }

    finalSubmitAnswer = () => {
        let queAnsArray = this.state.answerArray;
        let finalSubmitArray = [];
        let finalSubForScoreArray = [];
        // "q_no": 1,
        // "ans_no1": 0,
        // "ans_no2": 1,
        // "ans_no3": 0,
        // "ans_no4": 0,
        // "ans_custom": "my str",
        // "is_correct": 1
        for (let index = 0; index < queAnsArray.length; index++) {
            const element = queAnsArray[index];
            let queNo = 0;
            let ansNo1 = 0;
            let ansNo2 = 0;
            let ansNo3 = 0;
            let ansNo4 = 0;
            let ansCustom = '';
            let isCorrect = 0;
            let isCorrectMulti = 1;
            let typeCorrect = 0;
            queNo = element.Q_ID;
            let attemptAnswer = 0;
            let worngAnswer = 0;
            let ansStatus = 1;

            for (let j = 0; j < element.question_options.length; j++) {
                const elementJ = element.question_options[j];
                if (element.Q_TYPE === 1) {
                    if (j === 0) {
                        ansNo1 = elementJ.QO_STATUS === 0 ? elementJ.QO_OPTIONS_NUMBER : 0;
                    }
                    else if (j === 1) {
                        ansNo2 = elementJ.QO_STATUS === 0 ? elementJ.QO_OPTIONS_NUMBER : 0;
                    }
                    else if (j === 2) {
                        ansNo3 = elementJ.QO_STATUS === 0 ? elementJ.QO_OPTIONS_NUMBER : 0;
                    }
                    else if (j === 3) {
                        ansNo4 = elementJ.QO_STATUS === 0 ? elementJ.QO_OPTIONS_NUMBER : 0;
                    }

                    if (elementJ.QO_IS_CORRECT === 1 && elementJ.QO_STATUS === 0) {
                        isCorrect = 1;
                        worngAnswer = 0;
                        attemptAnswer = 1;
                        // skip handling 4 oct 21
                        ansStatus = 4;
                    }
                    //ATTENPT  WRONG
                    else if (elementJ.QO_IS_CORRECT === 0 && elementJ.QO_STATUS === 0) {
                        worngAnswer = 1;
                        attemptAnswer = 1;
                        // skip handling 4 oct 21
                        ansStatus = 4;
                    }
                } else if (element.Q_TYPE === 2) {
                    if (j === 0) {
                        ansNo1 = elementJ.QO_STATUS === 0 ? elementJ.QO_OPTIONS_NUMBER : 0;
                    }
                    if (j === 1) {
                        ansNo2 = elementJ.QO_STATUS === 0 ? elementJ.QO_OPTIONS_NUMBER : 0;
                    }
                    if (j === 2) {
                        ansNo3 = elementJ.QO_STATUS === 0 ? elementJ.QO_OPTIONS_NUMBER : 0;
                    }
                    if (j === 3) {
                        ansNo4 = elementJ.QO_STATUS === 0 ? elementJ.QO_OPTIONS_NUMBER : 0;
                    }
                    if (elementJ.QO_IS_CORRECT === 1) {
                        if (elementJ.QO_STATUS === 0) {
                            typeCorrect = 1;
                            attemptAnswer = 1;
                            // skip handling 4 oct 21
                            ansStatus = 4;
                        } else if (elementJ.QO_STATUS === 1) {
                            typeCorrect = 0;
                            // skip handling 4 oct 21
                            //ansStatus = 4;
                        }
                    } else {
                        if (elementJ.QO_STATUS === 0) {
                            typeCorrect = 0;
                            worngAnswer = 1;
                            attemptAnswer = 1;
                            // skip handling 4 oct 21
                            ansStatus = 4;
                        }
                    }
                    isCorrect = typeCorrect
                }
                else if (element.Q_TYPE === 3) {
                    if (j === 0) {
                        ansNo1 = elementJ.QO_STATUS === 0 ? elementJ.QO_OPTIONS_NUMBER : 0;
                        ansCustom = elementJ.QO_STATUS === 0 ? elementJ.QO_ANSWER_WRITTEN : '';
                        if (elementJ.QO_STATUS === 0 && elementJ.QO_ANSWER_WRITTEN != '' && elementJ.QO_OPTIONS_DESC.toLowerCase() == elementJ.QO_ANSWER_WRITTEN.toLowerCase()) {
                            isCorrect = 1;
                            worngAnswer = 0;
                            attemptAnswer = 1;
                            // skip handling 4 oct 21
                            ansStatus = 4;
                        }
                        // ATTENPT  WRONG
                        else if (elementJ.QO_STATUS === 0 && elementJ.QO_ANSWER_WRITTEN != '' && elementJ.QO_OPTIONS_DESC.toLowerCase() != elementJ.QO_ANSWER_WRITTEN.toLowerCase()) {
                            worngAnswer = 1;
                            attemptAnswer = 1;
                            // skip handling 4 oct 21
                            ansStatus = 4;
                        } else {
                            worngAnswer = 0;
                            attemptAnswer = 0;
                        }
                    }
                }
            }
            finalSubmitArray.push(
                {
                    "q_no": queNo,
                    "ans_no1": ansNo1,
                    "ans_no2": ansNo2,
                    "ans_no3": ansNo3,
                    "ans_no4": ansNo4,
                    "ans_custom": ansCustom,
                    "is_correct": isCorrect,
                    "ans_status": ansStatus,
                }
            );
            finalSubForScoreArray.push(
                {
                    "q_no": queNo,
                    "ans_no1": ansNo1,
                    "ans_no2": ansNo2,
                    "ans_no3": ansNo3,
                    "ans_no4": ansNo4,
                    "ans_custom": ansCustom,
                    "is_correct": isCorrect,
                    "attempt": attemptAnswer,
                    "wrong": worngAnswer
                }
            )
        }

        setTimeout(() => {
            //console.warn('Coreect answer Array', finalSubForScoreArray);
            this.callSubmitAnswerApi(finalSubmitArray, finalSubForScoreArray)
        }, 500);
    }

    handleHeightQueAnswer = (selectedQuestionObj, cou) => {
        // let value = (this.state.selectedQuestionObj && this.state.selectedQuestionObj?.Q_QUESTION.length > 35 ? 
        // (parseInt(this.state.selectedQuestionObj?.Q_QUESTION.length / 45) + 2) : 2);
        let finalLineCount = 0;
        if (selectedQuestionObj && selectedQuestionObj.length > 35) {
            let lineCount = selectedQuestionObj.length / cou;
            if (lineCount <= 10) {
                finalLineCount = lineCount + 2;
            } else if (lineCount >= 10 && lineCount < 15) {
                finalLineCount = lineCount + 2.5;
            } else if (lineCount >= 15 && lineCount < 20) {
                finalLineCount = lineCount + 2.5;
            } else if (lineCount >= 20 && lineCount < 25) {
                finalLineCount = lineCount + 2.5;
            } else if (lineCount >= 25 && lineCount < 30) {
                finalLineCount = lineCount - 1.5;
            } else if (lineCount >= 30 && lineCount < 35) {
                finalLineCount = lineCount - 1;
            } else if (lineCount >= 35 && lineCount < 40) {
                finalLineCount = lineCount - 2.5;
            } else if (lineCount >= 40 && lineCount < 45) {
                finalLineCount = lineCount - 3;
            } else if (lineCount >= 45 && lineCount < 50) {
                finalLineCount = lineCount - 5;
            } else if (lineCount >= 50 && lineCount < 55) {
                finalLineCount = lineCount - 7;
            } else if (lineCount >= 55 && lineCount < 60) {
                finalLineCount = lineCount - 8;
            } else if (lineCount >= 60 && lineCount < 65) {
                finalLineCount = lineCount - 9;
            } else if (lineCount >= 65 && lineCount < 70) {
                finalLineCount = lineCount - 12;
            } else if (lineCount >= 70 && lineCount < 75) {
                finalLineCount = lineCount - 12;
            } else if (lineCount >= 75 && lineCount < 80) {
                finalLineCount = lineCount - 10;
            } else if (lineCount >= 80 && lineCount < 85) {
                finalLineCount = lineCount - 10;
            } else if (lineCount >= 85 && lineCount < 90) {
                finalLineCount = lineCount - 10;
            } else if (lineCount >= 90 && lineCount < 95) {
                finalLineCount = lineCount - 10;
            } else if (lineCount >= 95 && lineCount < 100) {
                finalLineCount = lineCount - 10;
            } else if (lineCount >= 100 && lineCount < 105) {
                finalLineCount = lineCount - 10;
            } else if (lineCount >= 105 && lineCount < 110) {
                finalLineCount = lineCount - 11;
            } else if (lineCount >= 110 && lineCount < 115) {
                finalLineCount = lineCount - 11;
            } else if (lineCount >= 115 && lineCount < 120) {
                finalLineCount = lineCount - 11;
            } else if (lineCount >= 125 && lineCount < 130) {
                finalLineCount = lineCount - 11;
            } else if (lineCount >= 130 && lineCount < 135) {
                finalLineCount = lineCount - 11;
            } else if (lineCount >= 135 && lineCount < 140) {
                finalLineCount = lineCount - 11;
            } else if (lineCount >= 140 && lineCount < 145) {
                finalLineCount = lineCount - 11;
            } else if (lineCount >= 145 && lineCount < 150) {
                finalLineCount = lineCount - 12;
            }
        } else {
            finalLineCount = 2;
        }
        return finalLineCount;
    }


    handleHeightAnswer = (selectedQuestionObj, cou) => {
        // let value = (this.state.selectedQuestionObj && this.state.selectedQuestionObj?.Q_QUESTION.length > 35 ? 
        // (parseInt(this.state.selectedQuestionObj?.Q_QUESTION.length / 45) + 2) : 2);
        let finalLineCount = 0;
        if (selectedQuestionObj && selectedQuestionObj.length > 35) {
            let lineCount = selectedQuestionObj.length / cou;
            if (lineCount <= 10) {
                finalLineCount = lineCount + 3;
            } else if (lineCount >= 10 && lineCount < 15) {
                finalLineCount = lineCount + 3.5;
            } else if (lineCount >= 15 && lineCount < 20) {
                finalLineCount = lineCount + 3.5;
            } else if (lineCount >= 20 && lineCount < 25) {
                finalLineCount = lineCount + 3.5;
            } else if (lineCount >= 25 && lineCount < 30) {
                finalLineCount = lineCount + 4.5;
            } else if (lineCount >= 30 && lineCount < 35) {
                finalLineCount = lineCount + 4;
            } else if (lineCount >= 35 && lineCount < 40) {
                finalLineCount = lineCount - 1;
            } else if (lineCount >= 40 && lineCount < 45) {
                finalLineCount = lineCount - 2;
            } else if (lineCount >= 45 && lineCount < 50) {
                finalLineCount = lineCount - 6;
            } else if (lineCount >= 50 && lineCount < 55) {
                finalLineCount = lineCount - 6.5;
            } else if (lineCount >= 55 && lineCount < 60) {
                finalLineCount = lineCount - 6.7;
            } else if (lineCount >= 60 && lineCount < 65) {
                finalLineCount = lineCount - 7;
            } else if (lineCount >= 65 && lineCount < 70) {
                finalLineCount = lineCount - 7.5;
            } else if (lineCount >= 70 && lineCount < 75) {
                finalLineCount = lineCount - 9;
            } else if (lineCount >= 75 && lineCount < 80) {
                finalLineCount = lineCount - 9;
            } else if (lineCount >= 80 && lineCount < 85) {
                finalLineCount = lineCount - 10;
            } else if (lineCount >= 85 && lineCount < 90) {
                finalLineCount = lineCount - 11;
            } else if (lineCount >= 90 && lineCount < 95) {
                finalLineCount = lineCount - 12;
            } else if (lineCount >= 95 && lineCount < 100) {
                finalLineCount = lineCount - 13;
            } else if (lineCount >= 100 && lineCount < 105) {
                finalLineCount = lineCount - 14;
            } else if (lineCount >= 105 && lineCount < 110) {
                finalLineCount = lineCount - 14;
            } else if (lineCount >= 110 && lineCount < 115) {
                finalLineCount = lineCount - 15;
            } else if (lineCount >= 115 && lineCount < 120) {
                finalLineCount = lineCount - 15;
            } else if (lineCount >= 125 && lineCount < 130) {
                finalLineCount = lineCount - 16;
            } else if (lineCount >= 130 && lineCount < 135) {
                finalLineCount = lineCount - 16;
            } else if (lineCount >= 135 && lineCount < 140) {
                finalLineCount = lineCount - 17;
            } else if (lineCount >= 140 && lineCount < 145) {
                finalLineCount = lineCount - 17;
            } else if (lineCount >= 145 && lineCount < 150) {
                finalLineCount = lineCount - 18;
            }
        } else {
            finalLineCount = 2;
        }
        return finalLineCount;
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
                    {this.renderHeader(this.state.timeFormate)}
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
                        <Text style={{ fontSize: 16, fontFamily: CONSTANTS.DEMI, color: colors.white, textAlign: 'center' }}>
                            {`Question: ${this.state.countOfPositionQue}/${this.state.questionArrayCount}`}
                            {/* {'Question: 4/10'} */}
                        </Text>
                        {this.state.selectedQuestionObj !== undefined &&
                            <Text style={{ fontSize: 14, fontFamily: CONSTANTS.DEMI, color: colors.white, textAlign: 'center', marginTop: 2 }}>
                                {this.state.selectedQuestionObj.Q_TYPE === 3 ? 'NAT' : this.state.selectedQuestionObj.Q_TYPE === 1 ? 'MCQ' : 'MSQ'}
                            </Text>
                        }
                    </View>
                    <View style={{
                        flex: 1,
                        width: '100%',
                        backgroundColor: colors.white
                    }}>
                        <ScrollView
                            style={{
                                flex: 1
                            }}>
                            <View style={{
                                flex: 1,
                                width: '100%',
                                padding: 15
                            }}>
                                {/* Handle question view (4 views showing here according to condition) */}
                                {this.state.selectedQuestionObj !== undefined ?
                                    <QuestionComponent
                                        //heightMath={this.state.selectedQuestionObj && this.state.selectedQuestionObj?.Q_QUESTION.length > 35 ? (parseInt(this.state.selectedQuestionObj?.Q_QUESTION.length / 45) + 2) : 2}
                                        heightMath={this.handleHeightQueAnswer(this.state.selectedQuestionObj?.Q_QUESTION, 42)}
                                        heightSecondMath={this.state.selectedQuestionObj?.Q_QUESTION_EXTRA != null &&
                                            this.state.selectedQuestionObj?.Q_QUESTION_EXTRA != '' ? (this.handleHeightQueAnswer(this.state.selectedQuestionObj?.Q_QUESTION_EXTRA, 42) + 1.5) : 0}
                                        question={this.state.selectedQuestionObj?.Q_QUESTION}
                                        questionObj={this.state.selectedQuestionObj}
                                        type={this.state.isQuestionAnswerFlag}
                                        navigation={this.props.navigation} />
                                    :
                                    null
                                }
                                {this.state.selectedQuestionObj !== undefined && this.state.selectedQuestionObj.question_options.length !== 0 ?
                                    <View style={{
                                        flex: 1,
                                        paddingBottom: 10
                                    }}>
                                        <FlatList
                                            showsVerticalScrollIndicator={false}
                                            scrollEnabled={false}
                                            data={this.state.selectedQuestionObj.question_options}
                                            renderItem={({ item, index }) => this.renderAswerItem(item, index)}
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
                            </View>
                        </ScrollView>
                        {/* Bottom view */}
                        <View
                            style={{
                                width: '100%',
                                marginBottom: 10
                            }}>
                            {/* Next & PREVIOUS Button */}
                            <View
                                style={{
                                    width: '100%',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: 10
                                }}>
                                <TouchableOpacity
                                    style={{
                                        width: 150,
                                        height: 50,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: this.state.countOfPositionQue > 1 ? colors.theme : colors.gray,
                                        borderRadius: 5
                                    }}
                                    onPress={() => {
                                        if (this.state.countOfPositionQue > 1) {
                                            this.nextPreviousQueHandler('previous')
                                            this.previousPress()
                                        }
                                    }}>
                                    <Text style={{ fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 18, color: colors.white }}>PREVIOUS</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{
                                        width: 150,
                                        height: 50,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: this.state.countOfPositionQue < this.state.answerArray.length ? colors.theme : colors.gray,
                                        borderRadius: 5
                                    }}
                                    onPress={() => {
                                        if (this.state.countOfPositionQue < this.state.answerArray.length) {
                                            this.nextPreviousQueHandler('next')
                                            this.nextPress()
                                        }
                                    }}>
                                    <Text style={{ fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 18, color: colors.white }}>NEXT</Text>
                                </TouchableOpacity>
                            </View>
                            {/* Bottom Horizontal View */}
                            <View
                                style={{
                                    width: '100%',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: 10
                                }}>
                                {/* Left Press */}
                                <TouchableOpacity
                                    style={{
                                        width: '10%',
                                        height: 50,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onPress={() => {
                                        //this.scroll.scrollTo({ x: 1 })
                                        this.leftArrow()
                                    }}>
                                    <Image
                                        style={{
                                            width: 17,
                                            height: 20,
                                            tintColor: colors.black
                                        }}
                                        resizeMode={'contain'}
                                        source={require('../../../images/back.png')}
                                    />
                                </TouchableOpacity>
                                {/* Center Hori View */}
                                <ScrollView
                                    ref={(node) => this.scroll = node}
                                    style={{
                                        width: '80%',
                                        height: 50,
                                    }}
                                    horizontal={true}
                                    pagingEnabled={true}
                                    onContentSizeChange={(w, h) => this.setState({ scrollViewWidth: w })}
                                    scrollEventThrottle={16}
                                    scrollEnabled={true} // remove if you want user to swipe
                                    onScroll={this._handleScroll}>
                                    {/* this.state.answerArray */}
                                    {this.state.answerArray.length !== 0 &&
                                        this.state.answerArray.map((item, index) =>
                                            <TouchableOpacity
                                                activeOpacity={.9}
                                                style={{
                                                    width: 35,
                                                    height: 35,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    // backgroundColor: index === 0 || index === 1 ? '#C5E5DD' : index === 2 ? '#14A27B' : '#ffffff',
                                                    // borderColor: index === 2 || index === 3 ? '#CCCCCC' : 'transparent',
                                                    //backgroundColor: '#14A27B',
                                                    //borderColor: '#CCCCCC',
                                                    //backgroundColor: item.is_selected !== undefined && item.is_selected ? '#14A27B' : "#CCCCCC",
                                                    //skip color : #b3b300
                                                    backgroundColor: item.is_selected === undefined && item.IS_VISIBLE_BY_USER === undefined ? '#CCCCCC'
                                                        : item.is_selected === undefined && item.IS_VISIBLE_BY_USER === true ? '#b3b300'
                                                            : item.Q_TYPE === 2 && item.is_selected === false && item.IS_VISIBLE_BY_USER === false ? '#b3b300'
                                                                : item.Q_TYPE === 3 && item.is_selected === undefined && item.IS_VISIBLE_BY_USER === undefined ? '#CCCCCC'
                                                                    : item.Q_TYPE === 3 && item.is_selected === false && item.IS_VISIBLE_BY_USER === false ? '#b3b300'
                                                                        : item.Q_TYPE === 3 && item.is_selected === true && item.IS_VISIBLE_BY_USER === true ? '#14A27B'
                                                                            : '#14A27B',
                                                    borderRadius: 35 / 2,
                                                    marginLeft: 5,
                                                    alignSelf: 'center'
                                                }}
                                                onPress={() => {
                                                    this.roundBottomClick(item, index)
                                                }}>
                                                <Text style={{ fontFamily: CONSTANTS.DEMI, fontSize: 15, color: 'white', }}>{index + 1}</Text>
                                            </TouchableOpacity>
                                        )
                                    }
                                </ScrollView>
                                {/* Right Press */}
                                <TouchableOpacity
                                    style={{
                                        width: '10%',
                                        height: 50,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onPress={() => {
                                        this.rightArrow()
                                    }}>
                                    <Image
                                        style={{
                                            width: 17,
                                            height: 20,
                                            tintColor: colors.black
                                        }}
                                        resizeMode={'contain'}
                                        source={require('../../../images/right_caret.png')}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            );
        }
    }

    _handleScroll = (event) => {
        console.log('currentXOffset =', event.nativeEvent.contentOffset.x);
        newXOffset = event.nativeEvent.contentOffset.x
        this.setState({ currentXOffset: newXOffset })
    }

    leftArrow = () => {
        eachItemOffset = this.state.scrollViewWidth / 10; // Divide by 10 because I have 10 <View> items
        _currentXOffset = this.state.currentXOffset - eachItemOffset;
        this.scroll.scrollTo({ x: _currentXOffset, y: 0, animated: true })
    }

    rightArrow = () => {
        eachItemOffset = this.state.scrollViewWidth / 10; // Divide by 10 because I have 10 <View> items 
        _currentXOffset = this.state.currentXOffset + eachItemOffset;
        this.scroll.scrollTo({ x: _currentXOffset, y: 0, animated: true })
    }


    nextPress = () => {

        let eachItemOffset = this.state.scrollViewWidth / 17; // Divide by 17 because I have 10 <View> items
        let _currentXOffset = this.state.currentXOffset + eachItemOffset;
        this.scroll.scrollTo({ x: _currentXOffset, y: 0, animated: true })
    }
    previousPress = () => {

        let eachItemOffset = this.state.scrollViewWidth / 17; // Divide by 17 because I have 10 <View> items
        let _currentXOffset = this.state.currentXOffset - eachItemOffset;
        this.scroll.scrollTo({ x: _currentXOffset, y: 0, animated: true })
    }

    // {
    //     id:4,
    //     answer:'Hello answer 4',
    //     is_selected:false,
    //     type:'simple',
    //     postion:'D'
    // }
    renderAswerItem = (item, index) => {
        if (this.state.selectedQuestionObj !== undefined && this.state.selectedQuestionObj.Q_TYPE === 3) {
            return (
                <View style={{
                    width: '100%',
                    paddingVertical: 5,
                    alignItems: 'center',
                }}>
                    <TextInput
                        style={{
                            width: '90%',
                            height: 45,
                            minHeight: 45,
                            color: 'black',
                            fontSize: dimensions.sizeRatio * 17,
                            fontFamily: CONSTANTS.REGULAR,
                            borderBottomWidth: 1,
                            borderBottomColor: 'grey'
                            //paddingTop: 0, paddingBottom: 0,

                        }}
                        placeholder="Write answer..."
                        placeholderTextColor='#495F8E'
                        onChangeText={(txtAnswer) => this.setState({ txtAnswer })}
                        blurOnSubmit={false}
                        keyboardType="numeric"
                        returnKeyType="done"
                        autoCapitalize="none"
                        autoCorrect={false}
                        numberOfLines={1}
                        value={this.state.txtAnswer}
                        // value={item.QO_ANSWER_WRITTEN != undefined && item.QO_ANSWER_WRITTEN != null &&
                        //     item.QO_ANSWER_WRITTEN != '' ? item.QO_ANSWER_WRITTEN : this.state.txtAnswer}
                        // scrollEnabled={false}
                        ref={(input) => this.usernameInput = input}
                        onSubmitEditing={() => {
                            Keyboard.dismiss();
                            console.warn('SUBMIT ANSWER')
                            selectSubmitAnswerItem = item;
                            this.submitAnswer(item, this.state.selectedQuestionObj.Q_TYPE)
                        }}

                    />
                </View>
            )
        }
        else {
            return (
                <Ripple style={{
                    flexDirection: 'row',
                    width: '100%',
                    paddingVertical: 15,
                    justifyContent: 'center',
                }}
                    onPress={() => {
                        this.submitAnswer(item, this.state.selectedQuestionObj.Q_TYPE)
                    }}>
                    {/* Left view */}
                    <View
                        style={{
                            width: '12%',
                            height: 50,
                            backgroundColor: colors.white,
                            alignItems: 'center',
                            marginLeft: 5,
                            //justifyContent: 'center'
                        }}>
                        <View style={{
                            width: 30,
                            height: 30,
                            borderRadius: 30 / 2,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: item.QO_STATUS ? '#eaeaea' : 'green',
                        }}>
                            <Text style={{
                                fontSize: (dimensions.sizeRatio * 16),
                                color: item.QO_STATUS ? colors.black : colors.white,
                                fontFamily: CONSTANTS.DEMI,
                                //padding: 10,
                                alignSelf: 'center',
                                textAlign: 'center',
                                textAlignVertical: 'center'
                            }}>{item.QO_OPTIONS_NUMBER}</Text>
                        </View>
                    </View>
                    {/* Right view */}
                    <View
                        style={{
                            width: '88%',
                            marginLeft: 10
                        }}>
                        <AnswerComponent
                            //heightMath={item?.QO_OPTIONS_DESC.length > 35 ? (parseInt(item?.QO_OPTIONS_DESC.length / 45) + 2) : 2}
                            heightMath={this.handleHeightAnswer(item?.QO_OPTIONS_DESC, 36)}
                            question={item.QO_OPTIONS_DESC}
                            questionObj={item}
                            type={this.state.isQuestionAnswerFlag}
                            navigation={this.props.navigation} />
                        {/* <Text style={{
                        fontSize: (dimensions.sizeRatio * 14),
                        color: colors.black,
                        fontFamily: CONSTANTS.REGULAR,
                    }}>{item.answer}</Text> */}
                    </View>
                </Ripple>
            )
        }
    }


    renderHeader = (timeFormate) => {
        return (
            <View
                style={{
                    width: '100%',
                    height: 120,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.theme,
                    paddingHorizontal: 15
                }}>
                {/* Back */}
                <Ripple
                    onPress={() => {
                        this.handleBackButtonClick()
                    }}
                    style={{

                    }}>
                    {backButton}
                </Ripple>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginLeft: 10
                    }}>
                    {/* Left view */}
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'row'
                        }}>
                        {/* <Image
                            style={{
                                width: 40,
                                height: 35
                            }}
                            resizeMode={'contain'}
                            source={require('../../../images/test_qu_1.png')}
                        /> */}
                        {clipboardIcon}
                        <View
                            style={{
                                width: 80,
                                height: 32,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: 5,
                                borderTopWidth: 1,
                                borderBottomWidth: 1,
                                borderRightWidth: 1,
                                borderColor: colors.gray,

                            }}>
                            <Text style={{
                                fontSize: 16,
                                fontFamily: CONSTANTS.DEMI,
                                color: colors.white
                            }}>
                                {timeFormate}
                            </Text>
                        </View>
                    </View>
                    {/* Right */}
                    <TouchableOpacity
                        style={{
                            width: 120,
                            padding: 5,
                            marginRight: 15,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onPress={() => {
                            Alert.alert(
                                'Submit Answer',
                                'Are you sure you want to submit the answer?',
                                [
                                    { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                    {
                                        text: 'OK', onPress: () => {
                                            clearInterval(this.interval);
                                            if (this.state.selectedQuestionObj.Q_TYPE === 3) {
                                                this.setState({
                                                    isTextBeforeSubmit: true
                                                }, () => {
                                                    this.submitAnswer(selectSubmitAnswerItem, this.state.selectedQuestionObj.Q_TYPE)
                                                })
                                            } else {
                                                this.finalSubmitAnswer()
                                            }
                                        }
                                    },
                                ],
                                { cancelable: false }
                            )
                        }}>
                        {rightTickButton}
                        <Text style={{
                            fontSize: 16,
                            fontFamily: CONSTANTS.DEMI,
                            color: colors.white,
                            marginLeft: 5
                        }}>
                            {'SUBMIT'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
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