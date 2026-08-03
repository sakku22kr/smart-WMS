import { useState } from 'react';
import {
  MdSettings, MdDarkMode, MdLightMode, MdNotifications,
  MdSecurity, MdLanguage, MdPalette, MdSave,
} from 'react-icons/md';
import PageWrapper from '@components/layout/PageWrapper';
import Card        from '@components/ui/Card';
import Button      from '@components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import useToast    from '@hooks/useToast';

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="text-sm font-medium text-surface-800 dark:text-surface-100">{label}</p>
      {description && <p className="text-xs text-surface-400 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${checked ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const [notifs, setNotifs]     = useState({ email: true, push: true, sms: false, weekly: true });
  const [sec, setSec]           = useState({ twoFactor: false, sessionLog: true });
  const [lang, setLang]         = useState('en-IN');

  const save = () => toast.success('Settings saved successfully!');

  return (
    <PageWrapper>
      <div className="page-container max-w-3xl">
        <div className="page-header">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Configure your application preferences</p>
          </div>
        </div>

        {/* Appearance */}
        <Card title="Appearance" subtitle="Theme and display settings" headerAction={<MdPalette size={20} className="text-primary-500" />}>
          <div className="space-y-1 divide-y divide-surface-200 dark:divide-surface-700">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-surface-800 dark:text-surface-100">Dark Mode</p>
                <p className="text-xs text-surface-400 mt-0.5">Switch between light and dark theme</p>
              </div>
              <div className="flex items-center gap-2">
                <MdLightMode size={18} className={`transition-opacity ${isDark ? 'opacity-30' : 'opacity-100 text-warning-500'}`} />
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors ${isDark ? 'bg-primary-500' : 'bg-surface-200'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <MdDarkMode size={18} className={`transition-opacity ${isDark ? 'opacity-100 text-primary-400' : 'opacity-30'}`} />
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card title="Notifications" subtitle="Manage notification preferences" headerAction={<MdNotifications size={20} className="text-primary-500" />}>
          <div className="divide-y divide-surface-200 dark:divide-surface-700">
            <Toggle checked={notifs.email}  onChange={(v) => setNotifs({...notifs, email: v})}  label="Email Notifications"         description="Receive order and stock alerts via email" />
            <Toggle checked={notifs.push}   onChange={(v) => setNotifs({...notifs, push: v})}   label="Push Notifications"          description="Browser push notifications for critical alerts" />
            <Toggle checked={notifs.sms}    onChange={(v) => setNotifs({...notifs, sms: v})}    label="SMS Alerts"                  description="Text messages for urgent stock issues" />
            <Toggle checked={notifs.weekly} onChange={(v) => setNotifs({...notifs, weekly: v})} label="Weekly Digest"               description="Summary email every Monday morning" />
          </div>
        </Card>

        {/* Security */}
        <Card title="Security" subtitle="Account security settings" headerAction={<MdSecurity size={20} className="text-primary-500" />}>
          <div className="divide-y divide-surface-200 dark:divide-surface-700">
            <Toggle checked={sec.twoFactor}  onChange={(v) => setSec({...sec, twoFactor: v})}  label="Two-Factor Authentication" description="Add an extra layer of security to your account" />
            <Toggle checked={sec.sessionLog} onChange={(v) => setSec({...sec, sessionLog: v})} label="Session Activity Log"       description="Keep a log of all login sessions" />
          </div>
        </Card>

        {/* Language */}
        <Card title="Language & Region" subtitle="Localization preferences" headerAction={<MdLanguage size={20} className="text-primary-500" />}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-surface-700 dark:text-surface-300 block mb-2">Language</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="input-base w-full sm:w-64"
              >
                <option value="en-IN">English (India)</option>
                <option value="en-US">English (US)</option>
                <option value="hi-IN">Hindi</option>
                <option value="mr-IN">Marathi</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button variant="primary" size="lg" leftIcon={<MdSave />} onClick={save}>
            Save All Settings
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Settings;
