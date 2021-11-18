import React, {Component} from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import dimensions from '../resources/dimension';
import { EventRegister } from 'react-native-event-listeners';

export default class FullScreenHeaderButton extends Component {
 
    fireProfileEvent() {
        EventRegister.emit('FullScreenEvent', '')
    }


    render() {   
      return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity hitSlop={{top: 20, bottom: 20, left: 30, right: 30}} onPress={() => this.fireProfileEvent() }>
                <Image
                    source={require('../images/fullscreen.png')}
                    style={{ width: dimensions.sizeRatio * 20, height: dimensions.sizeRatio * 20, marginRight: dimensions.sizeRatio * 20, tintColor: 'white',}}
                />
            </TouchableOpacity>
        </View>
      );
    }
  }