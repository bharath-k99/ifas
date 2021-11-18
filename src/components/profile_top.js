import React, {Component} from 'react';
import {View, Text, Image} from 'react-native';
import dimensions from '../resources/dimension';
import CONSTANTS from '../resources/constants';
import colors from '../resources/colors';

export default class profile_top extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <View style={{flex: 0, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{color: colors.theme, fontFamily: CONSTANTS.DEMI, fontSize: dimensions.sizeRatio * 20}}>
                    {this.props.name} 
                </Text> 

                <Text style={{color: colors.lightblack, fontFamily: CONSTANTS.REGULAR, fontSize: dimensions.sizeRatio * 14, marginTop: dimensions.sizeRatio * 5}}>
                    {this.props.email}
                </Text>                 
            </View>            
        )
     }
}