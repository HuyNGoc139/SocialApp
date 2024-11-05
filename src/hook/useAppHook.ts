
import { useNotifications } from 'react-native-notificated';
import { NotificationOwnProps } from 'react-native-notificated/lib/typescript/defaultConfig/types';
import { NotificationConfigBase } from 'react-native-notificated/lib/typescript/types';
import { StyleProps } from 'react-native-reanimated';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { Colors, Fonts } from '../styles';

export const useApp = () => {
  const { modify, notify, remove } = useNotifications();
  const toastMessage = ({
    type,
    title,
    description,
    params,
    config,
  }: {
    type: 'error' | 'success' | 'info' | 'warning';
    title: string;
    description?: string;
    params?: Partial<NotificationOwnProps & StyleProps>;
    config?: Partial<NotificationConfigBase>;
  }) => {
    notify(type, {
      params: {
        title,
        description,
        hideCloseButton: true,
        style: {
          titleFamily: Fonts.bold,
          titleWeight: '600',
          titleSize: 16,
          titleColor: Colors.nero,
          descriptionFamily: Fonts.regular,
          descriptionColor: Colors.nero,
          descriptionWeight: '400',
          descriptionSize: 12,
        },
        ...params,
      },
      config,
    });
  };

  return {
    toastMessage,
    modify,
    remove,
  };
};
