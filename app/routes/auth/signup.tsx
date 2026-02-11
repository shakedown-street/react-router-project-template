import z from 'zod';
import { Form, Link, redirect } from 'react-router';
import { commitSession, getSessionUser } from '~/lib/session.server';
import type { Route } from './+types/signup';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { checkEmailExists, createUser, validatePassword } from '~/lib/auth.server';
import { Button } from '~/components/ui/button';

const signupSchema = z.object({
  email: z.email(),
  password: z.string(),
  confirmPassword: z.string(),
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

  const result = signupSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const passwordResult = validatePassword(result.data.password);
  if (!passwordResult.valid) {
    return { error: passwordResult.error! };
  }

  const passwordsMatch = result.data.password === result.data.confirmPassword;
  if (!passwordsMatch) {
    return { error: 'Passwords do not match' };
  }

  const emailExists = await checkEmailExists(result.data.email);
  if (emailExists) {
    return { error: 'Email already exists' };
  }

  const user = await createUser(result.data.email, result.data.password);
  return redirect('/', {
    headers: {
      'Set-Cookie': await commitSession(user.id),
    },
  });
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
