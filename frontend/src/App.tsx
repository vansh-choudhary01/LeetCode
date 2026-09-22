import './App.css'
import Auth from './components/Auth'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import Problems from './components/Problems'
import Problem from './components/Problem'
import ProbSubmission from './components/ProbSubmission'
import Profile from './components/Profile'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AxiosInterceptor from './utils/AxiosInterceptor'

const routes = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Auth /> },
      { path: "/problems", element: <Problems /> },
      {
        path: "/problems/:probId",
        element: <Problem />
      },
      {
        path: "/problems/:probId/:submissionId",
        element: <ProbSubmission />
      },
      { path: "/profile", element: <Profile /> }
    ]
  }
])

const queryClient = new QueryClient();

function RootLayout() {
  return <>
    <AxiosInterceptor />
    <Outlet />
  </>
}

function App() {

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={routes} />
      </QueryClientProvider>
    </>
  )
}

export default App
