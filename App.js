/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform, StyleSheet, ActivityIndicator, YellowBox, Alert, PushNotificationIOS, NativeEventEmitter,
  NativeModules, AsyncStorage, SafeAreaView, StatusBar, View
} from 'react-native';
import LoginScreen from './src/screens/login';
import FreeVideosScreen from './src/screens/free_videos';
import SessionsScreen from './src/screens/sessions';
import SubjectsScreen from './src/screens/subjects';
import GroupVideoCallScreen from './src/screens/GroupVideoCall';
import TopicsScreen from './src/screens/topics';
import PDFViewerScreen from './src/screens/PDFViewerScreen';
import TestScreen from './src/screens/TestScreen';
import TestYoutubePlayer from './src/screens/TestYoutubePlayer';
import LiveVideoStreaming from './src/screens/LiveVideoStreaming';
import CoursesScreen from './src/screens/courses';
import VideoStreamingScreen from './src/screens/video_streaming'
import ProfileScreen from './src/screens/profile'
import CoursesUnpaidScreen from './src/screens/courses_unpaid'
import VideoPlayerScreen from './src/screens/video_player'
import VideoPlayerNew from './src/screens/VideoPlayerNew'
import AudioPlayerScreen from './src/screens/AudioPlayer'
import DownloadedVideoPlayer from './src/screens/DownloadedVideoPlayer'
import DownloadedAudioPlayer from './src/screens/DownloadedAudioPlayer'
import NotificationScreen from './src/screens/NotificationScreen'
import NotificationDetail from './src/screens/NotificationDetail'

//navigation tab
import NavigationTab from './NavigationTab';
import NavigationTabWIthoutChat from './NavigationTabWIthoutChat';
import TabNavigatorFree from './NavigationFreeTab';
import LandingScreen from './src/screens/initialscreen/LandingScreen'

//FREE USER SCREENS
import FreeSession from './src/screens/freeuser/FreeSession';
import FreeSubects from './src/screens/freeuser/FreeSubects';
import FreeVideoList from './src/screens/freeuser/FreeVideoList';
import FreeVideoList001 from './src/screens/freeuser/FreeVideoList001';
import FreeVideoPlayer from './src/screens/freeuser/FreeVideoPlayer';
import FreeNotification from './src/screens/freeuser/FreeNotification';
import FreeNotificationDetail from './src/screens/freeuser/FreeNotificationDetail';
import FreeLiveSession from './src/screens/freeuser/FreeLiveSession';
//16 Sep 2021 (Change design)
import FreeeSession001 from './src/screens/freeuser/FreeeSession001';


//Paid user screens
import PaidSessions from './src/screens/paiduser/PaidSessions';
import PaidSubjects from './src/screens/paiduser/PaidSubjects';
import PaidTopic from './src/screens/paiduser/PaidTopic';
import PaidEbookSubects from './src/screens/paiduser/PaidEbookSubects';
import PaidEbookTopics from './src/screens/paiduser/PaidEbookTopics';
import PaidLiveSessionPlayer from './src/screens/paiduser/PaidLiveSessionPlayer';
import PaidTopicMsgSelection from './src/screens/paiduser/PaidTopicMsgSelection';
import SupportChatList from './src/screens/paiduser/SupportChatList';
import SupportAddMsg from './src/screens/paiduser/SupportAddMsg';
import SupportMessage from './src/screens/paiduser/SupportMessage';
import FreeChildVideoList from './src/screens/freeuser/FreeChildVideoList';
import GroupchatMessage from './src/screens/paiduser/GroupchatMessage';
import PaidTestWebView from './src/screens/paiduser/PaidTestWebView';
//Test module
import Instructions from './src/screens/paiduser/test_module/Instructions';
import ScoreBoard from './src/screens/paiduser/test_module/ScoreBoard';
import QuestionAnswer from './src/screens/paiduser/test_module/QuestionAnswer';
import ReviewTest from './src/screens/paiduser/test_module/ReviewTest';
//common paid free screen
//import AnalysisPaidFree from './src/screens/paiduser/AnalysisPaidFree';

import { createStackNavigator, createAppContainer } from 'react-navigation'
import SplashScreen from 'react-native-splash-screen'
import constants from './src/resources/constants';
import { showNativeAlert } from './src/resources/app_utility';

