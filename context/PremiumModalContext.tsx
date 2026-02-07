import React, {createContext, useContext, useState, ReactNode} from 'react';
import { useAuth } from './AuthContext';
import PremiumUnlockModal from '../components/PremiumUnlockModal';
import { isFreeUser } from '../utils/membership';

interface Ctx {
  showPremiumModal: () => void;
}

const PremiumModalContext = createContext<Ctx>({ showPremiumModal: () => {} });

export const usePremiumModal = () => useContext(PremiumModalContext);

export const PremiumModalProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const { user, limitation } = useAuth() || {} as any;
  const show = () => {
    if (isFreeUser(user) || isFreeUser(limitation)) {
      setVisible(true);
    }
  };
  const hide = () => setVisible(false);

  return (
    <PremiumModalContext.Provider value={{ showPremiumModal: show }}>
      {children}
      <PremiumUnlockModal visible={visible} onClose={hide} />
    </PremiumModalContext.Provider>
  );
};
