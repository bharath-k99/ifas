import React, { Component } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Keyboard,
    Text, 
    TouchableOpacity,
    ScrollView,
    View
} from 'react-native';

// Component
import CheckBox from '../../common_components/check_box';
import FillInTheBlankesAnswer from './answer_type/fill_in_the_blankes_answer';
import OptionAnswer from './answer_type/option_answer';
import SectionToolTip from '../../common_components/section_tool_tip';
import ScaledImage from '../../../utils/image/image_size';

// Dependency
import { Tooltip } from 'react-native-elements';

// Stylesheet
import { texts, styles } from './style-question-section-left';

// Summary: This section will contain the functionality for questions.
export default class QuestionSectionLeft extends Component{

    constructor(props){
        super(props);
        
        this.state = {
            checkSelected: []           
        };
        this.checkSelectedArr = [];
        this.displayImage = this.displayImage.bind(this);    
        this.displayAnswerOption = this.displayAnswerOption.bind(this);
        this.getSectionsDetails = this.getSectionsDetails.bind(this);
    }

    UNSAFE_componentWillMount() {
    }

    componentDidMount() {
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
    }
  
    componentWillUnmount() {
        this.keyboardDidHideListener.remove();
        this.keyboardDidShowListener.remove();
    }
  
    keyboardDidShow = () => {
        //Fix your view for when a keyboard shows
        this.props.handleKeyboardShowEventProps();
    };
  
    keyboardDidHide = () => {
        //Fix your view for when a keyboard hides
        this.props.handleKeyboardHideEventProps();
    };
    
    // Summary: this function will handle the conditional rendering.
    displayImage(){
        if(this.props.questionObjProps.image_url == ""){
            return <Text style = {{ marginTop: '40%' }}> </Text>; 
        }else{
            let widthParam = Dimensions.get('window').width;
            let heightParam = Dimensions.get('window').height;
            heightParam = (widthParam / 2) + ( heightParam / 8 );
            return <Image source={{ uri: this.props.questionObjProps.image_url }} style = {{ width: widthParam, height: heightParam, resizeMode : 'contain', margin: 5 }} />;        
        }
    }

    // Summary: This function will display mcqoption or textInput for giving answer.
    displayAnswerOption(){

        if(this.props.questionObjProps.descriptive_answer == true){
            return <FillInTheBlankesAnswer 
                getFillInTheBlanksAnswerProps = { this.props.getFillInTheBlanksAnswerProps }
                questionObjProps = { this.props.questionObjProps }
                descriptiveAnswerProps = { this.props.descriptiveAnswerProps }
                getFillInTheBlanksChangeTextEventProps = { this.props.getFillInTheBlanksChangeTextEventProps }
            />;
        }else if(this.props.questionObjProps.multiselect == true){
            console.log(this.props.questionObjProps.answer_multiselect);
            const checkboxs = this.props.questionObjProps.options.map(({id, option}, index) =>
                <CheckBox 
                    style={{ marginTop: 25  }} 
                    key={id} 
                    value={option}
                    selected =  { this.props.questionObjProps.multiselect_selected_boolean[index] }
                    // selected = { false }
                    clicked={(id, isCheck) => this.toggleCheckBox(id, option, isCheck, index)}
                >
                </CheckBox>
            );
            return checkboxs;
        }else{
            return <OptionAnswer 
                getOptionIdProps = { this.props.getOptionIdProps }
                optionButtonColorProps = { this.props.optionButtonColorProps }
                questionObjProps = { this.props.questionObjProps }
            />;
        }
    }

     // Summary: This will give us the selected values for the checkbox.
     toggleCheckBox = (id, option, isCheck, cBIndex) => {      
        let { checkSelected, indexQ } = this.state;
        if(this.state.indexQ != this.props.examDetailProps.index){
            this.checkSelectedArr = this.props.questionObjProps.answer_multiselect;
            // console.log(this.props.questionObjProps.answer_multiselect);
        }
        indexQ = this.props.examDetailProps.index;
        if (isCheck) {
            this.checkSelectedArr.push(option);
        } else { // remove element
            var index = this.checkSelectedArr.indexOf(option);
            if (index > -1) {
                this.checkSelectedArr.splice(index, 1);
            }
        }
        this.setState({ 
            indexQ 
        });
        this.props.getCheckBoxAnswerProps(this.checkSelectedArr, cBIndex);
    }

    // Summary: Use to return SectionToolTip component
    getSectionsDetails(){

        return <SectionToolTip 
                    navigationToSectionProps = { this.props.navigationToSectionProps }
                    sectionNamesProps = { this.props.sectionNamesProps }
                    sectionButtonsColorArrayProps = { this.props.sectionButtonsColorArrayProps }
                    examDetailProps = { this.props.examDetailProps }
                    questionsObjectArrayProps = { this.props.questionsObjArrayProp }
                />;
    }

    render(){
        return(
            <View>
                {/* <KeyboardAwareScrollView enableAutomaticScroll={(Platform.OS === 'ios')} enableOnAndroid={true}> */}
                <ScrollView contentContainerStyle= {{ 
                    flexGrow: 1
                }}>
                    <View style = {{ marginRight: 2 }}>
                        {
                            this.props.noOfSectionsProps > 0 ? this.getSectionsDetails(): null
                        }
                        <View style={ styles.containerQuestionLeftTop }>
                            <View style={styles.containerQuestionLeftTopCircle}>
                                <View style={styles.containerQuestionLeftTopCircleInner}>
                                    <Text style= {texts.optionButtonTopCircleInnerText}>
                                        {this.props.questionObjProps.question_no}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.containerQuestionLeftTopQuestion}>
                                <Text style={texts.primary}>  
                                    { this.props.questionObjProps.question_text }
                                </Text>
                            </View>
                        </View>
                        <View>
                            {
                                this.displayImage()
                            }
                        </View>
                        {/* Answer option Will display here based on the condition handled in displayAnswerOption() */}
                        <View style={{  
                        }}>
                            {
                                this.displayAnswerOption()
                            }
                        </View>
                    </View>
                </ScrollView>
                {/* </KeyboardAwareScrollView> */}
            </View>
        );
    }
}