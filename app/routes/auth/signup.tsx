import { Form, Link, redirect } from 'react-router';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { EmailAlreadyExistsError, InvalidPasswordError } from '~/lib/auth/errors';
import { getAuthService, getSessionService } from '~/lib/auth/factory';
import type { Route } from './+types/signup';

const signupSchema = z.object({
  email: z.email(),
  password: z.string(),
  confirmPassword: z.string(),
});

export type SignupInput = z.infer<typeof signupSchema>;

export async function loader({ request }: Route.LoaderArgs) {
  const sessionService = getSessionService();

  const user = await sessionService.getUser(request);
  if (user !== null) {
    return redirect('/');
  }

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const authService = getAuthService();
  const sessionService = getSessionService();

  const formData = await request.formData();
  const input = Object.fromEntries(formData) as SignupInput;
  const parseResult = signupSchema.safeParse(input);
  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }
  const { email, password, confirmPassword } = parseResult.data;

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  try {
    const user = await authService.signup(email, password);
    const response = await sessionService.create(user.id, '/');
    return response;
  } catch (error) {
    if (error instanceof EmailAlreadyExistsError || error instanceof InvalidPasswordError) {
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
