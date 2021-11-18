import React, { Component } from 'react';
import { View, Text, Image, Dimensions, ScrollView } from 'react-native';
import dimensions from '../../../../resources/dimension';
import CONSTANTS from '../../../../resources/constants';
import colors from '../../../../resources/colors';
import MathJax from './../../../../models/MathJax';
import constants from '../../../../resources/constants';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
const htmlContent = `&#8721;<sub><var>i</var>=0</sub><sup>&#8734;</sup>
<var>x<sub>i</sub></var>`;
export default class AllWithTypeQuestion extends Component {
    constructor(props) {
        super(props)

    }
    componentDidMount() {
        //console.warn('ENTER', constants.BASE_QUESTION_ANSWER_URL + this.props.questionObj?.Q_IMAGE_NAME)
    }

    render() {
        return (
            <View style={{ backgroundColor: 'transparent', justifyContent: 'center' }}>
                {
                    <View
                        style={{
                            width: '100%',
                            backgroundColor: 'transparent',
                        }}>
                        {this.props.questionObj?.Q_SOLUTION_DESC !== null &&
                            this.props.questionObj?.Q_SOLUTION_DESC !== '' &&
                            <MathJax
                                // HTML content with MathJax support
                                heightMath={this.props.heightMath}
                                html={this.props.questionObj?.Q_SOLUTION_DESC}
                                navigation = {this.props.navigation}
                                // MathJax config option
                                mathJaxOptions={{
                                    messageStyle: 'none',
                                    extensions: ['tex2jax.js'],
                                    jax: ['input/TeX', 'output/HTML-CSS'],
                                    tex2jax: {
                                        inlineMath: [['$', '$'], ['\\(', '\\)']],
                                        displayMath: [['$$', '$$'], ['\\[', '\\]']],
                                        processEscapes: true,
                                    },
                                    TeX: {
                                        extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js']
                                    }
                                }}
                            />
                        }
                    </View>
                }
            </View>
        )
    }
}