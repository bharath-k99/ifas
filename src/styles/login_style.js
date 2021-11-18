import { StyleSheet, Platform } from 'react-native';
import colors from '../resources/colors';
import dimensions from '../resources/dimension';
import CONSTANTS from '../resources/constants'


export default StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.black,
    },

    icon_view: {
        top: dimensions.sizeRatio * 100,
        width: dimensions.width,
        height: dimensions.sizeRatio * 280,
        // backgroundColor: colors.white,
        alignItems: 'center',
        // justifyContent: 'center',
    },

    app_icon: {
        // flex: 1,
        top: dimensions.sizeRatio * -120,
        // left: dimensions.sizeRatio * 130,
        width: dimensions.sizeRatio * 118,
        resizeMode: 'contain',
        height: dimensions.sizeRatio * 280,
        backgroundColor: colors.theme,
        // backgroundColor: colors.white,

    },

    icon_text: {
        top: dimensions.sizeRatio * 120,
        fontWeight: 'bold',
        fontSize: dimensions.sizeRatio * 33,
        width: dimensions.width,
        height: dimensions.sizeRatio * 35,
        color: colors.white,
        textAlign: 'center',
    },

    login_view: {
        paddingLeft: dimensions.sizeRatio * 25,
        paddingRight: dimensions.sizeRatio * 25,
        height: dimensions.sizeRatio * 200,
        backgroundColor: colors.theme,
    },

    username_text: {
        color: colors.light_theme, 
        fontSize: dimensions.sizeRatio * 15, 
        fontFamily: CONSTANTS.DEMI
    },

    username_text_focussed: {
        color: colors.white, 
        fontSize: dimensions.sizeRatio * 15, 
        fontFamily: CONSTANTS.DEMI
    },

    password_text: {
        color: colors.light_theme, 
        fontSize: dimensions.sizeRatio * 15, 
        fontFamily: CONSTANTS.DEMI
    },

    password_text_focussed: {
        color: colors.white, 
        fontSize: dimensions.sizeRatio * 15, 
        fontFamily: CONSTANTS.DEMI
    },

    username_view: {
        top: dimensions.sizeRatio * 15,
        // backgroundColor: colors.theme,
        borderWidth: dimensions.sizeRatio * 2,
        borderColor: colors.light_theme,
        borderRadius: dimensions.sizeRatio * 5,
        height: dimensions.sizeRatio * 52,
    },

    username_view_focussed: {
        top: dimensions.sizeRatio * 15,
        borderWidth: dimensions.sizeRatio * 2,
        borderColor: colors.white,
        borderRadius: dimensions.sizeRatio * 5,
        height: dimensions.sizeRatio * 52,
    },

    username_icon: {
        top: dimensions.sizeRatio * 15,
        left: dimensions.sizeRatio * 20,
        width: dimensions.sizeRatio * 14,
        height: dimensions.sizeRatio * 16,
    },

    username_textinput: {
        // backgroundColor: 'green',
        fontFamily: CONSTANTS.REGULAR,
        fontSize: dimensions.sizeRatio * 17,
        top: Platform.OS === 'ios' ?  dimensions.sizeRatio * -8 : dimensions.sizeRatio * -4,
        left: dimensions.sizeRatio * 50,
        width: dimensions.sizeRatio * 250,
        height: dimensions.sizeRatio * 52,
        color: colors.white,
    },
    password_textinput: {
        // backgroundColor: 'green',
        fontFamily: CONSTANTS.REGULAR,
        fontSize: dimensions.sizeRatio * 17,
        top: Platform.OS === 'ios' ?  dimensions.sizeRatio * -8 : dimensions.sizeRatio * -4,
        left: dimensions.sizeRatio * 50,
        width: dimensions.sizeRatio * 250,
        height: dimensions.sizeRatio * 52,
        color: colors.white,
    },

    password_icon: {
        top: dimensions.sizeRatio * 15,
        left: dimensions.sizeRatio * 20,
        width: dimensions.sizeRatio * 16,
        height: dimensions.sizeRatio * 17,
    },

    

    password_view: {
        top: dimensions.sizeRatio * 40,
        // backgroundColor: colors.theme,
        borderWidth: dimensions.sizeRatio * 2,
        borderColor: colors.light_theme,
        borderRadius: dimensions.sizeRatio * 5,
        height: dimensions.sizeRatio * 52,
    },

    password_view_focussed: {
        top: dimensions.sizeRatio * 40,
        // backgroundColor: colors.theme,
        borderWidth: dimensions.sizeRatio * 2,
        borderColor: colors.white,
        borderRadius: dimensions.sizeRatio * 5,
        height: dimensions.sizeRatio * 52,
    },

    button_view: {
        height: dimensions.sizeRatio * 167,
        backgroundColor: colors.theme,
        paddingLeft: dimensions.sizeRatio * 25,
        paddingRight: dimensions.sizeRatio * 25,
    },

    fp_button: {
        height: dimensions.sizeRatio * 25, 
        width: dimensions.sizeRatio * 120,
        // backgroundColor: colors.black,
        alignItems: 'center',
    },

    fp_text: {
        fontFamily: CONSTANTS.DEMI,
        paddingTop: dimensions.sizeRatio * 2,
        color: colors.fb_text, 
        fontSize: dimensions.sizeRatio * 13,
        flex: 1,
    },

    sign_button: {
        top: dimensions.sizeRatio * 25,
        height: dimensions.sizeRatio * 52,
        // width: dimensions.sizeRatio * 325,
        backgroundColor: colors.white,
        alignItems: 'center',
        borderRadius: dimensions.sizeRatio * 7,
    },

    sign_text: {
        fontFamily: CONSTANTS.DEMI,
        top: dimensions.sizeRatio * 17,
        alignItems: 'center',
        fontSize: dimensions.sizeRatio * 15,
        color: colors.theme
    },


    username_new_view: {
        flex: 1, 
        flexDirection: 'row', 
        borderColor: colors.light_theme, 
        borderWidth: 2,
        borderRadius: dimensions.sizeRatio * 5,
    },

    password_new_view: {
        flex: 1, 
        flexDirection: 'row', 
        borderColor: colors.light_theme, 
        borderWidth: 2,
        borderRadius: dimensions.sizeRatio * 5,
    },

    username_new_view_focussed: {
        flex: 1, 
        flexDirection: 'row', 
        borderColor: 'white', 
        borderWidth: 2,
        borderRadius: dimensions.sizeRatio * 5,
    },

    password_new_view_focussed: {
        flex: 1, 
        flexDirection: 'row', 
        borderColor: 'white', 
        borderWidth: 2,
        borderRadius: dimensions.sizeRatio * 5,
    },

    

  });

  