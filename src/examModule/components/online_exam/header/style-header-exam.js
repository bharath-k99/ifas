import {StyleSheet} from 'react-native';

// Enum
import { header_backgrounds, header_text_color } from '../../../enums/global_colors';

const styles = StyleSheet.create({

    containerTop: {
        flex: 1,
        flexDirection: 'row'
    },
    TopLeft: {
        flex: .7,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: header_backgrounds.left
    },
    TopMiddle: {
        flex: 1.3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: header_backgrounds.middle
    },
    TopRight: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: header_backgrounds.left 
        // 'transparent'
    }
});

const texts = StyleSheet.create({
   
    headerText: {
        fontSize: 16,
        textAlign:'center',
        marginLeft: 5,
        color: header_text_color.textCommonColor,    
    },
    headerSubText: {
        fontSize: 14,
        textAlign:'center',
        color: header_text_color.textCommonColor    
    }
});
const buttons = StyleSheet.create({
});



export { buttons, texts, styles };