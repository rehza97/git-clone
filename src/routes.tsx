import { createBrowserRouter, Navigate } from "react-router-dom"
import { RootLayout } from "@/components/layout/RootLayout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { LandingPage } from "@/pages/LandingPage"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { ExplorePage } from "@/pages/ExplorePage"
import { SearchUsersPage } from "@/pages/SearchUsersPage"
import { PublicProfilePage } from "@/pages/PublicProfilePage"
import { ProfileSettingsPage } from "@/pages/ProfileSettingsPage"
import { RepoDetailPage } from "@/pages/RepoDetailPage"
import { UploadPage } from "@/pages/UploadPage"
import { FileViewerPage } from "@/pages/FileViewerPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      { path: "explore", element: <ExplorePage /> },
      { path: "users", element: <SearchUsersPage /> },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfileSettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "repo/:repoId/upload",
        element: (
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        ),
      },
      { path: "repo/:repoId/file/*", element: <FileViewerPage /> },
      { path: "repo/:repoId", element: <RepoDetailPage /> },
      { path: ":username", element: <PublicProfilePage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
])
