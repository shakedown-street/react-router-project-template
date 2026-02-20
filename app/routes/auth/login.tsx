import { Form, Link, redirect } from 'react-router';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { getAuthService, getSessionService } from '~/lib/auth/factory';
import { prisma } from '~/lib/prisma';
import type { Route } from './+types/login';
import { IncorrectPasswordError, UserNotFoundError } from '~/lib/auth/errors';

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export async function loader({ request }: Route.LoaderArgs) {
  const sessionService = getSessionService(prisma);

  const user = await sessionService.getUser(request);
  if (user !== null) {
    return redirect('/');
  }

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const authService = getAuthService(prisma);
  const sessionService = getSessionService(prisma);

  const formData = await request.formData();
  const input = Object.fromEntries(formData) as LoginInput;

  const parseResult = loginSchema.safeParse(input);
  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }
  const { email, password } = parseResult.data;

  try {
    const user = await authService.login(email, password);
    const response = await sessionService.create(user.id, '/');
    return response;
  } catch (error) {
    if (error instanceof UserNotFoundError || error instanceof IncorrectPasswordError) {
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
