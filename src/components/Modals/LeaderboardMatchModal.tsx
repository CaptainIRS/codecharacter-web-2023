import { AnimatorGeneralProvider } from '@arwes/animation';
import { Button, Card, Text } from '@arwes/core';
import { useModal } from '../../providers/ModalProvider';

const LeaderboardMatchModal = ({ username }: { username: string }) => {
  const { modalState, setModalState } = useModal();
  return (
    <AnimatorGeneralProvider
      animator={{ duration: { enter: 200, exit: 200, stagger: 30 } }}
    >
      <Card
        animator={{ activate: modalState.isOpen }}
        title="Initiate Match"
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
            <Button palette="success">Confirm</Button>
          </div>
        }
      >
        <Text>Initiate match with {username}?</Text>
      </Card>
    </AnimatorGeneralProvider>
  );
};

export default LeaderboardMatchModal;
