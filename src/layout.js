// layout.js

import { PipelineToolbar } from './toolbar';
import { SubmitButton } from './submit';

export const Layout = ({ children }) => {
  return (
    <div className='flex h-screen w-screen flex-col overflow-hidden bg-background text-text-primary font-sans'>
      <header className='relative z-50 bg-background border-b border-border shadow-sm'>
        <PipelineToolbar />
      </header>
      <main className='flex-1 relative z-10'>
        {children}
        <div className='absolute bottom-6 left-1/2 -translate-x-1/2 z-20'>
          <SubmitButton />
        </div>
      </main>
    </div>
  );
};
