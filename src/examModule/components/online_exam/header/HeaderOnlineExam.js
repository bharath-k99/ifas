import React, { Component } from "react";
import {
    Text,
    TouchableOpacity, 
    View
} from 'react-native';

// Dependencies
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

// Stylesheet
import { texts, styles } from './style-header-exam';

// Summary: Component for upper section of exam.
export default class HeaderOnlineExam extends Component{

    UNSAFE_componentWillReceiveProps(nextProps){
        if(this.props.timerDetailProps.totalSeconds == -1) {
            this.props.endExamProps();
        }
    }

    render(){
        return(
            <View style={ styles.containerTop}>
                <View style={ styles.TopMiddle }>
                    <FontAwesome5 name={'clock'} size={35} color="#900" solid />
                    <Text style={texts.headerText}>  
                0{ this.props.timerDetailProps.hours }:{this.props.timerDetailProps.minutes < 10 ? 0 : null}{ this.props.timerDetailProps.minutes }:{this.props.timerDetailProps.seconds < 10 ? 0 : null}{ this.props.timerDetailProps.seconds }
                    </Text>
                </View>
                <View style={ styles.TopRight }>
                    <TouchableOpacity
                        onPress = {()=>
                            this.props.openQuestionLegendProps()
                    }>
                        <FontAwesome5 name={'bars'} size={35} color="#900" solid />
                        {/* <Text style={texts.headerText}>  
                            Question Pallete
                        </Text> */}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

}