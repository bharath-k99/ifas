import React, { Component } from 'react';
import { View, Text, Image, Dimensions, ScrollView } from 'react-native';
import dimensions from '../../../../resources/dimension';
import colors from '../../../../resources/colors';
import MathJax from './../../../../models/MathJaxAnswer';
import constants from '../../../../resources/constants';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
const htmlContent = `&#8721;<sub><var>i</var>=0</sub><sup>&#8734;</sup>
<var>x<sub>i</sub></var>`;
export default class AllWithTypeAnswer extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <View style={{ flex: 0, backgroundColor: 'transparent', justifyContent: 'center' }}>
                <View
                    style={{
                        width: '100%',
                        backgroundColor: 'white',
                    }}>
                    {this.props.questionObj?.QO_OPTIONS_DESC !== null &&
                        this.props.questionObj?.QO_OPTIONS_DESC !== '' &&
                        <MathJax
                            // HTML content with MathJax support
                            heightMath={this.props.heightMath}
                            html={this.props.questionObj?.QO_OPTIONS_DESC}
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
                            style={{
                                width: '100%'
                            }} />
                    }
                    {this.props.questionObj?.QO_OPTIONS_IMAGE !== null &&
                        this.props.questionObj?.QO_OPTIONS_IMAGE !== '' &&
                        <Image
                            style={{
                                width: '100%',
                                height: 150,
                                marginTop: 10,
                                alignSelf: 'center'
                            }}
                            resizeMode={'contain'}
                            //source={{uri:this.props.questionObj?.QO_OPTIONS_IMAGE}}
                            source={{ uri: constants.BASE_ANSWER_URL + this.props.questionObj?.QO_OPTIONS_IMAGE }}
                        />
                    }
                </View>
            </View>
        )
    }
}








