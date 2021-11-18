// Summary: This file contains all validation actions used in all modules.
// Created: 9/6/2017 8:06 PM - US (ID)

// Actions
import { setErrors, clearErrors } from '../error/error-actions';

// Utils
import { validateObject } from '../../utils/validation/validation';

// Summary: This function is used to validate an object and set errors -- if applicable.
// Created: 9/6/2017 8:07 PM - US (ID)
export const validate = (moduleName, name, object, validations, callback, language = "en") => {
    
    // First clear any existing errors
    return (dispatch) => {

        // First, clear any existing errors
        dispatch(clearErrors());

        // Validate object
        const response = validateObject(object, validations);

        if (response.isValid) {

            // Response is valid. Call callback function
            return callback(object);
        } else {
            // console.log("export const validate");
            // console.log(response);
            // Response is invalid. Set errors.
            return dispatch(setErrors(moduleName, name, response.messages));
        }
    }
}