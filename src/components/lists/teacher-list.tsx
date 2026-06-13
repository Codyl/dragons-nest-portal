import TeacherCard from '../cards/teacher-card';
import useGetTeachers from '@/hooks/use-get-teachers';

const TeacherList = ({
  state,
  grade,
  subjectId,
}: {
  state: string;
  grade: string;
  subjectId: string;
}) => {
  const getTeachersQuery = useGetTeachers({ state, grade, subjectId });
  if (getTeachersQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (getTeachersQuery.isError) {
    return <div>Error: {getTeachersQuery.error.message}</div>;
  }

  const teachers = getTeachersQuery.data;

  return (
    <div>
      {teachers?.data?.map((user) => (
        <TeacherCard key={user._id} user={user} />
      ))}
      {teachers?.data?.length === 0 && <div>No teachers found</div>}
    </div>
  );
};

export default TeacherList;
