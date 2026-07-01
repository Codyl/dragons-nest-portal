import { createFileRoute } from '@tanstack/react-router';
import { useManagedUser } from '@/contexts/managed-user-context';
import { Card, CardContent } from '@/components/ui/card';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import { US_STATE_OPTIONS } from '@/lib/us-state-options';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/(private)/_private/compliance')({
  head: () => ({
    meta: [{ title: 'Compliance | Cody Lillywhite' }],
  }),
  component: ComplianceRoute,
});

function ComplianceRoute() {
  const { activeManagedUser } = useManagedUser();
  const { data: userRes } = useLoggedInUser()

  return (
    <div className="p-2">
      <h2 className="text-2xl font-bold">Compliance</h2>
      {activeManagedUser && (
        <p className="text-muted-foreground">
          Viewing compliance for {activeManagedUser.displayName}
        </p>
      )}
      <div className='flex gap-4'>
        
      <div className="mt-6 grid gap-4 flex-3">
        <Card>
          <CardContent>
          <h3 className="font-semibold">Hours Tracking</h3>
          <div className="border p-4">
            <div>Weekly Hours</div>
            <div>Weekly Attendance</div>
            <div>Total Days</div>
          </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
          <h3 className="font-semibold">Quarterly Reports</h3>
          <p className="text-muted-foreground text-sm">Click below to download template for this report in your state</p>
          <Button>Download</Button>
        </CardContent>
        </Card>
        <Card>
          <CardContent>
          <h3 className="font-semibold">Notice of Intent</h3>
          <p className="text-muted-foreground text-sm">Click below to download template for this notice of intent in your state</p>
          <Button>Download</Button>
        </CardContent>
        </Card>
        <Card>
          <CardContent>
          <h3 className="font-semibold">Submit an Individualized Home Instruction Plan</h3>
          <p className="text-muted-foreground text-sm">Click below to download template for IHIP in your state</p>
          <Button>Download</Button>
        </CardContent>
        </Card>
        <Card>
          <CardContent>
          <h3 className="font-semibold">Standardized Testing</h3>
          <p className="text-muted-foreground text-sm">Notes of options</p>

        </CardContent>
        </Card>
        <Card>
          <CardContent>
          <h3 className="font-semibold">Subject Requirements</h3>
          <p className="text-muted-foreground text-sm">Notes of requirements with checks</p>
        </CardContent>
        </Card>
      </div>
      <aside className='flex flex-col flex-1 gap-5'>
        <Card>
          <CardContent>
          <h3 className="font-semibold">Compliance Status</h3>
          <p className="text-xl">100%</p>
        </CardContent>
        </Card>
         <Card>
          <CardContent>
          <h3 className="font-semibold">Upcoming Deadlines</h3>
          <div className="border p-4">
            <h3 className="font-semibold">Deadline 1</h3>
            <p className="text-muted-foreground text-sm">Due May 7</p>
          </div>
        </CardContent>
        </Card>
        <Card>
          <CardContent>
          <h3 className="font-semibold">Your State</h3>
          <p className="text-muted-foreground text-sm">{userRes?.data?.address?.state}</p>
          {userRes?.data?.address?.state && (
                          <Button
                            type="button"
                            variant="link"
                            onClick={() =>
                              window.open(
                                `https://hslda.org/legal/${US_STATE_OPTIONS.find(
                                  (s) => s.value === userRes?.data?.address?.state,
                                )
                                  ?.label.toLowerCase()
                                  .replace(' ', '-')}`,
                                '_blank',
                              )
                            }
                          >
                            Learn more about the homeschool laws in{' '}
                            {
                              US_STATE_OPTIONS.find((s) => s.value === userRes?.data?.address?.state)
                                ?.label
                            }
                          </Button>
                        )}
        </CardContent>
        </Card>
      </aside>
      </div>
    </div>
  );
}
