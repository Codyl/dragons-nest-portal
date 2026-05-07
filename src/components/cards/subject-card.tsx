import type { Subject } from '@/api/services/subjects.services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';
import { Cog } from 'lucide-react';
import AddTeacherSheet from '../sheets/add-teacher-sheet';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import { useStudent } from '@/contexts/student-context';

type SubjectCardProps = {
  subject: Subject;
};

const SubjectCard = ({ subject }: SubjectCardProps) => {
  const { data: profileData } = useLoggedInUser();
  const { activeStudent } = useStudent();
  return (
    <Card
      data-testid="subject-card"
      style={{ borderLeft: `4px solid ${subject.color}` }}
    >
      <CardHeader className="pb-2">

        <CardTitle className="text-lg"><span className='size-24' aria-label={`${subject.name} icon`} data-testid="subject-icon">
          {subject.icon}
        </span>{' '}
          {subject.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => {
              console.log('Configure by setting curriculum');
            }}
          >
            <Cog className="size-4" />
          </Button>
          <AddTeacherSheet subject={subject.name} state={profileData?.data?.address?.state || ''} grade={activeStudent?.currentGrade + ''} subjectId={subject._id} studentName={activeStudent?.displayName || ''} />
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectCard;
