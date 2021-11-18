import React, {Component} from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import dimensions from '../resources/dimension';
import { EventRegister } from 'react-native-event-listeners';

export default class ProfileHeaderButton extends Component {
 
    fireProfileEvent() {
        EventRegister.emit('ProfileEvent', '')
    }


    render() {   
      return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity hitSlop={{top: 20, bottom: 20, left: 30, right: 30}} onPress={() => this.fireProfileEvent() }>
                <Image
                    source={require('../images/profile_small.png')}
                    style={{ width: dimensions.sizeRatio * 15, height: dimensions.sizeRatio * 17, marginRight: dimensions.sizeRatio * 20}}
                />
            </TouchableOpacity>
        </View>
      );
    }
  }