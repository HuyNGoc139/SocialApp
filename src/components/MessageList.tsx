import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import { Scroll } from 'iconsax-react-native';
import MessageItem from './MessageItem';
interface MessageListProps {
    messages: any[]; // Bạn có thể thay đổi 'any' thành type cụ thể cho tin nhắn
    currenUser:any
}

const MessageList: React.FC<MessageListProps> = ({ messages ,currenUser}) => {
    
    return (
        <ScrollView>
            {messages.length > 0 ? (
                messages.map((mess, index) => (
                    <MessageItem key={index} mess={mess} currenUser={currenUser}/>
                ))
            ) : (
                <View><Text>No messages yet.</Text></View>
            )}
        </ScrollView>
    );
}

export default MessageList;