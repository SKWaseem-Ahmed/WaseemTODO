import React, { Suspense, lazy } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

// Lazy load components for better performance
const BackgroundScene = lazy(() => import("./components/BackgroundScene"));
const TodoApp = lazy(() => import("./components/TodoApp"));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-slate-500 font-medium">Loading Glass Tasks...</p>
    </div>
  </div>
);

function App() {
  return (
    <div className="App relative min-h-screen overflow-hidden">
      {/* 3D Background */}
      <Suspense fallback={null}>
        <BackgroundScene />
      </Suspense>
      
      {/* Main App */}
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<TodoApp />} />
            <Route path="*" element={<TodoApp />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      
      {/* Toast Notifications */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          },
        }}
      />
    </div>
  );
}

export default App;
