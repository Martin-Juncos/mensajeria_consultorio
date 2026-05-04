import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Inbox from './components/Inbox';
import SentPage from './pages/SentPage';
import ComposePage from './pages/ComposePage';
import './style.css';
function App() {
    return (_jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Inbox, {}) }), _jsx(Route, { path: "/sent", element: _jsx(SentPage, {}) }), _jsx(Route, { path: "/compose", element: _jsx(ComposePage, {}) })] }) }) }));
}
export default App;
