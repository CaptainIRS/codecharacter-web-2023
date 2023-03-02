import { AnimatorGeneralProvider } from '@arwes/animation';
import { Button, Card, FrameHexagon, Text } from '@arwes/core';
import { CurrentUserApi } from '@codecharacter-2023/client';
import { createRef } from 'react';
import toast from 'react-simple-toasts';
import { apiConfig, ApiError } from '../../api/ApiConfig';
import { useModal } from '../../providers/ModalProvider';
import Input from '../Input/Input';

const ChangeCredentialsModal = () => {
  const { modalState, setModalState } = useModal();

  const oldPasswordRef = createRef<HTMLInputElement>();
  const newPasswordRef = createRef<HTMLInputElement>();
  const passwordConfirmRef = createRef<HTMLInputElement>();

  const currentUserApi = new CurrentUserApi(apiConfig);

  return (
    <AnimatorGeneralProvider
      animator={{ duration: { enter: 200, exit: 200, stagger: 30 } }}
    >
      <Card
        animator={{ activate: modalState.isOpen }}
        title="Change Credentials"
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
                <Text>Updating Credentials...</Text>
              </Button>,
            );
            currentUserApi
              .updatePassword({
                oldPassword: oldPasswordRef.current?.value || '',
                password: newPasswordRef.current?.value || '',
                passwordConfirmation: passwordConfirmRef.current?.value || '',
              })
              .then(() => {
                toast(
                  <Button FrameComponent={FrameHexagon} palette="success">
                    <Text>Credentials Updated Successfully!</Text>
                  </Button>,
                );
                setModalState({ isOpen: false });
              })
              .catch(message => {
                toast(
                  <Button FrameComponent={FrameHexagon} palette="error">
                    <Text>
                      Failed to change credentials:{' '}
                      {(message as ApiError).message}
                    </Text>
                  </Button>,
                );
              });
          }}
        >
          <Input
            type="password"
            labelText="Old Password"
            inputRef={oldPasswordRef}
          />
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
            Change Credentials
          </Button>
        </form>
      </Card>
    </AnimatorGeneralProvider>
  );
};

export default ChangeCredentialsModal;
