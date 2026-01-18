import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

const RootLayout = () => (
  <>
    <div className='p-2 flex flex-wrap gap-2 fixed w-full shadow-lg bg-background z-50'>
      <Link to='/' className='[&.active]:font-bold'>
        Home
      </Link>
      <Link to='/login' className='[&.active]:font-bold'>
        Login
      </Link>
      <Link to='/signup' className='[&.active]:font-bold'>
        Signup
      </Link>
      <Link to='/confirm-signup' className='[&.active]:font-bold'>
        Confirm Signup
      </Link>
      <Link to='/mfa' className='[&.active]:font-bold'>
        MFA
      </Link>
      <Link to='/mfa/generate' className='[&.active]:font-bold'>
        MFA Generate
      </Link>
      <Link to='/mfa/connect' className='[&.active]:font-bold'>
        MFA Connect
      </Link>
      <Link to='/logout' className='[&.active]:font-bold'>
        Logout
      </Link>
      <Link to='/users/me' className='[&.active]:font-bold'>
        User Me
      </Link>
      <Link to='/users/me/settings' className='[&.active]:font-bold'>
        User Settings
      </Link>
      <Link to='/authenticated' className='[&.active]:font-bold'>
        Authenticated
      </Link>
    </div>
    <div className='px-2 pt-20 pb-16 min-h-screen'>
      <Outlet />
    </div>
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
