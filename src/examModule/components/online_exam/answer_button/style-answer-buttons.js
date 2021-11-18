import {StyleSheet} from 'react-native';

// Enum
import { answer_button_section } from '../../../enums/global_colors';

const styles = StyleSheet.create({

    containerAnswer: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center', 
        flexDirection: 'row',
        borderColor: '#900',
        // answer_button_section.containerBorderColor,
        borderWidth: 1
    },
    containerAnswerChild: {
        flex:1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    }
});

const texts = StyleSheet.create({
    
    buttonText: {
        fontSize: 11,
        textAlign:'center',
        color: answer_button_section.buttonTextColor,    
    },
});
const buttons = StyleSheet.create({

    buttonContainer: {
        backgroundColor: 'transparent',
        // answer_button_section.buttonBackgroundColor,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'flex-end',
        width:45,
        height: 50
    }
});



export { buttons, texts, styles };