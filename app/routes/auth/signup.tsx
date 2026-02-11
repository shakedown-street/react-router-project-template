import { Form, Link, redirect } from 'react-router';
import z from 'zod';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { AuthenticationError } from '~/lib/auth/errors';
import { AuthServiceFactory } from '~/lib/auth/factory';
import { prisma } from '~/lib/prisma';
import type { Route } from './+types/signup';

const signupSchema = z.object({
  email: z.email(),
  password: z.string(),
  confirmPassword: z.string(),
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

  const result = signupSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { email, password, confirmPassword } = result.data;

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }
  try {
    const { authService, sessionManager } = AuthServiceFactory.create(prisma);

    const user = await authService.signup(email, password);
    return redirect('/', { headers: { 'Set-Cookie': await sessionManager.create(user.id) } });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return { error: error.message };
    }
    throw error;
  }
}

export default function Signup({ actionData }: Route.ComponentProps) {
  const error = actionData?.error;

  return (
    <>
      <h1>Signup</h1>
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" />
          </div>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <p>
          Already have an account?{' '}
          <Link className="text-primary" to="/auth/login">
            Login
          </Link>
        </p>
        <Button type="submit">Sign up</Button>
      </Form>
    </>
  );
}