import firebase from 'react-native-firebase';
import type { RemoteMessage } from 'react-native-firebase';
import type { Notification, NotificationOpen } from 'react-native-firebase';

import { EventRegister } from 'react-native-event-listeners';
import Orientation from 'react-native-orientation';
import MessageScreen from './src/screens/MessageCategory';
import AddMessage from './src/screens/AddNewMessage';
import MessageChat from './src/screens/MessageChat';
import FullPreview from './src/screens/FullPreview'
import { NavigationActions } from 'react-navigation';

// Exam Module
import { Provider } from 'react-redux';
import { store } from './src/examModule/store/store'
import { ExamNavigator } from './src/examModule/navigation/Routes';

import Toast from 'react-native-tiny-toast';

const MyStatusBar = ({ backgroundColor, ...props }) => (
  <View style={[{ height: Platform.OS === 'ios' ? 20 : StatusBar.currentHeight }, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      timePassed: false
    };
  }

  componentDidMount() {
    constants.APP_HAS_LAUNCHED = true
    global.navigation = this.props.navigation
    console.log('global.navigation in app.js', global.navigation)
    Orientation.lockToPortrait();
    let that = this;
    if (Platform.OS == 'ios') {
      setTimeout(function () { that.setState({ timePassed: true }) }, 5000);
    } else {
      setTimeout(function () { that.setState({ timePassed: true }) }, 5000);
    }

    firebase.messaging().hasPermission()
      .then(enabled => {
        if (enabled) {
          // user has permission
          this.getToken()
        } else {
          // user doesn't have permission
          this.requestPermission()
        }
      });

    //Monitor token generation
    this.onTokenRefreshListener = firebase.messaging().onTokenRefresh(fcmToken => {
      console.warn("Token Refresh: " + fcmToken)
      constants.DEVICE_TOKEN = fcmToken
    });

    this.messageListener = firebase.messaging().onMessage((message: RemoteMessage) => {
      console.log("onMessage received")
      console.log(message)
    });


    this.notificationDisplayedListener = firebase.notifications().onNotificationDisplayed((notification: Notification) => {
      console.warn("onNotificationDisplayed" + notification)
      // Process your notification as required
      // ANDROID: Remote notifications do not contain the channel ID. You will have to specify this manually if you'd like to re-display the notification.
    });

    //ANDROID: called when app is in foregorund
    this.notificationListener = firebase.notifications().onNotification((notification: Notification) => {
      //console.warn(notification)
      console.log("onNotification " + constants.IS_LOGGED_IN)

      // Process your notification as required
      // if (constants.IS_LOGGED_IN == true) {
      //   // showNativeAlert(notification.body)
      //   let data = JSON.parse(notification.data.data)
      //   // console.log("relData: " + JSON.stringify(relData))

      //   this._openAppstate(data, notification)


      //   // EventRegister.emit('Notification_Received', '')
      // }

      if (constants.IS_LOGGED_IN == true) {
        // showNativeAlert(notification.body)
        let data = JSON.parse(notification.data.data)
        // console.log("relData: " + JSON.stringify(relData))
        if (data.relData.type == 'newmsg') {
          console.log('new msg')
          if (global.chatOpen == true && (global.currentThreadId == data.relData.tid)) {
            console.log('global.chatOpen true', global.chatOpen)
            // if (global.currentThreadId == data.relData.tid) {
            this._openAppstate(data, notification)
            // }
          }
          else {
            console.log('global.navigation foreground mohit', global.navigation)

            if (Platform.OS === "android") {
              console.log('in android if')
              const localNotification = new firebase.notifications.Notification({
                show_in_foreground: true,
                local_notification: true,
                sound: 'default',
              }).setNotificationId(notification.notificationId)
                .setTitle(notification.title)
                .setSubtitle(notification.subtitle)
                .setBody(notification.body)
                .setData(notification.data)
                .android.setChannelId(notification.notificationId)
                .android.setColor("#000000") // you can set a color here
                // .android.setSmallIcon("ic_stat_notification")
                .android.setColorized(true)
                .android.setAutoCancel(true)
                .android.setPriority(firebase.notifications.Android.Priority.High);

              const channelId = new firebase.notifications.Android.Channel(notification.notificationId, "Default", firebase.notifications.Android.Importance.High);
              firebase.notifications().android.createChannel(channelId);
              // Create the channel
              firebase.notifications()
                .displayNotification(localNotification)
                .catch(err => console.error(err));
            } else {
              //console.warn('notifiaction')
              const localNotificationIOS = new firebase.notifications.Notification({
                show_in_foreground: false,
                local_notification: true
              })
                .setNotificationId(notification.notificationId)
                .setTitle(notification.title)
                .setSubtitle(notification.subtitle)
                .setBody(notification.body)
                .setData(notification.data)
                .ios.setBadge(notification.ios.badge);

              return firebase.notifications()
                .displayNotification(localNotificationIOS)
                .catch(err => console.error(err));
            }

          }
        }
        else {
          this._openAppstate(data, notification)
        }

        // EventRegister.emit('Notification_Received', '')
      }
    });

    //ANDROID: called notification is tapped when app is in background
    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen: NotificationOpen) => {
      // Get the action triggered by the notification being opened
      const action = notificationOpen.action;
      // Get information about the notification that was opened
      const notification: Notification = notificationOpen.notification;
      console.log("onNotificationOpened")
      console.log(notification)
      if (constants.IS_LOGGED_IN == true) {
        const data = JSON.parse(notification.data.data)
        this._openAppstate(data, notification)
      }
    });

    firebase.notifications().getInitialNotification()
      .then((notificationOpen: NotificationOpen) => {
        console.log("getInitialNotification")
        if (notificationOpen) {
          // App was opened by a notification
          // Get the action triggered by the notification being opened
          const action = notificationOpen.action;
          // Get information about the notification that was opened
          const notification: Notification = notificationOpen.notification;
          console.log("onGetInitialNotification")
          console.log(notification)
          let data = JSON.parse(notification.data.data)

          if (data.relData.type == 'newmsg') {

            // setTimeout(() => {
            console.log('constants.IS_LOGGED_IN', constants.IS_LOGGED_IN)
            let self = this;
            AsyncStorage.getItem('ACCESS_TOKEN').then(value => {
              if (value !== null) {
                console.log('VALUE:' + value)
                const data = JSON.parse(notification.data.data)
                console.log('global.chatOpen false', global.chatOpen)
                global.isOpenedNotificationID = notification.notificationId;
                const navigateAction = NavigationActions.navigate({
                  routeName: 'MessageChat',
                  params: {
                    selectedMessage: data.relData.tid
                  }
                });
                global.navigateAction = navigateAction
              } else {
                // showNativeAlert('Not logged-In')
              }
            })
          }
          else {
            // if (constants.IS_LOGGED_IN == true) {
            const data = JSON.parse(notification.data.data)
            // this._openAppstate(data, notification)
            // }
          }
        }
      });
  }

  _openAppstate(data, notification) {
    console.warn('NOTIFICATIONMSG', data, notification)
    if (data.relData.type == 'newmsg') {
      console.log('new msg')
      //SECOND PHASE(21OCT20)
      if (global.landingScreenPaidItem != undefined &&
        global.landingScreenPaidItem.courses_name == 'paid') {
        if (global.chatOpen == true) {
          console.log('global.chatOpen true', global.chatOpen)
          if (global.currentThreadId == data.relData.tid) {
            EventRegister.emit("refreshChat", data.relData.tid);
          }
          else {
            console.log('global.chatOpen false', global.chatOpen)
            global.isOpenedNotificationID = notification.notificationId;
            console.log('global.navigation in if', global.navigation)
            EventRegister.emit("refreshChat", data.relData.tid);
          }
        } else {
          // console.log('global.chatOpen false', global.chatOpen)
          global.isOpenedNotificationID = notification.notificationId;
          console.log('global.navigation', global.navigation)

          const navigateAction = NavigationActions.navigate({
            routeName: 'MessageChat',
            params: {
              selectedMessage: data.relData.tid
            }
          });

          (global.navigation == undefined || global.navigation == null) ? null : global.navigation.dispatch(navigateAction);
        }
      }

      return
    }

    if (data.relData.type == 'expire') {
      //SECOND PHASE(21OCT20)
      if (global.landingScreenPaidItem != undefined &&
        global.landingScreenPaidItem.courses_name == 'paid') {
        EventRegister.emit('sessionExpire_notification', data.message)
      }
      else {
        //SECOND PHASE(21OCT20) FREE
        if (global.landingScreenPaidItem != undefined &&
          global.landingScreenPaidItem.courses_name == 'free') {

        }
      }
      return
    }

    if (data.relData.type == 'advt') {

      // AsyncStorage.setItem('ADMIN_NOTI_HANDLING_ALERT_MESSAGE', data.message).then(elementObj => {
      //   console.log('ADMIN_NOTI_HANDLING_ALERT_MESSAGE_ASYNC', elementObj)

      // }).catch(err => {
      //   console.log('ADMIN_NOTI_HANDLING_ALERT_MESSAGE_ASYNC' + err)
      // });
      EventRegister.emit("admin_notification_handling_alert", data);
      return
    }

    //End Conf
    if (data.relData.type == 'conf_end') {

      //console.warn('NOTIFICATIONMSG1', data, notification)

      //SECOND PHASE(21OCT20)
      if (global.landingScreenPaidItem != undefined &&
        global.landingScreenPaidItem.courses_name == 'paid') {

        if (Platform.OS == 'android') {

          //console.warn('NOTIFICATIONMSG2', data, notification)

          if (global.isAndroidConferenceOpen == true) {

            //console.warn('NOTIFICATIONMSG3', data, notification)
            EventRegister.emit("backToDashboard", data.relData);
            setTimeout(() => {
              Toast.show(data.message);
            }, 2000);

          } else {
            EventRegister.emit("end_live_conf_on_notification", '');
            if (global.isAndroidLiveSessionOpen == false) {
              Toast.show(data.message);
            }
            //console.warn('NOTIFICATIONMSG4', data, global.isAndroidConferenceOpen, notification)
          }
        } else {
          //console.warn('NOTIFICATIONMSG_IOS1', data, global.isAndroidConferenceOpen, notification)
          //this.props.navigation.navigate('Sessions')
          setTimeout(() => {
            // Alert.alert(
            //   'IFAS',
            //   data.message,
            //   [
            //     { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
            //     //{ text: 'Ok', onPress: ()=> console.log('Cancel Pressed'), style: 'cancel' },

            //   ],
            //   { cancelable: false }
            // )
            //if (global.isLiveConfRunningIosForLiveSessionNotHide == true) {
            Toast.show(data.message);
          }, 2000);
          EventRegister.emit("end_live_conf_on_notification", '');
        }
      }
      else {
        //SECOND PHASE(21OCT20) FREE
        if (global.landingScreenPaidItem != undefined &&
          global.landingScreenPaidItem.courses_name == 'free') {

        }
      }
      return
    }

    if (data.relData.type == 'warn_expire') {

      console.warn('NOTIFICATIONMSG1', data, notification)
      return
    }
    if (data.relData.type == 'course_expire') {

      console.warn('NOTIFICATIONMSG2', data, notification)
      return
    }

    //Start Conf
    if (data.relData.type == 'conf_start') {

      console.warn('NOTIFICATIONMSG_START1', data, global.isAndroidConferenceOpen, notification)

      //SECOND PHASE(21OCT20)
      if (global.landingScreenPaidItem != undefined &&
        global.landingScreenPaidItem.courses_name == 'paid') {
        if (Platform.OS == 'android') {

          console.warn('NOTIFICATIONMSG_START2', global.isChatLiveSessionVisible)
          if (global.isChatLiveSessionVisible == false) {
            Alert.alert(
              'IFAS',
              data.message,
              [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'Ok', onPress: () => this.joinLiveConference() },

              ],
              { cancelable: false }
            )
          } else {
            if (global.isTopicPlayerVisible == true) {
              Toast.show(data.message);
            } else {
              if (Platform.OS == 'android') {
                this.joinLiveConfAndroidLiveSession()
                // Alert.alert(
                //   'IFAS',
                //   data.message,
                //   [
                //     { text: 'Ok', onPress: () => this.joinLiveConfAndroidLiveSession() },

                //   ],
                //   { cancelable: false }
                // )
              }

            }

          }
        }
        else {

          //console.warn('NOTIFICATIONMSG_START3', global.isChatLiveSessionVisible)
          if (global.isChatLiveSessionVisible == false) {
            Alert.alert(
              'IFAS',
              data.message,
              [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'Ok', onPress: () => this.joinLiveConference() },

              ],
              { cancelable: false }
            )
          } else {
            Toast.show(data.message);
          }
        }
      }
      return
    }

    console.log("Video URL: " + data.relData.video_url)
    if (data.relData.video_url.trim() != '') {
      constants.VIDEO_URL = data.relData.video_url.trim()
    } else {
      constants.VIDEO_URL = ""
    }

    //SECOND PHASE(21OCT20)
    if (global.landingScreenPaidItem != undefined &&
      global.landingScreenPaidItem.courses_name == 'paid') {
        console.warn('ENTER LIVE SESSION1',global.landingScreenPaidItem)
      if (data.relData.type == 'start') {
        console.warn('ENTER LIVE SESSION2',global.landingScreenPaidItem)
        if (global.isLiveConfRunningIosForLiveSessionNotHide == true) {
          Alert.alert(
            'IFAS',
            data.message,
            [
              { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
              { text: 'Ok', onPress: () => this.joinSession() },
              // { text: 'Join', onPress: () => this.joinSession() },

            ],
            { cancelable: false }
          )
        }
      } else {
        if (global.isLiveConfRunningIosForLiveSessionNotHide == true) {
          Alert.alert(
            'IFAS',
            data.message,
            [
              { text: 'Ok', onPress: () => EventRegister.emit('Notification_Received', '') },
            ],
            { cancelable: false }
          )
        }
      }
    }
  }
  joinSession() {
    console.log('Join Pressed')

    //if (global.isLiveConfRunningIosForLiveSessionNotHide == false) {
    console.warn('entrrrr_1')
    EventRegister.emit('start_session_on_notification', '')
    //}

    // if (Platform.OS == 'ios') {
    //   if (global.isLiveConfRunningIosForLiveSessionNotHide == false) {
    //     console.warn('entrrrr_1')
    //     EventRegister.emit('start_session_on_notification', '')
    //   } else {
    //     console.warn('entrrrr_2')
    //   }
    // } else {
    //   EventRegister.emit('start_session_on_notification', '')
    // }
  }
  joinLiveConference() {
    console.log('Join Pressed')
    EventRegister.emit('start_live_conf_on_notification', '')
  }
  joinLiveConfAndroidLiveSession() {
    console.log('Android Live Session')
    EventRegister.emit('start_live_conf_noti_android_live_session', '')
  }
  //Here clear
  componentWillUnmount() {
    this.onTokenRefreshListener();
    this.notificationDisplayedListener();
    this.notificationListener();
    this.notificationOpenedListener();
  }

  requestPermission() {
    firebase.messaging().requestPermission()
      .then(() => {
        // User has authorised 
        this.getToken()

      })
      .catch(error => {
        // User has rejected permissions  
      });
  }

  //Get device token for notification
  getToken() {
    firebase.messaging().getToken()
      .then(fcmToken => {
        if (fcmToken) {
          // user has a device token
          console.log("DEVICE_TOKEN: " + fcmToken)
          constants.DEVICE_TOKEN = fcmToken
          // showNativeAlert(fcmToken)
        } else {
          // user doesn't have a device token yet
          // showNativeAlert("NO device token")
        }
      });
  }

  // Render method 
  render() {
    if (this.state.timePassed == true) {
      SplashScreen.hide();
      return (
        <SafeAreaView style={{
          flex: 1,
          height: (Platform.OS === 'ios') ? 20 : 0,
          backgroundColor: "#052048"
        }}>
          <StatusBar
            barStyle="light-content"
            backgroundColor="#052048" />
          <Provider store={store}>
            <AppContainer />
          </Provider>
          {/* <AppContainer /> */}
        </SafeAreaView>
      );
    } else {
      return (
        <ActivityIndicator />
      );
    }

  }
}

