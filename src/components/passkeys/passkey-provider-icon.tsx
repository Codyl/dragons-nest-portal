import { cn } from '@/lib/utils';
import {
  Cloud,
  CloudUpload,
  KeyRound,
  Monitor,
  Smartphone,
  Usb,
} from 'lucide-react';

/** Visual hint from server `provider` (see `resolvePasskeyDisplay` in nest-app profile). */
export function PasskeyProviderIcon({
  provider,
  className,
}: {
  provider: string;
  className?: string;
}) {
  const iconClass = cn('size-6', className);
  switch (provider) {
    case 'apple_icloud':
      return (
        <Smartphone
          className={iconClass}
          aria-hidden
        />
      );
    case 'google_password_manager':
      return (
        <Cloud
          className={iconClass}
          aria-hidden
        />
      );
    case 'windows_hello':
      return (
        <Monitor
          className={iconClass}
          aria-hidden
        />
      );
    case 'synced_passkey':
      return (
        <CloudUpload
          className={iconClass}
          aria-hidden
        />
      );
    case 'this_device':
      return (
        <Smartphone
          className={iconClass}
          aria-hidden
        />
      );
    case 'security_key':
      return (
        <Usb
          className={iconClass}
          aria-hidden
        />
      );
    default:
      return (
        <KeyRound
          className={iconClass}
          aria-hidden
        />
      );
  }
}
