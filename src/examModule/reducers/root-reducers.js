// Summary: This file contains all the reducers of app to combine them as one. 
import { combineReducers } from 'redux';
// import userInfoReducer from './user-info-reducers';
import onlineExamReducers from './online-exam-reducers';

//combineReducers will combine reducers from whole app
export default combineReducers({
	// auth: loginReducer,
	// SignupObject: signupReducer,
	// UserInfoReducer: userInfoReducer,
	OnlineExamReducers: onlineExamReducers
});