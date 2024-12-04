import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import Home from './pages/main/Home.jsx'
import Login from './pages/main/Login.jsx'
import Register from './pages/main/Register.jsx'
import RequestZone from './pages/user/RequestZone.jsx'
import Payment from './pages/user/Payment.jsx'
import RequestStatus from './pages/user/RequestStatus.jsx'
import ManageRequest from './pages/admin/ManageRequest.jsx'
import SetRent from './pages/admin/SetRent.jsx'
import ManageUser from './pages/admin/ManageUser.jsx'
import RequestHistory from './pages/admin/RequestHistory.jsx'
import Edit from './pages/main/Edit.jsx'
import ManageEvent from './pages/admin/ManageEvent.jsx'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/Login",
    element: <Login />,
  },
  {
    path: "/Register",
    element: <Register />,
  },
  {
    path: "/RequestZone",
    element: <RequestZone />,
  },
  {
    path: "/Payment",
    element: <Payment />,
  },
  {
    path: "/RequestStatus",
    element: <RequestStatus />,
  },
  {
    path: "/ManageRequest",
    element: <ManageRequest />,
  },
  {
    path: '/SetRent',
    element: <SetRent />
  },
  {
    path: "/ManageUser",
    element: <ManageUser />,
  },
  {
    path: "/RequestHistory",
    element: <RequestHistory />,
  },
  {
    path: "Edit",
    element: <Edit />,
  },
  {
    path: "/ManageEvent",
    element: <ManageEvent />,
  }
]);


ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
      <RouterProvider router={router} />
  // </React.StrictMode>
);