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
                            backgroundColor: 'white',
                        }}>
                        {this.props.questionObj?.Q_QUESTION !== null &&
                            this.props.questionObj?.Q_QUESTION !== '' &&
                            <MathJax
                                // HTML content with MathJax support
                                heightMath={this.props.heightMath}
                                html={this.props.questionObj?.Q_QUESTION}
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
                        {this.props.questionObj?.Q_IMAGE_NAME !== null &&
                            this.props.questionObj?.Q_IMAGE_NAME !== '' &&
                            <Image
                            style={{
                                width: '100%',
                                height: 150,
                                marginTop: 10,
                                alignSelf: 'center',
                            }}
                            resizeMode={'contain'}
                            //source={{uri:this.props.questionObj?.Q_IMAGE_NAME}}
                            source={{ uri: constants.BASE_QUESTION_URL + this.props.questionObj?.Q_IMAGE_NAME }}
                        />
                        }
                        {this.props.questionObj?.Q_QUESTION_EXTRA !== null &&
                            this.props.questionObj?.Q_QUESTION_EXTRA !== '' &&
                            <MathJax
                            // HTML content with MathJax support
                            heightMath={this.props.heightSecondMath}
                            html={this.props.questionObj?.Q_QUESTION_EXTRA}
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
                                marginTop: 10
                            }}
                        />
                        }
                    </View>
                }
            </View>
        )
    }
}





