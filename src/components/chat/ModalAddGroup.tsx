import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Button,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { SelectModel } from '../../models/SelectModal';
import CheckBox from '@react-native-community/checkbox';
import { useApp } from '../../hook/useAppHook';

interface ModalAddGroupProps {
  visible: boolean;
  onClose: () => void;
  users: SelectModel[];
  currentuser: any;
}

const ModalAddGroup: React.FC<ModalAddGroupProps> = ({
  visible,
  onClose,
  users,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<SelectModel[]>([]);
  const user = useSelector((state: RootState) => state.auth.user);
  const handleToggleUser = (user: SelectModel) => {
    const isSelected = selectedUsers.some(
      selected => selected.uid === user.uid,
    );
    if (isSelected) {
      setSelectedUsers(prev =>
        prev.filter(selected => selected.uid !== user.uid),
      );
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const createGroup = async (selectedUsers: SelectModel[]) => {
    if (selectedUsers.length < 2) {
      console.log('Nhóm phải có ít nhất 2 thành viên.');
      return;
    }

    const allUsers = [...selectedUsers, user];
    const userIds = allUsers.map(user => user?.uid).sort();
    const groupName = allUsers.map(user => user?.username).join(', ');
    const groupId = userIds.join('-');

    try {
      const groupRef = firestore().collection('Group').doc(groupId);
      const groupDoc = await groupRef.get();

      if (groupDoc.exists) {
        Alert.alert(`Nhóm đã tồn tại.`);
        return;
      }

      await groupRef.set({
        groupName,
        members: userIds,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updateAt: firestore.FieldValue.serverTimestamp(),
      });

      console.log(
        `Nhóm ${groupName} đã được tạo thành công với ID: ${groupId}`,
      );
    } catch (error) {
      console.error('Lỗi khi tạo nhóm:', error);
    }
  };

  const handleCreateGroup = () => {
    if (selectedUsers.length > 1) {
      createGroup(selectedUsers);
      setSelectedUsers([]);
      onClose();
    } else {
      Alert.alert('Số thành viên phải > 1');
    }
  };

  const handleClose = () => {
    setSelectedUsers([]);
    onClose();
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create New Group</Text>
          <FlatList
            data={users}
            keyExtractor={item => item.uid}
            renderItem={({ item }) => (
              <View style={styles.userItem}>
                <CheckBox
                  value={selectedUsers.some(
                    selected => selected.uid === item.uid,
                  )}
                  onValueChange={() => handleToggleUser(item)}
                  tintColors={{ true: '#3366FF', false: 'gray' }}
                />
                {item.url ? (
                  <Image source={{ uri: item.url }} style={styles.avatar} />
                ) : (
                  <Image
                    source={require('../../assets/image/avatar.png')}
                    style={styles.avatar}
                  />
                )}
                <Text style={styles.userName}>{item.username}</Text>
              </View>
            )}
          />
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#D0D0D0' }]}
              onPress={handleClose}
            >
              <Text style={styles.text}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#3366FF' }]}
              onPress={handleCreateGroup}
            >
              <Text style={styles.text}>Create Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  button: {
    padding: 10,
    borderRadius: 20,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ModalAddGroup;
