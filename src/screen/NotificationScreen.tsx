import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ArrowSquareLeft, Back, UserAdd } from 'iconsax-react-native';
import firestore from '@react-native-firebase/firestore';
import { globalStyles } from '../styles/globalStyles';
import Notificomponent from '../components/notifi/Notificomponent';
import { fontFamilies } from '../constants/fontFamily';
import SpaceComponent from '../components/SpaceComponent';

interface Notification {
  id: string;
  postId?: string;
  senderName: string;
  senderId: string;
  commentText: string;
  type: string;
  createdAt: any;
  receiverId: string;
  isRead: boolean;
  post?: any;
  UserSender?: any;
}

const NotificationScreen = ({ navigation, route }: any) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const getUserById = async (senderId: string) => {
    const userDoc = await firestore().collection('Users').doc(senderId).get();
    return userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;
  };
  useEffect(() => {
    const notificationRef = firestore()
      .collection('notifi')
      .orderBy('createdAt', 'desc');

    const unsubscribe = notificationRef.onSnapshot(
      async snapshot => {
        setLoading(true);
        if (snapshot && !snapshot.empty) {
          const notiList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Notification[];
          const filteredNotifications = notiList.filter(
            notification => notification.receiverId === user.userId,
          );

          const postPromises = filteredNotifications.map(async notification => {
            const postId = notification.postId;
            const senderId = notification.senderId;
            const UserSender = senderId ? await getUserById(senderId) : null;

            return {
              ...notification,
              UserSender,
            };
          });

          const notificationsWithPosts = await Promise.all(postPromises);
          setNotifications(notificationsWithPosts);
          setLoading(false);
        } else {
          setNotifications([]);
        }
      },
      error => {
        console.log('Error fetching notifications: ', error);
        setError('Failed to load notifications');
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView style={{ flex: 1, padding: 12, backgroundColor: '#c5d6d6' }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowSquareLeft size="28" color="black" />
        </TouchableOpacity>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={[globalStyles.textHeader, { color: 'black' }]}>
            Notifications
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.add}
        onPress={() => navigation.navigate('Friend')}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: '#ced6d6',
            borderRadius: 100,
            padding: 4,
          }}
        >
          <UserAdd size="32" color="black" />
        </View>
        <View style={{ flex: 1, paddingLeft: 16 }}>
          <Text style={styles.textadd}>Add Friend Request</Text>
          <Text style={{ fontSize: 14, fontFamily: fontFamilies.regular }}>
            Accept or Decline Request
          </Text>
        </View>
      </TouchableOpacity>
      {!loading ? (
        <View style={{ flex: 1 }}>
          {notifications.length > 0 ? (
            notifications.map((item, index) => (
              <Notificomponent
                key={index}
                data={item}
                userCurrent={user}
                navigation={navigation}
              />
            ))
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, color: 'black' }}>
                No notifications
              </Text>
            </View>
          )}
          <SpaceComponent height={20} />
        </View>
      ) : (
        <ActivityIndicator size={'large'} />
      )}
    </ScrollView>
  );
};

export default NotificationScreen;
const styles = StyleSheet.create({
  add: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  textadd: {
    fontSize: 16,
    fontFamily: fontFamilies.regular,
    color: 'black',
  },
});
