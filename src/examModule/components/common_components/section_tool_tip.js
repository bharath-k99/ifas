import React, { Component } from "react";
import {
    Text,
    TouchableOpacity, 
    View
} from 'react-native';

// Dependency
import { Tooltip } from 'react-native-elements';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

// Stylesheet
import { tip_style }  from './style_common';

// Summary: This class will provide the tooltip for sections
export default class SectionToolTip extends Component{
    
    constructor(props){
        super(props);
        this.toolTipDesign = this.toolTipDesign.bind(this);
        this.getSectionsDetails = this.getSectionsDetails.bind(this);
    }

    // Summary: it'will show the tooltip design and description of an section.
    toolTipDesign(index, sectionName){
        let startIndex = this.props.examDetailProps.start_index_of_sections_array[index];
        let endIndex = this.props.examDetailProps.end_index_of_sections_array[index];
        let noOfQuestion = this.props.examDetailProps.no_of_question_per_section_array[index];
        let numAnswered = 0;
        let notAnswered = 0;
        for(let i = startIndex; i<= endIndex; i++){
            let save = this.props.questionsObjectArrayProps[i].save;
            let saveMark =this.props.questionsObjectArrayProps[i].save_mark_review;
            if(save == true || saveMark == true){
                numAnswered += 1;
            }
        }
        notAnswered = noOfQuestion - numAnswered;
        return <View style = { tip_style.toolTipMain }>
            <View style = { tip_style.toolTipSub  }>
                <Text style = { tip_style.textToolTipSub }> { sectionName } </Text>
            </View>
            <View style = { tip_style.toolTipSub }>
                <Text style = { tip_style.textToolTipSub }> Total Question: { noOfQuestion }</Text>
            </View>
            <View style = { tip_style.toolTipSub }>
                <Text style = { tip_style.textToolTipSub }> Answered: { numAnswered }</Text>
            </View>
            <View style = { tip_style.toolTipSub }>
                <Text style = { tip_style.textToolTipSub }> Not Answered: { notAnswered }</Text>
            </View>
        </View>;
    }

    // Summary: Use to create buttons with title for each section.
    getSectionsDetails(){
        let sectionInfoView = this.props.sectionNamesProps.map((sectionName, index) => (
            <View style = {{ flex: 1 }}>
                <View style = { tip_style.sectionTipMainContainer }>
                    <View style = {[ tip_style.sectionTipMainSectionView, { backgroundColor: this.props.sectionButtonsColorArrayProps[index] }] }>
                        <TouchableOpacity 
                            style = { tip_style.sectionTipMainSectionViewButton }
                            onPress = { () => {
                                this.props.navigationToSectionProps(index);
                        }}>
                            <Text style = { tip_style.sectionTipMainSectionButtonText }>
                                { sectionName }
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style = { tip_style.sectionTipMainSectionView2 }>
                        <Tooltip 
                            containerStyle = { tip_style.toolTipContainer }
                            popover = { this.toolTipDesign(index, sectionName) }
                            height = { 120 }
                            backgroundColor = { '#000' }
                            overlayColor = { 'rgba(250, 250, 250, 0.40)' }
                            withPointer = { false }
                        >
                            <FontAwesome5 name={ 'info-circle'} size={35} color="#900" solid />
                        </Tooltip>
                    </View>
                </View>
            </View>
        ));
        return <View style = { tip_style.mainContainer }>
            { sectionInfoView }
        </View>;
    }

    render(){
        return(            
            this.getSectionsDetails()
        );
    }
}