import { StyleSheet } from 'react-native';

// Enum
import { answer_option, question_main_view } from '../../../enums/global_colors';

const styles = StyleSheet.create({
    containerQuestionLeft: {
        flex: 4
    },
    containerQuestionLeftTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    containerQuestionLeftTopCircle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    containerQuestionLeftTopCircleInner: {
        height: 25,
        width: 25,
        backgroundColor: question_main_view.circleColor,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    containerQuestionLeftTopQuestion: {
        flex: 7,
    },
    containerQuestionLeftBottom: {
        justifyContent: 'flex-end'
    },
});

const texts = StyleSheet.create({
    
    primary:{
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'justify',
        lineHeight: 20,
        marginTop:10,
        marginBottom:10  
    },
    optionButtonTopCircleInnerText: {
        fontSize: 14,
        textAlign: 'center',
        color: answer_option.option_circle_text
    }
});
const buttons = StyleSheet.create({

    optionButtonTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
        marginBottom: 2,
    },
    optionButtonTopCircle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    optionButtonTopCircleInner: {
        height: 25,
        width: 25,
        backgroundColor: answer_option.option_circle_view,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    optionButtonTopQuestion: {
        flex: 7,
        marginLeft: 5
    },
});



export { buttons, texts, styles };