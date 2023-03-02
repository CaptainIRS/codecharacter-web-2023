import { rgba } from 'polished';
import { theme } from '../../theme';
import ReactModal from 'react-modal';
import { useModal } from '../../providers/ModalProvider';

const Modal = () => {
  const { modalState, setModalState } = useModal();
  return (
    <ReactModal
      isOpen={modalState.isOpen}
      closeTimeoutMS={500}
      style={{
        overlay: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: rgba(theme.color.background, 0.95),
          zIndex: 2,
        },
        content: {
          border: 'none',
          background: '#00000000',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          borderRadius: '4px',
          outline: 'none',
          padding: '20px',
          zIndex: 3,
          inset: 'auto',
        },
      }}
      ariaHideApp={false}
      onRequestClose={() => {
        const onClose = modalState.onClose;
        setModalState({
          isOpen: false,
          content: <></>,
        });
        if (onClose) onClose();
      }}
    >
      {modalState.content}
    </ReactModal>
  );
};

export default Modal;
