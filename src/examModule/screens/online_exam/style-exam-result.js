import {
    Platform,
    StyleSheet
} from 'react-native';

const styles = StyleSheet.create({
    containerMain: {
        flex: 1, 
        padding: 10, 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    detailsView:{
        flexDirection: 'row', 
        width: '100%', 
        borderColor: '#000', 
        borderWidth: 1, 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    detailsViewSection: {
        flexDirection: 'column', 
        width: '100%', 
        borderColor: '#000', 
        borderWidth: 1, 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    detailsTextLeft:{   
        fontSize: 20,
        fontWeight: 'bold',
        width: '100%',
        padding: 5,
        textAlign: 'center',
        borderRightColor: '#000',
        borderRightWidth: 1,
        flex: 1
    },
    detailsTextRight:{   
        fontSize: 20,
        fontWeight: 'bold',
        width: '100%',
        textAlign: 'center',
        flex: 1
    },
    buttonContainer: {
        width: '80%',
        height: 60,
        marginTop: 30,  
        backgroundColor: '#ffbd27',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        width:Platform.OS === 'ios' ? 'auto' : 100,
        textAlign:Platform.OS === 'ios' ? 'auto' : 'center'
    },
});

export { styles };