import { AnimatorGeneralProvider } from '@arwes/animation';
import { Button, Card, FrameHexagon, Text } from '@arwes/core';
import { CurrentUserApi } from '@codecharacter-2023/client';
import { createRef, useState } from 'react';
import toast from 'react-simple-toasts';
import { apiConfig, ApiError } from '../../api/ApiConfig';
import { useModal } from '../../providers/ModalProvider';
import AvatarSelect from '../Avatar/AvatarSelect';
import Input from '../Input/Input';
import Select from '../Select/Select';

const CompleteProfileModal = () => {
  const { modalState, setModalState } = useModal();

  const nameRef = createRef<HTMLInputElement>();
  const usernameRef = createRef<HTMLInputElement>();
  const countryRef = createRef<HTMLSelectElement>();
  const collegeRef = createRef<HTMLInputElement>();
  const [avatarId, setAvatarId] = useState(0);

  const currentUserApi = new CurrentUserApi(apiConfig);

  return (
    <AnimatorGeneralProvider
      animator={{ duration: { enter: 200, exit: 200, stagger: 30 } }}
    >
      <Card
        animator={{ activate: modalState.isOpen }}
        title="Complete Profile"
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
                <Text>Updating Profile Information...</Text>
              </Button>,
            );
            currentUserApi
              .completeUserProfile({
                name: nameRef.current?.value || '',
                username: usernameRef.current?.value || '',
                country: countryRef.current?.value || '',
                college: collegeRef.current?.value || '',
                avatarId: avatarId,
              })
              .then(() => {
                toast(
                  <Button FrameComponent={FrameHexagon} palette="success">
                    <Text>Profile Updated Successfully!</Text>
                  </Button>,
                );
                setModalState({ isOpen: false });
                localStorage.removeItem('token');
                window.dispatchEvent(new Event('storage'));
              })
              .catch(message => {
                toast(
                  <Button FrameComponent={FrameHexagon} palette="error">
                    <Text>
                      Failed to update profile: {(message as ApiError).message}
                    </Text>
                  </Button>,
                );
              });
          }}
        >
          <Input type="text" labelText="Name" inputRef={nameRef} />
          <Input type="text" labelText="Username" inputRef={usernameRef} />
          <Select labelText="Country" selectRef={countryRef} value={'India'}>
            <option value="India">India</option>
            <option value="Other">Other</option>
          </Select>
          <Input type="text" labelText="College" inputRef={collegeRef} />
          <AvatarSelect defaultAvatar={avatarId} onSelect={setAvatarId} />
          <Button FrameComponent={FrameHexagon} palette="secondary">
            Update Profile
          </Button>
        </form>
      </Card>
    </AnimatorGeneralProvider>
  );
};

export default CompleteProfileModal;
