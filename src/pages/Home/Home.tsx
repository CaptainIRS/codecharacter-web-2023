import { Button } from '@arwes/core';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ActivateUserModal from '../../components/Modals/ActivateUserModal';
import CompleteProfileModal from '../../components/Modals/CompleteProfileModal';
import ForgotPasswordModal from '../../components/Modals/ForgotPasswordModal';
import LoginModal from '../../components/Modals/LoginModal';
import RegisterModal from '../../components/Modals/RegisterModal';
import ResetPasswordModal from '../../components/Modals/ResetPasswordModal';
import { useModal } from '../../providers/ModalProvider';

export enum DisplayModal {
  None,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  ActivateUser,
  CompleteProfile,
}

const Home = ({ displayModal }: { displayModal: DisplayModal }) => {
  const { setModalState } = useModal();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    switch (displayModal) {
      case DisplayModal.Login:
        setModalState({
          isOpen: true,
          content: <LoginModal />,
          onClose: () => navigate('/'),
        });
        break;
      case DisplayModal.Register:
        setModalState({
          isOpen: true,
          content: <RegisterModal />,
          onClose: () => navigate('/'),
        });
        break;
      case DisplayModal.ForgotPassword:
        setModalState({
          isOpen: true,
          content: <ForgotPasswordModal />,
          onClose: () => navigate('/'),
        });
        break;
      case DisplayModal.ResetPassword:
        setModalState({
          isOpen: true,
          content: <ResetPasswordModal />,
          onClose: () => navigate('/'),
        });
        break;
      case DisplayModal.ActivateUser:
        setModalState({
          isOpen: true,
          content: <ActivateUserModal />,
          onClose: () => navigate('/'),
        });
        break;
      case DisplayModal.CompleteProfile:
        setModalState({
          isOpen: true,
          content: <CompleteProfileModal />,
          onClose: () => navigate('/'),
        });
        break;
      default:
        break;
    }
  }, [location.pathname, location.hash]);
  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <div
        css={{
          maxWidth: '20em',
          textAlign: 'center',
        }}
      >
        <div
          css={{
            padding: '2em',
            fontSize: '2em',
          }}
        >
          CodeCharacter
        </div>

        <div css={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Button onClick={() => navigate('/login')}>Login</Button>
          <Button onClick={() => navigate('/register')}>Register</Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
