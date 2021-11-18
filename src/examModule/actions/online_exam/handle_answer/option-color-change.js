import * as types from '../../action-types';

// Summary: This action will handle the color of selected option.
export const handleOptionColor = (index, questionArray, selectedOption, renderState, optionColorArr) => {
    
    questionArray[index].selected_option = selectedOption;
    questionArray[index].optionButtonColorArr = optionColorArr;
    questionArray[index].answered = true;

    let payloadObject = {
        questionsArr: questionArray,
        renderObj: !renderState
    };

    return{
        type: types.OPTION_CHANGE,
        payload: payloadObject
    }
}

// Summary: This action will handle text of fill in the blanks.
export const handleFillInTheBlanks = (index, questionArray, answerValue, renderState, submit) => {
    
    questionArray[index].descriptive_given_answer = answerValue; 
    questionArray[index].answered = submit == true ? true : false;

    let payloadObject = {
        questionsArr: questionArray,
        renderObj: !renderState
    };

    return{
        type: types.HANDLE_FILL_BLANKS,
        payload: payloadObject
    }
}

// Summary: This action will handle text of fill in the blanks.
export const handleCheckBox = (index, questionArray, answerValue, renderState, cbIndex) => {
    
    questionArray[index].multiselect_selected_boolean[cbIndex] = !(questionArray[index].multiselect_selected_boolean[cbIndex]);
    questionArray[index].answer_multiselect = answerValue; 
    questionArray[index].answered = true;
    // console.log(questionArray[index].multiselect_selected_boolean[cbIndex]);
    let payloadObject = {
        questionsArr: questionArray,
        renderObj: !renderState
    };

    return{
        type: types.HANDLE_CHECK_BOX,
        payload: payloadObject
    }
}