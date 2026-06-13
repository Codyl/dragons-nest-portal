import { gradeLabel } from '@/lib/grade-label';
import { formatTeacherAvailabilitySummary } from '@/lib/format-teacher-availability';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import type { User } from '@/api/services/user.services';
import { Button } from '../ui/button';
import { Mail } from 'lucide-react';
import ProfilePhoto from '@/components/images/profile-photo';

const TeacherCard = ({ user }: { user: User }) => {
  const availabilityLines = formatTeacherAvailabilitySummary(user.availability);

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center gap-4">
            <ProfilePhoto
              src={user.avatar || ''}
              givenName={user.givenName || ''}
              familyName={user.familyName || ''}
              email={user.email || ''}
            />
            <div>
              <CardTitle className="text-lg font-bold">
                {user.givenName} {user.familyName}
              </CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <a href={`mailto:${user.email}`}>{user.email}</a>
                </div>
              </div>
            </div>
          </div>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            No description available
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              Availability
            </h3>
            {availabilityLines.length > 0 ? (
              <ul
                className="mt-1 list-inside list-disc text-sm"
                data-testid="teacher-availability"
              >
                {availabilityLines.map((line, index) => (
                  <li key={`${line}-${index}`}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Availability not set
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium">Subjects</h3>
            <ul>
              {user.teachableCourses?.map((course) => (
                <li key={course._id}>
                  <div>{course.className}</div>
                  <div className="text-sm text-muted-foreground">
                    {course?.grades
                      ?.map((grade) => gradeLabel(Number(grade)))
                      .join(', ')}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full">
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Facebook</title>
              <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
            </svg>
            Message on Facebook
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TeacherCard;
