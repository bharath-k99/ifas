import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({

    containerQuestionPalleteQuestions: {
        // flex:1,
        flexDirection: 'row',
        flexWrap: 'wrap'
        // alignItems: 'center',
        // justifyContent: 'center',
    }
});

const texts = StyleSheet.create({

    questionPaletteText: {
        fontSize: 14,
        textAlign:'center',
        color:'#FF6347',    
    },
});
const buttons = StyleSheet.create({

    buttonsQuestionPalleteQuestions: {
        height: 30,
        width: 30,
        margin: 5,
        alignItems: 'center',
        justifyContent: 'center'
    }
});



export { buttons, texts, styles };