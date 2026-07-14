import { createContext, ReactNode, useContext, useEffect } from 'react';
import { useSettings } from '@/providers/settings-provider';

type SidebarTheme = 'dark' | 'light';

interface LayoutState {
  sidebarCollapse: boolean;
  setSidebarCollapse: (open: boolean) => void;
  sidebarTheme: SidebarTheme;
  setSidebarTheme: (theme: SidebarTheme) => void;
}

const LayoutContext = createContext<LayoutState | undefined>(undefined);

interface LayoutProviderProps {
  children: ReactNode;
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  const { settings, storeOption } = useSettings();
  const sidebarCollapse = settings.layouts.appLayout.sidebarCollapse;
  const sidebarTheme = settings.layouts.appLayout.sidebarTheme || 'light';

  const setSidebarCollapse = (open: boolean) => {
    storeOption('layouts.appLayout.sidebarCollapse', open);
  };

  const setSidebarTheme = (theme: SidebarTheme) => {
    storeOption('layouts.appLayout.sidebarTheme', theme);
  };

  // Sync body class for sidebar-collapse
  useEffect(() => {
    const bodyClass = document.body.classList;
    if (sidebarCollapse) {
      bodyClass.add('sidebar-collapse');
    } else {
      bodyClass.remove('sidebar-collapse');
    }
  }, [sidebarCollapse]);

  return (
    <LayoutContext.Provider
      value={{
        sidebarCollapse,
        setSidebarCollapse,
        sidebarTheme,
        setSidebarTheme,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
