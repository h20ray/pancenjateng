import { ReactNode } from 'react';
import { useAuth } from '@/auth/context/auth-context';
import { I18N_LANGUAGES } from '@/i18n/config';
import { Language } from '@/i18n/types';
import {
  Globe,
  Moon,
  Settings,
  UserCircle,
  LogOut,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Link } from 'react-router';
import { toAbsoluteUrl } from '@/lib/helpers';
import { useLanguage } from '@/providers/i18n-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';

export function UserDropdownMenu({ trigger }: { trigger: ReactNode }) {
  const { logout, user } = useAuth();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const displayName =
    user?.fullname ||
    (user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.name || user?.username || 'Admin');

  const displayEmail = user?.email || '';
  const displayAvatar = toAbsoluteUrl('/media/avatars/300-2.png');

  const handleLanguage = (lang: Language) => {
    changeLanguage(lang);
  };

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" side="bottom" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <img
              className="size-9 rounded-full border-2 border-green-500"
              src={displayAvatar}
              alt="User avatar"
            />
            <div className="flex flex-col">
              <span className="text-sm text-mono font-semibold">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground">
                {displayEmail}
              </span>
            </div>
          </div>
          <Badge variant="primary" appearance="light" size="sm">
            Admin
          </Badge>
        </div>

        <DropdownMenuSeparator />

        {/* Profile */}
        <DropdownMenuItem asChild>
          <Link
            to="/admin"
            className="flex items-center gap-2"
          >
            <UserCircle />
            Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            to="/admin/aduan"
            className="flex items-center gap-2"
          >
            <Settings />
            Kelola Aduan
          </Link>
        </DropdownMenuItem>

        {/* Language Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2 [&_[data-slot=dropdown-menu-sub-trigger-indicator]]:hidden hover:[&_[data-slot=badge]]:border-input data-[state=open]:[&_[data-slot=badge]]:border-input">
            <Globe />
            <span className="flex items-center justify-between gap-2 grow relative">
              Bahasa
              <Badge
                variant="outline"
                className="absolute end-0 top-1/2 -translate-y-1/2"
              >
                {currentLanguage.label}
                <img
                  src={currentLanguage.flag}
                  className="w-3.5 h-3.5 rounded-full"
                  alt={currentLanguage.label}
                />
              </Badge>
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuRadioGroup
              value={currentLanguage.code}
              onValueChange={(value) => {
                const selectedLang = I18N_LANGUAGES.find(
                  (lang) => lang.code === value,
                );
                if (selectedLang) handleLanguage(selectedLang);
              }}
            >
              {I18N_LANGUAGES.map((item) => (
                <DropdownMenuRadioItem
                  key={item.code}
                  value={item.code}
                  className="flex items-center gap-2"
                >
                  <img
                    src={item.flag}
                    className="w-4 h-4 rounded-full"
                    alt={item.label}
                  />
                  <span>{item.label}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Dark Mode Toggle */}
        <DropdownMenuItem
          className="flex items-center gap-2"
          onSelect={(event) => event.preventDefault()}
        >
          <Moon />
          <div className="flex items-center gap-2 justify-between grow">
            Dark Mode
            <Switch
              size="sm"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeToggle}
            />
          </div>
        </DropdownMenuItem>

        {/* Logout */}
        <div className="p-2 mt-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={logout}
          >
            <LogOut className="size-4 mr-2" />
            Logout
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
