import React, { Component } from "react";
import { 
    ScrollView,
    Text,
    TouchableOpacity,
    View 
} from "react-native";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// Actions
import * as examActions from '../../actions/online-exam-actions';

// Component
import QuestionLegendCount from '../../components/common_components/question_legend_count';

// Dependencies
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

// Stylesheet
import { buttons, texts, styles } from './style-exam-guide';

// Summary: This class is used as a guide for the examination.
class ExamGuide extends Component{

    componentDidMount(){
        
        let param = this.props.navigation.getParam('item');
        if(param == 'yes'){
            this.props.actions.fetchSectionExamFromAPI(this.props.renderValue);    
        }else{
            this.props.actions.fetchExamFromAPI(this.props.renderValue);
        }
    }

    render(){
        return(
            <ScrollView contentContainerStyle = {{ flexGrow: 1 }}> 
                <View style = { styles.container }>
                    <View style = { styles.containerTop }>
                        <View style = { styles.containerTopUpper }>
                            <Text style = { texts.examTitle }>
                                National Eligibility Test (NET) - Subject Name
                            </Text>
                        </View>
                        <View style = { styles.containerTopLower }>
                            <View style = { styles.containerTopLowerInner }>
                                <Text style = { texts.examTitleLowerInnerLeft }>
                                    Exam Name: 
                                </Text>
                                <Text style = { texts.examTitleLowerInnerRight }>
                                    IFAS DEMO - PART A
                                </Text>
                            </View>
                            <View style = { styles.containerTopLowerInner }>
                                <Text style = { texts.examTitleLowerInnerLeft }>
                                    Total Questions: 
                                </Text>
                                <Text style = { texts.examTitleLowerInnerRight }>
                                    { this.props.examDetail.total_questions }
                                </Text>
                            </View>
                            <View style = { styles.containerTopLowerInner }>
                                <Text style = { texts.examTitleLowerInnerLeft }>
                                    Total Time: 
                                </Text>
                                <Text style = { texts.examTitleLowerInnerRight }>
                                    30 Minutes
                                </Text>
                            </View>
                            <View style = { styles.containerTopLowerInnerButton }>
                                <TouchableOpacity 
                                    style = { buttons.proceedButton }
                                    onPress = { () => {
                                        this.props.navigation.navigate('OnlineTest');
                                }}>
                                    <Text style = { texts.examProceedText }>
                                        PROCEED 
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style = { styles.containerMiddle }>
                        <View style = { styles.containerMiddleUpper }>
                            <Text style = { texts.containerMiddleUpperText }>
                                Total Questions: 20
                            </Text>
                            <Text style = { texts.containerMiddleUpperText }>
                                Maximum Marks: 60
                            </Text>
                            <Text style = { texts.containerMiddleUpperText }>
                                Correct Mark For each Right Question: +3
                            </Text>
                            <Text style = { texts.containerMiddleUpperText }>
                                Negative Marks For each Wrong Question: -1
                            </Text>
                            <Text style = { texts.containerMiddleUpperText }>
                                All Questions are Compulsory.
                            </Text>
                        </View>
                        <View>
                            <QuestionLegendCount
                                saveCountProps = { -1 }
                                notAnsweredCountProps = { -1 }
                                markReviewCountProps = { -1 }
                                saveAndMarkReviewCountProps = { -1 }
                            />
                        </View>
                        <View>
                            <View style={ styles.containerMiddleLower }>
                                <View style = { styles.containerMiddleLowerLeft }>
                                    <View style = {{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Icon name="save" size={45} color="#900" />
                                        <Text> Save & Next </Text>
                                    </View>
                                </View>
                                <View style = { styles.containerMiddleLowerRight }>
                                    <View style = {{ flexDirection: 'row', alignItems: 'center' }}>
                                        <FontAwesome5 name={'bookmark'} size={45} color="#900" solid />
                                        <Text> Save & MarkReview </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={ styles.containerMiddleLower }>
                                <View style = { styles.containerMiddleLowerLeft }>
                                    <View style = {{ flexDirection: 'row', alignItems: 'center' }}>
                                        <FontAwesome5 name={'flag'} size={45} color="#900" solid />
                                        <Text> Marked Review </Text>
                                    </View>
                                </View>
                                <View style = { styles.containerMiddleLowerRight }>
                                    <View style = {{ flexDirection: 'row', alignItems: 'center' }}>
                                        <FontAwesome5 name={'external-link-square-alt'} size={45} color="#900" solid />
                                        <Text> Submit Exam </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style = { styles.containerBottom }>
                        <Text style = { texts.examTitle }>
                            National Eligibility Test (NET) - Subject Name
                        </Text>
                    </View>
                </View>
            </ScrollView>
        );
    }
}

// this will dispatch the control to.
function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(examActions, dispatch)
    };
}

//mapStateToProps is used for selecting the part of the data from the store that the connected component needs.
const mapStateToProps = ( state ) => {
    // console.log(" from Exam Guide page state.OnlineExamReducers");
    // console.log(state.OnlineExamReducers.renderVal);
    return { 
        examDetail: state.OnlineExamReducers.examDetail,
        renderValue: state.OnlineExamReducers.renderVal
    };
}

/*
As the first argument passed in to connect, mapStateToProps is used for selecting the part of the data from the store that the connected component needs. 
It’s frequently referred to as just mapState for short.
*/
export default connect(mapStateToProps, mapDispatchToProps)(ExamGuide);