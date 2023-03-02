import { AnimatorGeneralProvider } from '@arwes/animation';
import { Button, Card, FrameHexagon, Text } from '@arwes/core';
import { UserApi } from '@codecharacter-2023/client';
import { createRef, useCallback, useEffect, useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-simple-toasts';
import { ApiError, authConfig } from '../../api/ApiConfig';
import { useModal } from '../../providers/ModalProvider';
import AvatarSelect from '../Avatar/AvatarSelect';
import Input from '../Input/Input';
import Select from '../Select/Select';

const RegisterModal = () => {
  const { modalState } = useModal();

  const usernameRef = createRef<HTMLInputElement>();
  const nameRef = createRef<HTMLInputElement>();
  const emailRef = createRef<HTMLInputElement>();
  const passwordRef = createRef<HTMLInputElement>();
  const passwordConfirmRef = createRef<HTMLInputElement>();
  const countryRef = createRef<HTMLSelectElement>();
  const collegeRef = createRef<HTMLInputElement>();
  const [avatarId, setAvatarId] = useState(0);

  const userApi = new UserApi(authConfig);

  const navigate = useNavigate();

  const { executeRecaptcha } = useGoogleReCaptcha();
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const handleReCaptchaVerify = useCallback(async () => {
    if (!executeRecaptcha) {
      return;
    }

    const token = await executeRecaptcha('yourAction');
    setRecaptchaToken(token);
  }, [executeRecaptcha]);

  useEffect(() => {
    handleReCaptchaVerify();
  }, [handleReCaptchaVerify]);

  return (
    <AnimatorGeneralProvider
      animator={{ duration: { enter: 200, exit: 200, stagger: 30 } }}
    >
      <Card
        animator={{ activate: modalState.isOpen }}
        title="Register"
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
                  <Text>Registering User...</Text>
                </Button>,
              );
              userApi
                .register({
                  username: usernameRef.current?.value || '',
                  name: nameRef.current?.value || '',
                  email: emailRef.current?.value || '',
                  password: passwordRef.current?.value || '',
                  passwordConfirmation: passwordConfirmRef.current?.value || '',
                  country: countryRef.current?.value || '',
                  college: collegeRef.current?.value || '',
                  avatarId: avatarId,
                  recaptchaCode: recaptchaToken || '',
                })
                .then(() => {
                  toast(
                    <Button FrameComponent={FrameHexagon} palette="success">
                      <Text>Registered Successfully, Please Login!</Text>
                    </Button>,
                  );
                  navigate('/login');
                })
                .catch(message => {
                  toast(
                    <Button FrameComponent={FrameHexagon} palette="error">
                      <Text>
                        Failed to register: {(message as ApiError).message}
                      </Text>
                    </Button>,
                  );
                });
            }}
          >
            <Input type="text" labelText="Username" inputRef={usernameRef} />
            <Input type="text" labelText="Name" inputRef={nameRef} />
            <Input type="email" labelText="Email" inputRef={emailRef} />
            <Input
              type="password"
              labelText="Password"
              inputRef={passwordRef}
            />
            <Input
              type="password"
              labelText="Confirm Password"
              inputRef={passwordConfirmRef}
            />
            <Select value="India" labelText="Country" selectRef={countryRef}>
              <option value="India">India</option>
              <option value="Other">Other</option>
            </Select>
            <Input type="text" labelText="College" inputRef={collegeRef} />
            <AvatarSelect defaultAvatar={0} onSelect={setAvatarId} />
            <Button FrameComponent={FrameHexagon} palette="secondary">
              Register
            </Button>
          </form>
          <div
            css={{
              margin: '0.5em',
              textAlign: 'center',
            }}
          >
            <i>Or Login with</i>
          </div>
          <div
            css={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '2em',
            }}
          >
            <Button
              FrameComponent={FrameHexagon}
              css={{
                flex: 1,
                '& div ~ div': {
                  display: 'flex',
                  justifyContent: 'center',
                },
              }}
              palette="secondary"
            >
              <FaGoogle />
              &nbsp;&nbsp;Google
            </Button>
            <Button
              FrameComponent={FrameHexagon}
              css={{
                flex: 1,
                '& div ~ div': {
                  display: 'flex',
                  justifyContent: 'center',
                },
              }}
              palette="secondary"
            >
              <FaGithub />
              &nbsp;&nbsp;Github
            </Button>
          </div>
        </div>
      </Card>
    </AnimatorGeneralProvider>
  );
};

export default RegisterModal;
