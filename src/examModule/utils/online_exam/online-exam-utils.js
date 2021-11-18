// Summary: This function will provide the object to be handled in redux for online exam.
export const getOnlineExamDetails = (index, disable_prev_button, 
    disable_next_button, not_answer_count, mark_review_count, save_count, save_and_mark_review_count,
    no_of_sections, section_names, total_questions, start_index_of_sections_array, 
    no_of_question_per_section_array, section_buttons_color_array, end_index_of_sections_array) => {
    return{
        index: index,
        disable_prev_button: disable_prev_button,
        disable_next_button: disable_next_button,
        not_answer_count: not_answer_count,
        mark_review_count: mark_review_count,
        save_count: save_count,
        save_and_mark_review_count: save_and_mark_review_count,
        no_of_sections: no_of_sections,
        section_names: section_names,
        total_questions: total_questions,
        start_index_of_sections_array: start_index_of_sections_array,
        no_of_question_per_section_array: no_of_question_per_section_array,
        section_buttons_color_array: section_buttons_color_array,
        end_index_of_sections_array: end_index_of_sections_array
    };
};