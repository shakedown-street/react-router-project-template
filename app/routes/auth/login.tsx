import { Form, Link, redirect } from 'react-router';
import z from 'zod';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { AuthenticationError } from '~/lib/auth/errors';
import { AuthServiceFactory } from '~/lib/auth/factory';
import { prisma } from '~/lib/prisma';
import type { Route } from './+types/login';

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export async function loader({ request }: Route.LoaderArgs) {
  const { sessionManager } = AuthServiceFactory.create(prisma);
  const user = await sessionManager.getUser(request);
  if (user !== null) {
    return redirect('/');
  }
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const result = loginSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { email, password } = result.data;
  const { authService, sessionManager } = AuthServiceFactory.create(prisma);

  try {
    const user = await authService.login(email, password);
    return redirect('/', { headers: { 'Set-Cookie': await sessionManager.create(user.id) } });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return { error: 'Invalid email or password' };
    }
    throw error;
  }
}

export default function Login({ actionData }: Route.ComponentProps) {
  const error = actionData?.error;

  return (
    <>
      <h1>Login</h1>
      <Form method="post">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" />
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <p>
          Don't have an account?{' '}
          <Link className="text-primary" to="/auth/signup">
            Sign up
          </Link>
        </p>
        <Button type="submit">Login</Button>
      </Form>
    </>
  );
}
