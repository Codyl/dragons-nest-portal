import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { EllipsisVertical } from 'lucide-react';

const ActionPopover = ({
  actions,
}: {
  actions: { label: string; onClick: () => void }[];
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="link"
          size="icon"
        >
          <EllipsisVertical className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {actions.map((action) => (
          <Button
            className="w-full"
            variant="ghost"
            key={action.label}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default ActionPopover;
