import { 
    StyleSheet
} from 'react-native';

// Enum
import { color_code_answer_button } from '../../enums/global_colors';

const styles = StyleSheet.create({
    container:{
        flex: 1,
        alignItems: 'center',
    },
    containerTop: {
        flex: .5,
        backgroundColor: '#fff',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    containerMiddle: {
        flex: 6.3,
        width: '100%',
        // paddingLeft: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    containerBottom: {
        flex: .7,
        width: '100%',
        justifyContent: 'center'
    },
    containerBottomChild: {
        flexDirection: 'row',
        width: '100%',
        paddingTop: 5,
        paddingBottom: 5,
        borderColor: color_code_answer_button.not_answered,
        borderWidth: 1
    },
    containerBottomChildInner: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end'
    }

}); 

const buttons = StyleSheet.create({
    buttonContainer: {
        backgroundColor: color_code_answer_button.not_answered,
        width: '90%',
        height: '100%', 
        justifyContent: 'center',
        alignItems: 'center'
    }
});

export { buttons, styles };