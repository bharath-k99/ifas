import React, { Component } from "react";
import { 
    Text,
    TouchableOpacity,
    View 
} from "react-native";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// Actions
import * as examActions from '../../actions/online-exam-actions';

// StyleSheet
import { styles } from './style-exam-result';

// Util
import { arraysEqual } from '../../utils/common/array_equal';
import { stringEquality } from '../../utils/common/string_equality';
import { ScrollView } from "react-native-gesture-handler";
// Summary: This class is used to calculate the result of exam.
class ExamResult extends Component{

    constructor(props){
        super(props);
        this.state = {
            render: false    
        };
        this.backToDashboard = this.backToDashboard.bind(this);
        this.calculatingResultSection = this.calculatingResultSection.bind(this);
        this.calculatingResult = this.calculatingResult.bind(this);
        this.perSectionDetails = this.perSectionDetails.bind(this);
        this.rightAnswerMarks = 3;
        this.wrongAnswerMarks = 1;
        this.rightAnswerCount = 0;
        this.wrongAnswerCount = 0;
        this.rightAnswerCountSectionArr = [];
        this.wrongAnswerCountSectionArr = [];
        this.sectionIndex = 0;
        this.totalMarks = 0;
    }

    componentDidMount(){
        let lengthArr = this.props.questionsObjectArray.length;
        let startIndex = this.props.examDetail.start_index_of_sections_array;
        let endIndex = this.props.examDetail.end_index_of_sections_array;
        let sectionNames = this.props.examDetail.section_names;
        if(sectionNames.length > 0){
            for(let i = 0; i < sectionNames.length; i++){
                this.rightAnswerCountSectionArr[i] = 0;
                this.wrongAnswerCountSectionArr[i] = 0; 
            }
            for(let i = 0; i < lengthArr; i++){
                if(startIndex[this.sectionIndex] == i){
                    this.calculatingResultSection(this.props.questionsObjectArray[i], i, lengthArr, true);
                }else{
                    this.calculatingResultSection(this.props.questionsObjectArray[i], i, lengthArr, false);
                }
                
            }
        }else{
            for(let i = 0; i < lengthArr; i++){
                if(startIndex[this.sectionIndex] == i){
                    this.calculatingResult(this.props.questionsObjectArray[i], i, lengthArr);
                }else{
                    this.calculatingResult(this.props.questionsObjectArray[i], i, lengthArr);
                }
            }
        }
    }

     // Summary: this will calculate the result and store it in a variable.
    calculatingResult(questionObj, i, lengthArr){
        
        if( questionObj.save == true || questionObj.save_mark_review == true ){
            if(questionObj.multiselect == false && questionObj.descriptive_answer == false){
                if(questionObj.right_answer == questionObj.selected_option){
                    console.log("questionObj right option");
                    console.log(questionObj.question_no);
                    console.log(this.sectionIndex);
                    this.totalMarks += this.rightAnswerMarks;
                    this.rightAnswerCount += 1;
                }else{
                    console.log("questionObj wrong option");
                    console.log(questionObj.question_no);
                    this.totalMarks -= this.wrongAnswerMarks;
                    this.wrongAnswerCount += 1;
                }
            }else if(questionObj.multiselect == true){                
                let equality = arraysEqual(questionObj.right_answer_multiselect, questionObj.answer_multiselect);
                if(equality == true){
                    console.log("questionObj right multiselect");
                    console.log(questionObj.question_no);
                    console.log(this.sectionIndex);
                    this.totalMarks += this.rightAnswerMarks;
                    this.rightAnswerCount += 1;
                }else{
                    console.log("questionObj wrong multiselect");
                    console.log(questionObj.question_no);
                    this.totalMarks -= this.wrongAnswerMarks;
                    this.wrongAnswerCount += 1;
                }                
            }else if(questionObj.descriptive_answer == true){
                let areEqual = stringEquality(questionObj.descriptive_rigth_answer, questionObj.descriptive_given_answer);
                if(areEqual == true){
                    console.log("questionObj right descriptive_answer");
                    console.log(questionObj.question_no);
                    console.log(this.sectionIndex);
                    this.totalMarks += this.rightAnswerMarks;
                    this.rightAnswerCount += 1;
                }else{
                    console.log("questionObj wrong descriptive_answer");
                    console.log(questionObj.question_no);
                    this.totalMarks -= this.wrongAnswerMarks;
                    this.wrongAnswerCount += 1;
                }
            }
        }
        if(i == (lengthArr - 1)){
            this.setState((prevstate)=>{
                return{
                    render: !prevstate.render
                }
            });
        }
    }

