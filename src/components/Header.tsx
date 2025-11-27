import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserIcon, LogOutIcon, LayoutDashboardIcon, ShieldIcon, MenuIcon, XIcon, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logoBlue from '../imgs/logo-blue.png';
import logoWhite from '../imgs/logo-white.png';

import { NavigationMenu } from './NavigationMenu';

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

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
    navigate('/');
  };
  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  // Navigation Data
  const buySections = [
    {
      title: 'Homes for Sale',
      items: [
        { label: 'Homes for sale', href: '/properties?status=for_sale' },
        { label: 'Foreclosures', href: '/properties?type=foreclosure' },
        { label: 'For sale by owner', href: '/properties?type=fsbo' },
        { label: 'New construction', href: '/properties?type=new_construction' },
      ]
    },
    {
      title: 'Resources',
      items: [
        { label: 'Buyers Guide', href: '/about' },
        { label: 'Foreclosure center', href: '/about' },
      ]
    }
  ];

  const rentSections = [
    {
      title: 'Search for Rentals',
      items: [
        { label: 'Rental buildings', href: '/properties?status=for_rent&type=apartment' },
        { label: 'Apartments for rent', href: '/properties?status=for_rent&type=apartment' },
        { label: 'Houses for rent', href: '/properties?status=for_rent&type=house' },
        { label: 'All rental listings', href: '/properties?status=for_rent' },
      ]
    },
    {
      title: 'Resources',
      items: [
        { label: 'Renters Guide', href: '/about' },
        { label: 'Affordability calculator', href: '/mortgage' },
      ]
    }
  ];

  const sellSections = [
    {
      title: 'Selling Tools',
      items: [
        { label: 'Browse homes', href: '/properties' },
        { label: 'See your home\'s Zestimate', href: '/about' },
        { label: 'Home values', href: '/about' },
        { label: 'Sellers guide', href: '/about' },
      ]
    },
    {
      title: 'Resources',
      items: [
        { label: 'List for sale by owner', href: '/post' },
        { label: 'Find a seller\'s agent', href: '/about' },
      ]
    }
  ];

  const mortgageSections = [
    {
      title: 'Mortgages',
      items: [
        { label: 'Mortgage lenders', href: '/mortgage' },
        { label: 'Mortgage rates', href: '/mortgage' },
        { label: 'Refinance rates', href: '/mortgage' },
        { label: 'All mortgage calculators', href: '/mortgage' },
      ]
    },
    {
      title: 'Resources',
      items: [
        { label: 'Mortgage learning center', href: '/about' },
        { label: 'Affordability calculator', href: '/mortgage' },
      ]
    }
  ];

  const agentSections = [
    {
      title: 'Find Pros',
      items: [
        { label: 'Real estate agents', href: '/about' },
        { label: 'Property managers', href: '/about' },
        { label: 'Home inspectors', href: '/about' },
      ]
    }
  ];

  const isHomePage = location.pathname === '/';

  return (
    <header className={`border-b sticky top-0 z-50 font-sans ${isHomePage ? 'bg-transparent border-transparent md:bg-white md:border-gray-200' : 'bg-white border-gray-200'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo (Left) */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={isHomePage ? logoWhite : logoBlue}
                alt="Hovallo"
                className={`h-8 w-auto ${isHomePage ? 'md:hidden' : ''}`}
              />
              <img
                src={logoBlue}
                alt="Hovallo"
                className={`h-8 w-auto ${isHomePage ? 'hidden md:block' : 'hidden'}`}
              />
              <span className={`hidden lg:inline text-xl font-bold tracking-tight ${isHomePage ? 'text-white md:text-blue-900' : 'text-blue-900'
                }`}>Hovallo</span>
            </Link>
          </div>

          {/* Desktop Navigation (Left-Center) */}
          <nav className="hidden md:flex items-center gap-4 ml-8 flex-1">
            <NavigationMenu title="Buy" sections={buySections} active={location.pathname.includes('/properties') && !location.search.includes('for_rent')} />
            <NavigationMenu title="Rent" sections={rentSections} active={location.search.includes('for_rent')} />
            <NavigationMenu title="Sell" sections={sellSections} active={location.pathname === '/post'} />
            <NavigationMenu title="Home Loans" sections={mortgageSections} active={location.pathname === '/mortgage'} />
            <NavigationMenu title="Agent Finder" sections={agentSections} active={location.pathname === '/about'} />
          </nav>

          {/* Right Side: User Menu / Sign In */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/dashboard" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Manage Rentals</Link>
            <Link to="/faq" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Help</Link>

            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>

                      <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutDashboardIcon className="w-4 h-4" />
                        My Dashboard
                      </Link>

                      <Link to="/favorites" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Heart className="w-4 h-4" />
                        My Favorites
                      </Link>

                      {isAdmin && (
                        <Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <ShieldIcon className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}

                      <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-200 mt-2">
                        <LogOutIcon className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button (Right) */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${isHomePage ? 'text-white hover:bg-white/20' : 'text-gray-600 hover:text-gray-900'
                }`}
              aria-label="Toggle menu"
            >
              {showMobileMenu ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={closeMobileMenu} />
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl z-50 md:hidden overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <img src={logoBlue} alt="Hovallo" className="h-8 w-auto" />
              <button onClick={closeMobileMenu} className="p-2 text-gray-500 hover:text-gray-700">
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <nav className="px-4 py-4 space-y-1">
              <Link to="/properties" onClick={closeMobileMenu} className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Buy</Link>
              <Link to="/properties" onClick={closeMobileMenu} className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Rent</Link>
              <Link to="/post" onClick={closeMobileMenu} className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Sell</Link>
              <Link to="/mortgage" onClick={closeMobileMenu} className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Home Loans</Link>
              <Link to="/about" onClick={closeMobileMenu} className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Agent Finder</Link>

              <div className="border-t border-gray-200 my-2 pt-2"></div>

              <Link to="/dashboard" onClick={closeMobileMenu} className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Manage Rentals</Link>
              <Link to="/faq" onClick={closeMobileMenu} className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Help</Link>

              <div className="border-t border-gray-200 my-2 pt-2"></div>

              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <Link to="/dashboard" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                    <LayoutDashboardIcon className="w-5 h-5" />
                    My Dashboard
                  </Link>
                  <Link to="/favorites" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                    <Heart className="w-5 h-5" />
                    My Favorites
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg mt-2">
                    <LogOutIcon className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={closeMobileMenu} className="block px-4 py-3 text-base font-medium text-blue-600 hover:bg-blue-50 rounded-lg">Sign In</Link>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}