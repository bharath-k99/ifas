import { Dimensions, Platform } from 'react-native'

const dimensions = {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    sizeRatio: Platform.OS == 'ios' ? Dimensions.get('window').width / 375 : 0.9
  };
export default dimensions;