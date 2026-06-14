
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Register } from './Pages/register'
import { Login } from './Pages/login';
import { Chats } from './Pages/chats';
import { Requests } from './Pages/requests';
import { FindUsers } from './Pages/users';
import { Notifications } from './Pages/notification';
import { Profile } from './Pages/profile';
import { EditProfile } from './Pages/editprofile';

function App() {

  const router = createBrowserRouter([
    {
      path:"/register",
      element:<Register />
    },
    {
      path:"/login",
      element:<Login />
    },
    {
      path:"/chats",
      element:<Chats />
    },
    {
      path:"/requests",
      element:<Requests />
    },
    {
      path:"/findusers",
      element:<FindUsers />
    },
    {
      path:"/notifications",
      element:<Notifications />
    },
    {
      path:"/profile",
      element:<Profile />
    },
    {
      path:"/editprofile",
      element:<EditProfile />
    }
  ]);

  return <RouterProvider router={router} />

}

export default App
