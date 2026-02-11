import { Form, Link, redirect } from 'react-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { AuthServiceFactory } from '~/lib/auth/factory';
import { SignupUseCase, type SignupInput } from '~/lib/auth/use-cases/SignupUseCase';
import { prisma } from '~/lib/prisma';
import type { Route } from './+types/signup';

export async function loader({ request }: Route.LoaderArgs) {
  const { sessionManager } = AuthServiceFactory.create(prisma);

  const user = await sessionManager.getUser(request);
  if (user !== null) {
    return redirect('/');
  }

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const { authService, sessionManager } = AuthServiceFactory.create(prisma);
  const useCase = new SignupUseCase(authService, sessionManager);

  const formData = await request.formData();
  const input = Object.fromEntries(formData) as SignupInput;
  const output = await useCase.execute(input);

  if (!output.success) {
    return { error: output.error };
  }

  return output.redirectResponse;
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
