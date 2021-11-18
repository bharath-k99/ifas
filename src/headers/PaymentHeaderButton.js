import React, {Component} from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import dimensions from '../resources/dimension';
import { EventRegister } from 'react-native-event-listeners';
import colors from '../resources/colors';

export default class PaymentHeaderButton extends Component {
 
    firePaymentEvent() {
        EventRegister.emit('PaymentEvent', '')
    }

    fireProfileEvent() {
        EventRegister.emit('ProfileEvent', '')
    }


    render() {   
      return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity hitSlop={{top: 20, bottom: 20, left: 30, right: 30}} onPress={() => this.firePaymentEvent() }>
                <Image
                    source={require('../images/payment.png')}
                    style={{ width: dimensions.sizeRatio * 45, height: dimensions.sizeRatio * 20, marginRight: dimensions.sizeRatio * 15, marginTop: dimensions.sizeRatio * 3}}
                />
            </TouchableOpacity>

            <TouchableOpacity hitSlop={{top: 20, bottom: 20, left: 20, right: 20}} onPress={() => this.fireProfileEvent() } style = {{marginLeft: 10}}>
            <Image
                    source={require('../images/profile_small.png')}
                    style={{ top: dimensions.sizeRatio * 4, width: dimensions.sizeRatio * 18, height: dimensions.sizeRatio * 18, marginRight: dimensions.sizeRatio * 20, tintColor: 'black'}}
                />
            </TouchableOpacity>
        </View>
      );
    }
  }