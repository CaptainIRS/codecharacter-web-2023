import { theme } from '../../theme';
import { MdNotifications } from 'react-icons/md';
import NotificationsModal from '../Modals/NotificationsModal';
import { useModal } from '../../providers/ModalProvider';
import { useAuth } from '../../providers/AuthProvider';
import { Text } from '@arwes/core';

const Header = () => {
  const { setModalState } = useModal();
  const { user } = useAuth();
  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'row',
        gap: '2rem',
        padding: '0.5rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.color.section,
        borderBottom: `1px solid ${theme.color.border}`,
      }}
    >
      <div
        css={{
          fontSize: '1.5rem',
        }}
      >
        &lt;CodeCharacter/&gt;
      </div>
      <div
        css={{
          display: 'flex',
          flexDirection: 'row',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        <Text>Hi {user?.name}!</Text>
        <MdNotifications
          css={{ cursor: 'pointer' }}
          onClick={() => {
            setModalState({
              isOpen: true,
              content: <NotificationsModal />,
            });
          }}
        />
      </div>
    </div>
  );
};

export default Header;
