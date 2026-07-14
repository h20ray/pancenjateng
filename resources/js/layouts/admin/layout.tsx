import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet, useLocation } from 'react-router-dom';
import { MENU_SIDEBAR } from '@/config/layout-1.config';
import { useMenu } from '@/hooks/use-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/providers/settings-provider';
import { LayoutProvider } from './components/context';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { Sidebar } from './components/sidebar';

export function AdminLayout() {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const { getCurrentItem } = useMenu(pathname);
  const item = getCurrentItem(MENU_SIDEBAR);
  const { settings, setOption } = useSettings();

  useEffect(() => {
    setOption('layout', 'app-layout');
  }, [setOption]);

  useEffect(() => {
    const bodyClass = document.body.classList;

    bodyClass.add('app-layout');
    bodyClass.add('sidebar-fixed');
    bodyClass.add('header-fixed');

    const timer = setTimeout(() => {
      bodyClass.add('layout-initialized');
    }, 1000);

    return () => {
      bodyClass.remove('app-layout');
      bodyClass.remove('sidebar-fixed');
      bodyClass.remove('sidebar-collapse');
      bodyClass.remove('header-fixed');
      bodyClass.remove('layout-initialized');
      clearTimeout(timer);
    };
  }, []);

  return (
    <LayoutProvider>
      <Helmet>
        <title>{item?.title ? `${item.title} — Pancen Jateng` : 'Pancen Jateng'}</title>
      </Helmet>

      {!isMobile && <Sidebar />}

      <div className="wrapper flex grow flex-col">
        <Header />

        <main className="grow pt-5" role="content">
          <Outlet />
        </main>

        <Footer />
      </div>
    </LayoutProvider>
  );
}
