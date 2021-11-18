// Actions
import * as types from '../../action-types';

// Summary: increaseIndex will increase the index by one.
export function increaseIndex(index, questionArray, colorCode, answered, notAnsweredCountParam, markReviewCountParam, 
    saveCountParam, saveAndMarkReviewCountParam, lengthOfData, timerValue, no_of_sections,
    section_names, total_questions, start_index_of_sections_array, 
    no_of_question_per_section_array, section_buttons_color_array, endIndexSectionArr) {
    
    let newIndex = index == (lengthOfData - 1) ? index : index+1;
    let saveStatus = questionArray[index].save;
    let saveMarkReviewStatus = questionArray[index].save_mark_review;
    let markReviewStatus = questionArray[index].mark_review; 
    let alreadyVisited = questionArray[index].visited_not_answer;
    let conditionStatus = ( alreadyVisited == false && saveStatus == false && saveMarkReviewStatus == false && markReviewStatus == false);
    let displayTime =  questionArray[index].display_time_of_question;
    let alreadyTakenTime = questionArray[index].time_taken_by_question;
    let timerValueTaken = timeTakenByEachQuestion(displayTime, timerValue, alreadyTakenTime);
    let sectionButtonsColorArray = section_buttons_color_array;
    // Summary: Changes the color of Section button.
    if(start_index_of_sections_array.includes(index + 1)){
        sectionButtonsColorArray = changeSectionColor(index+1, section_buttons_color_array, start_index_of_sections_array);
    }    
    questionArray[index].question_pallete_color = answered == true ? questionArray[index].question_pallete_color : colorCode;
    questionArray[index].time_taken_by_question = timerValueTaken;
    questionArray[index].visited_not_answer = true;
    questionArray[newIndex].display_time_of_question = timerValue;
    let payloadObject = {
        index: newIndex,
        questionsObj: index == (lengthOfData - 1) ? questionArray[index] : questionArray[index +1],
        questionsArr: questionArray,
        disable_prev_button: index == 1 ? true : false,
        disable_next_button: index == (lengthOfData - 2) ? true : false,
        not_answered_count: conditionStatus ? notAnsweredCountParam + 1 : notAnsweredCountParam,
        save_count: saveCountParam,
        save_and_mark_review_count: saveAndMarkReviewCountParam,
        mark_review_count: markReviewCountParam,
        no_of_sections: no_of_sections,
        section_names: section_names, 
        total_questions: total_questions,
        start_index_of_sections_array: start_index_of_sections_array,
        no_of_question_per_section_array: no_of_question_per_section_array,
        section_buttons_color_array: sectionButtonsColorArray,
        end_index_section_arr: endIndexSectionArr
    };
    return {
        type: types.INDEX_INCREASE,
        payload: payloadObject
    }
}

// Summary: This function will find out time take by each question on revisit time included.
export function timeTakenByEachQuestion(displayTime, timerValue, alreadyTakenTime){
    let difference = displayTime - timerValue;
    let timeTaken = alreadyTakenTime + difference;
    return timeTaken;
}

// Summary: Changes the color of Section button.
function changeSectionColor(index, section_buttons_color_array, index_of_sections_array){
    let sectionButtonsColorArray = section_buttons_color_array;    
    let sectionIndex = index_of_sections_array.indexOf(index);
    let lengthData = sectionButtonsColorArray.length;
    for(let i = 0; i < lengthData; i++){
        sectionButtonsColorArray[i] = '#C9D7DD';   
    }
    sectionButtonsColorArray[sectionIndex] = '#00BFEE';  
    return sectionButtonsColorArray;
}