// <View style={{ flex: 0, backgroundColor: 'transparent', justifyContent: 'center' }}>
//                 {this.props.type === 'simple' ?
//                     <Text style={{ color: colors.black, fontFamily: CONSTANTS.REGULAR, fontSize: dimensions.sizeRatio * 13, lineHeight: dimensions.sizeRatio * 21 }}>
//                         {this.props.question}
//                     </Text>
//                     : this.props.type === 'simplewithimage' ?
//                         (
//                             <View
//                                 style={{
//                                     flex: 0, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center'
//                                 }}>
//                                 <Text style={{ color: colors.black, fontFamily: CONSTANTS.REGULAR, fontSize: dimensions.sizeRatio * 13, lineHeight: dimensions.sizeRatio * 21 }}>
//                                     {this.props.question}
//                                 </Text>
//                                 <Image
//                                     style={{
//                                         width: 150,
//                                         height: 150,
//                                         marginTop: 10
//                                     }}
//                                     resizeMode={'contain'}
//                                     source={require('../../../../images/icon_session2.png')}
//                                 />
//                             </View>
//                         )
//                         : this.props.type === 'simplewithimagesimple' ?
//                         (
//                             <View
//                                 style={{
//                                     flex: 0, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center'
//                                 }}>
//                                 <Text style={{ color: colors.black, fontFamily: CONSTANTS.REGULAR, fontSize: dimensions.sizeRatio * 13, lineHeight: dimensions.sizeRatio * 21 }}>
//                                     {this.props.question}
//                                 </Text>
//                                 <Image
//                                     style={{
//                                         width: 150,
//                                         height: 150,
//                                         marginTop: 10
//                                     }}
//                                     resizeMode={'contain'}
//                                     source={require('../../../../images/icon_session2.png')}
//                                 />
//                                 <Text style={{ color: colors.black, fontFamily: CONSTANTS.REGULAR, fontSize: dimensions.sizeRatio * 13, lineHeight: dimensions.sizeRatio * 21,marginTop: 5 }}>
//                                     {this.props.question}
//                                 </Text>
//                             </View>
//                         )
//                         : this.props.type === 'html' ?
//                             (
//                                     <View
//                                         style={{
//                                             width:'100%',
//                                             backgroundColor: 'transparent',
//                                         }}>
//                                         <MathJax
//                                             // HTML content with MathJax support
//                                             html={this.props.question}
//                                             // MathJax config option
//                                             mathJaxOptions={{
//                                                 messageStyle: 'none',
//                                                 extensions: ['tex2jax.js'],
//                                                 jax: ['input/TeX', 'output/HTML-CSS'],
//                                                 tex2jax: {
//                                                     inlineMath: [['$', '$'], ['\\(', '\\)']],
//                                                     displayMath: [['$$', '$$'], ['\\[', '\\]']],
//                                                     processEscapes: true,
//                                                 },
//                                                 TeX: {
//                                                     extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js']
//                                                 }
//                                             }}/>
//                                     </View>
//                             )
//                             :this.props.type === 'htmlwithimage' ?
//                             (
//                                     <View
//                                         style={{
//                                             width:'100%',
//                                             backgroundColor: 'transparent',
//                                         }}>
//                                             <MathJax
//                                             // HTML content with MathJax support
//                                             html={this.props.question}
//                                             // MathJax config option
//                                             mathJaxOptions={{
//                                                 messageStyle: 'none',
//                                                 extensions: ['tex2jax.js'],
//                                                 jax: ['input/TeX', 'output/HTML-CSS'],
//                                                 tex2jax: {
//                                                     inlineMath: [['$', '$'], ['\\(', '\\)']],
//                                                     displayMath: [['$$', '$$'], ['\\[', '\\]']],
//                                                     processEscapes: true,
//                                                 },
//                                                 TeX: {
//                                                     extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js']
//                                                 }
//                                             }}/>
//                                         <Image
//                                             style={{
//                                                 width: 130,
//                                                 height: 130,
//                                                 marginTop: 10,
//                                                 alignSelf: 'center'
//                                             }}
//                                             resizeMode={'contain'}
//                                             source={require('../../../../images/icon_session2.png')}
//                                         />
//                                     </View>
//                             )
//                             :
//                             (
//                                 <View
//                                     style={{
//                                         width:'100%',
//                                         backgroundColor: 'transparent',
//                                     }}>
//                                         <MathJax
//                                         // HTML content with MathJax support
//                                         html={this.props.question}
//                                         // MathJax config option
//                                         mathJaxOptions={{
//                                             messageStyle: 'none',
//                                             extensions: ['tex2jax.js'],
//                                             jax: ['input/TeX', 'output/HTML-CSS'],
//                                             tex2jax: {
//                                                 inlineMath: [['$', '$'], ['\\(', '\\)']],
//                                                 displayMath: [['$$', '$$'], ['\\[', '\\]']],
//                                                 processEscapes: true,
//                                             },
//                                             TeX: {
//                                                 extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js']
//                                             }
//                                         }}/>
//                                     <Image
//                                         style={{
//                                             width: 130,
//                                             height: 130,
//                                             marginTop: 10,
//                                             alignSelf: 'center'
//                                         }}
//                                         resizeMode={'contain'}
//                                         source={require('../../../../images/icon_session2.png')}
//                                     />
//                                     <MathJax
//                                         // HTML content with MathJax support
//                                         html={this.props.question}
//                                         // MathJax config option
//                                         mathJaxOptions={{
//                                             messageStyle: 'none',
//                                             extensions: ['tex2jax.js'],
//                                             jax: ['input/TeX', 'output/HTML-CSS'],
//                                             tex2jax: {
//                                                 inlineMath: [['$', '$'], ['\\(', '\\)']],
//                                                 displayMath: [['$$', '$$'], ['\\[', '\\]']],
//                                                 processEscapes: true,
//                                             },
//                                             TeX: {
//                                                 extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js']
//                                             }
//                                         }}
//                                         style={{
//                                             marginTop:10
//                                         }}
//                                         />
//                                 </View>
//                         )

//                 }
//             </View>