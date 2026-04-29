import React from 'react';
import Navbar from './Navbar';
import ChatbotButton from '../chatbot/ChatbotButton';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-border bg-card py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Mini AI LMS. All rights reserved.
      </footer>
      <ChatbotButton />
    </div>
  );
};

export default Layout;
