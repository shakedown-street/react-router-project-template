import { redirect } from 'react-router';
import { AuthServiceFactory } from '~/lib/auth/factory';
import { prisma } from '~/lib/prisma';
import type { Route } from './+types/logout';

export async function loader({}: Route.LoaderArgs) {
  return redirect('/');
}

export async function action({ request }: Route.ActionArgs) {
  const { sessionService } = AuthServiceFactory.create(prisma);

  return await sessionService.destroy(request, '/auth/login');
}
