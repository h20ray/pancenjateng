import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Toolbar,
  ToolbarActions,
  ToolbarBreadcrumbs,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/layouts/admin/components/toolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchSettings, updateSettings } from '@/services/settingsApi';
import type { AppSettings } from '@/types/settings';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const FIELD_KEYS: (keyof AppSettings)[] = [
  'app_name',
  'app_description',
  'organization_name',
  'organization_address',
  'organization_phone',
  'organization_email',
  'default_whatsapp_target',
];

const TEXTAREA_FIELDS: (keyof AppSettings)[] = [
  'app_description',
  'organization_address',
];

const EMPTY_FORM: AppSettings = {
  app_name: '',
  app_description: '',
  organization_name: '',
  organization_address: '',
  organization_phone: '',
  organization_email: '',
  default_whatsapp_target: '',
};

export function AdminSettingsPage() {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AppSettings>(EMPTY_FORM);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });

  useEffect(() => {
    if (settings) {
      setForm({ ...EMPTY_FORM, ...settings });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success(intl.formatMessage({ id: 'settings.save_success' }));
    },
    onError: () => {
      toast.error(intl.formatMessage({ id: 'settings.save_error' }));
    },
  });

  const handleChange = (key: keyof AppSettings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <>
      <Helmet>
        <title>{intl.formatMessage({ id: 'settings.page_title' })}</title>
      </Helmet>

      <div className="container">
        <Toolbar>
          <ToolbarHeading>
            <ToolbarBreadcrumbs />
            <ToolbarPageTitle />
            <ToolbarDescription>
              <FormattedMessage id="settings.page_description" />
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button
              size="sm"
              type="submit"
              form="settings-form"
              disabled={mutation.isPending || isLoading}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <FormattedMessage id="settings.saving" />
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  <FormattedMessage id="settings.save" />
                </>
              )}
            </Button>
          </ToolbarActions>
        </Toolbar>

        <Card>
          <CardHeader>
            <CardTitle>
              <FormattedMessage id="settings.card_title" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage id="settings.card_description" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {FIELD_KEYS.map((key) => (
                  <div key={key} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <form id="settings-form" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {FIELD_KEYS.map((key) => {
                    const isTextarea = TEXTAREA_FIELDS.includes(key);

                    return (
                      <div
                        key={key}
                        className={
                          isTextarea ? 'md:col-span-2' : undefined
                        }
                      >
                        <Label htmlFor={key}>
                          <FormattedMessage id={`settings.field_${key}`} />
                        </Label>
                        {isTextarea ? (
                          <Textarea
                            id={key}
                            value={form[key] ?? ''}
                            onChange={(e) => handleChange(key, e.target.value)}
                            rows={3}
                            className="mt-2"
                          />
                        ) : (
                          <Input
                            id={key}
                            value={form[key] ?? ''}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="mt-2"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
