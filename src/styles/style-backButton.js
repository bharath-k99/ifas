import { StyleSheet } from 'react-native';
import dimensions from '../resources/dimension';

// Utils

export default StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: dimensions.sizeRatio * 10,
    alignContent:"center",
    justifyContent:"center",
    marginTop: dimensions.sizeRatio * 5,
    
  },
  backImage: {
    flex:1,
  }
  });