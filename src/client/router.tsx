import { createBrowserRouter } from "react-router"
import { AuthenticatedLayout } from "./layouts/authenticated-layout"
import { EditorLayout } from "./layouts/editor-layout"
import { RootLayout } from "./layouts/root-layout"
import { ArticleEditPage } from "./pages/article-edit-page"
import { ArticleListPage } from "./pages/article-list-page"
import { ArticleNewPage } from "./pages/article-new-page"
import { DashboardPage } from "./pages/dashboard-page"
import { LandingPage } from "./pages/landing-page"
import { SettingsPage } from "./pages/settings-page"

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        element: <AuthenticatedLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/articles",
            element: <ArticleListPage />,
          },
          {
            path: "/settings",
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    element: <EditorLayout />,
    children: [
      {
        path: "/articles/new",
        element: <ArticleNewPage />,
      },
      {
        path: "/articles/:id",
        element: <ArticleEditPage />,
      },
    ],
  },
])
