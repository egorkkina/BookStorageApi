import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute/PublicOnlyRoute";
import MainLayout from "./components/Layout/MainLayout";

import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import BooksPage from "./pages/BooksPage/BooksPage";
import BookFormPage from "./pages/BookFormPage/BookFormPage";
import BookReviewPage from "./pages/BookReviewPage/BookReviewPage";
import ReadingListsPage from "./pages/ReadingListsPage/ReadingListsPage";
import ReadingListFormPage from "./pages/ReadingListFormPage/ReadingListFormPage";
import BookReviewFormPage from "./pages/BookReviewFormPage/BookReviewFormPage";
import ProfileFormPage from "./pages/ProfileFormPage/ProfileFormPage";

function AppRoutes() {
  const location = useLocation();
  
  return (
    <Routes>
      <Route path="/" element={
        <PublicOnlyRoute>
          <HomePage />
        </PublicOnlyRoute>
      } />
      <Route path="/login" element={
        <PublicOnlyRoute>
          <LoginPage />
        </PublicOnlyRoute>
      } />
      
      <Route path="/register" element={
        <PublicOnlyRoute>
          <RegisterPage />
        </PublicOnlyRoute>
      } />

      {/* Защищенные маршруты (только после входа) С Layout */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout>
            <ProfilePage key={location.key} />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/books" element={
        <ProtectedRoute>
          <MainLayout>
            <BooksPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/books/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <BookFormPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/reviews" element={
        <ProtectedRoute>
          <MainLayout>
            <BookReviewPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/review/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <BookReviewFormPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/readinglists" element={
        <ProtectedRoute>
          <MainLayout>
            <ReadingListsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/readinglists/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <ReadingListFormPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <ProfileFormPage />
          </MainLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}