// Navigation stack
const PrimaryNav = createStackNavigator({
  Courses: {
    // screen: LandingScreen, 
    // navigationOptions: { header: null } 
    //navigationOptions: {
      //CoursesScreen
    screen: LoginScreen, navigationOptions: {
      headerBackTitle: null,
    },
  },
  FreeVideos: { screen: FreeVideosScreen },
  //Login: { screen: LoginScreen },
  Sessions: { screen: SessionsScreen },
  Subjects: { screen: SubjectsScreen },
  GroupVideoCall: { screen: GroupVideoCallScreen, navigationOptions: { header: null } },
  CoursesUnpaid: { screen: CoursesUnpaidScreen },
  Topics: { screen: TopicsScreen },
  VideoStreaming: { screen: VideoStreamingScreen },
  VideoPlayer: { screen: VideoPlayerScreen },
  AudioPlayer: { screen: AudioPlayerScreen },
  DownloadedVideoPlayer: { screen: DownloadedVideoPlayer },
  DownloadedAudioPlayer: { screen: DownloadedAudioPlayer },
  VideoPlayerNew: { screen: VideoPlayerNew, navigationOptions: { header: null }  },
  Profile: { screen: ProfileScreen },
  Message: { screen: MessageScreen },
  NotificationScreen: { screen: NotificationScreen },
  //AnalysisPaidFree: { screen: AnalysisPaidFree },
  NotificationDetail: { screen: NotificationDetail },
  AddMessage: { screen: AddMessage },
  MessageChat: { screen: MessageChat, navigationOptions: { header: null } },
  FullPreview: { screen: FullPreview },
  PDFViewerScreen: { screen: PDFViewerScreen, navigationOptions: { header: null } },
  TestScreen: { screen: TestScreen },
  TestYoutubePlayer: { screen: TestYoutubePlayer },
  LiveVideoStreaming: { screen: LiveVideoStreaming },

  //Free new module(1-Sep-2020)
  FreeSession: { screen: FreeSession, navigationOptions: { header: null } },
  FreeSubects: { screen: FreeSubects, navigationOptions: { header: null } },
  FreeVideoList: { screen: FreeVideoList, navigationOptions: { header: null } },
  FreeLiveSession: { screen: FreeLiveSession, navigationOptions: { header: null } },
  FreeVideoList001: { screen: FreeVideoList001, navigationOptions: { header: null } },
  FreeChildVideoList: { screen: FreeChildVideoList, navigationOptions: { header: null } },
  FreeVideoPlayer: { screen: FreeVideoPlayer },
  FreeNotification: { screen: FreeNotification },
  FreeNotificationDetail: { screen: FreeNotificationDetail },
  FreeeSession001: { screen: FreeeSession001, navigationOptions: { header: null } },

  //Paid new module(8 sep 2020)
  PaidSessions: { screen: PaidSessions, navigationOptions: { header: null } },
  PaidSubjects: { screen: PaidSubjects, navigationOptions: { header: null } },
  PaidTopic: { screen: PaidTopic, navigationOptions: { header: null } },
  PaidEbookSubects: { screen: PaidEbookSubects, navigationOptions: { header: null } },
  PaidEbookTopics: { screen: PaidEbookTopics, navigationOptions: { header: null } },
  PaidLiveSessionPlayer: { screen: PaidLiveSessionPlayer, navigationOptions: { header: null } },
  PaidTopicMsgSelection: { screen: PaidTopicMsgSelection, navigationOptions: { header: null } },
  SupportChatList: { screen: SupportChatList, navigationOptions: { header: null } },
  SupportAddMsg: { screen: SupportAddMsg, navigationOptions: { header: null } },
  SupportMessage: { screen: SupportMessage, navigationOptions: { header: null } },
  GroupchatMessage: { screen: GroupchatMessage, navigationOptions: { header: null } },
  PaidTestWebView: { screen: PaidTestWebView, navigationOptions: { header: null } },
  //Test module
  Instructions: { screen: Instructions, navigationOptions: { header: null } },
  ScoreBoard: { screen: ScoreBoard, navigationOptions: { header: null } },
  QuestionAnswer: { screen: QuestionAnswer, navigationOptions: { header: null } },
  ReviewTest: { screen: ReviewTest, navigationOptions: { header: null } },
  //common paid or free module

  //Tab screen and landing screen(initial screen)
  LandingScreen: { screen: LandingScreen, navigationOptions: { header: null } },
  NavigationTab: { screen: NavigationTab, navigationOptions: { header: null } },
  NavigationTabWIthoutChat: { screen: NavigationTabWIthoutChat, navigationOptions: { header: null } },
  TabNavigatorFree: { screen: TabNavigatorFree, navigationOptions: { header: null } },
});

const FinalNav = createStackNavigator({
  PrimaryNav: {
    screen: PrimaryNav,
    navigationOptions: {
      header: null,

    }
  },
  ExamNavigator: {
    screen: ExamNavigator,
    navigationOptions: {
      header: null,

    }
  }
});

const AppContainer = createAppContainer(FinalNav);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

