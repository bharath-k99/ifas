// Summary: This function checks for a valid string with value. It does not accept an empty string.
// Created: 3/25/2018 11:04 PM - US (TX)
export const isValidString = (input) => {

    return typeof input !== "undefined" && input != null && typeof input === "string" && input.length > 0;
};