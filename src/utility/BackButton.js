// Summary: This file is Loader Component which can be used in all modules.
// Created: 11/10/2019 12:00 PM - VS (IN)
import React from 'react';
import {
  Image,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';

// Style sheet
import styles from '../styles/style-backButton'
import { Icon } from 'native-base';
import dimensions from '../resources/dimension';

const BackButton = props => {
  const {
    onPress,
    ...attributes
  } = props;

  const iconname = Platform.OS == "ios" ? "back.png" : "back.png"
  return (
    <TouchableOpacity style={styles.container}
      onPress={() => {
        onPress()

      }}
    >
      <Icon style={styles.backImage} type="Ionicons" name={iconname} style={{ color: "white", fontSize: dimensions.sizeRatio * 30 }} />
    </TouchableOpacity>
  )
}

export default BackButton;
