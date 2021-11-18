// Summary: This file is used to combine all login actions so that in out components, we refrence only this file to import all login actions.
//          All actions related to the login module are under /actions/login folder
// Created: 11/12/2019 12:00 pM - NS (IN)

//import { getAccessToken } from '../authentication/authentication-utils';

export const fetchOptionsGet = (token) => {
    //const token = getAccessToken();
    return {
        method: 'GET',
        mode: 'cors',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Bearer " + token
        }
    }
}

export const fetchOptionsPost = (data, isAuthenticatedRequest = true) => {
    
    if (isAuthenticatedRequest) {

        return {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify(data)
        }
    } else {

        return {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify(data)
        }
    }
};

export const parseJSON = (response) => {
    return response.json();
}

export const parseText = (response) => {
    return response.text();
}