// Summary: decreaseIndex will increase the index by one.
export function decreaseIndex(index, questionArray, notAnswerCount, examDetails, timerValue, 
    no_of_sections, section_names, total_questions, start_index_of_sections_array, 
    no_of_question_per_section_array, section_buttons_color_array, endIndexSectionArr) {

    let newIndex = index == 0 ? 0 : index - 1;

    let displayTime =  questionArray[index].display_time_of_question;
    let alreadyTakenTime = questionArray[index].time_taken_by_question;
    let timerValueTaken = timeTakenByEachQuestion(displayTime, timerValue, alreadyTakenTime);
    // console.log("timerValueTaken");
    // console.log(timerValueTaken);
    questionArray[index].time_taken_by_question = timerValueTaken;
    questionArray[newIndex].display_time_of_question = timerValue;
    let sectionButtonsColorArray = section_buttons_color_array;
    // Summary: Changes the color of Section button.    
    if(endIndexSectionArr.includes(index - 1)){
        sectionButtonsColorArray = changeSectionColor(index - 1, section_buttons_color_array, endIndexSectionArr);
    }    
    let payloadObject = {
        index: newIndex,
        questionsArr: questionArray,
        questionsObj: questionArray[newIndex],
        disable_prev_button: index == 1 ? true : false,
        not_answered_count: notAnswerCount,
        save_count: examDetails.save_count,
        save_and_mark_review_count: examDetails.save_and_mark_review_count,
        mark_review_count: examDetails.mark_review_count,
        no_of_sections: no_of_sections,
        section_names: section_names, 
        total_questions: total_questions,
        start_index_of_sections_array: start_index_of_sections_array,
        no_of_question_per_section_array: no_of_question_per_section_array,
        section_buttons_color_array: sectionButtonsColorArray,
        end_index_section_arr: endIndexSectionArr
    };
    return {
        type: types.INDEX_DECREASE,
        payload: payloadObject
    }
}

