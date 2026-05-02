import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';

function App() {
  return (
    <div className='flex h-screen w-screen flex-col overflow-hidden bg-background text-text-primary font-sans'>
      <header className='relative z-50 bg-background border-b border-border shadow-sm'>
        <PipelineToolbar />
      </header>
      <main className='flex-1 relative z-10'>
        <PipelineUI />
      </main>
      <footer className='p-4 border-t border-border bg-background'>
        <SubmitButton />
      </footer>
    </div>
  );
}

export default App;