// {this.props.questionObj?.Q_QUESTION !== null &&
//     this.props.questionObj?.Q_QUESTION_EXTRA === null &&
//     this.props.questionObj?.Q_IMAGE_NAME === null &&
//     this.props.questionObj?.Q_IMAGE_NAME === ''
//     ?
//     (
//         <View
//             style={{
//                 width: '100%',
//                 backgroundColor: 'transparent',
//             }}>
//             <MathJax
//                 // HTML content with MathJax support
//                 html={this.props.questionObj?.Q_QUESTION}
//                 // MathJax config option
//                 mathJaxOptions={{
//                     messageStyle: 'none',
//                     extensions: ['tex2jax.js'],
//                     jax: ['input/TeX', 'output/HTML-CSS'],
//                     tex2jax: {
//                         inlineMath: [['$', '$'], ['\\(', '\\)']],
//                         displayMath: [['$$', '$$'], ['\\[', '\\]']],
//                         processEscapes: true,
//                     },
//                     TeX: {
//                         extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js']
//                     }
//                 }}
//             />
//         </View>
//     )
//     : this.props.questionObj?.Q_QUESTION !== null &&
//         this.props.questionObj?.Q_QUESTION_EXTRA === null &&
//         this.props.questionObj?.Q_IMAGE_NAME !== null &&
//         this.props.questionObj?.Q_IMAGE_NAME === ''
//         ?
//         (
//             <View
//                 style={{
//                     width: '100%',
//                     backgroundColor: 'transparent',
//                 }}>
//                 <MathJax
//                     // HTML content with MathJax support
//                     html={this.props.questionObj?.Q_QUESTION}
//                     // MathJax config option
//                     mathJaxOptions={{
//                         messageStyle: 'none',
//                         extensions: ['tex2jax.js'],
//                         jax: ['input/TeX', 'output/HTML-CSS'],
//                         tex2jax: {
//                             inlineMath: [['$', '$'], ['\\(', '\\)']],
//                             displayMath: [['$$', '$$'], ['\\[', '\\]']],
//                             processEscapes: true,
//                         },
//                         TeX: {
//                             extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js']
//                         }
//                     }} />
//                 <Image
//                     style={{
//                         width: '100%',
//                         height: 150,
//                         marginTop: 10,
//                         alignSelf: 'center',
//                     }}
//                     resizeMode={'contain'}
//                     //source={{uri:this.props.questionObj?.Q_IMAGE_NAME}}
//                     source={{ uri: constants.BASE_QUESTION_URL + this.props.questionObj?.Q_IMAGE_NAME }}
//                 />
//             </View>
//         )
//         : this.props.questionObj?.Q_QUESTION !== null &&
//             this.props.questionObj?.Q_QUESTION_EXTRA !== null &&
//             this.props.questionObj?.Q_IMAGE_NAME === null &&
//             this.props.questionObj?.Q_IMAGE_NAME === '' ?
//             (
//                 <View
//                     style={{
//                         width: '100%',
//                         backgroundColor: 'transparent',
//                     }}>
//                     <MathJax
//                         // HTML content with MathJax support
//                         html={this.props.questionObj?.Q_QUESTION}
//                         // MathJax config option
//                         mathJaxOptions={{
//                             messageStyle: 'none',
//                             extensions: ['tex2jax.js'],
//                             jax: ['input/TeX', 'output/HTML-CSS'],
//                             tex2jax: {
//                                 inlineMath: [['$', '$'], ['\\(', '\\)']],
//                                 displayMath: [['$$', '$$'], ['\\[', '\\]']],
//                                 processEscapes: true,
//                             },
//                             TeX: {
//                                 extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js']
//                             }
//                         }} />
//                     <MathJax
//                         // HTML content with MathJax support
//                         html={this.props.questionObj?.Q_QUESTION_EXTRA}
//                         // MathJax config option
//                         mathJaxOptions={{
//                             messageStyle: 'none',
//                             extensions: ['tex2jax.js'],
//                             jax: ['input/TeX', 'output/HTML-CSS'],
//                             tex2jax: {
//                                 inlineMath: [['$', '$'], ['\\(', '\\)']],
//                                 displayMath: [['$$', '$$'], ['\\[', '\\]']],
//                                 processEscapes: true,
//                             },
//                             TeX: {
//                                 extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js']
//                             }
//                         }}
//                         style={{
//                             marginTop: 10
//                         }}
//                     />
//                 </View>
//             )
//             :
//             (
//                 <View
//                     style={{
//                         width: '100%',
//                         backgroundColor: 'transparent',
//                     }}>
//                     <Image
//                         style={{
//                             width: '100%',
//                             height: 150,
//                             marginTop: 10,
//                             alignSelf: 'center',
//                         }}
//                         resizeMode={'contain'}
//                         //source={{uri:this.props.questionObj?.Q_IMAGE_NAME}}
//                         source={{ uri: constants.BASE_QUESTION_URL + this.props.questionObj?.Q_IMAGE_NAME }}
//                     />
//                     <MathJax
//                         // HTML content with MathJax support
//                         html={this.props.questionObj?.Q_QUESTION_EXTRA}
//                         // MathJax config option
//                         mathJaxOptions={{
//                             messageStyle: 'none',
//                             extensions: ['tex2jax.js'],
//                             jax: ['input/TeX', 'output/HTML-CSS'],
//                             tex2jax: {
//                                 inlineMath: [['$', '$'], ['\\(', '\\)']],
//                                 displayMath: [['$$', '$$'], ['\\[', '\\]']],
//                                 processEscapes: true,
//                             },
//                             TeX: {
//                                 extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js']
//                             }
//                         }}
//                         style={{
//                             marginTop: 10
//                         }}
//                     />
//                 </View>
//             )

// }









// <View style={{ flex: 0, backgroundColor: 'transparent', justifyContent: 'center' }}>
//                 {this.props.type === 'simple' ?
//                     <Text style={{ color: colors.black, fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 16, lineHeight: dimensions.sizeRatio * 22 }}>
//                         {this.props.question}
//                     </Text>
//                     : this.props.type === 'simplewithimage' ?
//                         (
//                             <View
//                                 style={{
//                                     flex: 0, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center'
//                                 }}>
//                                 <Text style={{ color: colors.black, fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 16, lineHeight: dimensions.sizeRatio * 22 }}>
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
//                                 <Text style={{ color: colors.black, fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 16, lineHeight: dimensions.sizeRatio * 22 }}>
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
//                                 <Text style={{ color: colors.black, fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 16, lineHeight: dimensions.sizeRatio * 22,marginTop: 5 }}>
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
//                                             }}
//                                             />
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