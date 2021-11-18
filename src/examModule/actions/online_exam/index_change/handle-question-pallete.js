import * as types from '../../action-types';

import { timeTakenByEachQuestion } from './index-change-actions';
// Summary: This action will handle opening and closing of question pallete alert box.
export function handleQuestionPallete(index, questionArray, modalVisible, examDetails, currentIndex,
    timerValue, condition, sectionIndex){
    
    // Summary: Calculate time taken by each question.
    if(index != currentIndex){
        let displayTime =  questionArray[currentIndex].display_time_of_question;
        let alreadyTakenTime = questionArray[currentIndex].time_taken_by_question;
        let timerValueTaken = timeTakenByEachQuestion(displayTime, timerValue, alreadyTakenTime);
        questionArray[currentIndex].time_taken_by_question = timerValueTaken;
        questionArray[index].display_time_of_question = timerValue;
    }
    // Summary: Handle the colour change of section.
    if(sectionIndex < 0 && index != currentIndex){
        let len = examDetails.start_index_of_sections_array.length;
        let startIndex = examDetails.start_index_of_sections_array;
        let endIndex = examDetails.end_index_of_sections_array;

        for(let i = 0; i < len; i++){
            if(index >= startIndex[i] && index <= endIndex[i]){
                for(let j = 0; j < len; j++){
                    examDetails.section_buttons_color_array[j] = '#C9D7DD';   
                }
                examDetails.section_buttons_color_array[i] = '#00BFEE';
                console.log(examDetails.section_buttons_color_array);        
            }
        }
        // examDetails.start_index_of_sections_array  examDetails.end_index_of_sections_array
    }
    // Summary: Handles the click event of section button and change colour accordingly.
    if(condition && sectionIndex >= 0){
        let lengthData = examDetails.section_buttons_color_array.length;
        for(let i = 0; i < lengthData; i++){
            examDetails.section_buttons_color_array[i] = '#C9D7DD';   
        }
        examDetails.section_buttons_color_array[sectionIndex] = '#00BFEE';
    }
    let questionObj = {
        index: index,
        question_obj: questionArray[index],
        questionLegendModalVisible: !modalVisible,
        disable_prev_button: examDetails.disable_prev_button,
        disable_next_button: examDetails.disable_next_button,
        not_answered_count: examDetails.not_answer_count,
        save_count: examDetails.save_count,
        save_and_mark_review_count: examDetails.save_and_mark_review_count,
        mark_review_count: examDetails.mark_review_count,
        no_of_sections: examDetails.no_of_sections,
        section_names: examDetails.section_names, 
        total_questions: examDetails.total_questions,
        start_index_of_sections_array: examDetails.start_index_of_sections_array,
        no_of_question_per_section_array: examDetails.no_of_question_per_section_array,
        section_buttons_color_array: examDetails.section_buttons_color_array,
        end_index_section_arr: examDetails.end_index_of_sections_array
    };

    return {
        type: types.HANDLE_QUESTION_PALLETE,
        payload: questionObj
    };
}
