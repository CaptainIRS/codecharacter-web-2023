import { AnimatorGeneralProvider } from '@arwes/animation';
import {
  ArwesThemeProvider,
  LoadingBars,
  StylesBaseline,
  Text,
} from '@arwes/core';
import { TourProvider } from '@reactour/tour';
import { Suspense } from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { BrowserRouter } from 'react-router-dom';
import { toastConfig } from 'react-simple-toasts';
import Modal from './components/Modals/Modal';
import Websocket from './components/Websocket/Websocket';
import { SITE_KEY } from './config/config';
import { AuthProvider } from './providers/AuthProvider';
import { ModalProvider } from './providers/ModalProvider';
import Router from './Router';
import { theme } from './theme';

toastConfig({
  position: 'bottom-right',
  className: 'toaster',
  render: message => (
    <ArwesThemeProvider>
      <StylesBaseline />
      {message}
    </ArwesThemeProvider>
  ),
});

const App = () => {
  return (
    <ArwesThemeProvider>
      <StylesBaseline />
      <AnimatorGeneralProvider
        animator={{
          duration: { enter: 500, exit: 500 },
        }}
      >
        <Suspense fallback={<LoadingBars full />}>
          <BrowserRouter>
            <AuthProvider>
              <GoogleReCaptchaProvider reCaptchaKey={SITE_KEY}>
                <ModalProvider>
                  <Websocket />
                  <Modal />
                  <TourProvider
                    steps={[
                      {
                        selector: '.home-button',
                        content: 'Use this button to go back to the home page',
                      },
                      {
                        selector: '.save-code-button',
                        content:
                          'Use this button to save your latest code in the server. This code will be restored when you log in again.',
                      },
                      {
                        selector: '.run-code-button',
                        content:
                          'Use this button to run your code in a self-match. Self-matchs are matches of your code against your own maps. You can use this to test your code and maps. These matches do not affect your rating.',
                      },
                      {
                        selector: '.commit-code-button',
                        content:
                          'Use this button to save a new version of your code. You can revert to previous versions of your code at any time.',
                      },
                      {
                        selector: '.submit-code-button',
                        content:
                          'Use this button to submit your code to the leaderboard. This code will be used to compete against other players. You can submit a new version of your code at any time.',
                      },
                    ]}
                    components={{
                      // eslint-disable-next-line react/prop-types
                      Arrow: ({ inverted, disabled }) =>
                        inverted ? (
                          <FaArrowRight
                            css={{ color: 'cyan', opacity: disabled ? 0.5 : 1 }}
                          />
                        ) : (
                          <FaArrowLeft
                            css={{ color: 'cyan', opacity: disabled ? 0.5 : 1 }}
                          />
                        ),
                      // eslint-disable-next-line react/prop-types
                      Content: ({ content }) => <Text>{content}</Text>,
                    }}
                    styles={{
                      maskWrapper: base => ({
                        ...base,
                        color: 'rgba(0, 0, 0, 0.9)',
                      }),
                      popover: base => ({
                        ...base,
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        border: `1px solid ${theme.color.border}`,
                        maxWidth: 'min(80vw, 350px)',
                        padding: '1rem',
                      }),
                      badge: base => ({
                        ...base,
                        color: 'black',
                      }),
                    }}
                    showCloseButton={false}
                  >
                    <Router />
                  </TourProvider>
                </ModalProvider>
              </GoogleReCaptchaProvider>
            </AuthProvider>
          </BrowserRouter>
        </Suspense>
      </AnimatorGeneralProvider>
    </ArwesThemeProvider>
  );
};

export default App;
