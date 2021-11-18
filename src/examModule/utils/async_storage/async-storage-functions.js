// Summary: Use for stroing name of user in async storage.
// Created: 11/14/2019 05:35 PM - VS (IN)

import { AsyncStorage } from 'react-native';

// Use for stroing name of user in async storage.
// Created: 11/14/2019 05:35 PM - VS (IN)
export const _storeData = async (key, value) => {
  	try {
    	await AsyncStorage.setItem(key, value);
  	} catch (error) {
    	console.log(error);
  	}
}

// Use for retrieving name of user from async storage.
export const _retrieveData = async () => {       
	try {
		const value = await AsyncStorage.getItem('@username');
		if (value !== null) {
			// We have data!!
			return value;
		}
	} catch (error) {
		console.log(error);
	}
}