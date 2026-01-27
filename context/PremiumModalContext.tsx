import React, {createContext, useContext, useState, ReactNode} from 'react';
import PremiumUnlockModal from '../components/PremiumUnlockModal';

interface Ctx {
  showPremiumModal: () => void;
}

const PremiumModalContext = createContext<Ctx>({ showPremiumModal: () => {} });

export const usePremiumModal = () => useContext(PremiumModalContext);

export const PremiumModalProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  return (
    <PremiumModalContext.Provider value={{ showPremiumModal: show }}>
      {children}
      <PremiumUnlockModal visible={visible} onClose={hide} />
    </PremiumModalContext.Provider>
  );
};
