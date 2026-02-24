import { createBrowserRouter } from "react-router"
import { AuthenticatedLayout } from "./layouts/authenticated-layout"
import { EditorLayout } from "./layouts/editor-layout"
import { RootLayout } from "./layouts/root-layout"
import { ContentTypeDetailPage } from "./pages/content-type-detail-page"
import { ContentTypeListPage } from "./pages/content-type-list-page"
import { ContentTypeNewPage } from "./pages/content-type-new-page"
import { DashboardPage } from "./pages/dashboard-page"
import { EntryEditPage, EntryNewPage } from "./pages/entry-edit-page"
import { EntryListPage } from "./pages/entry-list-page"
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
            path: "/content-types",
            element: <ContentTypeListPage />,
          },
          {
            path: "/content-types/new",
            element: <ContentTypeNewPage />,
          },
          {
            path: "/content-types/:id",
            element: <ContentTypeDetailPage />,
          },
          {
            path: "/content-types/:id/entries",
            element: <EntryListPage />,
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
        path: "/content-types/:id/entries/new",
        element: <EntryNewPage />,
      },
      {
        path: "/content-types/:id/entries/:entryId",
        element: <EntryEditPage />,
      },
    ],
  },
])
