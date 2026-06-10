import type { Subject } from '@/api/services/subjects.services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';
import { Cog } from 'lucide-react';
import AddTeacherSheet from '../sheets/add-teacher-sheet';
import useLoggedInUser from '@/hooks/use-logged-in-user';
import { useStudent } from '@/contexts/student-context';
import { useState } from 'react';
import CurriculumModal from '@/components/modals/curriculum.modal';

type SubjectCardProps = {
  subject: Subject;
};

const SubjectCard = ({ subject }: SubjectCardProps) => {
  const { data: profileData } = useLoggedInUser();
  const { activeStudent } = useStudent();
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  return (
    <>
    <Card
      data-testid="subject-card"
    >
      <CardHeader className="pb-2">

        <CardTitle className="text-lg"><span className='size-24' aria-label={`${subject.name} icon`} data-testid="subject-icon">
          {subject.icon}
        </span>{' '}
          {subject.name}</CardTitle>
          {subject.links && activeStudent && subject.links[activeStudent.currentGrade] && 
          <CardDescription>
            <a href={subject?.links && activeStudent ? subject.links[activeStudent.currentGrade] : ""} target='_blank' rel="noreferrer">
              Common Core
            </a>
          </CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Configure curriculum"
            onClick={() => setCurriculumOpen(true)}
          >
            <Cog className="size-4" />
          </Button>
          <AddTeacherSheet subject={subject.name} state={profileData?.data?.address?.state || ''} grade={activeStudent?.currentGrade + ''} subjectId={subject._id} studentName={activeStudent?.displayName || ''} />
        </div>
      </CardContent>
    </Card>
    <CurriculumModal subject={subject} open={curriculumOpen} onOpenChange={setCurriculumOpen} />
    </>
  );
};

export default SubjectCard;
