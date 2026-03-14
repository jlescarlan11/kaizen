import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from '../../features/home/HomePage'
import { NotFoundPage } from '../../features/not-found/NotFoundPage'
import { PlaygroundPage } from '../../features/playground/PlaygroundPage'
import { AppearancePage } from '../../features/your-account/AppearancePage'
import { YourAccountPage } from '../../features/your-account/YourAccountPage'
import { RootLayout } from './RootLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'playground',
        element: <PlaygroundPage />,
      },
      {
        path: 'your-account',
        element: <YourAccountPage />,
      },
      {
        path: 'your-account/appearance',
        element: <AppearancePage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
