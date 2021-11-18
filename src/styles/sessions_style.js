import { StyleSheet } from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import CONSTANTS from '../resources/constants';

export default StyleSheet.create({
    dummy_navbar: {
        height: dimensions.sizeRatio * 65,
        backgroundColor: colors.theme,
    },

    main_separator_view: {
        top: dimensions.sizeRatio * -55,
        paddingLeft: dimensions.sizeRatio * 15,
        paddingRight: dimensions.sizeRatio * 15,
        // backgroundColor: colors.light_theme,
        height: dimensions.sizeRatio * 580,
    },

    live_session: {
        paddingHorizontal:dimensions.sizeRatio * 20,
        paddingTop:dimensions.sizeRatio * 20,
        paddingBottom:dimensions.sizeRatio * 20,
        backgroundColor: colors.white,
        borderRadius: dimensions.sizeRatio * 15,
        alignItems: 'center', 
    },

    live_icon: {
        width: dimensions.sizeRatio * 90,
        height: dimensions.sizeRatio * 90,
    },

    live_text: {
        marginTop:dimensions.sizeRatio * 10,
        fontFamily: CONSTANTS.DEMI,
        fontSize: dimensions.sizeRatio * 20,
        textAlign: 'center',
        width: '100%',
        color: colors.theme,
    },

    live_sub_text: {
        fontFamily: CONSTANTS.REGULAR,
        top: dimensions.sizeRatio * 45,
        fontSize: dimensions.sizeRatio * 13,
        textAlign: 'center',
        width: dimensions.width,
        height: dimensions.sizeRatio * 50,
        color: colors.lightblack,
    },

    separator_session: {
        marginTop:dimensions.sizeRatio * 20,
    },

    recorded_session: {
        marginTop:dimensions.sizeRatio * 10,
        paddingHorizontal:dimensions.sizeRatio * 20,
        paddingTop:dimensions.sizeRatio * 20,
        paddingBottom:dimensions.sizeRatio * 20,
        backgroundColor: colors.white,
        borderRadius: dimensions.sizeRatio * 15,
        alignItems: 'center',
    },

    recorded_icon: {
        width: dimensions.sizeRatio * 130,
        height: dimensions.sizeRatio * 118,
    },

    recorded_text: {
        fontFamily: CONSTANTS.DEMI,
        marginTop:dimensions.sizeRatio * 10,
        fontSize: dimensions.sizeRatio * 20,
        textAlign: 'center',
        width: '100%',
        color: colors.theme,
    },

    recorded_sub_text: {
        fontFamily: CONSTANTS.REGULAR,
        top: dimensions.sizeRatio * 63,
        fontSize: dimensions.sizeRatio * 13,
        textAlign: 'center',
        width: dimensions.width,
        height: dimensions.sizeRatio * 50,
        color: colors.lightblack,
    },
});