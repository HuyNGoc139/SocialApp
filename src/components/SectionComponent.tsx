import React, { PureComponent, ReactNode } from 'react'
import { StyleProp, Text, View, ViewStyle } from 'react-native'
import { globalStyles } from '../styles/globalStyles'
interface Props{
    children:ReactNode,
    styles?:StyleProp<ViewStyle>
}
 const SectionComponent =(props:Props)=>{
    const {children,styles}=props
    return(
        <View style={[globalStyles.section,styles]}>
            {children}
        </View>
    )
}
export default SectionComponent