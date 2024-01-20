import { AnimatorGeneralProvider } from '@arwes/animation';
import { Button, Card, FrameHexagon, LoadingBars, Text } from '@arwes/core';
import { Notification, NotificationApi } from '@codecharacter-2022/client';
import { useEffect, useState } from 'react';
import { apiConfig } from '../../api/ApiConfig';
import { useModal } from '../../providers/ModalProvider';

const NotificationsModal = () => {
  const { modalState, setModalState } = useModal();
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notificationApi = new NotificationApi(apiConfig);

  useEffect(() => {
    setIsLoading(true);
    notificationApi.getAllNotifications().then(notifications => {
      setIsLoading(false);
      setNotifications(notifications);
    });
  }, []);

  return (
    <AnimatorGeneralProvider
      animator={{ duration: { enter: 200, exit: 200, stagger: 30 } }}
    >
      <Card
        animator={{ activate: modalState.isOpen }}
        title="Notifications"
        css={{ width: 'min(80vw, 400px)', minWidth: 0, maxHeight: '80vh' }}
        options={
          <div>
            <Button
              palette="error"
              onClick={() => setModalState({ isOpen: false })}
              css={{ marginRight: '1rem' }}
            >
              <Text>Close</Text>
            </Button>
          </div>
        }
      >
        <div
          css={{
            height: '60vh',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1rem',
            overflowY: 'auto',
          }}
        >
          {isLoading && <LoadingBars full />}
          {notifications.map(notification => (
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            <FrameHexagon
              key={notification.id}
              animator={{ animate: false }}
              css={{
                '& div': {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8em',
                },
              }}
            >
              <div css={{ fontSize: '1.2rem', fontWeight: 'bolder' }}>
                {notification.title}
              </div>
              <div css={{ fontSize: '1rem', fontWeight: 'lighter' }}>
                {notification.content}
              </div>
              <div css={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                {new Date(notification.createdAt).toLocaleString()}
              </div>
            </FrameHexagon>
          ))}
        </div>
      </Card>
    </AnimatorGeneralProvider>
  );
};

export default NotificationsModal;
