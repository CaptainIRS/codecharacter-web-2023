import { AnimatorGeneralProvider } from '@arwes/animation';
import { Button, Card, FrameHexagon, Text } from '@arwes/core';
import { AuthApi } from '@codecharacter-2023/client';
import { createRef } from 'react';
import toast from 'react-simple-toasts';
import { ApiError, authConfig } from '../../api/ApiConfig';
import { useModal } from '../../providers/ModalProvider';
import Input from '../Input/Input';

const ForgotPasswordModal = () => {
  const { modalState, setModalState } = useModal();

  const emailRef = createRef<HTMLInputElement>();

  const authApi = new AuthApi(authConfig);

  return (
    <AnimatorGeneralProvider
      animator={{ duration: { enter: 200, exit: 200, stagger: 30 } }}
    >
      <Card
        animator={{ activate: modalState.isOpen }}
        title="Forgot Password"
        css={{ width: 'min(80vw, 400px)', minWidth: 0, maxHeight: '80vh' }}
      >
        <div css={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                  <Text>Requesting Password Reset...</Text>
                </Button>,
              );
              authApi
                .forgotPassword({
                  email: emailRef.current?.value || '',
                })
                .then(() => {
                  toast(
                    <Button FrameComponent={FrameHexagon} palette="success">
                      <Text>Reset Password Email Sent! Check your inbox.</Text>
                    </Button>,
                  );
                  setModalState({ isOpen: false });
                })
                .catch(message => {
                  toast(
                    <Button FrameComponent={FrameHexagon} palette="error">
                      <Text>
                        Failed to request reset: {(message as ApiError).message}
                      </Text>
                    </Button>,
                  );
                });
            }}
          >
            <Input type="email" labelText="Email" inputRef={emailRef} />
            <Button FrameComponent={FrameHexagon} palette="secondary">
              <Text>Request Password Reset</Text>
            </Button>
          </form>
        </div>
      </Card>
    </AnimatorGeneralProvider>
  );
};

export default ForgotPasswordModal;
