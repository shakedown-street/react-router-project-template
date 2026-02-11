import { redirect } from 'react-router';
import type { Route } from './+types/logout';
import { destroySession } from '~/lib/session.server';

export async function loader({}: Route.LoaderArgs) {
  return redirect('/');
}

export async function action({ request }: Route.ActionArgs) {
  return redirect('/auth/login', {
    headers: {
      'Set-Cookie': await destroySession(request),
    },
  });
}
