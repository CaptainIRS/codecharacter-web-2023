import { AnimatorGeneralProvider } from '@arwes/animation';
import { Button, Card, FrameHexagon, Text } from '@arwes/core';
import { AuthApi } from '@codecharacter-2023/client';
import { createRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-simple-toasts';
import { ApiError, authConfig } from '../../api/ApiConfig';
import { useModal } from '../../providers/ModalProvider';
import Input from '../Input/Input';

const ResetPasswordModal = () => {
  const { modalState, setModalState } = useModal();

  const newPasswordRef = createRef<HTMLInputElement>();
  const passwordConfirmRef = createRef<HTMLInputElement>();

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const authApi = new AuthApi(authConfig);

  return (
    <AnimatorGeneralProvider
      animator={{ duration: { enter: 200, exit: 200, stagger: 30 } }}
    >
      <Card
        animator={{ activate: modalState.isOpen }}
        title="Reset Password"
        css={{ width: 'min(80vw, 400px)', minWidth: 0, maxHeight: '80vh' }}
      >
        <form
          css={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
          onSubmit={event => {
            event.preventDefault();
            toast(
              <Button FrameComponent={FrameHexagon} palette="primary">
                <Text>Resetting Password...</Text>
              </Button>,
            );
            authApi
              .resetPassword({
                token: searchParams.get('token') || '',
                password: newPasswordRef.current?.value || '',
                passwordConfirmation: passwordConfirmRef.current?.value || '',
              })
              .then(() => {
                toast(
                  <Button FrameComponent={FrameHexagon} palette="success">
                    <Text>
                      Password Reset Successfully! Login to continue...
                    </Text>
                  </Button>,
                );
                setModalState({ isOpen: false });
                navigate('/login', { replace: true });
              })
              .catch(message => {
                toast(
                  <Button FrameComponent={FrameHexagon} palette="error">
                    <Text>
                      Failed to reset password: {(message as ApiError).message}
                    </Text>
                  </Button>,
                );
              });
          }}
        >
          <Input
            type="password"
            labelText="New Password"
            inputRef={newPasswordRef}
          />
          <Input
            type="password"
            labelText="Confirm Password"
            inputRef={passwordConfirmRef}
          />
          <Button FrameComponent={FrameHexagon} palette="secondary">
            Reset Password
          </Button>
        </form>
      </Card>
    </AnimatorGeneralProvider>
  );
};

export default ResetPasswordModal;
