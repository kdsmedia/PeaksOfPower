import React, { createContext, useState, useCallback, ReactNode } from 'react';

export interface WithdrawalRecord {
  id: string;
  method: 'DANA' | 'OVO';
  accountNumber: string;
  koin: number;
  rupiah: number;
  status: 'pending' | 'processed';
  createdAt: string;
}

interface WalletContextType {
  koin: number;
  adRewardCount: number;
  withdrawalHistory: WithdrawalRecord[];
  addKoin: (amount: number) => void;
  watchAd: () => void;
  withdraw: (method: 'DANA' | 'OVO', accountNumber: string, koinAmount: number) => { success: boolean; message: string };
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [koin, setKoin] = useState(0);
  const [adRewardCount, setAdRewardCount] = useState(0);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRecord[]>([]);

  const addKoin = useCallback((amount: number) => {
    setKoin(prev => prev + amount);
  }, []);

  const watchAd = useCallback(() => {
    setKoin(prev => prev + 1000);
    setAdRewardCount(prev => prev + 1);
  }, []);

  const withdraw = useCallback(
    (method: 'DANA' | 'OVO', accountNumber: string, koinAmount: number): { success: boolean; message: string } => {
      if (adRewardCount < 300) {
        const remaining = 300 - adRewardCount;
        return {
          success: false,
          message: `Kamu butuh ${remaining}x iklan lagi.\nSyarat penarikan: 300x Iklan.`,
        };
      }
      if (koinAmount < 10000) {
        return { success: false, message: 'Minimum penarikan adalah 10.000 Koin.' };
      }
      if (koin < koinAmount) {
        return { success: false, message: 'Saldo Koin tidak mencukupi.' };
      }
      const rupiah = Math.floor((koinAmount / 10000) * 100);
      const record: WithdrawalRecord = {
        id: `WD_${Date.now()}`,
        method,
        accountNumber,
        koin: koinAmount,
        rupiah,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setKoin(prev => prev - koinAmount);
      setWithdrawalHistory(prev => [record, ...prev]);
      return { success: true, message: `Penarikan Rp${rupiah} ke ${method} berhasil diajukan! 🎉` };
    },
    [koin, adRewardCount]
  );

  return (
    <WalletContext.Provider value={{ koin, adRewardCount, withdrawalHistory, addKoin, watchAd, withdraw }}>
      {children}
    </WalletContext.Provider>
  );
}
