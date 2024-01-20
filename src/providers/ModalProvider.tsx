import { createContext, useContext, useState } from 'react';

interface ModalStateType {
  isOpen: boolean;
  content?: JSX.Element;
  onClose?: () => void;
}

const ModalContext = createContext<{
  modalState: ModalStateType;
  setModalState: React.Dispatch<React.SetStateAction<ModalStateType>>;
}>({
  modalState: { isOpen: false },
  setModalState: () => undefined,
});

export const ModalProvider = ({ children }: { children: JSX.Element[] }) => {
  const [modalState, setModalState] = useState<ModalStateType>({
    isOpen: false,
  });

  return (
    <ModalContext.Provider value={{ modalState, setModalState }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  return useContext(ModalContext);
};
