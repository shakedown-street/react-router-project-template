import { Button } from '~/components/ui/button';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'React Router Project Template' }];
}

export default function Home() {
  return (
    <>
      <h1 className="text-2xl font-bold">Home</h1>
      <Button>Click me</Button>
    </>
  );
}
