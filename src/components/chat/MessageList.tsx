import React, { memo, useEffect, useRef } from 'react';
import { ScrollView, View, Text } from 'react-native';
import MessageItem from './MessageItem';

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
          <MessageItem
            key={index}
            mess={mess}
            currenUser={currenUser}
            url={url}
          />
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
