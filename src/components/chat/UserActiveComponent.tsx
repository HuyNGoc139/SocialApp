import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { User } from '../../models/user';

interface Props {
  onPress: () => void;
}
const OnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('User')
      .where('status', '==', 'online')
      .onSnapshot(snapshot => {
        const users = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data(),
        })) as User[];
        setOnlineUsers(users);
      });

    return () => unsubscribe();
  }, []);
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <Text style={{ fontSize: 18, color: 'white' }}>Active User</Text>
      {onlineUsers.length > 0 ? (
        <FlatList
          horizontal
          data={onlineUsers}
          keyExtractor={item => item.uid}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => console.log(item)}
              style={{
                marginVertical: 10,
                alignItems: 'center',
                marginRight: 8,
                justifyContent: 'center',
              }}
            >
              {item.url ? (
                <Image
                  source={{ uri: item.url }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    marginRight: 10,
                  }}
                />
              ) : (
                <Image
                  source={require('../../assets/avatar.png')}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    marginRight: 10,
                  }}
                />
              )}
              <Image
                source={require('../../assets/active.png')}
                tintColor={'green'}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 24,
                  position: 'absolute',
                  right: 10,
                  top: 32,
                }}
              />
              <Text style={{ fontSize: 16, color: 'white' }}>
                {item.username}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text>No users online.</Text>
      )}
    </View>
  );
};

export default OnlineUsers;