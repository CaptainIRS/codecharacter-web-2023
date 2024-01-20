import { AnimatorGeneralProvider } from '@arwes/animation';
import { Button, Card, FrameHexagon, LoadingBars, Text } from '@arwes/core';
import { UserApi } from '@codecharacter-2022/client';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-simple-toasts';
import { ApiError, authConfig } from '../../api/ApiConfig';
import { useModal } from '../../providers/ModalProvider';

const ActivateUserModal = () => {
  const { modalState, setModalState } = useModal();

  const userApi = new UserApi(authConfig);

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  useEffect(() => {
    userApi
      .activateUser(searchParams.get('userId') || '', {
        token: searchParams.get('token') || '',
      })
      .then(() => {
        toast(
          <Button FrameComponent={FrameHexagon} palette="success">
            <Text>User Activated Successfully! Please Login to continue.</Text>
          </Button>,
        );
        setModalState({ isOpen: false });
        navigate('/login', { replace: true });
      })
      .catch((error: ApiError) => {
        toast(
          <Button FrameComponent={FrameHexagon} palette="error">
            <Text>{error.message}</Text>
          </Button>,
        );
        setModalState({ isOpen: false });
      });
  }, []);

  return (
    <AnimatorGeneralProvider
      animator={{ duration: { enter: 200, exit: 200, stagger: 30 } }}
    >
      <Card
        animator={{ activate: modalState.isOpen }}
        title="Activating User..."
        css={{ width: 'min(80vw, 400px)', minWidth: 0, maxHeight: '80vh' }}
      >
        <div css={{ minHeight: '40vh' }}>
          <LoadingBars full />
        </div>
      </Card>
    </AnimatorGeneralProvider>
  );
};

export default ActivateUserModal;
