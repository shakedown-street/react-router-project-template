import { redirect } from 'react-router';
import { getSessionService } from '~/lib/auth/factory';
import type { Route } from './+types/logout';

export async function loader({}: Route.LoaderArgs) {
  return redirect('/');
}

export async function action({ request }: Route.ActionArgs) {
  const sessionService = getSessionService();

  return await sessionService.destroy(request, '/auth/login');
}
