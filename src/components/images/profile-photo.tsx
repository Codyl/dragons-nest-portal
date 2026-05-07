import { Avatar, AvatarFallback } from "../ui/avatar";

const ProfilePhoto = ({ src, givenName, familyName, email }: { src: string | null, givenName: string | null, familyName: string | null, email: string | null }) => {
  function initials(data: {
    givenName?: string | null;
    familyName?: string | null;
    email?: string | null;
  }): string {
    const g = data.givenName?.trim();
    const f = data.familyName?.trim();
    if (g && f) return `${g[0] ?? ''}${f[0] ?? ''}`.toUpperCase().slice(0, 2);

    if (g) return g.slice(0, 2).toUpperCase();

    const email = data.email;
    if (email?.length) return email.slice(0, 2).toUpperCase();

    return '?';
  }
  const initialsStr = initials({ givenName: givenName, familyName: familyName, email });
  return (
    <Avatar
      className="rounded-full"
      size="lg"
    >
      <AvatarFallback className="rounded-lg text-xs">
        {initialsStr}
      </AvatarFallback>
    </Avatar>
  );
};

export default ProfilePhoto;