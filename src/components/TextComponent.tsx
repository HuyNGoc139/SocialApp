import React, { PureComponent, ReactNode } from 'react'
import { StyleProp, Text, TextStyle, View } from 'react-native'
import { globalStyles } from '../styles/globalStyles'
import { fontFamilies } from '../constants/fontFamily'
import { colors } from '../constants/color'
interface Props{
    text:string,
    size?:number,
    font?:string,
    color?:string,
    flex?: number;
    styles?: StyleProp<TextStyle>;
    line?:number
}
const TextComponent = (props: Props) => {
  const {text, font, size, color, flex, styles,line} = props;

  return (
    <Text
    numberOfLines={line}
      style={[
        globalStyles.text,
        {
          flex: flex ?? 1,
          fontFamily: font ?? fontFamilies.regular,
          fontSize: size ?? 14,
          color: color ?? colors.desc,
        },
        styles,
      ]}>
      {text}
    </Text>
  );
};

export default TextComponent;