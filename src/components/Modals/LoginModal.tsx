import { AnimatorGeneralProvider } from '@arwes/animation';
import { Button, Card, FrameHexagon, Text } from '@arwes/core';
import { AuthApi } from '@codecharacter-2022/client';
import { createRef, useEffect } from 'react';
import { FaGithub, FaGoogle } from 'react-icons/fa';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-simple-toasts';
import { ApiError, authConfig } from '../../api/ApiConfig';
import { useModal } from '../../providers/ModalProvider';
import Input from '../Input/Input';

const LoginModal = () => {
  const { modalState, setModalState } = useModal();

  const emailRef = createRef<HTMLInputElement>();
  const passwordRef = createRef<HTMLInputElement>();

  const authApi = new AuthApi(authConfig);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('error')) {
      toast(
        <Button FrameComponent={FrameHexagon} palette="error">
          <Text>Failed to log in: {searchParams.get('error')}</Text>
        </Button>,
      );
    }
  }, []);

  return (
    <AnimatorGeneralProvider
      animator={{ duration: { enter: 200, exit: 200, stagger: 30 } }}
    >
      <Card
        animator={{ activate: modalState.isOpen }}
        title="Login"
        css={{ width: 'min(80vw, 400px)', minWidth: 0, maxHeight: '80vh' }}
      >
        <div
          css={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
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
                  <Text>Signing In...</Text>
                </Button>,
              );
              authApi
                .passwordLogin({
                  email: emailRef.current?.value || '',
                  password: passwordRef.current?.value || '',
                })
                .then(response => {
                  localStorage.setItem('token', response.token);
                  window.dispatchEvent(new Event('storage'));
                  toast(
                    <Button FrameComponent={FrameHexagon} palette="success">
                      <Text>Logged In Successfully!</Text>
                    </Button>,
                  );
                  setModalState({ isOpen: false });
                })
                .catch(message => {
                  toast(
                    <Button FrameComponent={FrameHexagon} palette="error">
                      <Text>
                        Failed to log in: {(message as ApiError).message}
                      </Text>
                    </Button>,
                  );
                });
            }}
          >
            <Input type="email" labelText="Email" inputRef={emailRef} />
            <Input
              type="password"
              labelText="Password"
              inputRef={passwordRef}
            />
            <Link
              to="/forgot-password"
              css={{ textAlign: 'center', cursor: 'pointer', zIndex: 100 }}
            >
              Forgot your password?
            </Link>
            <Button FrameComponent={FrameHexagon} palette="secondary">
              Login
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
          <Link
            to="/register"
            css={{ textAlign: 'center', cursor: 'pointer', zIndex: 100 }}
          >
            New to CodeCharacter? Register here!
          </Link>
        </div>
      </Card>
    </AnimatorGeneralProvider>
  );
};

export default LoginModal;
