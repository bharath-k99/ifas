import React, { Component } from "react";
import {
    Modal, 
    Text,  
    TouchableOpacity,
    View, 
} from 'react-native';


// Stylesheet
import { styles } from './style_question_pallete_legend';

// Summary: This class handles the alert functionality whenever a user clicks on end exam.
export default class EndExamAlert extends Component{
    
    render() {

        return(
            <View style={styles.MainContainer}>
                <Modal
                    visible={ this.props.ModalVisibleProps }
                    transparent={ true }
                    animationType={ "slide" 
                }>
                    <View style={{ flex:1, alignItems: 'center', justifyContent: 'center' }}>
                        <View style={styles.Alert_Main_View_End_Exam}>
                            <View style = { styles.Alert_Title_View }>
                                <Text style={styles.Alert_Title}>
                                    IFAS DEMO: Subject Name
                                </Text>
                            </View>
                            <View style = { styles.Main_content_view_end_exam }>
                                <Text style = { styles.textStyleEndExam }> 
                                    You are about to finish your exam. Click OK to finish and Cancel to continue. 
                                </Text>
                                <Text style = { styles.textStyleEndExamAttempted}>
                                    Total Question: { this.props.totalQuestionsProps }  Total Answered: { this.props.examDetailProps.save_count + this.props.examDetailProps.save_and_mark_review_count }
                                </Text>
                                <Text style = { styles.textStyleEndExamAttempted}>
                                    Not Answered: { Math.abs( this.props.totalQuestionsProps - ( this.props.examDetailProps.save_count + this.props.examDetailProps.save_and_mark_review_count ) )}
                                </Text>
                            </View>        
                            <View style={{ flex: 1, flexDirection: 'row'}}>
                                <TouchableOpacity 
                                    style={ [ styles.buttonStyleOk, { backgroundColor: '#fff'} ]} 
                                    onPress={() => {
                                        this.props.closeModalProps("ok")
                                    }} 
                                    activeOpacity={ 0.7 
                                }>
                                    <Text style={styles.TextStyleOk}> OK </Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={ [ styles.buttonStyleOk, { backgroundColor: '#009688'} ]} 
                                    onPress={() => {
                                        this.props.closeModalProps("not");
                                    }} 
                                    activeOpacity={ 0.7 
                                }>
                                    <Text style={styles.TextStyle}> CLOSE </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }
}