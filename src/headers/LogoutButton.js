import React, {Component} from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import dimensions from '../resources/dimension';
import { EventRegister } from 'react-native-event-listeners';

export default class LogoutButton extends Component {
 
    fireProfileEvent() {
        EventRegister.emit('LogoutEvent', '')
    }


    render() {   
      return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity hitSlop={{top: 20, bottom: 20, left: 30, right: 30}} onPress={() => this.fireProfileEvent() }>
                <Image
                    source={require('../images/logout.png')}        
                    style={{ width: dimensions.sizeRatio * 18, height: dimensions.sizeRatio * 18, marginRight: dimensions.sizeRatio * 20, tintColor: 'white', resizeMode: 'contain'}}
                />
            </TouchableOpacity>
        </View>
      );
    }
  }