
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import './App.css';
import { ProgressProvider } from './contexts/ProgressContext';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <ProgressProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </ProgressProvider>
  );
}

export default App;
