import { StyleSheet } from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import CONSTANTS from '../resources/constants';

export default StyleSheet.create({
    cell_main_view: {
        // flex: 1,
        flexDirection: 'row',
        // marginBottom: dimensions.sizeRatio * 10, 
        // marginLeft: dimensions.sizeRatio * 15, 
        // marginRight: dimensions.sizeRatio * 15, 
        // borderRadius: dimensions.sizeRatio * 10,
        // backgroundColor: colors.white, 
        // justifyContent: 'center', 
        // alignItems: 'center',
    },

    cell_text: {
        color: colors.subjects_text, 
        paddingLeft: dimensions.sizeRatio * 15,
        paddingRight: dimensions.sizeRatio * 40,
        fontSize: dimensions.sizeRatio * 17,
    },

    indicator_image: {
        width: dimensions.sizeRatio * 10, 
        height: dimensions.sizeRatio * 15,
    },

    signin_text_ios: {
        color: colors.theme, 
        // backgroundColor: 'green',
        fontSize: dimensions.sizeRatio * 15, 
        justifyContent: "center", 
        alignItems: "center", 
        alignSelf: "center", 
        paddingTop: dimensions.sizeRatio * 20, 
        fontFamily: CONSTANTS.DEMI,
    },

    signin_text_android: {
        color: colors.theme, 
        // backgroundColor: 'green',
        fontSize: dimensions.sizeRatio * 15, 
        justifyContent: "center", 
        alignItems: "center", 
        alignSelf: "center", 
        paddingTop: dimensions.sizeRatio * 16, 
        fontFamily: CONSTANTS.DEMI,
    },

    course_text_android: {
        // backgroundColor: 'red',
        fontSize: dimensions.sizeRatio * 17, 
        color: colors.night, 
        fontFamily: CONSTANTS.DEMI,
    },

    course_text_ios: {
        // backgroundColor: 'red',
        fontSize: dimensions.sizeRatio * 17, 
        color: colors.night, 
        fontFamily: CONSTANTS.DEMI,
        marginTop: dimensions.sizeRatio * 6,
    },
});