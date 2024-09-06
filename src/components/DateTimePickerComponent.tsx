import {View, Text, Modal, Button, Dimensions, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import TitleComponent from './TitleComponent';
import RowComponent from './RowComponent';
import TextComponent from './TextComponent';
import {ArrowDown2} from 'iconsax-react-native';
import {globalStyles} from '../styles/globalStyles';
import SpaceComponent from './SpaceComponent';
import { colors } from '../constants/color';
import DatePicker from 'react-native-date-picker';

interface Props {
  type?: 'date' | 'time' | 'datetime';
  title?: string;
  placeholder?: string;
  selected?: Date;
  onSelect: (val: Date) => void;
}

const DateTimePickerComponent = (props: Props) => {
  const {selected, onSelect, placeholder, title, type} = props;
  const [isVisibleModalDateTime, setIsVisibleModalDateTime] = useState(false);
  const [date, setDate] = useState(selected ?? new Date());
  const formatNumber = (number:number|string) => number.toString().padStart(2, '0');
  return(
    <>
    <View style={{marginBottom:16}}>
        {title&&<TitleComponent text={title}/>}
        <RowComponent onPress={()=>setIsVisibleModalDateTime(true)}
          styles={[
            globalStyles.inputContainer,
            {marginTop: title ? 8 : 0, paddingVertical: 16},
          ]}>
            <TextComponent text={
              selected
                ? type === 'time'
                  ? `${selected.getHours() < 10 ? '0' : ''}${selected.getHours()}:${selected.getMinutes() < 10 ? '0' : ''}${selected.getMinutes()}`
                  : `${selected.getDate() < 10 ? '0' : ''}${selected.getDate()}/${
                      (selected.getMonth() + 1) < 10 ? '0' : ''}${selected.getMonth() + 1}/${selected.getFullYear()}`
                : placeholder
                ? placeholder
                : ''
            }
             color={selected ? colors.text : '#676767'}/>
             <ArrowDown2 size={20} color={colors.text} />
        </RowComponent>
    </View>
    
    <Modal visible={isVisibleModalDateTime} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <View
            style={{
              margin: 20,
              width: '90%',
              backgroundColor: colors.white,
              padding: 20,
              borderRadius: 20,
            }}>
            <TitleComponent text="Date time picker" color={colors.blue} />
            <View>
              <DatePicker
                mode={type ? type : 'datetime'}
                date={date}
                onDateChange={val => setDate(val)}
                locale="vi"
              />
              
            </View>
            <SpaceComponent height={20} />
            
            <TouchableOpacity onPress={() => {
                onSelect(date);
                setIsVisibleModalDateTime(false);
              }} 
              
              style={{
                height:36,
                width:'100%',
                backgroundColor:'rgb(95, 199, 199)',
                justifyContent:'center',
                alignItems:'center',
                alignContent:'center',
                borderRadius:100
                }}>
              <Text style={globalStyles.text}>Confirm</Text>
            </TouchableOpacity>
            <SpaceComponent height={16} />
            <TouchableOpacity onPress={() => setIsVisibleModalDateTime(false)}
              
              style={{
                height:36,
                width:'100%',
                backgroundColor:'rgb(95, 199, 199)',
                justifyContent:'center',
                alignItems:'center',
                alignContent:'center',
                borderRadius:100
                }}>
              <Text style={globalStyles.text}>Close</Text>
            </TouchableOpacity>
            
          </View>
        </View>
      </Modal>
    </>
  )
};

export default DateTimePickerComponent;