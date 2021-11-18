import { StyleSheet } from 'react-native';

const styles = StyleSheet.create(
{
  container: {
    flex: 1,
  },
  headerMenuMain:{
    height:100
  },
  headerMenu:{
    flex: 1,
    flexDirection: 'row',
    backgroundColor:'#d3d3d3',
    padding:10,
    alignItems: 'center'
  },
  menuHeaderText:{
    marginLeft:15,
    fontSize:18,
    color: '#7d7885'
  },
  upperMenu:{
    flexDirection: 'row',
    backgroundColor: '#f42e78',
  },
  upperMenuLeft:{
    marginTop:30,
    marginBottom:30,
    marginLeft:20,
    alignItems:'center'
  },
  upperMenuRight:{
    position: 'absolute',
    top: 30,
    right: 20,
  },
  textGuest:{
    color:'#ffffff',
    fontSize:18,
    fontWeight:'bold',
    marginTop:10,
    width:Platform.OS === 'ios' ? 'auto' : 70,
    textAlign:Platform.OS === 'ios' ? 'auto' : 'center'
  },
  textLogin:{
    color:'#ffffff',
    fontSize:20,
    fontWeight:'bold',
    width:Platform.OS === 'ios' ? 'auto' : 70,
    textAlign:Platform.OS === 'ios' ? 'auto' : 'center'
  },
  scrollViw:{
    padding:30
  },
  itemView:{
    marginTop:30
  },
  menuItemText:{
    fontSize:18,
    color: '#7d7885'
  }
});

export { styles }