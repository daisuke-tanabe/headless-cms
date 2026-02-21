import { createBrowserRouter } from "react-router"
import { AuthenticatedLayout } from "./layouts/authenticated-layout"
import { RootLayout } from "./layouts/root-layout"
import { ArticleDetailPage } from "./pages/article-detail-page"
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
            path: "/articles/new",
            element: <ArticleNewPage />,
          },
          {
            path: "/articles/:id",
            element: <ArticleDetailPage />,
          },
          {
            path: "/settings",
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
])
