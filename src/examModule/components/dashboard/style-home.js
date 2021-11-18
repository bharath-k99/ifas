  
import { StyleSheet } from 'react-native';
  
const stylesH = StyleSheet.create({
    container: {
        padding:50,
        flex:1
    }
});
  
const texts = StyleSheet.create({
    primary: {
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'justify',
        lineHeight: 20,
        marginTop:10,
        marginBottom:10    
    },
    secondary:{
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'justify',
        lineHeight: 15,
        marginTop:10,
    },
    third:{
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'justify',
        lineHeight: 15,
    }
});
  
export { stylesH, texts }
  