import './App.css'
import Auth from './components/Auth'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Problems from './components/Problems'
import Problem from './components/Problem'
import ProbSubmission from './components/ProbSubmission'
import Profile from './components/Profile'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const routes = createBrowserRouter([
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
])

const queryClient = new QueryClient();

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
