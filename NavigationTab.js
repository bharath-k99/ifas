import React from 'react';
import { View, Image, Text } from 'react-native';
//libraries
import colors from './src/resources/colors';
import {
    createAppContainer, createStackNavigator, createDrawerNavigator, HeaderBackButton, Drawer,
    DrawerActions, StackActions, NavigationActions, Navigation, createBottomTabNavigator
} from "react-navigation";

//screens
import Home from './src/screens/sessions'
import Chats from './src/screens/MessageCategory'
import Notifications from './src/screens/NotificationScreen'
import SupportChatList from './src/screens/paiduser/SupportChatList'
//import Analysis from './src/screens/paiduser/AnalysisPaidFree'
import More from './src/screens/profile'

import { IconX, ICON_TYPE } from './src/utility/Icons';

const TabNavigator = createBottomTabNavigator(
    {
        Home: {
            screen: Home,
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
        Chats: {
            screen: Chats,
            navigationOptions: {
                tabBarLabel: 'Chat',
                tabBarIcon: ({ tintColor }) => (
                    <View>
                        {global.messageReadCount != undefined && global.messageReadCount == '0' ?

                            // <IconX
                            //     origin={ICON_TYPE.ANT_ICON}
                            //     name='wechat'
                            //     color={tintColor}
                            //     size={22}
                            // />
                            <Image
                                source={require('./src/images/messageRead.png')}
                                style={{
                                    width: 19,
                                    height: 19,
                                    tintColor: tintColor
                                }}
                                resizeMode={'contain'}
                            />
                            :
                            <Image
                                source={require('./src/images/messageUnread.png')}
                                style={{
                                    width: 19,
                                    height: 19,
                                }}
                                resizeMode={'contain'}
                            />
                        }
                    </View>),
                showLabel: true,
                activeColor: colors.white,
                inactiveColor: colors.tab_active_theme,
                barStyle: { backgroundColor: colors.theme },
            }
        },
        Notifications: {
            screen: Notifications,
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
        SupportChatList: {
            screen: SupportChatList,
            navigationOptions: {
                tabBarLabel: 'Support',
                tabBarIcon: ({ tintColor }) => (
                    <View>
                        <Image
                            style={{
                                width: 20,
                                height: 20,
                                tintColor: tintColor
                            }}
                            //support.png
                            source={require('./src/images/support.png')}
                            resizeMode={'contain'}
                        />
                        {/* <IconX
                            origin={ICON_TYPE.MATERIAL_ICONS}
                            name='support-agent'
                            color={tintColor}
                            size={22}
                        /> */}
                    </View>),
                showLabel: true,
                activeColor: colors.white,
                inactiveColor: colors.tab_active_theme,
                barStyle: { backgroundColor: colors.theme },
            }
        },
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
            style: { backgroundColor: colors.tab_theme },
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

export default TabNavigator;