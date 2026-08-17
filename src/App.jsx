import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Builder = lazy(() => import('@/pages/Builder'));
const Reports = lazy(() => import('@/pages/Reports'));
const Templates = lazy(() => import('@/pages/Templates'));
const Drafts = lazy(() => import('@/pages/Drafts'));
const Settings = lazy(() => import('@/pages/Settings'));

const ReportBuilderApp = () => {
  return (
    <Suspense fallback={<div className="fixed inset-0 grid place-items-center bg-slate-50"><div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-red-600 animate-spin" aria-label="Loading application" /></div>}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/builder/:id" element={<Builder />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/drafts" element={<Drafts />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <ScrollToTop />
        <ReportBuilderApp />
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
