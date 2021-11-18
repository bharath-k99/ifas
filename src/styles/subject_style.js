import { StyleSheet } from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import CONSTANTS from '../resources/constants.js'

export default StyleSheet.create({

    cell_main_view: {
        flex: 1,
        flexDirection: 'row',
        marginBottom: dimensions.sizeRatio * 10, 
        marginLeft: dimensions.sizeRatio * 15, 
        marginRight: dimensions.sizeRatio * 15, 
        borderRadius: dimensions.sizeRatio * 10,
        backgroundColor: colors.white, 
        justifyContent: 'center', 
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

    category_name_ios: { 
        fontSize: dimensions.sizeRatio * 17, 
        color: colors.night, 
        marginHorizontal: dimensions.sizeRatio * 14 , 
        fontFamily: CONSTANTS.DEMI, 
        marginTop: dimensions.sizeRatio * 15
    },

    category_name_android: { 
        fontSize: dimensions.sizeRatio * 17, 
        color: colors.night, 
        marginHorizontal: dimensions.sizeRatio * 14 , 
        fontFamily: CONSTANTS.DEMI, 
        marginTop: dimensions.sizeRatio * 15
    },
    subjects_name_ios: {
        fontSize: dimensions.sizeRatio * 17,
        color: colors.night,
        paddingHorizontal: dimensions.sizeRatio * 15,
        fontFamily: CONSTANTS.DEMI,
        paddingTop: dimensions.sizeRatio * 4
    },

    subjects_name_android: {
        fontSize: dimensions.sizeRatio * 17,
        color: colors.night,
        paddingHorizontal: dimensions.sizeRatio * 15,
        fontFamily: CONSTANTS.DEMI,
    },
    category_descrtiption_ios: { 
        fontFamily:CONSTANTS.REGULAR,
        fontSize: dimensions.sizeRatio * 12.5,
        color: colors.night, 
        marginHorizontal: dimensions.sizeRatio * 14 , 
        marginTop: dimensions.sizeRatio * 10,
        marginBottom: dimensions.sizeRatio * 15
    },

    category_descrtiption_android: { 
        fontFamily:CONSTANTS.REGULAR,
        fontSize: dimensions.sizeRatio * 12.5,
        color: colors.night, 
        marginHorizontal: dimensions.sizeRatio * 14 , 
        marginTop: dimensions.sizeRatio * 10,
        marginBottom: dimensions.sizeRatio * 15
    },

    topic_name_ios: { 
        fontFamily: CONSTANTS.DEMI, 
        fontSize: dimensions.sizeRatio * 16, 
        color: colors.night, 
        paddingHorizontal: dimensions.sizeRatio * 15 , 
        fontFamily: CONSTANTS.DEMI,
        marginTop: dimensions.sizeRatio * 5
    },

    topic_name_android: { 
        fontFamily: CONSTANTS.DEMI, 
        fontSize: dimensions.sizeRatio * 16, 
        color: colors.night, 
        paddingHorizontal: dimensions.sizeRatio * 15 , 
        fontFamily: CONSTANTS.DEMI,
    },

});