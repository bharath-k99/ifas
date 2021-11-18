import React, {Component} from 'react';
import {View, Text, Image} from 'react-native';
import dimensions from '../resources/dimension';
import CONSTANTS from '../resources/constants';
import colors from '../resources/colors';

export default class profile_component extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <View style={{backgroundColor: 'transparent', height: dimensions.sizeRatio * 60, marginVertical: dimensions.sizeRatio * 5}}>
                <View style={{flex: 1, flexDirection: "row"}}>
                    <View style={{flex: 0.18, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center'}}>
                        <Image source={this.props.imagePath} style={{width: dimensions.sizeRatio * 16, height: dimensions.sizeRatio * 15}}  resizeMode = 'contain' />
                    </View>
                    <View style={{flex: 0.82, backgroundColor: 'transparent'}}>
                        <View style={{flex: 1}}>
                            <View style={{flex: 0.5, backgroundColor:'transparent'}}>
                                <View style={{flex: 1, justifyContent: 'center'}}>
                                    <Text style={{fontFamily: CONSTANTS.REGULAR, fontSize: dimensions.sizeRatio * 14, color: colors.lightblack}}>
                                        {this.props.title}
                                    </Text>
                                </View>
                            </View>
                            <View style={{flex: 0.5}}>
                                <View style={{flex: 1, justifyContent: 'center'}}>
                                    <Text style={{fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 17}}>
                                        {this.props.value}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        )
     }
}