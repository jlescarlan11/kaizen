import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from '../../features/home/HomePage'
import { NotFoundPage } from '../../features/not-found/NotFoundPage'
import { PlaygroundPage } from '../../features/playground/PlaygroundPage'
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
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
