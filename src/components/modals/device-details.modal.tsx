import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { Dialog, DialogContent } from '../ui/dialog';
import { formatDate } from '@/utils/helpers/formatting.helpers';
import type { KnownDevice } from '@/api/services/profile.services';

const DeviceDetailsModal = ({
  show,
  setShow,
  deviceDetails,
}: {
  show: boolean;
  setShow: (show: boolean) => void;
  deviceDetails: KnownDevice;
}) => {
  return (
    <Dialog
      open={show}
      onOpenChange={setShow}
    >
      <DialogContent>
        <DialogTitle>
          {deviceDetails.DeviceName.split(' ')[0]}
          {deviceDetails.isCurrentDevice ? ' (Current)' : ''}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {deviceDetails.DeviceName.split(' ')[1] &&
            deviceDetails.DeviceName.split(' ')[1]}
        </DialogDescription>
        <div className="grid">
          <div>
            <div className="font-bold">Device Name</div>
            <div className="text-muted-foreground">
              {deviceDetails.DeviceName}
            </div>
          </div>
          <div>
            <div className="font-bold">Last IP Used</div>
            <div className="text-muted-foreground">
              {deviceDetails.DeviceLastIPUsed}
            </div>
          </div>
          <div>
            <div className="font-bold">Last Used on</div>
            <div className="text-muted-foreground">
              {formatDate(deviceDetails.DeviceLastAuthenticatedDate)}
            </div>
          </div>
          <div>
            <div className="font-bold">First Added on</div>
            <div className="text-muted-foreground">
              {formatDate(deviceDetails.DeviceCreateDate)}
            </div>
          </div>
          <div>
            <div className="font-bold">Location</div>
            <div className="text-muted-foreground">
              Near {deviceDetails?.City} {deviceDetails?.Region},{' '}
              {deviceDetails?.Country}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceDetailsModal;
