import { Platform, StyleSheet } from "react-native"
import { fontFamilies } from "../constants/fontFamily"
import { colors } from "../constants/color"

export const globalStyles=StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:colors.bgColor,
        paddingTop:12,
        
      },
      title:{
        fontFamily:fontFamilies.bold,
        color:colors.text,
        fontSize:32,
      },
      text:{
        fontSize:14,
        color:colors.text,
        fontFamily:fontFamilies.regular,
      },
      row:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
      },
      inputContainer: {
        backgroundColor: colors.gray,
        borderRadius: 12,
        paddingHorizontal: Platform.OS === 'ios' ? 12 : 8,
        paddingVertical: 12,
      },
    
      section: {
        marginBottom: 12,
        paddingHorizontal: 12,
      },
    
      tag: {
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 6 : 4,
        borderRadius: 100,
        backgroundColor: colors.blue,
      },
    
      card: {
        borderRadius: 12,
      },
    
      iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 100,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
      },
      imag: {
        width: 400,
        height: 300,
        marginTop: 20,
      },
      header:{
        justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.fb,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    height: 80,
    flexDirection: 'row'
      },
      textHeader:{
        fontFamily:fontFamilies.regular,
        fontSize:24,
        color:'white'
      }
})