import { AnimatorGeneralProvider } from '@arwes/animation';
import { Button, Card, FrameHexagon, Text } from '@arwes/core';
import { MapApi } from '@codecharacter-2022/client';
import { createRef } from 'react';
import toast from 'react-simple-toasts';
import { apiConfig } from '../../api/ApiConfig';
import { useModal } from '../../providers/ModalProvider';
import Input from '../Input/Input';

const CommitMapModal = ({ map }: { map: Array<Array<number>> }) => {
  const { modalState, setModalState } = useModal();

  const commitMessageRef = createRef<HTMLInputElement>();

  const mapApi = new MapApi(apiConfig);

  return (
    <AnimatorGeneralProvider
      animator={{ duration: { enter: 200, exit: 200, stagger: 30 } }}
    >
      <Card
        animator={{ activate: modalState.isOpen }}
        title="Commit Map"
        css={{ width: 'min(80vw, 400px)', minWidth: 0, maxHeight: '80vh' }}
        options={
          <div>
            <Button
              palette="error"
              onClick={() => setModalState({ isOpen: false })}
              css={{ marginRight: '1rem' }}
            >
              <Text>Cancel</Text>
            </Button>
            <Button
              palette="success"
              onClick={() => {
                toast(
                  <Button FrameComponent={FrameHexagon} palette="primary">
                    <Text>Committing Map...</Text>
                  </Button>,
                );
                mapApi
                  .createMapRevision({
                    map: JSON.stringify(map),
                    message: commitMessageRef.current?.value || '',
                    mapImage: '',
                  })
                  .then(() => {
                    toast(
                      <Button FrameComponent={FrameHexagon} palette="success">
                        <Text>Committed Successfully!</Text>
                      </Button>,
                    );
                  })
                  .catch(() => {
                    toast(
                      <Button FrameComponent={FrameHexagon} palette="error">
                        <Text>Failed to commit!</Text>
                      </Button>,
                    );
                  });
                setModalState({ isOpen: false });
              }}
            >
              <Text>Commit</Text>
            </Button>
          </div>
        }
      >
        <div
          css={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Text>Please enter the commit message:</Text>
          <Input type="text" inputRef={commitMessageRef} />
        </div>
      </Card>
    </AnimatorGeneralProvider>
  );
};

export default CommitMapModal;