    // Summary: this will calculate the result and store it in a variable.
    calculatingResultSection(questionObj, i, lengthArr, sectionchange){
        if(sectionchange == true ){
            this.sectionIndex += 1;
        }
        if( questionObj.save == true || questionObj.save_mark_review == true ){
            if(questionObj.multiselect == false && questionObj.descriptive_answer == false){
                if(questionObj.right_answer == questionObj.selected_option){
                    console.log("questionObj right option");
                    console.log(questionObj.question_no);
                    console.log(this.sectionIndex);
                    this.totalMarks += this.rightAnswerMarks;
                    this.rightAnswerCountSectionArr[(this.sectionIndex - 1)] += 1;
                    this.rightAnswerCount += 1;
                }else{
                    console.log("questionObj wrong option");
                    console.log(questionObj.question_no);
                    this.totalMarks -= this.wrongAnswerMarks;
                    this.wrongAnswerCountSectionArr[(this.sectionIndex - 1)] += 1;
                    this.wrongAnswerCount += 1;
                }
            }else if(questionObj.multiselect == true){                
                let equality = arraysEqual(questionObj.right_answer_multiselect, questionObj.answer_multiselect);
                if(equality == true){
                    console.log("questionObj right multiselect");
                    console.log(questionObj.question_no);
                    console.log(this.sectionIndex);
                    this.totalMarks += this.rightAnswerMarks;
                    this.rightAnswerCountSectionArr[(this.sectionIndex - 1)] += 1;
                    this.rightAnswerCount += 1;
                }else{
                    console.log("questionObj wrong multiselect");
                    console.log(questionObj.question_no);
                    this.totalMarks -= this.wrongAnswerMarks;
                    this.wrongAnswerCountSectionArr[(this.sectionIndex - 1)] += 1;
                    this.wrongAnswerCount += 1;
                }                
            }else if(questionObj.descriptive_answer == true){
                let areEqual = stringEquality(questionObj.descriptive_rigth_answer, questionObj.descriptive_given_answer);
                if(areEqual == true){
                    console.log("questionObj right descriptive_answer");
                    console.log(questionObj.question_no);
                    console.log(this.sectionIndex);
                    this.totalMarks += this.rightAnswerMarks;
                    this.rightAnswerCountSectionArr[(this.sectionIndex - 1)] += 1;
                    this.rightAnswerCount += 1;
                }else{
                    console.log("questionObj wrong descriptive_answer");
                    console.log(questionObj.question_no);
                    this.totalMarks -= this.wrongAnswerMarks;
                    this.wrongAnswerCountSectionArr[(this.sectionIndex - 1)] += 1;
                    this.wrongAnswerCount += 1;
                }
            }
        }
        if(i == (lengthArr - 1)){
            this.setState((prevstate)=>{
                return{
                    render: !prevstate.render
                }
            });
        }
    }

    // Summary: This will return the ui with section details.
    perSectionDetails(){
        
        let returnedView =  this.props.examDetail.section_names.map((section_name, index) =>(
            
            <View style={ styles.detailsViewSection }>
                <View style={{ width: '100%', height: 35 }}>
                    <Text style = { styles.detailsTextLeft }>
                        { section_name }  
                    </Text>
                </View>
                <View style={ styles.detailsView }>
                    <Text style = { styles.detailsTextLeft }>
                        No. Of Right Answers
                    </Text>
                    <Text style = { styles.detailsTextRight }>
                        { this.rightAnswerCountSectionArr[index] }
                    </Text>
                </View>
                <View style={ styles.detailsView }>
                    <Text style = { styles.detailsTextLeft }>
                        No. Of Wrong Answers
                    </Text>
                    <Text style = { styles.detailsTextRight }>
                        { this.wrongAnswerCountSectionArr[index] }
                    </Text>
                </View>
            </View>
        ));
        return returnedView; 
    }

    // Summar: Will Navigate to the dashboard and clear the redux state to initial state.
    backToDashboard(){
        this.props.actions.stopTimer();
        this.props.navigation.navigate('Home');
    }

    render(){
        return(
            <ScrollView>
                <View style= { styles.containerMain }>
                    <View style={ styles.detailsView }>
                        <Text style = { styles.detailsTextLeft }>
                            Total Questions
                        </Text>
                        <Text style = { styles.detailsTextRight }>
                            { this.props.examDetail.total_questions }
                        </Text>
                    </View>
                    <View style={ styles.detailsView }>
                        <Text style = { styles.detailsTextLeft }>
                            Total Marks
                        </Text>
                        <Text style = { styles.detailsTextRight }>
                            { this.props.examDetail.total_questions * 3 }
                        </Text>
                    </View>
                    <View style={ styles.detailsView }>
                        <Text style = { styles.detailsTextLeft }>
                            Total Marks Obtained
                        </Text>
                        <Text style = { styles.detailsTextRight }>
                            { this.totalMarks }
                        </Text>
                    </View>
                    <View style={ styles.detailsView }>
                        <Text style = { styles.detailsTextLeft }>
                            No. Of Right Answers 
                        </Text>
                        <Text style = { styles.detailsTextRight }>
                            { this.rightAnswerCount }
                        </Text>
                    </View>
                    <View style={ styles.detailsView }>
                        <Text style = { styles.detailsTextLeft }>
                            No. Of Wrong Answers
                        </Text>
                        <Text style = { styles.detailsTextRight }>
                            { this.wrongAnswerCount }
                        </Text>
                    </View>
                    {   
                        this.props.examDetail.section_names.length > 0
                        &&
                        this.perSectionDetails()
                    }
                    <TouchableOpacity 
                        style = { styles.buttonContainer }
                        onPress = {()=>{
                            this.backToDashboard();
                    }}>
                        <Text style = { styles.buttonText }>
                            Close Screen
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }
}

function mapDispatchToProps(dispatch){
    return {
        actions: bindActionCreators(examActions, dispatch)
    };
}

function mapStateToProps(state){
    return { 
        index: state.OnlineExamReducers.examDetail.index,
        examDetail: state.OnlineExamReducers.examDetail, 
        timerDetail: state.OnlineExamReducers.timerDetail,
        questionsObject: state.OnlineExamReducers.questionsObj,
        questionsObjectArray: state.OnlineExamReducers.questionsObjArray,
        renderState: state.OnlineExamReducers.renderVal
    };
}

export default connect( mapStateToProps, mapDispatchToProps )( ExamResult );