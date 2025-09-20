import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import '../styles/globals.css';
import { AppLayout } from './components/layout/AppLayout';

function PreviewShell() {
  return (
    <BrowserRouter>
      <AppLayout>
        <div className="container py-4">
          <h1 className="h3 mb-3">Next.js + Bootstrap (Preview Shell)</h1>
          <p className="text-muted">
            This is a lightweight Vite shell required by the Lovable preview environment.
            Your real app runs on Next.js using the pages/ directory.
          </p>
          <p className="mb-0">Use the sidebar to explore UI screens.</p>
        </div>
      </AppLayout>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PreviewShell />
  </React.StrictMode>
);
