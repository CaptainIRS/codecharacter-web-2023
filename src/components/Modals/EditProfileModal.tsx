import { AnimatorGeneralProvider } from '@arwes/animation';
import { Button, Card, FrameHexagon, Text } from '@arwes/core';
import { CurrentUserApi, TierType } from '@codecharacter-2023/client';
import { createRef, useState } from 'react';
import toast from 'react-simple-toasts';
import { apiConfig, ApiError } from '../../api/ApiConfig';
import { useAuth } from '../../providers/AuthProvider';
import { useModal } from '../../providers/ModalProvider';
import AvatarSelect from '../Avatar/AvatarSelect';
import Input from '../Input/Input';
import Select from '../Select/Select';
import ChangeCredentialsModal from './ChangeCredentialsModal';

const EditProfileModal = () => {
  const { modalState, setModalState } = useModal();
  const { user, setUser } = useAuth();

  const nameRef = createRef<HTMLInputElement>();
  const countryRef = createRef<HTMLSelectElement>();
  const collegeRef = createRef<HTMLInputElement>();
  const [avatarId, setAvatarId] = useState(user?.avatarId || 0);

  const currentUserApi = new CurrentUserApi(apiConfig);

  return (
    <AnimatorGeneralProvider
      animator={{ duration: { enter: 200, exit: 200, stagger: 30 } }}
    >
      <Card
        animator={{ activate: modalState.isOpen }}
        title="Edit Profile"
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
                  <Text>Updating User...</Text>
                </Button>,
              );
              currentUserApi
                .updateCurrentUser({
                  name: nameRef.current?.value || '',
                  country: countryRef.current?.value || '',
                  college: collegeRef.current?.value || '',
                  avatarId: avatarId,
                })
                .then(() => {
                  toast(
                    <Button FrameComponent={FrameHexagon} palette="success">
                      <Text>User Updated Successfully!</Text>
                    </Button>,
                  );
                  currentUserApi.getCurrentUser().then(user => {
                    setUser({ ...user, tier: user.tier || TierType.Tier1 });
                    setAvatarId(user.avatarId || 0);
                    setModalState({ isOpen: false });
                  });
                })
                .catch(message => {
                  toast(
                    <Button FrameComponent={FrameHexagon} palette="error">
                      <Text>
                        Failed to update user: {(message as ApiError).message}
                      </Text>
                    </Button>,
                  );
                });
            }}
          >
            <Input
              type="text"
              labelText="Name"
              inputRef={nameRef}
              defaultValue={user?.name}
            />
            <Select
              labelText="Country"
              selectRef={countryRef}
              value={user?.country || 'India'}
            >
              <option value="India">India</option>
              <option value="Other">Other</option>
            </Select>
            <Input
              type="text"
              labelText="College"
              inputRef={collegeRef}
              defaultValue={user?.college}
            />
            <AvatarSelect
              defaultAvatar={user?.avatarId || 0}
              onSelect={setAvatarId}
            />
            <Button FrameComponent={FrameHexagon} palette="secondary">
              Update User
            </Button>
          </form>
          <Button
            FrameComponent={FrameHexagon}
            palette="secondary"
            onClick={() =>
              setModalState({
                isOpen: true,
                content: <ChangeCredentialsModal />,
              })
            }
          >
            Change Credentials
          </Button>
        </div>
      </Card>
    </AnimatorGeneralProvider>
  );
};

export default EditProfileModal;
