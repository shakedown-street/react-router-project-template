import { Form, Link, redirect } from 'react-router';
import z from 'zod';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { verifyLogin } from '~/lib/auth.server';
import { commitSession, getSessionUser } from '~/lib/session.server';
import type { Route } from './+types/login';

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getSessionUser(request);
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

  const user = await verifyLogin(result.data.email, result.data.password);
  if (user === null) {
    return { error: 'Invalid email or password' };
  }

  return redirect('/', {
    headers: {
      'Set-Cookie': await commitSession(user.id),
    },
  });
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
