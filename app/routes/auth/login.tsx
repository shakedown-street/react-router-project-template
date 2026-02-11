import { Form, Link, redirect } from 'react-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { AuthServiceFactory } from '~/lib/auth/factory';
import { LoginUseCase, type LoginInput } from '~/lib/auth/use-cases/LoginUseCase';
import { prisma } from '~/lib/prisma';
import type { Route } from './+types/login';

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
  const useCase = new LoginUseCase(authService, sessionManager);

  const formData = await request.formData();
  const input = Object.fromEntries(formData) as LoginInput;
  const output = await useCase.execute(input);

  if (!output.success) {
    return { error: output.error };
  }

  return output.redirectResponse;
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
