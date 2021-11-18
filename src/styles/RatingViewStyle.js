import { StyleSheet } from 'react-native';
import dimensions from '../resources/dimension';
import colors from '../resources/colors';
import CONSTANTS from '../resources/constants.js'

export default StyleSheet.create({
  ratingViewWrapper: {
    height: 300 * dimensions.sizeRatio,
    width: 345 * dimensions.sizeRatio,
    borderRadius: 10,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',

    // alignItems: 'center',
    // justifyContent: 'center'
  },
  ratingInnerView: {
    height: 70 * dimensions.sizeRatio,
    width: 325 * dimensions.sizeRatio,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15 * dimensions.sizeRatio,
    marginHorizontal: 10 * dimensions.sizeRatio,
    flexDirection: 'row'
  },
  smileyView: {
    backgroundColor: 'transparent',
    height: 50 * dimensions.sizeRatio,
    aspectRatio: 1
  },
  smileyBackground: {
    height: '100%',
    width: (300 * dimensions.sizeRatio) / 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  TextInputStyle: {
    fontSize: 17 * dimensions.sizeRatio,
    fontFamily: CONSTANTS.REGULAR,
    color: colors.night,
    flex: 1,
    textAlignVertical: 'top',
    marginHorizontal: 10 * dimensions.sizeRatio,
    marginTop: 10 * dimensions.sizeRatio,
    backgroundColor: colors.sessions_bgtheme,
    borderRadius: 10 * dimensions.sizeRatio,
    height: 56 * dimensions.sizeRatio
  },
  SubmitButton: {
    marginVertical: 15 * dimensions.sizeRatio,
    borderRadius: 5 * dimensions.sizeRatio,
    backgroundColor: colors.theme,
    marginHorizontal: 10,
    height: 50 * dimensions.sizeRatio,
    justifyContent: 'center',
    alignItems: 'center',
  },
  SubmitText: {
    color: colors.white,
    textAlign: 'center',
    fontSize: 15 * dimensions.sizeRatio,
    fontFamily: CONSTANTS.DEMI
  },
  modalBackground: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040'
  }
}
);