import './App.css'
import Auth from './components/Auth'
import { BrowserRouter, createBrowserRouter, Route, RouterProvider, Routes } from 'react-router-dom'
import Problems from './components/Problems'
import Problem from './components/Problem'
import ProbSubmission from './components/ProbSubmission'
import Profile from './components/Profile'

const routes = createBrowserRouter([
  { path: "/", element: <Auth />},
  { path: "/problems",
    element: <Problems />,
    children: [
      {
        path: "/:probId",
        element: <Problem />
      },
      {
        path: "/:probId/:submissionId",
        element: <ProbSubmission />
      }
    ]
  },
  { path: "/profile", element: <Profile />}
])

function App() {

  return (
    <>
     <RouterProvider router={routes} />
    </>
  )
}

export default App
