import { Button } from '~/components/ui/button';
import type { Route } from './+types/home';
import { requireSessionUser } from '~/lib/session.server';
import { useSubmit } from 'react-router';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'React Router Project Template' }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireSessionUser(request);

  return { user };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  const logoutSubmit = useSubmit();

  function submitLogout() {
    logoutSubmit(null, { method: 'post', action: '/auth/logout' });
  }

  return (
    <>
      <h1 className="text-2xl font-bold">Home</h1>
      <p className="text-lg">Welcome, {user.email}!</p>
      <Button onClick={submitLogout}>Logout</Button>
    </>
  );
}
