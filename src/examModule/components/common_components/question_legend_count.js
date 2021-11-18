import React, { Component } from 'react';
import {
    Text,
    View
} from 'react-native';

// Enums
import { color_code_answer_button } from '../../enums/global_colors';

// StyleSheet
import { stylesQuestion } from './style_question_legend_count';

// Summary: This class will handle the count of different types of questions attempted.
export default class QuestionLegendCount extends Component{
    render(){
        return(
            <View>
                {
                    this.props.saveCountProps >=0 
                    &&
                    <View>
                        <Text style={[ stylesQuestion.Alert_Message_Main, { color: '#000000' } ]}> 
                            Legend:
                        </Text>
                    </View>
                }   

                <View style = { [ stylesQuestion.containerRowMain ]}> 
                    <View style = { stylesQuestion.containerRowInner }>                
                        <View style ={[ stylesQuestion.coloredContainer, {
                            backgroundColor: color_code_answer_button.saveAndNext,
                        }]}>
                            <Text style={stylesQuestion.Alert_Message}> 
                                { this.props.saveCountProps >=0 ? this.props.saveCountProps : null }
                            </Text>
                        </View>
                        <View>    
                            <Text style={stylesQuestion.Alert_Message_Text}> 
                                Answered
                            </Text>
                        </View>
                    </View>
                    <View style = { stylesQuestion.containerRowInnerRight }>
                        <View style ={[ stylesQuestion.coloredContainer, {
                            backgroundColor: color_code_answer_button.next,
                        }]}>
                            <Text style={stylesQuestion.Alert_Message}> 
                                { this.props.notAnsweredCountProps >= 0 ? this.props.notAnsweredCountProps : null }
                            </Text>
                        </View>
                        <View>
                            <Text style={stylesQuestion.Alert_Message_Text}> 
                                Not Answered
                            </Text>
                        </View>
                    </View>
                </View>
                <View style = { [ stylesQuestion.containerRowMain ]}>
                    <View style = { [stylesQuestion.containerRowInner ] }>                    
                        <View style ={[ stylesQuestion.coloredContainer, {
                            backgroundColor: color_code_answer_button.saveAndMarkReview,
                        }]}>
                            <Text style={stylesQuestion.Alert_Message}> 
                                { this.props.markReviewCountProps >= 0 ? this.props.markReviewCountProps : null }
                            </Text>
                        </View>
                        <View>
                            <Text style={stylesQuestion.Alert_Message_Text}> 
                                Marked
                            </Text>
                        </View>
                    </View>
                    <View style = { stylesQuestion.containerRowInnerRight }>
                        <View style ={[ stylesQuestion.coloredContainer, {
                            backgroundColor: color_code_answer_button.not_answered,
                        }]}>
                            <Text style={[stylesQuestion.Alert_Message, { color: '#000000' }]}> 
                            { this.props.saveAndMarkReviewCountProps >= 0 ? 
                              this.props.questionsObjProp.length - (this.props.notAnsweredCountProps + this.props.saveCountProps + this.props.markReviewCountProps + this.props.saveAndMarkReviewCountProps) 
                                : null }
                            </Text>
                        </View>                         
                        <View>
                            <Text style={stylesQuestion.Alert_Message_Text}> 
                                Not Visited
                            </Text>
                        </View>
                    </View>
                </View>
                <View style = { [ stylesQuestion.containerRowMain ]}>
                    <View style = { stylesQuestion.containerRowInner }>
                        <View style ={[ stylesQuestion.coloredContainer, {
                            backgroundColor: color_code_answer_button.saveAndMarkReview,
                        }]}>
                            <Text style={stylesQuestion.Alert_Message}> 
                                { this.props.saveAndMarkReviewCountProps >= 0 ? this.props.saveAndMarkReviewCountProps : null }
                            </Text>
                            <View style={{ 
                                height: 10, 
                                width: 45,
                                alignItems: 'flex-end',
                                marginTop: -15
                            }}>
                                <View
                                    style={{
                                        backgroundColor: '#2DBC01', 
                                        borderRadius: 10, 
                                        height: 12, 
                                        width: 12,
                                }}>
                                </View>
                            </View>
                        </View>
                        <View>
                            <Text style={stylesQuestion.Alert_Message_Text}> 
                                Marked & Answered
                            </Text> 
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}