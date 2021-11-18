// Summary: This file is Navigation Component which can be used in all modules for navigation.
// Created By: Vaibhav Sharma
import React from 'react';
import { 
    View, 
    TouchableOpacity, 
    Image 
} from 'react-native';

//Components
import Dashboard from '../screens/home/Dashboard';
import OnlineExam from '../screens/online_exam/OnlineExam';
import ExamGuide from '../screens/online_exam/examGuide';
import ExamSummary from '../screens/online_exam/examSummary';
import ExamResult from '../screens/online_exam/examResult';

// Resources
import colors from '../../resources/colors';

// react-navigation
import { createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

export const TestStackNavigator = createStackNavigator({
        TestGuide: {
            screen: ExamGuide,
            navigationOptions: ({navigation}) => ({
                header: null 
            })
        },    
        OnlineTest: {
            screen: OnlineExam,
            navigationOptions: ({navigation}) => ({
                header: null 
            })
        },
        TestSummary: {
            screen: ExamSummary,
            navigationOptions: ({ navigation }) => ({
                header: null
            })
        },
        TestResult: {
            screen: ExamResult,
            navigationOptions: ({ navigation }) => ({
                header: null
            })
        }
    },
    {
        initialRouteName: 'TestGuide',
});

// DrawerNavigator should be kept under a Stack Navigator for smooth working.
// Created By: Vaibhav Sharma

export const HomeDrawer = createStackNavigator({
    Home: {
        screen: Dashboard,
        navigationOptions: {
            title: 'Online Test',
            headerStyle: {
                backgroundColor: colors.theme,
                elevation: 0,
                shadowColor: 'transparent',
                borderBottomWidth: 0,
                shadowOpacity: 0
            },
            headerTitleStyle: {
                color: colors.white,
                textAlign: 'center',
                flex: 1
            },
            headerBackTitle: null,          
        }
    }
});

// AppNavigator will be the root navigator and used for switching between stack and Drawer navigators.
// Created By: Vaibhav Sharma
export const ExamNavigator = createSwitchNavigator({
        HomeDrawer: {
            screen: HomeDrawer,
            
        },
        Test: TestStackNavigator
    },
    {
        initialRouteName: 'HomeDrawer',
});
