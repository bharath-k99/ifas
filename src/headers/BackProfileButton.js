import React, {Component} from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import dimensions from '../resources/dimension';
import { EventRegister } from 'react-native-event-listeners';

export default class BackProfileButton extends Component {
 
    fireBackEvent() {
        EventRegister.emit('BackProfileEvent', '')
    }


    render() {   
      return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity hitSlop={{top: 20, bottom: 20, left: 30, right: 30}} onPress={() => this.fireBackEvent() }>
                <Image
                    source={require('../images/back.png')}
                    style={{ width: dimensions.sizeRatio * 10, height: dimensions.sizeRatio * 15, marginLeft: dimensions.sizeRatio * 20}}
                />
            </TouchableOpacity>
        </View>
      );
    }
  }