import React, { Component } from 'react';
import {
    View,
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// Actions
import * as examActions from '../../actions/online-exam-actions';

// Component
import AnswerButtons from '../../components/online_exam/answer_button/AnswerButtons';
import HeaderOnlineExam from '../../components/online_exam/header/HeaderOnlineExam';
import QuestionSectionLeft from '../../components/online_exam/question_section/QuestionSectionsLeft';
import QuestionPalleteLegend from '../../components/common_components/question_pallete_legend';

// Enum
import { answer_option, color_code_answer_button } from '../../enums/global_colors';

// Style sheet
import { styles } from './style-online-exam';

// Summary: This class will contain all the functionality of the online test.
class OnlineExam extends Component{

    // Summary: No header Will be shown for this component
    static navigationOptions = {
        header: null
    }

    constructor(props){
        super(props);
        this.state = {
            index: 0,
            disable_answer_button_view: true,
        };
        this.runTimer = null;
        this.clearResponseFunction = this.clearResponseFunction.bind(this);
        this.decreaseIndexChange = this.decreaseIndexChange.bind(this);
        this.getOptionId = this.getOptionId.bind(this);
        this.increaseIndexChange = this.increaseIndexChange.bind(this);
        this.getFillInTheBlanksAnswer = this.getFillInTheBlanksAnswer.bind(this);
        this.getCheckBoxAnswer = this.getCheckBoxAnswer.bind(this); 
        this.handleKeyboardShowEvent = this.handleKeyboardShowEvent.bind(this);
        this.handleKeyboardHideEvent = this.handleKeyboardHideEvent.bind(this);
        this.getFillInTheBlanksChangeTextEvent = this.getFillInTheBlanksChangeTextEvent.bind(this);
        this.navigationOfQuestion = this.navigationOfQuestion.bind(this);
        this.openQuestionLegend = this.openQuestionLegend.bind(this);
        this.changeColorCodeQuestionPalleteNotAnsweredOrNextButton = this.changeColorCodeQuestionPalleteNotAnsweredOrNextButton.bind(this);
        this.endExam = this.endExam.bind(this);
        this.examSummary = this.examSummary.bind(this);
        this.navigationToSection = this.navigationToSection.bind(this);
    }

    // Summary: It will prepare optionButtonColorArr. Throughout the test.
    UNSAFE_componentWillMount(){
    }

    // Summary: It will run timer and call startTimer action repetively in one second.
    componentDidMount(){
        this.focusListenerOnlineExam = this.props.navigation.addListener("didFocus", () => {            
            this.runTimer = setInterval(() => {
                this.props.actions.startTimer(this.props.timerDetail.totalSeconds);
            }, 1000);
        });
        this.blurListenerOnlineExam = this.props.navigation.addListener("didBlur", () => {            
            clearInterval(this.runTimer);
            console.log("this.blurListenerOnlineExam");
        });
    }

    // Summary: It will clear timer.
    componentWillUnmount(){
        clearInterval(this.runTimer);
        this.focusListenerOnlineExam.remove();
        this.blurListenerOnlineExam.remove();
    }
   
    // Summary: This function will decrease the index for the question object.
    decreaseIndexChange() {
        this.props.actions.decreaseIndex(this.props.index, this.props.questionsObjectArray, 
            this.props.examDetail.not_answer_count, this.props.examDetail, 
            this.props.timerDetail.totalSeconds, this.props.examDetail.no_of_sections,
            this.props.examDetail.section_names, this.props.examDetail.total_questions,
            this.props.examDetail.start_index_of_sections_array, this.props.examDetail.no_of_question_per_section_array, 
            this.props.examDetail.section_buttons_color_array, this.props.examDetail.end_index_of_sections_array);        
    }

    // Summary: This function will increase the index for the question object.
    increaseIndexChange(buttonId) {
        let answerGiven = this.props.questionsObjectArray[this.props.index].answered;
        let indexLength = this.props.questionsObjectArray.length;
        if(answerGiven == true){
            // #2DBC01 save & Next, #441988 Mark review, #441988 (Save & Mark review with small green circle)
            // #E44502 not answered,
            if(buttonId == 0) {
                this.props.actions.increaseIndexSave(this.props.index, this.props.questionsObjectArray, 
                    color_code_answer_button.saveAndNext, true, this.props.examDetail.not_answer_count, this.props.examDetail.mark_review_count,
                    this.props.examDetail.save_count, this.props.examDetail.save_and_mark_review_count, 
                    indexLength, buttonId, this.props.timerDetail.totalSeconds, this.props.examDetail.no_of_sections,
                    this.props.examDetail.section_names, this.props.examDetail.total_questions, this.props.examDetail.start_index_of_sections_array,
                    this.props.examDetail.no_of_question_per_section_array, this.props.examDetail.section_buttons_color_array, this.props.examDetail.end_index_of_sections_array);
            }else if(buttonId == 1) {
                this.props.actions.increaseIndexSave(this.props.index, this.props.questionsObjectArray, 
                    color_code_answer_button.saveAndMarkReview, true, this.props.examDetail.not_answer_count, this.props.examDetail.mark_review_count,
                    this.props.examDetail.save_count, this.props.examDetail.save_and_mark_review_count, 
                    indexLength, buttonId, this.props.timerDetail.totalSeconds, this.props.examDetail.no_of_sections,
                    this.props.examDetail.section_names, this.props.examDetail.total_questions, this.props.examDetail.start_index_of_sections_array,
                    this.props.examDetail.no_of_question_per_section_array, this.props.examDetail.section_buttons_color_array, this.props.examDetail.end_index_of_sections_array);
            }else if(buttonId == 2) {
                this.props.actions.increaseIndexSave(this.props.index, this.props.questionsObjectArray, 
                    color_code_answer_button.saveAndMarkReview, true, this.props.examDetail.not_answer_count, this.props.examDetail.mark_review_count,
                    this.props.examDetail.save_count, this.props.examDetail.save_and_mark_review_count, 
                    indexLength, buttonId, this.props.timerDetail.totalSeconds, this.props.examDetail.no_of_sections,
                    this.props.examDetail.section_names, this.props.examDetail.total_questions, this.props.examDetail.start_index_of_sections_array,
                    this.props.examDetail.no_of_question_per_section_array, this.props.examDetail.section_buttons_color_array, this.props.examDetail.end_index_of_sections_array);
            }else if(buttonId == 3) {
                this.changeColorCodeQuestionPalleteNotAnsweredOrNextButton(indexLength, color_code_answer_button.next, true);
            }
        }else if(buttonId == 2 && answerGiven == false){
            this.props.actions.increaseIndexSave(this.props.index, this.props.questionsObjectArray, 
                color_code_answer_button.saveAndMarkReview, false, this.props.examDetail.not_answer_count, this.props.examDetail.mark_review_count,
                this.props.examDetail.save_count, this.props.examDetail.save_and_mark_review_count, 
                indexLength, buttonId, this.props.timerDetail.totalSeconds, this.props.examDetail.no_of_sections,
                this.props.examDetail.section_names, this.props.examDetail.total_questions, this.props.examDetail.start_index_of_sections_array,
                this.props.examDetail.no_of_question_per_section_array, this.props.examDetail.section_buttons_color_array, this.props.examDetail.end_index_of_sections_array);
        }else{
            this.changeColorCodeQuestionPalleteNotAnsweredOrNextButton(indexLength, color_code_answer_button.next, false);
        }
    }

    // Summary: This function will handle the working of next button or not answered by clicking on any button.
    changeColorCodeQuestionPalleteNotAnsweredOrNextButton(indexLength, colorCode, answered) {
        let saveTrue = this.props.questionsObjectArray[this.props.index].save;
        let saveMarkReviewTrue = this.props.questionsObjectArray[this.props.index].save_mark_review;
        let markReviewTrue = this.props.questionsObjectArray[this.props.index].mark_review;

        if(saveTrue == true || saveMarkReviewTrue == true || markReviewTrue == true){
            this.props.actions.increaseIndex(this.props.index, this.props.questionsObjectArray, 
                colorCode, true, this.props.examDetail.not_answer_count, this.props.examDetail.mark_review_count,
                this.props.examDetail.save_count, this.props.examDetail.save_and_mark_review_count, 
                indexLength, this.props.timerDetail.totalSeconds, this.props.examDetail.no_of_sections,
                this.props.examDetail.section_names, this.props.examDetail.total_questions, this.props.examDetail.start_index_of_sections_array, this.props.examDetail.no_of_question_per_section_array, 
                this.props.examDetail.section_buttons_color_array, this.props.examDetail.end_index_of_sections_array);
        }else{
            this.props.actions.increaseIndex(this.props.index, this.props.questionsObjectArray, 
                colorCode, false, this.props.examDetail.not_answer_count, this.props.examDetail.mark_review_count,
                this.props.examDetail.save_count, this.props.examDetail.save_and_mark_review_count, 
                indexLength, this.props.timerDetail.totalSeconds, this.props.examDetail.no_of_sections,
                this.props.examDetail.section_names, this.props.examDetail.total_questions, 
                this.props.examDetail.start_index_of_sections_array, this.props.examDetail.no_of_question_per_section_array, 
                this.props.examDetail.section_buttons_color_array, this.props.examDetail.end_index_of_sections_array);
        }
    }

    // Summary: This function handles the color change of option selected by user.
    getOptionId(buttonId, optionSelected) {
        // Summary: arrInt is used to maintain the indexing. 
        let arrColor = [answer_option.option_button_not_answered, answer_option.option_button_not_answered, answer_option.option_button_not_answered, answer_option.option_button_not_answered];
        // Summary: Set different color on clicked button.
        arrColor[buttonId] = answer_option.option_button_answered;
        // Summary: Fire action from here.
        this.props.actions.handleOptionColor( this.props.index, this.props.questionsObjectArray, optionSelected, this.props.renderState, arrColor);
    }

    // Summary: This function handles onChangeText event of text input.
    getFillInTheBlanksChangeTextEvent(value){
        this.props.actions.handleFillInTheBlanks(this.props.index, this.props.questionsObjectArray,
            value, this.props.renderState, false);
    }
    // Summary: This function will handle the answer of text input type questions.
    getFillInTheBlanksAnswer(answer){
        this.props.actions.handleFillInTheBlanks(this.props.index, this.props.questionsObjectArray,
            answer, this.props.renderState, true);
    }

    // Summary: This function will handle the answer given by checkbox input.
    getCheckBoxAnswer(answerArr, cbIndex){
        this.props.actions.handleCheckBox(this.props.index, this.props.questionsObjectArray,
            answerArr, this.props.renderState, cbIndex);
    }

    // Summary: It will handle event when keyboard show.
    handleKeyboardShowEvent(){
        this.setState({
            disable_answer_button_view: false
        });
    }

    // Summary: It will handle event when keyboard hide.
    handleKeyboardHideEvent(){
        this.setState({
            disable_answer_button_view: true
        });
    }

    // Summary: This function will handle the opening of question pallete legend.
    openQuestionLegend(){
        //Summary: Action Fired
        this.props.actions.handleQuestionPallete(this.props.index, this.props.questionsObjectArray,
            this.props.questionLegendModalVisible, this.props.examDetail, this.props.index, 
            this.props.timerDetail.totalSeconds, false, -1);
    }

    // Summary: This function handles the navigation to particular question when clicked 
    // on question pallete question no.
    navigationOfQuestion(questionNo){
        let indexClicked = questionNo -1;
        let currentIndex = this.props.index;
        //Summary: Action Fired
        this.props.actions.handleQuestionPallete(indexClicked, this.props.questionsObjectArray,
            this.props.questionLegendModalVisible, this.props.examDetail, currentIndex, 
            this.props.timerDetail.totalSeconds, false, -1);
    }

    // Summary: It'll navigate to the first question of the section.
    navigationToSection(index) {
        let indexClicked = this.props.examDetail.start_index_of_sections_array[index];
        let currentIndex = this.props.index;
        //Summary: Action Fired
        this.props.actions.handleQuestionPallete(indexClicked, this.props.questionsObjectArray,
            true, this.props.examDetail, currentIndex, this.props.timerDetail.totalSeconds, true, index);
    }

    // Summary: This function will when time ends or user submit the paper.
    endExam(){
        clearInterval(this.runTimer);
        this.props.navigation.navigate('TestResult');
    }

    // Summary: This function will user review and submit paper.
    examSummary(){
        // clearInterval(this.runTimer);
        this.props.navigation.navigate('TestSummary');
    }

    // Summary: This function will clear the answer.
    clearResponseFunction() {
        this.props.actions.clearResponse(this.props.examDetail, this.props.questionsObjectArray);
    }

    render() {
        return(
            <View style={ styles.container }>
                <View style={{flex:.5}}>
                    <HeaderOnlineExam 
                        openQuestionLegendProps = { this.openQuestionLegend }
                        questionLegendModalVisibleProps = { this.props.questionLegendModalVisible }
                        examDetailProps = { this.props.examDetail }
                        timerDetailProps = { this.props.timerDetail }
                        endExamProps = { this.endExam }
                    />
                </View>
                <View style={{flex: 6.3}}>
                    <View style = { styles.containerQuestion}>
                        <View style={ styles.containerQuestionLeft }>
                            <QuestionSectionLeft 
                                questionObjProps = { this.props.questionsObject }
                                getOptionIdProps = { this.getOptionId }
                                optionButtonColorProps = { this.props.questionsObjectArray[this.props.index].optionButtonColorArr }
                                getFillInTheBlanksAnswerProps = { this.getFillInTheBlanksAnswer }
                                getCheckBoxAnswerProps = { this.getCheckBoxAnswer }
                                handleKeyboardShowEventProps = { this.handleKeyboardShowEvent }
                                handleKeyboardHideEventProps = { this.handleKeyboardHideEvent }
                                descriptiveAnswerProps = { this.props.questionsObjectArray[this.props.index].descriptive_given_answer }
                                getFillInTheBlanksChangeTextEventProps = { this.getFillInTheBlanksChangeTextEvent }
                                noOfSectionsProps = { this.props.examDetail.no_of_sections }
                                sectionNamesProps = { this.props.examDetail.section_names }
                                totalQuestionsProps = { this.props.examDetail.total_questions }
                                navigationToSectionProps = { this.navigationToSection }
                                sectionButtonsColorArrayProps = { this.props.examDetail.section_buttons_color_array }
                                examDetailProps = { this.props.examDetail }
                                questionsObjArrayProp = { this.props.questionsObjectArray }
                            />
                        </View>  
                        <QuestionPalleteLegend 
                            questionsObjProp = { this.props.questionsObjectArray }
                            navigationOfQuestionProps = { this.navigationOfQuestion }
                            openQuestionLegendProps = { this.openQuestionLegend }
                            questionLegendModalVisibleProps = { this.props.questionLegendModalVisible }
                            saveCountProps = { this.props.examDetail.save_count }
                            markReviewCountProps = { this.props.examDetail.mark_review_count }
                            notAnsweredCountProps = { this.props.examDetail.not_answer_count }
                            saveAndMarkReviewCountProps = { this.props.examDetail.save_and_mark_review_count } 
                        />
                    </View>
                </View>
                <View style = {{flex: .7}}>
                    {
                        this.state.disable_answer_button_view 
                            && 
                        <AnswerButtons 
                            actionDecreaseIndexChange = { this.decreaseIndexChange }
                            actionIncreaseIndexChange = { this.increaseIndexChange }
                            actionClearResponseFunction = { this.clearResponseFunction }
                            disablePrev = { this.props.examDetail.disable_prev_button } 
                            disableNext = { this.props.examDetail.disable_next_button }
                            examSummaryProps = { this.examSummary }  
                        />
                    }
                </View> 
            </View>
        );
    }
}

// this will dispatch the control to.
function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(examActions, dispatch)
    };
}

//mapStateToProps is used for selecting the part of the data from the store that the connected component needs.
const mapStateToProps = ( state ) => {
    return { 
        index: state.OnlineExamReducers.examDetail.index,
        examDetail: state.OnlineExamReducers.examDetail, 
        timerDetail: state.OnlineExamReducers.timerDetail,
        questionsObject: state.OnlineExamReducers.questionsObj,
        questionsObjectArray: state.OnlineExamReducers.questionsObjArray,
        renderState: state.OnlineExamReducers.renderVal,
        questionLegendModalVisible: state.OnlineExamReducers.questionLegendModalVisible
    };
}

/*
As the first argument passed in to connect, mapStateToProps is used for selecting the part of the data from the store that the connected component needs. 
It’s frequently referred to as just mapState for short.
*/
export default connect(mapStateToProps, mapDispatchToProps)(OnlineExam);