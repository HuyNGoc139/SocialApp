import React, { memo, useEffect, useRef } from 'react';
import { ScrollView, View, Text } from 'react-native';
import MessGroupItem from './MessGroupItem';

interface MessageListProps {
  messages: any[];
  currenUser: any;
  url?: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currenUser,
  url, //url cua ban be
}) => {
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
          <MessGroupItem key={index} mess={mess} currenUser={currenUser} />
        ))
      ) : (
        <View>
          <Text style={{ textAlign: 'center' }}>No messages yet.</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default memo(MessageList);
