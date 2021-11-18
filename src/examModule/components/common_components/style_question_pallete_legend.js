import {
  Platform,
  StyleSheet
} from 'react-native';

// Enum
import { color_code_answer_button } from '../../enums/global_colors';

const styles = StyleSheet.create({
 
	MainContainer :{
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: (Platform.OS == 'ios') ? 20 : 0,
	},
	Alert_Main_View:{

		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor : '#FFFFFF', 
		height: '90%' ,
		width: '90%',
		borderWidth: 1,
		borderColor: '#000000',
		borderRadius:7,
	},
	Alert_Main_View_End_Exam:{

		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor : '#FFFFFF', 
		height: 300,
		width: '90%',
		borderWidth: 1,
		borderColor: '#000000',
		borderRadius:7,
	},
	Alert_Title_View: {
		flex:.5,
		backgroundColor : '#009688',
		width: '100%'
	},
	Alert_Title:{

		fontSize: 25, 
		color: '#FFFFFF',
		textAlign: 'center',
		padding: 10,
		backgroundColor : '#009688',
		width: '100%',
		// height: '28%'
	},
	Main_content_view:{
		flex: 3,
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 10,
	},
	Main_content_view_end_exam:{
		flex: 2.5,
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 10,
		padding: 10
	},
	Alert_Message:{

		fontSize: 22, 
		color: '#FFFFFF',
		textAlign: 'center',
		padding: 10,
		// height: '42%'
	},
	Alert_Message_Text:{

		fontSize: 16, 
		color: '#000000',
		textAlign: 'center',
		padding: 10,
		lineHeight: 12
		// height: '42%'
	},
	buttonStyle: {
		
		width: '100%',
		// height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor : '#009688',

	},
	buttonStyleOk: {
		
		width: '50%',
		// height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		// backgroundColor : '#009688',

	},
	TextStyleOk:{
		color: '#000000',
		textAlign:'center',
		fontSize: 22,
		marginTop: -5
	},
	TextStyle:{
		color: '#FFFFFF',
		textAlign:'center',
		fontSize: 22,
		marginTop: -5
	},
	textStyleEndExam:{
		fontSize: 16,
		fontWeight: 'bold'
	},
	textStyleEndExamAttempted:{
		fontSize: 16,
		marginTop: 15
	}

});

export { styles };