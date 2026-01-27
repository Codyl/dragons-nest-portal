import { DialogTitle } from "@radix-ui/react-dialog";
import { Dialog, DialogContent } from "../ui/dialog";
import { formatDate } from "@/utils/helpers/formatting.helpers";

const DeviceDetailsModal = ({ show, setShow, deviceDetails }: { show: boolean, setShow: (show: boolean) => void, deviceDetails: { DeviceKey: string, DeviceName: string, DeviceLastIPUsed: string, DeviceLastAuthenticatedDate: string, DeviceLastModifiedDate: string, DeviceCreateDate: string, City: string, Region: string, Country: string } }) => {

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent>
        <DialogTitle>{deviceDetails.DeviceName}</DialogTitle>
        <div className="grid">
          <div className="col-span-1">
            <div className="font-bold">Last IP Used</div>
            <div className="text-muted-foreground">{deviceDetails.DeviceLastIPUsed}</div>
          </div>
          <div className="col-span-1">
            <div className="font-bold">Last Used on</div>
            <div className="text-muted-foreground">{formatDate(deviceDetails.DeviceLastAuthenticatedDate)}</div>
          </div>
          <div className="col-span-1">
            <div className="font-bold">First Added on</div>
            <div className="text-muted-foreground">{formatDate(deviceDetails.DeviceCreateDate)}</div>
          </div>
          <div className="col-span-1">
            <div className="font-bold">Location</div>
            <div className="text-muted-foreground">{deviceDetails?.City} {deviceDetails?.Region}, {deviceDetails?.Country}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeviceDetailsModal;