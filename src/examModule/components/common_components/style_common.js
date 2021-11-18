import {
    StyleSheet
} from 'react-native';

// Enum
import { checkBoxStyleColor } from '../../enums/global_colors';

/*
            **** CHECK_BOX.JS ****
*/
const check_style = StyleSheet.create({
    containerMain: {
        height: 24,
        width: 24,
        borderWidth: 2,
        borderColor: checkBoxStyleColor.borderColour,
        alignItems: 'center',
        justifyContent: 'center',
    },
    containerSub: {
        height: 12,
        width: 12
    },
    textInContainer: {
        flex: 1,
        marginTop: 25, 
        marginLeft: 5
    }
});

/*
            **** SECTION_TOOL_TIP.JS ****
*/
const tip_style = StyleSheet.create({
    mainContainer: { 
        width: '100%', 
        height: 40, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    sectionTipMainContainer: { 
        flexDirection: 'row', 
        width: '100%', 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    sectionTipMainSectionView: { 
        width: '60%', 
        height: '100%', 
        paddingLeft: 5, 
        paddingRight: 5, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    sectionTipMainSectionView2: { 
        width: '40%', 
        height: '100%', 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    sectionTipMainSectionViewButton: { 
        height: '100%', 
        width: '100%',  
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    sectionTipMainSectionButtonText: { 
        color: '#000', 
        fontSize:14 
    },
    toolTipMain: {
        flex: 1, 
        padding: 5
    },
    toolTipContainer: { 
        paddingLeft: 5, 
        paddingRight: 5, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    toolTipSub: {
        alignItems:  'center', 
        justifyContent: 'center', 
        marginBottom: 5
    },
    textToolTipSub: {
        color: '#ffffff'
    }
});


export { check_style, tip_style };