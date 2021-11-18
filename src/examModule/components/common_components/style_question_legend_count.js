import {
    StyleSheet
} from 'react-native';

const stylesQuestion = StyleSheet.create({
    containerRowMain: {
        flexDirection:'row',
        width: '100%',                    
        marginTop: 10, 
        marginBottom: 10
    },
    containerRowInner: {
        flexDirection:'row',
        width: '50%',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    containerRowInnerRight: {
        flexDirection:'row',
        width: '50%',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    coloredContainer: {
        width: 50,
        height: 50,
        borderRadius: 5,
    },
    Alert_Message:{
		fontSize: 22, 
		color: '#FFFFFF',
		textAlign: 'center',
		padding: 10,
		// height: '42%'
    },
    Alert_Message_Main:{
        fontSize: 22, 
		color: '#FFFFFF',
		textAlign: 'left',
		padding: 10,
    },
	Alert_Message_Text:{

		fontSize: 16, 
		color: '#000000',
		textAlign: 'center',
		padding: 10,
		lineHeight: 12
		// height: '42%'
    }, 
 
});

export { stylesQuestion };