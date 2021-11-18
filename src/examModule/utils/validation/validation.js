// Summary: This file contains all validation functions used in the frontend.
// Available validation rules are: required, email, min_length
// Created: 11/11/2019 12:00 pM - VS (IN)

import types from '../../enums/validation/validation-types';


const regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


// Summary: This method is used to perform specified validations on an object.
// Created: 12/22/2016 12:33 PM - US (WY)
export const validateObject = (object, validations, language = "en") => {
   
    // console.log(object);
    // Create response object
    let response = {
        isValid: true,
        messages: []
    };

    // Go through object properties and perform required validations
    let value = null;
    let value2 = null;
    let fieldName = "";
    let validationsForProperty = [];
    let requirements = [];
    let result = {};
    let conditions = [];
    let validate = true;
    
    for (let index in object) {

        // Reset values in case they've already been assigned values
        validate = false;
        value2 = null;

        // Field name is either the alias -- if one defined -- or property name
        fieldName = (typeof validations[index] !== 'undefined' && typeof validations[index].alias !== 'undefined' && validations[index].alias !== null ? validations[index].alias : index)

        // Get value
        value = object[index];
        
        // Get a list of validations required for the property
        validationsForProperty = (typeof validations[index] !== 'undefined' ? validations[index].validations : null);

        // If validations include PHONE_NUMBER, we need to get countryId and assign it to value2
        if (validationsForProperty !== null && validationsForProperty.includes(types.PHONE_NUMBER))
            value2 = object.countryId;
        
        // Get validation requirements if defined. See validation documentation for more info.
        requirements = (typeof validations[index] !== 'undefined' && typeof validations[index].requirements !== 'undefined' ? validations[index].requirements : null);
        
        // Get validation conditions if defined. See validation documentation for more info.
        conditions = (typeof validations[index] !== 'undefined' && typeof validations[index].conditions !== 'undefined' ? validations[index].conditions : null)

        if(validationsForProperty !== null) {

            // See if we have any conditions that may allow us to skip this particular validation
            if(conditions === null) {
                validate = true;
            } else {
                
                // Get current value for property mentioned in the condition
                let conditionFieldName = "";
                let actualValue = null;

                for(let condition of conditions) {
                
                    conditionFieldName = condition.fieldName;
                    actualValue = object[conditionFieldName];

                    for(let conditionValue of condition.value) {
                    
                        if(!validate && actualValue === conditionValue)
                            validate = true;
                    }
                }
            }

            // Run validations for this value -- unless a condition makes it unnecessary
            if(validate) {
                result = validateValue(fieldName, value, validationsForProperty, requirements, language);
                // If invalid, add messages to response
                if(!result.isValid) {
                    response.isValid = false;
                    // Make sure we have messages
                    if(result.messages.length > 0) {
                        // Set invalid message properties
                        let invalidMessage = {
                            fieldName: index,
                            messages: []
                        };
                        for(let message of result.messages) {
                            invalidMessage.messages.push(message);
                        }
                        // Put invalid message into response
                        response.messages.push(invalidMessage);
                    }
                }
            }
        }
    }
    
    return response;
};


// Summary: This method is used to perform specified validation rules on a value.
// Created: 11/11/2019 12:00 pM - VS (IN)

export const validateValue = (fieldName, value, validations, requirement, language = "en") => {
    
    // Create response object
    let response = {
        isValid: true,
        messages: []
    };

    // Go through all validations and check if the value is valid
    for (let i = 0; i < validations.length; i++) {

        switch (validations[i]) {
    
            case types.REQUIRED:
                if(value === null || value.length === 0){
                    response.isValid = false;
                    response.messages.push(getMessage(fieldName, types.REQUIRED, requirement, language));
                }
                break;
            case types.MIN_CHARS:
                if(value.length < requirement) {
                    response.isValid = false;
                    response.messages.push(getMessage(fieldName, types.MIN_CHARS, requirement, language));
                }
                break;
            case types.BOOLEAN:
                if(value != true) {
                    response.isValid = false;
                    response.messages.push(getMessage(fieldName, types.BOOLEAN, requirement, language));
                }
                break;
            case types.EMAIL:
                if(!regexEmail.test(value)) {
                    response.isValid = false;
                    response.messages.push(getMessage(fieldName, types.EMAIL, requirement, language));
                }
                break;
        }
    }
    return response;
}


// Summary: This object stores all validation messages we can display on the frontend -- in all languages.
// Created: 11/11/2019 12:00 pM - VS (IN)

const messages = {

    "required-en": {message: "${fieldName} is required"},
    "min-chars-en": {message: "Minimum ${requirement} characters required for ${fieldName}"},
    "email-en": { message: "Please enter a valid ${fieldName}" },
    "boolean-en": { message: "Please accept the ${fieldName}" },
};

// Summary: This function returns the standard message we display if a field is not valid.
// Created: 11/11/2019 12:00 pM - VS (IN)

const getMessage = (fieldName, validation, requirement, language) => {

    const messageId = getMessageId(validation, language);
    return eval("`" + messages[messageId].message + "`");
}


// Summary: This method is used to generate messageId from validation and language.
//          We use enum to enforce consistency but we also want messageId's to be easy-to-understand which is why we need this reverse conversion method.
// Created: 11/11/2019 12:00 pM - VS (IN)
const getMessageId = (validation, language) => {

    let messageId = "";

    // Convert enum value to text
    switch (validation) {
        case types.REQUIRED:
            messageId = "required";
            break;
        case types.MIN_CHARS:
            messageId = "min-chars";
            break;
        case types.EMAIL:
            messageId = "email";
            break;
        case types.BOOLEAN:
            messageId = "boolean";
            break;    
    }

    // Add language suffix to the Id
    messageId += "-" + language;

    return messageId;
}