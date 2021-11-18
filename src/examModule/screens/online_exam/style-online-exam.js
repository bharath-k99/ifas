import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 5,
        paddingTop: 0
    },
    containerTop: {
        flex: 1,
        flexDirection: 'row'
    },
    TopLeft: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F98144'
    },
    TopMiddle: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#29B493'
    },
    TopRight: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F98144'
    },
    containerQuestion: {
        flex: 5,
        // flexDirection: 'row',
        borderColor: '#C9D7DD'
    },
    containerQuestionLeft: {
        flex: 1
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
        backgroundColor: '#000000',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    containerQuestionLeftTopQuestion: {
        flex: 7,
        marginLeft: 5
    },
    containerQuestionLeftBottom: {
        flex: 1,
        flexDirection: 'column'
    },
    containerQuestionRight: {
        flex: 1,
        alignItems: 'center',
        borderColor: '#C9D7DD',
        borderWidth: 1
    },
    containerAnswer: {
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'center', 
        flexDirection: 'row',
        borderColor: '#C9D7DD',
        borderWidth: 2
    },
    containerAnswerChild: {
        flex:1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    containerQuestionPalleteQuestions: {
        flex:1,
        alignItems: 'center',
        justifyContent: 'center',
    }
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
    buttonText: {
        fontSize: 11,
        textAlign:'center',
        color:'#FF6347',    
    },
    headerText: {
        fontSize: 16,
        textAlign:'center',
        color:'#FDF7FF',    
    },
    headerSubText: {
        fontSize: 14,
        textAlign:'center',
        color:'#FDF7FF',    
    },
    questionPaletteText: {
        fontSize: 14,
        textAlign:'center',
        color:'#FF6347',    
    },
    optionButtonTopCircleInnerText: {
        fontSize: 14,
        textAlign:'center',
        color:'#FDF7FF'
    }
});
const buttons = StyleSheet.create({

    buttonContainer: {
        backgroundColor: '#C9D7DD',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        width:40,
        height: 80
    },
    optionButtonContainer: {
        backgroundColor: '#C9D7DD',
        marginTop: 2,
        marginBottom: 2,
        paddingLeft: 5,
        paddingRight: 5,
        height: 40,
        // alignItems: 'flex-start',
        // justifyContent: 'center',
    },
// 35C8C8
    optionButtonTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#C9D7DD',
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
        backgroundColor: '#35C8C8',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    optionButtonTopQuestion: {
        flex: 7,
        marginLeft: 5
    },
    buttonsQuestionPalleteQuestions: {
        height: 30,
        width: 30,
        marginTop: 5,
        backgroundColor: '#C9D7DD',
        alignItems: 'center',
        justifyContent: 'center'
    }
});



export { buttons, texts, styles };