import { BackHandler, Alert, Dimensions, AsyncStorage } from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';

const handleAndroidBackButton = callback => {
    BackHandler.addEventListener('hardwareBackPress', () => {
        callback();
        return true;
    });
};


const handleAndroidBackButtonSimple = callback => {
    BackHandler.addEventListener('hardwareBackPress', () => {
        callback.goBack()
        return true;
    });
};

/**
 * Removes the event listener in order not to add a new one
 * every time the view component re-mounts
 */
const removeAndroidBackButtonHandler = () => {
    BackHandler.removeEventListener('hardwareBackPress', () => { });
}


const exitAlert = () => {
    console.log('blue whale')
    Alert.alert(
        'EXIT APP',
        'Are you sure you want to exit the app?',
        [
            { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
            { text: 'OK', onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: false }
    )
};

 

export { handleAndroidBackButton, exitAlert, removeAndroidBackButtonHandler, handleAndroidBackButtonSimple};
