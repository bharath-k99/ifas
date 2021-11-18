import React, { Component } from 'react';
import {
    Text, 
    TouchableOpacity,
    View
} from 'react-native';

// Enum
import { question_pallete_text } from '../../../enums/global_colors';

// StyleSheet
import { buttons, texts, styles } from './style-question-section-right';

// Summary: This section will contain the functionality for questions pallete.
export default class QuestionSectionRight extends Component {

    constructor(props){
        super(props);
    }

    render(){

        // Summary: Map will generate the for loop on array of object and by the 
        // help of that we dynamically create buttons.
        let buttonsListArr = this.props.questionsObjProp.map(buttonInfo => (
            <View>
                <TouchableOpacity 
                    key={ buttonInfo.question_no } 
                    style = { 
                        [ buttons.buttonsQuestionPalleteQuestions, { backgroundColor: buttonInfo.question_pallete_color } 
                    ]}
                    onPress = {
                        () => this.props.navigationOfQuestionProps(buttonInfo.question_no)        
                }>
                    <Text style={{
                        color: buttonInfo.answered == true ? question_pallete_text.button_answered_text : question_pallete_text.button_text
                    }}>  
                        {buttonInfo.question_no}
                    </Text>
                </TouchableOpacity>
                { 
                    buttonInfo.save_mark_review 
                        && 
                    <View style={{ 
                        height: 10, 
                        width: 34,
                        alignItems: 'flex-end',
                        marginTop: -15
                    }}>
                        <View
                            style={{
                                backgroundColor: '#2DBC01', 
                                borderRadius: 5, 
                                height: 10, 
                                width: 10,
                        }}>
                        </View>
                    </View>     
                }
            </View>
        ));
        return(
            <View style = { styles.containerQuestionPalleteQuestions }>
                { buttonsListArr }
            </View>    
        );
    }
}