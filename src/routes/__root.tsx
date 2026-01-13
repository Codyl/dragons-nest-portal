import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

const RootLayout = () => (
  <>
    <div className='p-2 flex gap-2 fixed w-full shadow-lg'>
      <Link to='/' className='[&.active]:font-bold'>
        Home
      </Link>{' '}
      <Link to='/login' className='[&.active]:font-bold'>
        Login
      </Link>
    </div>
    <div className='px-2 pt-12 pb-16 min-h-screen'>
      <Outlet />
    </div>
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
