import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home.tsx";
import AppLayout from "./AppLayout.tsx";
import CreatePost from "./pages/CreatePost.tsx";
import CreateCommunity from "./pages/CreateCommunity.tsx";
import Communities from "./pages/Communities.tsx";
import { Provider } from "react-redux";
import { store } from "./app/store.ts";
import PostDetais from "./pages/PostDetails.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "createpost", element: <CreatePost /> },
      { path: "createcommunity", element: <CreateCommunity /> },
      { path: "communities", element: <Communities /> },
      { path: "postdetails/:id", element: <PostDetais /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
