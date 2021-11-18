// Summary: This file contains all error actions used in all modules.
// Created By: Vaibhav Sharma

import * as types from '../action-types';
import { getBlankLoginErrors } from '../../utils/login/login-utils';

// Summary: This action is used to add/remove error messages to the errors array in state.
// Created By: Vaibhav Sharma
export const setErrors = (moduleName, name, errorMessages) => {

    let errors = {};

    switch(moduleName) {
        case "login":
            errors = JSON.parse(JSON.stringify(getBlankLoginErrors(null, null)));
            break;
    }

    // Start with the initial blankError object and assign messages to its properties
    for(let item of errorMessages) {
        errors[name][item.fieldName] = item.messages;
    }
    return {
        type: types.SET_ERRORS,
        errors: errors
    };
};

// Summary: This action is used to clear the state for errors.
// Created By: Vaibhav Sharma
export const clearErrors = () => {
    return {
        type: types.CLEAR_ERRORS
    };
};