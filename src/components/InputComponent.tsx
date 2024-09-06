import { ReactNode, useState } from "react";
import { KeyboardTypeOptions, Text, TextInput, TouchableOpacity, View } from "react-native";
import TitleComponent from "./TitleComponent";
import RowComponent from "./RowComponent";
import { globalStyles } from "../styles/globalStyles";
import { CloseSquare, Eye, EyeSlash } from "iconsax-react-native";


interface Props{
    value:string,
    onChange:(val:string)=> void;
    placeholder?:string;
    title?:string;
    prefix?: ReactNode;
  affix?: ReactNode;
  allowClear?: boolean;//cho phep xoa noi dung
  multible?: boolean;
  numberOfLine?: number;
  type?: KeyboardTypeOptions;
  isPassword?: boolean;

}
const InputComponent=(props:Props)=>{
    const{value,onChange,placeholder,title,prefix,affix,allowClear,multible,
      numberOfLine,
      type,
      isPassword,}=props
      const[showPass,setShowPass]=useState(false)
  return(
    <View style={{marginBottom:16}}>
      {title&&<TitleComponent  text={title}/>}
      <RowComponent styles={[globalStyles.inputContainer,{
            marginTop: title ? 8 : 0,
            minHeight: multible && numberOfLine ? 32 * numberOfLine : 32,
            paddingVertical: 16,
            paddingHorizontal: 10,
            alignItems: 'flex-start',
          },]}>
          {prefix&&prefix}
          <View
          style={{
            flex: 1,
            paddingLeft: prefix ? 8 : 0,
            paddingRight: affix ? 8: 0,
          }}>
          <TextInput
            style={[
              globalStyles.text,
              {margin: 0, padding: 0, paddingVertical:0, flex: 1,},
            ]}
            placeholder={placeholder ?? ''}
            
            placeholderTextColor={'#676767'}
            value={value}
            onChangeText={val => onChange(val)}
            multiline={multible}
            numberOfLines={numberOfLine}
            keyboardType={type}
            secureTextEntry={isPassword ? !showPass : false}
            autoCapitalize="none"
          />
        </View>
        {affix&&affix}
        {allowClear&&value&&<TouchableOpacity style={{alignItems:'center',justifyContent:'center',alignSelf:'center'}} onPress={()=>onChange('')}>
        <CloseSquare size="22" color="#FAFAFA"/>
          </TouchableOpacity>}
          {isPassword&&<TouchableOpacity onPress={()=>setShowPass(!showPass)}>
            {!showPass?<Eye size="32" color="#FAFAFA"/>:
            <EyeSlash size="32" color="#FAFAFA"/>}
            </TouchableOpacity>}
      </RowComponent>
    </View>
  )



}
export default InputComponent