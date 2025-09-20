'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  User, 
  FileText, 
  Plus, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  TrendingUp
} from 'lucide-react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isAdmin = user?.role === 'admin';
  const isMarketer = user?.role === 'marketer';

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-green-600 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Data Marketing
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                {/* Common Links */}
                <Link
                  href="/dashboard"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>

                {/* Admin Links */}
                {isAdmin && (
                  <>
                    <Link
                      href="/admin/marketers"
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Marketers
                    </Link>
                    <Link
                      href="/admin/submissions"
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      All Submissions
                    </Link>
                    <Link
                      href="/admin/override-logs"
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Override Logs
                    </Link>
                  </>
                )}

                {/* Marketer Links */}
                {isMarketer && (
                  <>
                    <Link
                      href="/submit"
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Data
                    </Link>
                    <Link
                      href="/submissions"
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      My Submissions
                    </Link>
                    <Link
                      href="/hot-leads"
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 transition-colors"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Hot Leads
                    </Link>
                  </>
                )}

                {/* User Menu */}
                <div className="ml-4 flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              /* Guest Links */
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
              {user ? (
                <>
                  {/* User Info */}
                  <div className="px-3 py-2 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Common Links */}
                  <Link
                    href="/dashboard"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <BarChart3 className="h-5 w-5 mr-3" />
                    Dashboard
                  </Link>

                  {/* Admin Links */}
                  {isAdmin && (
                    <>
                      <Link
                        href="/admin/marketers"
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Users className="h-5 w-5 mr-3" />
                        Marketers
                      </Link>
                      <Link
                        href="/admin/submissions"
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <FileText className="h-5 w-5 mr-3" />
                        All Submissions
                      </Link>
                      <Link
                        href="/admin/override-logs"
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Shield className="h-5 w-5 mr-3" />
                        Override Logs
                      </Link>
                    </>
                  )}

                  {/* Marketer Links */}
                  {isMarketer && (
                    <>
                      <Link
                        href="/submit"
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Plus className="h-5 w-5 mr-3" />
                        Submit Data
                      </Link>
                      <Link
                        href="/submissions"
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <FileText className="h-5 w-5 mr-3" />
                        My Submissions
                      </Link>
                      <Link
                        href="/hot-leads"
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-100"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <TrendingUp className="h-5 w-5 mr-3" />
                        Hot Leads
                      </Link>
                    </>
                  )}

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                /* Guest Links */
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}