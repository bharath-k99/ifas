// Actions
import * as types from '../actions/action-types';

// Enums
import { questions_array_object } from '../enums/question_answers_set1';
import { question_answer_dummy } from '../enums/question_answers_dummy';

// Utils
import { getOnlineExamDetails } from '../utils/online_exam/online-exam-utils';
import { timerUtil } from '../utils/online_exam/timer-exam-utils';

const INITIAL_STATE = { 
    examDetail: JSON.parse(JSON.stringify(getOnlineExamDetails(0, true, false, 0, 0, 0, 0, 0, [], 0, [], [], [], []))),
    timerDetail: JSON.parse(JSON.stringify(timerUtil(300, 0, 0, 0))),
    questionsObj: {}, 
    questionsObjArray: [],
    questionLegendModalVisible: false,
    renderVal: false
};
// mark_review_count, save_count, save_and_mark_review_count
export default (state = INITIAL_STATE , action) => {

    switch (action.type) {
        case types.INITIAL_STATE_EXAM:
            return Object.assign({}, state, {
                examDetail: JSON.parse(JSON.stringify(getOnlineExamDetails(0, true, false, 0, 0, 0, 0, 
                    action.payload.no_of_sections, action.payload.section_names, action.payload.total_questions,
                    action.payload.start_index_of_sections, action.payload.no_of_questions_each_section, 
                    action.payload.section_buttons_color_array, action.payload.end_index_section_arr))),
                timerDetail: JSON.parse(JSON.stringify(timerUtil(300, 0, 0, 0))),
                questionsObj: action.payload.questionObject,
                questionsObjArray: action.payload.questionArr,
                renderVal: action.payload.renderval
            });
        // Summary: This case will increase the index by one.
        case types.INDEX_INCREASE:
            return Object.assign({}, state,{
                examDetail: JSON.parse(JSON.stringify(getOnlineExamDetails(action.payload.index, action.payload.disable_prev_button, action.payload.disable_next_button, action.payload.not_answered_count, action.payload.mark_review_count, action.payload.save_count, action.payload.save_and_mark_review_count, action.payload.no_of_sections, 
                            action.payload.section_names, action.payload.total_questions, action.payload.start_index_of_sections_array, action.payload.no_of_question_per_section_array, action.payload.section_buttons_color_array, action.payload.end_index_section_arr))),
                questionsObj: action.payload.questionsObj,
                questionsObjArray: action.payload.questionsArr
            });
        case types.INDEX_INCREASE_SAVE:
            return Object.assign({}, state,{
                examDetail: JSON.parse(JSON.stringify(getOnlineExamDetails(action.payload.index, action.payload.disable_prev_button, action.payload.disable_next_button, action.payload.not_answered_count, action.payload.mark_review_count, action.payload.save_count, action.payload.save_and_mark_review_count, action.payload.no_of_sections, 
                            action.payload.section_names, action.payload.total_questions, action.payload.start_index_of_sections_array, 
                            action.payload.no_of_question_per_section_array, action.payload.section_buttons_color_array, action.payload.end_index_section_arr))),
                questionsObj: action.payload.questionsObj,
                questionsObjArray: action.payload.questionsArr
            });
        case types.CLEAR_RESPONSE:
            return Object.assign({}, state,{
                examDetail: JSON.parse(JSON.stringify(getOnlineExamDetails(action.payload.index, action.payload.disable_prev_button, action.payload.disable_next_button, action.payload.not_answered_count, action.payload.mark_review_count, action.payload.save_count, action.payload.save_and_mark_review_count, action.payload.no_of_sections, 
                            action.payload.section_names, action.payload.total_questions, action.payload.start_index_of_sections_array, 
                            action.payload.no_of_question_per_section_array, action.payload.section_buttons_color_array, action.payload.end_index_section_arr))),
                questionsObj: action.payload.questionsObj,
                questionsObjArray: action.payload.questionsArr
            });
        case types.INDEX_DECREASE:
            return Object.assign({}, state, {
                examDetail: JSON.parse(JSON.stringify(getOnlineExamDetails(action.payload.index, action.payload.disable_prev_button, false, action.payload.not_answered_count, action.payload.mark_review_count, 
                            action.payload.save_count, action.payload.save_and_mark_review_count, action.payload.no_of_sections, action.payload.section_names, action.payload.total_questions, action.payload.start_index_of_sections_array, 
                            action.payload.no_of_question_per_section_array, action.payload.section_buttons_color_array, action.payload.end_index_section_arr))),
                questionsObj: action.payload.questionsObj,
                questionsObjArray: action.payload.questionsArr
            });
        case types.OPTION_CHANGE:
            return Object.assign({}, state, {
                questionsObjArray: action.payload.questionsArr,
                renderVal: action.payload.renderObj
            });
        case types.HANDLE_FILL_BLANKS:
            return Object.assign({}, state, {
                questionsObjArray: action.payload.questionsArr,
                renderVal: action.payload.renderObj
            });
        case types.HANDLE_CHECK_BOX:
            return Object.assign({}, state, {
                questionsObjArray: action.payload.questionsArr,
                renderVal: action.payload.renderObj
            });
        case types.HANDLE_QUESTION_PALLETE:
            return Object.assign({}, state, {
                examDetail: JSON.parse(JSON.stringify(getOnlineExamDetails(action.payload.index, action.payload.disable_prev_button, action.payload.disable_next_button, action.payload.not_answered_count, action.payload.mark_review_count, action.payload.save_count, action.payload.save_and_mark_review_count, action.payload.no_of_sections, 
                    action.payload.section_names, action.payload.total_questions, action.payload.start_index_of_sections_array, 
                    action.payload.no_of_question_per_section_array, action.payload.section_buttons_color_array, action.payload.end_index_section_arr))),
                questionsObj: action.payload.question_obj,
                questionLegendModalVisible: action.payload.questionLegendModalVisible
            });
        case types.TIMER_START:
            return Object.assign({}, state,{
                timerDetail: JSON.parse(JSON.stringify(
                    timerUtil(action.payload.totalSeconds, action.payload.hours, action.payload.minutes, action.payload.seconds)
                ))
            });
        case types.CLEAR_TIMER:
            return Object.assign({}, state, {
                examDetail: JSON.parse(JSON.stringify(getOnlineExamDetails(0, true, false, 0, 0, 0, 0, 0, [], 0, [], [], [], []))),
                timerDetail: JSON.parse(JSON.stringify(timerUtil(300, 0, 0, 0))),
                questionsObj: {}, 
                questionsObjArray: [],
                questionLegendModalVisible: false,
            });
        default:
            return state;
    }
};