import { questions_array_object } from '../../../enums/question_answers_set1';
import { questions_array_dummy } from '../../../enums/question_answers_dummy';
// Actions
import { initialStateExam } from './index-change-actions';

// Enums
import { color_code_answer_button, answer_option } from '../../../enums/global_colors';
import { section_questions } from '../../../enums/section_question_set2';

// Summary: this function will convert the section object into exam array.
export function fetchSectionExamFromAPI(value) {
    let section_questions_object = JSON.parse(JSON.stringify(section_questions));
    let keysOfSection = Object.keys(section_questions_object);    
    let finalData = [];
    let startIndexSection = [];
    let endIndexSection = [];
    let noOfQuestionsSections = [];
    let sectionButtonsColorArray = [];
    let tempCount = 0;
    for (let i = 0; i < keysOfSection.length; i++ ) {
        // This is how you concat two arrays into single array.
        let lengthData = section_questions_object[keysOfSection[i]];
        noOfQuestionsSections[i] = lengthData.length;
        if(i == 0){
            startIndexSection[i] = 0;
            endIndexSection[0] = section_questions_object[keysOfSection[i]].length - 1;
            sectionButtonsColorArray[i] = '#00BFEE';
        }else{
            let tempArr = section_questions_object[keysOfSection[i-1]];
            let tempData = section_questions_object[keysOfSection[i]].length - 1;
            startIndexSection[i] = tempCount + tempArr.length;
            endIndexSection[i] = startIndexSection[i] + tempData; 
            sectionButtonsColorArray[i] = '#C9D7DD';
            tempCount = startIndexSection[i];
        }
        const interest = [...finalData, ...section_questions_object[keysOfSection[i]]];
        finalData = interest;
    }

    let questionObjectData = {
        data: finalData,
        noOfSections: keysOfSection.length,
        sectionNames: keysOfSection,
        totalQuestions: finalData.length,
        startIndexOfSections: startIndexSection,
        noOfQuestionsInEachSection: noOfQuestionsSections,
        sectionButtonsColorArray: sectionButtonsColorArray,
        endIndexSectionArr: endIndexSection
    };

    return dispatch => { 
        return dispatch(initialStateExam(questionObjectData, value));
    }
}

export function fetchExamFromAPI(value) {
    let data = JSON.parse(JSON.stringify(questions_array_object));

    let questionObjectData = {
        data: data,
        noOfSections: 0,
        sectionNames: [],
        totalQuestions: data.length,
        startIndexOfSections: [],
        noOfQuestionsInEachSection: [],
        sectionButtonsColorArray: [],
        endIndexSectionArr: []
    };
     
    return dispatch => { 
        return dispatch(initialStateExam(questionObjectData, value));
    }         
}