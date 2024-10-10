import React, { useEffect, useRef } from 'react';
import { ScrollView, View, Text } from 'react-native';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: any[]; // Bạn có thể thay đổi 'any' thành type cụ thể cho tin nhắn
  currenUser: any;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currenUser }) => {
  const scrollViewRef = useRef<ScrollView>(null); // Tạo một ref cho ScrollView

  useEffect(() => {
    // Cuộn xuống cuối khi có tin nhắn mới
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]); // Khi danh sách tin nhắn thay đổi

  return (
    <ScrollView ref={scrollViewRef}>
      {messages.length > 0 ? (
        messages.map((mess, index) => (
          <MessageItem key={index} mess={mess} currenUser={currenUser} />
        ))
      ) : (
        <View>
          <Text>No messages yet.</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default MessageList;
