import { redirect } from 'react-router';
import { AuthServiceFactory } from '~/lib/auth/factory';
import { prisma } from '~/lib/prisma';
import type { Route } from './+types/logout';

export async function loader({}: Route.LoaderArgs) {
  return redirect('/');
}

export async function action({ request }: Route.ActionArgs) {
  const { sessionManager } = AuthServiceFactory.create(prisma);

  return await sessionManager.destroy(request, '/auth/login');
}
