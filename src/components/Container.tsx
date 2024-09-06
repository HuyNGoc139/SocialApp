import { ScrollView, Text, View } from "react-native"
import React, { ReactNode } from "react"
import { globalStyles } from "../styles/globalStyles";
import { useNavigation } from "@react-navigation/native";
interface Props{
    title?:string,//? la co the co hoac khong
    back?:boolean,
    right?:ReactNode,
    children:ReactNode,
}
const Container=(props:Props)=>{
    const{title,back,right,children}=props;
    const navigation: any = useNavigation();
    return(
        <ScrollView style={globalStyles.container}>{children}</ScrollView>
    )
}
export default Container