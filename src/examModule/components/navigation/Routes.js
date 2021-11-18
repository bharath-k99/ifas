// Summary: This file is Navigation Component which can be used in all modules for navigation.
// Created By: Vaibhav Sharma
import React from 'react';
import { 
    View, 
    TouchableOpacity, 
    Image 
} from 'react-native';

//Components
import Dashboard from '../../screens/home/Dashboard';
import DrawerContentComponents from '../side_menu/DrawerContentComponents';
import Login from '../../screens/authentication/login/LoginUI';
import OnlineExam from '../../screens/online_exam/OnlineExam';
import Signup from '../../screens/authentication/signup/SignUpUI';
import UserInfo from '../../screens/user_info/UserInfo';
import ExamGuide from '../../screens/online_exam/examGuide';
import ExamSummary from '../../screens/online_exam/examSummary';
import ExamResult from '../../screens/online_exam/examResult';

// react-navigation
import { createAppContainer,createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator, DrawerActions } from 'react-navigation-drawer';

// Style sheet
import RouteStyles from './style-routes';

// DrawerNavigator creates the route for the side menu.
// Created By: Vaibhav Sharma
const DrawerNavigator = createDrawerNavigator({
        Home: {
            screen: Dashboard,
        },
        // Test:{
        //     screen: OnlineExam
        // }
    },{
        contentComponent: DrawerContentComponents,
        initialRouteName: 'Home',
        navigationOptions: ({navigation}) => ({
            title: `Dashboard`,
            headerStyle: {
                backgroundColor: '#d3d3d3',
            },
            drawerType:'back',
            headerTintColor: '#000',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
            headerLeft: 
                <View>
                    <TouchableOpacity style={RouteStyles.drawerHeaderLeft}
                        onPress={() => {
                            navigation.dispatch(DrawerActions.toggleDrawer())
                        }
                    }>
                        <Image source={require('../../assets/images/menu_icon.png')} />
                    </TouchableOpacity>
                </View>,  
        })
    }
);

// UserStackNavigator creates the route for the user info and  other routes which is not part of DrawerNavigator after user login .
// Created By: Vaibhav Sharma

export const UserStackNavigator = createStackNavigator({
    UserInfo: {
        screen: UserInfo,
        navigationOptions: ({navigation}) => ({
            headerLeft: 
            <View style={RouteStyles.backButtonContainer}>
                 <TouchableOpacity  
                    onPress={() => navigation.navigate('Home')}>
                <Image resizeMode='contain'  style={RouteStyles.backButton}source={ require('../../assets/images/back.png') }/>
            </TouchableOpacity>
            </View>
           
        })
    }
});

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
        screen: DrawerNavigator
    }
});

// AuthStackNavigator creates the routes for login and signup.
// Created By: Vaibhav Sharma

export const AuthStackNavigator = createStackNavigator({
        Login: {
            screen: Login,
            navigationOptions: ({navigation}) => ({
                title: 'Login',
                headerTintColor: '#000',    
                headerStyle: { backgroundColor: '#ffbd27',height:50},
                headerTitleStyle: {
                  color: '#ffffff', 
                  fontWeight: 'bold',
                  width: Platform.OS === 'ios' ? 'auto' : 180,
                  // fontSize: Platform.OS === 'ios' ? 20 : 20,
                  // ign: Platform.OS === 'ios' ? 'auto' : 'center'
                },
            })
        },
        Signup: {
            screen: Signup,
            navigationOptions: ({navigation}) => ({
                title: 'Signup',
                headerTintColor: '#000',    
                headerStyle: { backgroundColor: '#ffbd27',height:50},
                headerTitleStyle: {
                  color: '#ffffff', 
                  fontWeight: 'bold',
                  width: Platform.OS === 'ios' ? 'auto' : 180,
                  // fontSize: Platform.OS === 'ios' ? 20 : 20,
                  // ign: Platform.OS === 'ios' ? 'auto' : 'center'
                },
            })
        }
    },
    {
        initialRouteName: 'Login',
});

// AppNavigator will be the root navigator and used for switching between stack and Drawer navigators.
// Created By: Vaibhav Sharma

export const AppNavigator = createSwitchNavigator({
        AuthStack:{
            screen: AuthStackNavigator          
        },
        HomeDrawer: {
            screen: HomeDrawer
        },
        Test: TestStackNavigator,
        User: UserStackNavigator,
    },
    {
        initialRouteName: 'AuthStack',
});


