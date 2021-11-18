import React, { Component } from "react";
import {
    Text, 
    TouchableOpacity,
    View
} from 'react-native';

// Dependencies
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

// StyleSheet
import { buttons, texts, styles } from './style-answer-buttons';

// Summary: AnswerButton class contains the functionality of answer button s.
export default class AnswerButtons extends Component{
    
    componentDidMount(){
    }
    render(){
        return(
            <View style = { styles.containerAnswer }>
                <View style = { styles.containerAnswerChild }>
                    <TouchableOpacity 
                        style= { buttons.buttonContainer }
                        onPress = { this.props.actionDecreaseIndexChange }
                        disabled={ this.props.disablePrev 
                    }>
                        <FontAwesome5 name={'angle-double-left'} size={45} color="#900" solid />
                    </TouchableOpacity>
                </View>
                <View style = { styles.containerAnswerChild }>
                    <TouchableOpacity 
                        style= { buttons.buttonContainer }
                        onPress = { () => this.props.actionIncreaseIndexChange(0) }
                        // disabled={ 
                        //     this.props.disableNext 
                        // }
                    >
                        <Icon name="save" size={45} color="#900" />
                    </TouchableOpacity>
                </View>
                <View style = { styles.containerAnswerChild }>
                    <TouchableOpacity 
                        style= { buttons.buttonContainer }
                        onPress = { () => this.props.actionIncreaseIndexChange(1) }
                        // disabled={ 
                        //     this.props.disableNext 
                        // }
                    >
                        <FontAwesome5 name={'bookmark'} size={45} color="#900" solid />
                    </TouchableOpacity>
                </View>
                <View style = { styles.containerAnswerChild }>
                    <TouchableOpacity 
                        style= { buttons.buttonContainer }
                        onPress = { () => this.props.actionIncreaseIndexChange(2) }
                        // disabled={ 
                        //     this.props.disableNext 
                        // }
                    >
                        <FontAwesome5 name={'flag'} size={45} color="#900" solid />
                    </TouchableOpacity>
                </View>
                <View style = { styles.containerAnswerChild }>
                    <TouchableOpacity 
                        style= { buttons.buttonContainer }
                        onPress = { 
                            this.props.actionClearResponseFunction 
                    }>
                        <FontAwesome5 name={'ban'} size={45} color="#900" solid />
                    </TouchableOpacity>
                </View>
                <View style = { styles.containerAnswerChild }>
                    <TouchableOpacity 
                        style = { buttons.buttonContainer }
                        onPress = { ()=>{
                            this.props.examSummaryProps();
                    }}>
                        <FontAwesome5 name={'external-link-square-alt'} size={45} color="#900" solid />
                    </TouchableOpacity>
                </View>
                <View style = { styles.containerAnswerChild }>
                    <TouchableOpacity 
                        style= { buttons.buttonContainer }
                        onPress = { () => this.props.actionIncreaseIndexChange(3) }
                        disabled={ 
                            this.props.disableNext 
                    }>
                        <FontAwesome5 name={'angle-double-right'} size={45} color="#900" solid />    
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

}