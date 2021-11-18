import React from 'react';
import { View, Image,Text } from 'react-native';
//libraries
import colors from './src/resources/colors';
import {
    createAppContainer, createStackNavigator, createDrawerNavigator, HeaderBackButton, Drawer,
    DrawerActions, StackActions, NavigationActions, Navigation, createBottomTabNavigator
  } from "react-navigation";

//screens
import HomeFree from './src/screens/freeuser/FreeSession'
// 16 Sep 2021 (Change design)
import FreeeSession001 from './src/screens/freeuser/FreeeSession001'
import NotificationsFree from './src/screens/freeuser/FreeNotification'
import SupportChatList from './src/screens/paiduser/SupportChatList'
//import Analysis from './src/screens/paiduser/AnalysisPaidFree'
import More from './src/screens/profile'

import { IconX, ICON_TYPE } from './src/utility/Icons';

const TabNavigatorFree = createBottomTabNavigator(
    {
        Home:{
            screen: FreeeSession001,
            navigationOptions: {
                tabBarLabel: 'Home',
                tabBarIcon: ({ tintColor }) => (
                    <View>
                        <IconX
                            origin={ICON_TYPE.MATERIAL_COMMUNITY}
                            name='home'
                            color={tintColor}
                            size={22}
                        />
                    </View>),
                showLabel: true,
                activeColor: colors.white,
                inactiveColor: colors.tab_active_theme,
                barStyle: { backgroundColor: colors.theme },
            }
        },
        Notifications:{
            screen: NotificationsFree,
            navigationOptions: {
                tabBarLabel: 'Notifications',
                tabBarIcon: ({ tintColor }) => (
                    <View>
                        <IconX
                            origin={ICON_TYPE.MATERIAL_ICONS}
                            name='notifications'
                            color={tintColor}
                            size={22}
                        />
                    </View>),
                showLabel: true,
                activeColor: colors.white,
                inactiveColor: colors.tab_active_theme,
                barStyle: { backgroundColor: colors.theme },
            }
        },
        // SupportChatList: {
        //     screen: SupportChatList,
        //     navigationOptions: {
        //         tabBarLabel: 'Support',
        //         tabBarIcon: ({ tintColor }) => (
        //             <View>
        //                 <Image
        //                     style={{
        //                         width: 20,
        //                         height: 20,
        //                         tintColor: tintColor
        //                     }}
        //                     //support.png
        //                     source={require('./src/images/support.png')}
        //                     resizeMode={'contain'}
        //                 />
        //                 {/* <IconX
        //                     origin={ICON_TYPE.MATERIAL_ICONS}
        //                     name='support-agent'
        //                     color={tintColor}
        //                     size={22}
        //                 /> */}
        //             </View>),
        //         showLabel: true,
        //         activeColor: colors.white,
        //         inactiveColor: colors.tab_active_theme,
        //         barStyle: { backgroundColor: colors.theme },
        //     }
        // },
        // Analysis: {
        //     screen: Analysis,
        //     navigationOptions: {
        //         tabBarLabel: 'Analysis',
        //         tabBarIcon: ({ tintColor }) => (
        //             <View>
        //                 <IconX
        //                     origin={ICON_TYPE.FONT_AWESOME}
        //                     name='line-chart'
        //                     color={tintColor}
        //                     size={22}
        //                 />
        //             </View>),
        //         showLabel: true,
        //         activeColor: colors.white,
        //         inactiveColor: colors.tab_active_theme,
        //         barStyle: { backgroundColor: colors.theme },
        //     }
        // },
        More: {
            screen: More,
            navigationOptions: {
                tabBarLabel: 'More',
                tabBarIcon: ({ tintColor }) => (
                    <View>
                        <IconX
                            origin={ICON_TYPE.FONT_AWESOME}
                            name='navicon'
                            color={tintColor}
                            size={22}
                        />
                    </View>),
                showLabel: true,
                activeColor: colors.white,
                inactiveColor: colors.tab_active_theme,
                barStyle: { backgroundColor: colors.theme },
            }
        }
    },
    {
        tabBarOptions: {
        style: { backgroundColor:colors.tab_theme },
        activeTintColor: colors.white,
        inactiveTintColor: colors.tab_active_theme,
  
      },
        initialRouteName: "Home",
        activeColor: colors.white,
        inactiveColor: colors.tab_active_theme,
        barStyle: { backgroundColor: colors.tab_theme },
        showLabel: true,
    },
);

export default TabNavigatorFree;