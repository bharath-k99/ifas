/** @format */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import bgMessaging from './src/bgMessaging';

//import TrackPlayer from 'react-native-track-player';

AppRegistry.registerComponent(appName, () => App);

// New task registration
AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => bgMessaging); // <-- Add this line

//TrackPlayer.registerPlaybackService(() => require('./service'));