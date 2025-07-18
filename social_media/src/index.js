import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import store from './redux/store';
import { ApolloProvider } from '@apollo/client';


import client from './apolloClient';

// Add Tailwind CSS CDN
try {
  const tailwindScript = document.createElement('script');
  tailwindScript.src = 'https://cdn.tailwindcss.com';
  document.head.appendChild(tailwindScript);
} catch (error) {
  console.error("Error adding Tailwind CSS script:", error);
}

let root;
try {
  root = ReactDOM.createRoot(document.getElementById('root'));
} catch (error) {
  console.error("Error creating React root:", error);
  // Fallback to body if root element not found
  root = ReactDOM.createRoot(document.body);
}
root.render(
    <ApolloProvider client={client}>
       <Provider store={store}>
        <App />
    </Provider>
    </ApolloProvider>
);
    


