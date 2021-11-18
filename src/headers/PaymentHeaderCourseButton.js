import React, {Component} from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import dimensions from '../resources/dimension';
import { EventRegister } from 'react-native-event-listeners';
import colors from '../resources/colors';

export default class PaymentHeaderCourseButton extends Component {

 firePaymentEvent() {
    // EventRegister.emit('PaymentCourseEvent', '')
  }


  render() {   
      
       return (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity hitSlop={{ top: 20, bottom: 20, left: 30, right: 30 }} onPress={()=> this.firePaymentEvent}>
                <Image
                    source={require('../images/payment.png')}
                    style={{ width: dimensions.sizeRatio * 45, height: dimensions.sizeRatio * 20, marginRight: dimensions.sizeRatio * 20}}
                />
            </TouchableOpacity>
        </View>
      );
    }
  }