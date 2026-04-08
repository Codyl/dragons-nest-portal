import { cn } from '@/lib/utils';
import useKnownDevices from '@/hooks/use-known-devices';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import { formatDate } from '@/utils/helpers/formatting.helpers';
import ActionPopover from '../popovers/action-popover';
import { useState } from 'react';
import DeviceDetailsModal from '../modals/device-details.modal';
import type { KnownDevice } from '@/api/services/user.services';
import { forgetDevice } from 'aws-amplify/auth';
import { useQueryClient } from '@tanstack/react-query';

const UserDevice = ({
  device,
  className,
}: {
  device: KnownDevice;
  onClick: () => void;
  buttonText: string;
  className?: string;
}) => {
  const [showDeviceDetailsModal, setShowDeviceDetailsModal] = useState(false);
  const queryClient = useQueryClient();
  return (
    <>
      <DeviceDetailsModal
        show={showDeviceDetailsModal}
        setShow={setShowDeviceDetailsModal}
        deviceDetails={device}
      />
      <div
        className={cn(
          'flex flex-col w-full gap-2 tablet:flex-row justify-between items-center',
          className,
        )}
      >
        <div className="font-bold">
          {device.DeviceName.split(' ')[0] || 'Unknown Device'}
          {device.isCurrentDevice ? ' (Current)' : ''}
        </div>
        <div className="text-muted-foreground">
          {device.DeviceLastIPUsed || 'Unknown IP'}
        </div>
        <div className="text-muted-foreground">
          {formatDate(device.DeviceLastAuthenticatedDate) || 'Unknown Date'}
        </div>
        <ActionPopover
          actions={[
            {
              label: 'Forget Device',
              onClick: () => {
                forgetDevice({ device: { id: device.DeviceKey } });
                queryClient.invalidateQueries({ queryKey: ['known-devices'] });
              },
            },
            {
              label: 'See more details',
              onClick: () => {
                setShowDeviceDetailsModal(true);
              },
            },
          ]}
        />
      </div>
    </>
  );
};

const UserDeviceSettingsSection = ({ className }: { className?: string }) => {
  const { data: userData } = useLoggedInUser();
  const { data } = useKnownDevices();

  if (userData?.data?.hasPassword === false) {
    return null;
  }

  return (
    <div className={className}>
      <h1 className="text-2xl font-bold">User Device Settings</h1>
      <div className="text-muted-foreground mt-2">
        Manage your devices and connected services.
      </div>
      <div className="flex flex-col mt-2 divide-y">
        {(data?.data.length === 0 || !data) && (
          <div className="text-muted-foreground">No devices found</div>
        )}
        {data?.data.map((device) => (
          <UserDevice
            key={device.DeviceKey}
            device={device}
            onClick={() => {}}
            buttonText="Forget Device"
          />
        ))}
      </div>
    </div>
  );
};

export default UserDeviceSettingsSection;
