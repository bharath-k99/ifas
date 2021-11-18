import * as types from '../../action-types';

// Enum
import { color_code_answer_button } from '../../../enums/global_colors';
// Summary: Clear Response action is used to clear the response of a question.
export function clearResponse(examObject, questionObjectArr){
    
    let index = examObject.index;
    let mark_review_count = examObject.mark_review_count;
    let not_answer_count = examObject.not_answer_count;
    let save_and_mark_review_count = examObject.save_and_mark_review_count;
    let save_count  = examObject.save_count;
    
    if(questionObjectArr[index].save == true){
        save_count -= 1;
        not_answer_count += 1;
        questionObjectArr[index].optionButtonColorArr = [ color_code_answer_button.not_answered, color_code_answer_button.not_answered, color_code_answer_button.not_answered, color_code_answer_button.not_answered ];
        questionObjectArr[index].question_pallete_color = color_code_answer_button.next;
        questionObjectArr[index].save = false;
        questionObjectArr[index].visited_not_answer = true;
        questionObjectArr[index].answered =false;
        questionObjectArr[index].descriptive_given_answer = "";
        questionObjectArr[index].selected_option = "";
        questionObjectArr[index].answer_multiselect = [];
        questionObjectArr[index].multiselect_selected_boolean = [false, false, false, false];
    }else if(questionObjectArr[index].save_mark_review == true) {
        save_and_mark_review_count -= 1;
        not_answer_count += 1;
        questionObjectArr[index].optionButtonColorArr = [ color_code_answer_button.not_answered, color_code_answer_button.not_answered, color_code_answer_button.not_answered, color_code_answer_button.not_answered ];
        questionObjectArr[index].question_pallete_color = color_code_answer_button.next;
        questionObjectArr[index].save_mark_review = false;
        questionObjectArr[index].visited_not_answer = true;
        questionObjectArr[index].answered =false;
        questionObjectArr[index].descriptive_given_answer = "";
        questionObjectArr[index].selected_option = "";
        questionObjectArr[index].answer_multiselect = [];
        questionObjectArr[index].multiselect_selected_boolean = [false, false, false, false];
    }else if(questionObjectArr[index].mark_review == true) {
        mark_review_count -= 1;
        not_answer_count += 1;
        questionObjectArr[index].optionButtonColorArr = [ color_code_answer_button.not_answered, color_code_answer_button.not_answered, color_code_answer_button.not_answered, color_code_answer_button.not_answered ];
        questionObjectArr[index].question_pallete_color = color_code_answer_button.next;
        questionObjectArr[index].mark_review = false;
        questionObjectArr[index].visited_not_answer = true;
        questionObjectArr[index].answered =false;
        questionObjectArr[index].descriptive_given_answer = "";
        questionObjectArr[index].selected_option = "";
        questionObjectArr[index].answer_multiselect = [];
        questionObjectArr[index].multiselect_selected_boolean = [false, false, false, false];
    }else{
        not_answer_count += 1;
        questionObjectArr[index].optionButtonColorArr = [ color_code_answer_button.not_answered, color_code_answer_button.not_answered, color_code_answer_button.not_answered, color_code_answer_button.not_answered ];
        questionObjectArr[index].question_pallete_color = color_code_answer_button.next;
        questionObjectArr[index].mark_review = false;
        questionObjectArr[index].visited_not_answer = true;
        questionObjectArr[index].answered =false;
        questionObjectArr[index].descriptive_given_answer = "";
        questionObjectArr[index].selected_option = "";
        questionObjectArr[index].answer_multiselect = [];
        questionObjectArr[index].multiselect_selected_boolean = [false, false, false, false];
    }

    let payloadObject = {    
        disable_next_button: index >= questionObjectArr.length ? true : examObject.disable_next_button, 
        disable_prev_button: index == 0 ? true : examObject.disable_prev_button, 
        end_index_section_arr: examObject.end_index_of_sections_array, 
        index: examObject.index, 
        mark_review_count: mark_review_count, 
        no_of_question_per_section_array: examObject.no_of_question_per_section_array, 
        no_of_sections: examObject.no_of_sections, 
        not_answered_count: not_answer_count, 
        save_and_mark_review_count: save_and_mark_review_count, 
        save_count: save_count, 
        section_buttons_color_array: examObject.section_buttons_color_array, 
        section_names: examObject.section_names, 
        start_index_of_sections_array: examObject.start_index_of_sections_array, 
        total_questions: examObject.total_questions,
        questionsObj: questionObjectArr[index],
        questionsArr: questionObjectArr,        
    };

    return {
        type: types.CLEAR_RESPONSE,
        payload: payloadObject
    }
}