// Summary: increaseIndex will increase the index by one and handle save, saveMark and mark review button.
export function increaseIndexSave(index, questionArray, colorCode, answered, 
    notAnsweredCountParam, markReviewCountParam, saveCountParam, saveAndMarkReviewCountParam,
    lengthOfData, buttonId, timerValue, no_of_sections, section_names, total_questions, 
    start_index_of_sections_array, no_of_question_per_section_array, section_buttons_color_array, endIndexSectionArr) {
        
    let saveStatus = questionArray[index].save;
    let saveMarkReviewStatus = questionArray[index].save_mark_review;
    let markReviewStatus = questionArray[index].mark_review; 
    let conditionStatus = (saveStatus == false && saveMarkReviewStatus == false && markReviewStatus == false);       
    let newIndex = index == (lengthOfData - 1) ? index: index+1;
    let save_count_param = (buttonId == 0 && conditionStatus) ? 
        saveCountParam + 1 : saveCountParam;
    let save_and_mark_review_count_param = (buttonId == 1 && conditionStatus) ? 
        saveAndMarkReviewCountParam + 1 : saveAndMarkReviewCountParam;
    let mark_review_count_param = (buttonId == 2 && conditionStatus) ? 
        markReviewCountParam + 1 : markReviewCountParam;
    let not_answered_count_param = notAnsweredCountParam;
    let sectionButtonsColorArray = section_buttons_color_array;
    // Summary: Changes the color of Section button.
    if(start_index_of_sections_array.includes(index + 1)){
        sectionButtonsColorArray = changeSectionColor(index + 1, section_buttons_color_array, start_index_of_sections_array);
    }
    
    if(questionArray[index].visited_not_answer == true){
        questionArray[index].visited_not_answer = false;
        not_answered_count_param = ((buttonId == 0 && saveStatus == false) || 
            (buttonId == 1 && saveMarkReviewStatus == false) || 
            (buttonId == 2 && markReviewStatus == false)) ? not_answered_count_param - 1 : not_answered_count_param;
    }

    // Summary: Changing the count of button. Eg: When a user click markReview on already save question.
    // then change boolean and count status of different question.
    // Date: 26-May-2020 (Before this working perfectly)
    if(saveStatus == true || saveMarkReviewStatus == true || markReviewStatus == true){
        
        if(buttonId != 0 && saveStatus == true){
            console.log("Welcome Back Save Changed");
            console.log(colorCode);
            questionArray[index].question_pallete_color = colorCode;
            save_count_param -= 1;
            questionArray[index].save = false;
            save_and_mark_review_count_param = ( buttonId == 1 ) ? 
                                saveAndMarkReviewCountParam + 1 : saveAndMarkReviewCountParam;        
            mark_review_count_param = ( buttonId == 2 ) ? 
                                markReviewCountParam + 1 : markReviewCountParam;                    
            questionArray[index].save_mark_review = ( buttonId == 1 ) ? true: questionArray[index].save_mark_review;
            questionArray[index].mark_review = ( buttonId == 2  ) ? true: questionArray[index].mark_review;                    
        }
        if(buttonId != 1 && saveMarkReviewStatus == true){
            console.log("Welcome Back saveMarkReviewStatus Changed");
            console.log(colorCode);
            questionArray[index].question_pallete_color = colorCode;
            save_and_mark_review_count_param -= 1;
            questionArray[index].save_mark_review = false;
            save_count_param = ( buttonId == 0 ) ? 
                                saveCountParam + 1 : saveCountParam;
            mark_review_count_param = ( buttonId == 2 ) ? 
                                markReviewCountParam + 1 : markReviewCountParam;                    
            questionArray[index].save = ( buttonId == 0 ) ? true: questionArray[index].save;
            questionArray[index].mark_review = ( buttonId == 2 ) ? true: questionArray[index].mark_review;                    

        }
        if(buttonId != 2 && markReviewStatus == true){
            console.log("Welcome Back markReviewStatus Changed");
            console.log(colorCode);
            questionArray[index].question_pallete_color = colorCode;
            mark_review_count_param -= 1;
            questionArray[index].mark_review = false;
            save_count_param = ( buttonId == 0 ) ? 
                                saveCountParam + 1 : saveCountParam;
            save_and_mark_review_count_param = ( buttonId == 1 ) ? 
                                saveAndMarkReviewCountParam + 1 : saveAndMarkReviewCountParam;
            questionArray[index].save = ( buttonId == 0 ) ? true: questionArray[index].save;                    
            questionArray[index].save_mark_review = ( buttonId == 1 ) ? true: questionArray[index].save_mark_review;
        }

    }        
   

    //     save_count_param = ( buttonId == 0 && conditionStatus ) ? 
    //                             saveCountParam + 1 : saveCountParam;
    //     save_and_mark_review_count_param = ( buttonId == 1 && conditionStatus ) ? 
    //                             saveAndMarkReviewCountParam + 1 : saveAndMarkReviewCountParam;
    //     mark_review_count_param = ( buttonId == 2 && conditionStatus ) ? 
    //                             markReviewCountParam + 1 : markReviewCountParam;

    // }

    let displayTime =  questionArray[index].display_time_of_question;
    let alreadyTakenTime = questionArray[index].time_taken_by_question;
    let timerValueTaken = timeTakenByEachQuestion(displayTime, timerValue, alreadyTakenTime);

    questionArray[index].question_pallete_color = conditionStatus ? colorCode : questionArray[index].question_pallete_color;
    questionArray[index].save = ( buttonId == 0 && conditionStatus ) ? true: questionArray[index].save;
    questionArray[index].save_mark_review = ( buttonId == 1 && conditionStatus ) ? true: questionArray[index].save_mark_review;
    questionArray[index].mark_review = ( buttonId == 2 && conditionStatus ) ? true: questionArray[index].mark_review;
    questionArray[index].time_taken_by_question = timerValueTaken;

    questionArray[newIndex].display_time_of_question = timerValue;
    let payloadObject = {
        index: newIndex,
        questionsObj: questionArray[newIndex],
        questionsArr: questionArray,
        disable_prev_button: index == 1 ? true : false,
        disable_next_button: index == (lengthOfData - 2) ? true : false,
        not_answered_count: not_answered_count_param,
        save_count: save_count_param,
        save_and_mark_review_count: save_and_mark_review_count_param,
        mark_review_count: mark_review_count_param,
        no_of_sections: no_of_sections,
        section_names: section_names, 
        total_questions: total_questions,
        start_index_of_sections_array: start_index_of_sections_array,
        no_of_question_per_section_array: no_of_question_per_section_array,
        section_buttons_color_array: sectionButtonsColorArray,
        end_index_section_arr: endIndexSectionArr
    };
    return {
        type: types.INDEX_INCREASE_SAVE,
        payload: payloadObject
    }
}


// Summary: This function will provide the initial state for exam.
export function initialStateExam(response, renderBool){
    let questions_array_object_state = response.data;
    let noOfsections = response.noOfSections;
    let sectionNames = response.sectionNames;
    let totalQuestions = response.totalQuestions;
    let startIndexOfSections = response.startIndexOfSections;
    let noOfQuestionsInEachSection = response.noOfQuestionsInEachSection;
    let sectionButtonsColorArray = response.sectionButtonsColorArray;
    let endIndexSectionArr = response.endIndexSectionArr;
    let questionObj = {
        questionObject: questions_array_object_state[0],
        questionArr: questions_array_object_state,
        no_of_sections: noOfsections,
        section_names: sectionNames,
        total_questions: totalQuestions,
        renderval: !(renderBool),
        start_index_of_sections: startIndexOfSections,
        no_of_questions_each_section: noOfQuestionsInEachSection,
        section_buttons_color_array: sectionButtonsColorArray,
        end_index_section_arr: endIndexSectionArr
    };

    return {
        type: types.INITIAL_STATE_EXAM,
        payload: questionObj
    }
}



