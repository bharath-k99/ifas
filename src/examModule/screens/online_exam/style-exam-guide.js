import {
    StyleSheet
} from 'react-native';

const buttons = StyleSheet.create({
    proceedButton: {
        width: 150,
        height: 50,
        backgroundColor: '#3255B9',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30
    }
});

const styles = StyleSheet.create({
    container:{
        flex: 1,
        padding: 10,
        alignItems: 'center'
    },
    containerTop: {
        flex: 1.4,
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center'
    },
    containerTopUpper: {
        flex: 1,
        width: '100%',
        alignItems: 'center'
    },
    containerTopLower: {
        flex: 10,
        width: '100%',
        backgroundColor: '#00BFEE',
        alignItems: 'center',
        padding: 15,
        borderRadius: 5,
        marginTop: 10
    },
    containerTopLowerInner:{
        width: '100%',
        flexDirection: 'row',
        flex: 1,
        marginTop: 10,
        marginBottom: 10,
    },
    containerTopLowerInnerButton:{
        width: '100%',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 20
    },
    containerMiddle: {
        flex: 2,
        width: '100%',
        marginTop: 20,
        backgroundColor: '#E5E5E5',
        borderRadius: 5,
        padding: 5,
        alignItems: 'center'
    },
    containerMiddleUpper: {
        width: '85%',
        backgroundColor: '#B8997A',
        padding: 10,
        borderRadius: 5
    },
    containerMiddleLower: {
        flexDirection: 'row', 
        width: '100%',
        marginTop: 10
    },
    containerMiddleLowerLeft:{
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        backgroundColor: '#E5E5E5',
    },
    containerMiddleLowerRight:{
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    containerBottom: {
        flex: .6,
        width: '100%',
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center'
    } 
});

const texts = StyleSheet.create({
    containerMiddleUpperText: {
        fontSize: 16,
        color: '#ffffff'
    },
    examTitle: {
        fontSize: 16,
        color: '#030303',
        fontWeight: 'bold'
    },
    examTitleLowerInnerLeft: {
        flex: 1.3,
        fontSize: 16,
        color: '#030303',
        fontWeight: 'bold'
    },
    examTitleLowerInnerRight: {
        flex: 1.8,
        fontSize: 16,
        color: '#000000'
    },
    examProceedText: {
        fontSize: 16,
        color: '#ffffff'
    }
});

export { buttons, styles, texts };