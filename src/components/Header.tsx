import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, SearchIcon, PlusCircleIcon, UserIcon, LogOutIcon, LayoutDashboardIcon, ShieldIcon, MenuIcon, XIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    logout,
    isAuthenticated,
    isAdmin
  } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isActive = (path: string) => location.pathname === path;
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
    navigate('/');
  };
  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };
  return <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <HomeIcon className="w-6 h-6 text-blue-600" />
          <span className="hidden sm:inline">Hovallo</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
            <HomeIcon className="w-4 h-4" />
            Home
          </Link>
          <Link to="/properties" className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/properties') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
            <SearchIcon className="w-4 h-4" />
            Browse
          </Link>

          {isAuthenticated ? <>
            <Link to="/post" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <PlusCircleIcon className="w-4 h-4" />
              Post Property
            </Link>

            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <span>{user?.name}</span>
              </button>

              {showUserMenu && <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>

                  <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <LayoutDashboardIcon className="w-4 h-4" />
                    My Dashboard
                  </Link>

                  {isAdmin && <Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <ShieldIcon className="w-4 h-4" />
                    Admin Panel
                  </Link>}

                  <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-200 mt-2">
                    <LogOutIcon className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>}
            </div>
          </> : <>
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </Link>
          </>}
        </nav>

        {/* Mobile Menu Button */}
        <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Toggle menu">
          {showMobileMenu ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={closeMobileMenu} />

        {/* Menu Panel */}
        <div className="fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 md:hidden">
          <nav className="px-4 py-4 space-y-1">
            <Link to="/" onClick={closeMobileMenu} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>
              <HomeIcon className="w-5 h-5" />
              Home
            </Link>

            <Link to="/properties" onClick={closeMobileMenu} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive('/properties') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}>
              <SearchIcon className="w-5 h-5" />
              Browse Properties
            </Link>

            {isAuthenticated ? <>
              <Link to="/post" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 transition-colors">
                <PlusCircleIcon className="w-5 h-5" />
                Post Property
              </Link>

              <div className="pt-4 mt-4 border-t border-gray-200">
                <div className="px-4 py-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <Link to="/dashboard" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <LayoutDashboardIcon className="w-5 h-5" />
                  My Dashboard
                </Link>

                {isAdmin && <Link to="/admin" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <ShieldIcon className="w-5 h-5" />
                  Admin Panel
                </Link>}

                <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors mt-2">
                  <LogOutIcon className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </> : <div className="pt-4 mt-4 border-t border-gray-200 space-y-2">
              <Link to="/login" onClick={closeMobileMenu} className="flex items-center justify-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors border border-gray-300">
                Sign In
              </Link>
              <Link to="/signup" onClick={closeMobileMenu} className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg text-base font-medium hover:bg-blue-700 transition-colors">
                Get Started
              </Link>
            </div>}
          </nav>
        </div>
      </>}
    </div>
  </header>;
}