import { createRouter } from '@tanstack/react-router';
import { routeTree } from '../routeTree.gen';

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  // Since we're using file-based routing with TanStack Router, 
  // we'll need to generate the route tree.
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
