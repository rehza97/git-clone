import { createBrowserRouter, Navigate } from "react-router-dom"
import { RootLayout } from "@/components/layout/RootLayout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
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
import { CodeEditorPage } from "@/pages/CodeEditorPage"
import { AboutPage } from "@/pages/AboutPage"
import { InstitutionsPage } from "@/pages/InstitutionsPage"
import { SupportPage } from "@/pages/SupportPage"
import { TrainingPage } from "@/pages/TrainingPage"
import { CertificatePage } from "@/pages/CertificatePage"
import { CertificateCenterPage } from "@/pages/CertificateCenterPage"
import { PricingPage } from "@/pages/PricingPage"
import { ApiReferencePage } from "@/pages/ApiReferencePage"
import { DocsPage } from "@/pages/DocsPage"
import { LandingPage } from "@/pages/LandingPage"
import { UploadLandingPage } from "@/pages/UploadLandingPage"
import { NotificationsPage } from "@/pages/NotificationsPage"
import { CreateProjectPage } from "@/pages/CreateProjectPage"

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
      { path: "about", element: <AboutPage /> },
      { path: "institutions", element: <InstitutionsPage /> },
      { path: "docs", element: <DocsPage /> },
      { path: "api", element: <ApiReferencePage /> },
      { path: "support", element: <SupportPage /> },
      { path: "training", element: <TrainingPage /> },
      { path: "pricing", element: <PricingPage /> },
      { path: "upload", element: <UploadLandingPage /> },
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
      { path: "repo/:repoId/code/*", element: <CodeEditorPage /> },
      { path: "repo/:repoId/certificate", element: <CertificatePage /> },
      {
        path: "certificates",
        element: (
          <ProtectedRoute>
            <CertificateCenterPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "create-project",
        element: (
          <ProtectedRoute>
            <CreateProjectPage />
          </ProtectedRoute>
        ),
      },
      { path: "repo/:repoId", element: <RepoDetailPage /> },
      { path: ":username", element: <PublicProfilePage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
])
