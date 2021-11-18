import React, { Component } from "react";
import {
    Image,
    Text, 
    TouchableOpacity,
    View
} from 'react-native';

//StyleSheet
import { 
    buttons, texts, styles 
} from '../style-question-section-left'; 


// Summary: This class will handle if a question contains single option to answer.
export default class OptionAnswer extends Component{
    render(){
        return(
            <View style={ styles.containerQuestionLeftBottom }>
                <TouchableOpacity 
                    id={ 0 }
                    onPress= { 
                        () => this.props.getOptionIdProps(0, "a")
                    }
                    style = {{ 
                        backgroundColor: this.props.optionButtonColorProps[0],
                        marginTop: 2,
                        marginBottom: 2 
                }}>
                    <View style={ buttons.optionButtonTop }>
                        <View style={ buttons.optionButtonTopCircle }>
                            <View style={ buttons.optionButtonTopCircleInner }>
                                <Text style= {texts.optionButtonTopCircleInnerText}>
                                    A
                                </Text>
                            </View>
                        </View>
                        <View style={buttons.optionButtonTopQuestion}>
                            <Text style={texts.primary}>  
                                {this.props.questionObjProps.options.a}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity 
                    id={ 1 }
                    onPress= { 
                        () => this.props.getOptionIdProps(1, "b") 
                    }
                    style = {{ 
                        backgroundColor: this.props.optionButtonColorProps[1],
                        marginTop: 2,
                        marginBottom: 2 
                }}>
                    <View style={ buttons.optionButtonTop }>
                        <View style={buttons.optionButtonTopCircle}>
                            <View style={buttons.optionButtonTopCircleInner}>
                                <Text style= {texts.optionButtonTopCircleInnerText}>
                                    B
                                </Text>
                            </View>
                        </View>
                        <View style={buttons.optionButtonTopQuestion}>
                            <Text style={texts.primary}>  
                                {this.props.questionObjProps.options.b}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity 
                    id={ 2 }
                    onPress= { 
                        () => this.props.getOptionIdProps(2, "c")
                    }
                    style = {{ 
                        backgroundColor: this.props.optionButtonColorProps[2],
                        marginTop: 2,
                        marginBottom: 2
                }}>
                    <View style={ buttons.optionButtonTop }>
                        <View style={buttons.optionButtonTopCircle}>
                            <View style={buttons.optionButtonTopCircleInner}>
                                <Text style= {texts.optionButtonTopCircleInnerText}>
                                    C
                                </Text>
                            </View>
                        </View>
                        <View style={buttons.optionButtonTopQuestion}>
                            <Text style={texts.primary}>  
                                {this.props.questionObjProps.options.c}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity 
                    id={ 3 }
                    onPress= { 
                        () => this.props.getOptionIdProps(3, "d")
                    }
                    style = {{ 
                        backgroundColor: this.props.optionButtonColorProps[3],
                        marginTop: 2,
                        marginBottom: 2 
                }}>
                    <View style={ buttons.optionButtonTop }>
                        <View style={buttons.optionButtonTopCircle}>
                            <View style={buttons.optionButtonTopCircleInner}>
                                <Text style= {texts.optionButtonTopCircleInnerText}>
                                    D
                                </Text>
                            </View>
                        </View>
                        <View style={buttons.optionButtonTopQuestion}>
                            <Text style={texts.primary}>  
                                {this.props.questionObjProps.options.d}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}