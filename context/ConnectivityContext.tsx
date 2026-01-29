import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Network from 'expo-network';

interface Connectivity {
  isOffline: boolean;
}

const ConnectivityContext = createContext<Connectivity>({ isOffline: false });

export const ConnectivityProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const check = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsOffline(!(state.isConnected && state.isInternetReachable));
    };
    check();
    const id = setInterval(check, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <ConnectivityContext.Provider value={{ isOffline }}>
      {children}
    </ConnectivityContext.Provider>
  );
};

export const useConnectivity = () => useContext(ConnectivityContext);
