import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowSquareLeft, Back } from 'iconsax-react-native';
import storage from '@react-native-firebase/storage'
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import { globalStyles } from './styles/globalStyles';
import Notificomponent from './components/Notificomponent';

interface Notification {
    id: string;
    postId?: string; // Thêm postId với dấu hỏi để nó có thể là undefined
    senderName: string;
    senderId: string;
    commentText: string;
    type: string; // loại thông báo (comment, like, ...)
    createdAt: any; // Thay đổi kiểu này nếu có thể
    receiverId: string;
    isRead: boolean;
    post?:any;
    UserSender?:any;
}

const NotificationScreen = ({ navigation, route }: any) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { user } = route.params;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const getPostById = async (postId: string) => {
        const postDoc = await firestore().collection('Posts').doc(postId).get();
        return postDoc.exists ? { id: postDoc.id, ...postDoc.data() } : null;
    };

    const getUserById = async (senderId: string) => {
        const userDoc = await firestore().collection('Users').doc(senderId).get(); // Thay 'Users' với tên bộ sưu tập của bạn
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

                    // Lọc thông báo dựa trên receiverId
                    const filteredNotifications = notiList.filter(notification => notification.receiverId === user.userId);

                    // Lấy thông tin bài viết và người gửi cho từng thông báo
                    const postPromises = filteredNotifications.map(async notification => {
                        const postId = notification.postId;
                        const senderId = notification.senderId; // Lấy senderId

                        // const post = postId ? await getPostById(postId) : null;
                        const UserSender = senderId ? await getUserById(senderId) : null;

                        return {
                            ...notification,
                            // post,
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
            }
        );

        return () => unsubscribe();
    }, []);
    return (
        <View style={{flex:1,padding:12,backgroundColor:'#c5d6d6'}}>
            <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowSquareLeft size="28" color="black"/>
            </TouchableOpacity>
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <Text style={[globalStyles.textHeader,{color:'black'}]}>Notifications</Text>
            </View>
            </View>
            {/* {!loading?<View style={{flex:1}}>
            {notifications.map((item,index)=><Notificomponent key={index} data={item} userCurrent={user} navigation={navigation}/>)}
            </View>:<ActivityIndicator size={'large'} />} */}
             {!loading ? (
                <View style={{ flex: 1 }}>
                    {notifications.length > 0 ? (
                        notifications.map((item, index) => (
                            <Notificomponent key={index} data={item} userCurrent={user} navigation={navigation} />
                        ))
                    ) : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, color: 'black' }}>No notifications</Text>
                        </View>
                    )}
                </View>
            ) : (
                <ActivityIndicator size={'large'} />
            )}
        </View>
    );
};

export default NotificationScreen;
