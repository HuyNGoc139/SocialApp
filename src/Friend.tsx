import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { globalStyles } from './styles/globalStyles';
import { SearchNormal1 } from 'iconsax-react-native';
import SpaceComponent from './components/SpaceComponent';
import FriendComponent from './components/FriendsComponent';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { SelectModel } from './models/SelectModal';

const FriendScreen = ({navigation}:any) => {
    const [search, setSearch] = useState('');
    const [userSelect, setUserSelect] = useState<SelectModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [friendRequests, setFriendRequests] = useState<SelectModel[]>([]);
    const [friends, setFriends] = useState<SelectModel[]>([]); // Danh sách bạn bè
    const [isLoadingfr, setIsLoadingfr] = useState(false);
    // useEffect(() => {
    //     const unsubscribe = auth().onAuthStateChanged((user) => {
    //         if (user) {
    //             handleGetFriendRequests(user.uid);
    //             handleGetAllUsers(user.uid);
    //         }
    //     });
    //     return () => unsubscribe(); // Clean up the subscription on unmount
    // }, []);
    useEffect(() => {
        const handleInitialData = async (uid: string) => {
            // Chờ `handleGetFriendRequests` hoàn thành
            await handleGetFriendRequests(uid);
    
            // Sau đó mới thực thi `handleGetAllUsers`
            handleGetAllUsers(uid);
        };
    
        const unsubscribe = auth().onAuthStateChanged((user) => {
            if (user) {
                handleInitialData(user.uid); // Gọi hàm async
            }
        });
    
        return () => unsubscribe(); // Clean up the subscription on unmount
    }, []);

    const handleGetAllUsers = (currentUserId: string) => {
        setIsLoadingfr(true); // Bắt đầu quá trình tải
        try {
            // Lấy thông tin người dùng hiện tại
            const unsubscribeCurrentUser = firestore().doc(`Users/${currentUserId}`).onSnapshot((currentUserDoc) => {
                const currentUserFriends = currentUserDoc.data()?.friends || []; // Lấy danh sách bạn bè
                
                // Lắng nghe thay đổi trong collection Users
                const unsubscribeUsers = firestore().collection('Users').onSnapshot((snapshot) => {
                    const items: SelectModel[] = [];
                    if (snapshot.empty) {
                        console.log('User not found');
                    } else {
                        snapshot.forEach((item) => {
                            if (item.id !== currentUserId && !currentUserFriends.includes(item.id)) { // Loại bỏ những người bạn đã có
                                items.push({
                                    userName: item.data().username,
                                    uid: item.id,
                                });
                            }
                        });
                        setUserSelect(items);
                    }
                });
    
                // Cleanup function
                return () => {
                    unsubscribeUsers(); // Ngừng lắng nghe khi component unmount
                };
            });
    
            // Cleanup function cho unsubscribeCurrentUser
            return () => {
                unsubscribeCurrentUser(); // Ngừng lắng nghe thông tin người dùng hiện tại
            };
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoadingfr(false); // Kết thúc quá trình tải
        }
    };

    
    const handleGetFriendRequests = async (currentUserId: string) => {
        setIsLoading(true);
        const unsubscribe = firestore()
            .collection('FriendRequests')
            .where('receiverId', '==', currentUserId)
            .where('status', '==', 'pending')
            .onSnapshot(snapshot => {
                const requests: any[] = [];
                snapshot.forEach((item) => {
                    requests.push({
                        uid: item.data().senderId,
                    });
                });
                setFriendRequests(requests);
                setIsLoading(false);
            });

        return () => unsubscribe(); // Clean up the subscription on unmount
    };

    // Lấy danh sách uid của những người đã gửi yêu cầu kết bạn
    const requestUids = friendRequests.map(request => request.uid);
    // Lấy danh sách uid của những người bạn
    const friendUids = friends.map(friend => friend.uid);
    return (
        <View style={{ flex: 1 }}>
            <View style={globalStyles.header}>
                <Text style={globalStyles.textHeader}>Friends</Text>
            </View>
            <SpaceComponent height={10} />
            <View style={styles.container}>
                <View style={styles.input}>
                    <SearchNormal1 size="28" color="black" />
                    <TextInput
                        style={{ flex: 1, paddingLeft: 10 }}
                        value={search}
                        onChangeText={(val) => setSearch(val)}
                        placeholder="Search Friends"
                    />
                </View>

                <View>
                    <Text style={styles.textH1}>Friend Requests</Text>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="blue" />
                    ) : friendRequests.length > 0 ? (
                        <FlatList
                            data={friendRequests}
                            keyExtractor={(item) => item.uid}
                            renderItem={({ item }) => (
                                <FriendComponent key={item.uid} uid={item.uid} isRequest navigation={navigation}/>
                            )}
                        />
                    ) : (
                        <View style={{justifyContent:'center',alignItems:'center'}}>
                            <Text style={styles.textnotfound}>No Friend Requests</Text></View>
                    )}
                </View>

                <View>
                    <Text style={styles.textH1}>People you may know</Text>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="blue" />
                    ) : userSelect.length > 0 ? (
                        <FlatList
                            data={userSelect.filter((ele) => 
                                !requestUids.includes(ele.uid) && // Kiểm tra xem uid có nằm trong requestUids không
                                !friendUids.includes(ele.uid) && // Kiểm tra xem uid có nằm trong friendUids không
                                ele.userName.toLowerCase().includes(search.toLowerCase())
                            )}
                            keyExtractor={(item) => item.uid}
                            renderItem={({ item }) => (
                                <FriendComponent key={item.uid} uid={item.uid} navigation={navigation}/>
                            )}
                        />
                    ) : (
                        <View style={{justifyContent:'center',alignItems:'center'}}><Text style={styles.textnotfound}>No Users Found</Text>
                        </View>
                        
                    )}
                </View>
            </View>
        </View>
    );
};

export default FriendScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: 12,
        marginRight: 12,
    },
    input: {
        borderWidth: 1,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10,
    },
    textH1:{
        fontSize:20,
        color:'black',
        fontWeight:'500',
        marginTop:10,
        marginBottom:10
    },
    textnotfound:{
        fontSize:16,
        color:'black',
    }
});
