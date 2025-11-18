import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

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
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/profile"
        element={<ProfilePage key={location.key} />}
      />
      <Route path="/books" element={<BooksPage />} />
      <Route path="/books/:id" element={<BookFormPage />} />
      <Route path="/reviews" element={<BookReviewPage />} />
      <Route path="/review/:id" element={<BookReviewFormPage />} />
      <Route path="/readinglists" element={<ReadingListsPage />} />
      <Route path="/readinglists/:id" element={<ReadingListFormPage />} />
      <Route path="/profile/:id" element={<ProfileFormPage />} />
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