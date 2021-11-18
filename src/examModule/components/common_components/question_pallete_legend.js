import React, { Component } from 'react';
import {
    Modal, 
    Text,  
    TouchableOpacity,
    ScrollView,
    View, 
} from 'react-native';

// Component
import QuestionSectionRight from '../online_exam/question_section/QuestionSectionsRight'
import QuestionLegendCount from './question_legend_count';

// Stylesheet
import { styles } from './style_question_pallete_legend';

// Summary: This class will handle the functionality for the question pallete legend.
export default class QuestionPalleteLegend extends Component {
 
    constructor(props) {
        super(props);
    }

    render() {   
        return (
            <View style={styles.MainContainer}>
                <Modal
                    visible={ this.props.questionLegendModalVisibleProps }
                    transparent={ true }
                    animationType={ "slide" 
                }>
                    <View style={{ flex:1, alignItems: 'center', justifyContent: 'center' }}>
                        <View style={styles.Alert_Main_View}>
                            <View style = { styles.Alert_Title_View }>
                                <Text style={styles.Alert_Title}>
                                    Questions Summary
                                </Text>
                            </View>
                            <View style = { styles.Main_content_view }>
                                <ScrollView contentContainerStyle={{
                                    flexGrow: 1, 
                                    justifyContent : 'center'
                                }}>
                                    <QuestionSectionRight 
                                        questionsObjProp = { this.props.questionsObjProp }
                                        navigationOfQuestionProps = { this.props.navigationOfQuestionProps }
                                        openQuestionLegendProps = { this.props.openQuestionLegendProps }
                                        questionLegendModalVisibleProps = { this.props.questionLegendModalVisibleProps }
                                    />                                
                                    <View style={{ width: '100%', height: 1, backgroundColor: '#000000'}}>
                                    </View>
                                    <QuestionLegendCount
                                        questionsObjProp = { this.props.questionsObjProp } 
                                        saveCountProps = { this.props.saveCountProps }
                                        markReviewCountProps = { this.props.markReviewCountProps }
                                        notAnsweredCountProps = { this.props.notAnsweredCountProps }
                                        saveAndMarkReviewCountProps = { this.props.saveAndMarkReviewCountProps }
                                    />
                                </ScrollView>
                            </View>        
                            <View style={{ flex: .5, flexDirection: 'row'}}>
                                <TouchableOpacity 
                                    style={ styles.buttonStyle } 
                                    onPress={() => {
                                        this.props.openQuestionLegendProps()
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
