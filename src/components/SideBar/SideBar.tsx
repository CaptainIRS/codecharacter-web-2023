import { Button, FrameCorners } from '@arwes/core';
import { useTour } from '@reactour/tour';
import { rgba } from 'polished';
import {
  FaMap,
  FaTrophy,
  FaTv,
  FaHistory,
  FaQuestionCircle,
  FaSignOutAlt,
  FaUser,
  FaCode,
  FaFileAlt,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../../providers/ModalProvider';
import { theme } from '../../theme';
import EditProfileModal from '../Modals/EditProfileModal';

const Sidebar = () => {
  const { setIsOpen } = useTour();
  const navigate = useNavigate();

  const { setModalState } = useModal();

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '0.5rem',
        borderRight: `1px solid ${rgba(theme.color.border, 0.4)}`,
      }}
    >
      <div css={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Button
          className="home-button"
          FrameComponent={FrameCorners}
          animator={{ animate: false }}
          onClick={() => navigate('/')}
        >
          <FaCode />
        </Button>
        <Button
          FrameComponent={FrameCorners}
          animator={{ animate: false }}
          onClick={() => navigate('map-designer')}
        >
          <FaMap />
        </Button>
        <Button
          FrameComponent={FrameCorners}
          animator={{ animate: false }}
          onClick={() => navigate('history')}
        >
          <FaHistory />
        </Button>
        <Button
          FrameComponent={FrameCorners}
          animator={{ animate: false }}
          onClick={() => navigate('leaderboard')}
        >
          <FaTrophy />
        </Button>
        <Button
          FrameComponent={FrameCorners}
          animator={{ animate: false }}
          onClick={() => navigate('battle-tv')}
        >
          <FaTv />
        </Button>
      </div>
      <div css={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Button
          FrameComponent={FrameCorners}
          animator={{ animate: false }}
          onClick={() => {
            navigate('/');
            setIsOpen(true);
          }}
        >
          <FaQuestionCircle />
        </Button>
        <Button
          FrameComponent={FrameCorners}
          animator={{ animate: false }}
          onClick={() =>
            window.open(
              'https://codecharacter-docs-2022.vercel.app/',
              '_blank',
              'noopener,noreferrer',
            )
          }
        >
          <FaFileAlt />
        </Button>
        <Button
          FrameComponent={FrameCorners}
          animator={{ animate: false }}
          onClick={() =>
            setModalState({
              isOpen: true,
              content: <EditProfileModal />,
            })
          }
        >
          <FaUser />
        </Button>
        <Button
          FrameComponent={FrameCorners}
          animator={{ animate: false }}
          onClick={() => {
            localStorage.removeItem('token');
            window.dispatchEvent(new Event('storage'));
            navigate('/');
          }}
        >
          <FaSignOutAlt />
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
