
import React from 'react';
import { Image } from 'react-native';

export default class LogoTitle extends Component {
    render() {
      return (
        <Image
          source={require('../images/appicon.png')}
          style={{ width: 30, height: 30 }}
        />
      );
    }
  }