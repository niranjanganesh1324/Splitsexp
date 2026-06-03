import React from 'react';
import { Link } from 'react-router-dom';

function Header({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-50 flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 max-w-[1280px] mx-auto bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline shadow-sm dark:shadow-none">
      <div className="flex items-center gap-xl">
        <Link to="/" className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary">Splitexp</Link>
        <nav className="hidden md:flex items-center gap-lg">
          <Link to="/dashboard" className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant pb-1 hover:text-primary dark:hover:text-primary-fixed-dim transition-colors">Dashboard</Link>
          <Link to="/history" className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant pb-1 hover:text-primary dark:hover:text-primary-fixed-dim transition-colors">History</Link>
          <Link to="/groups" className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant pb-1 hover:text-primary dark:hover:text-primary-fixed-dim transition-colors">Groups</Link>
        </nav>
      </div>
      <div className="flex items-center gap-sm md:gap-md">
        <div className="hidden lg:flex items-center bg-surface-container border border-outline-variant rounded-full px-sm py-xs">
          <span className="material-symbols-outlined text-outline" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>search</span>
          <input className="bg-transparent border-none focus:ring-0 text-body-sm w-32 lg:w-48 ml-2 outline-none" placeholder="Search..." type="text"/>
        </div>
        {user ? (
          <>
            <Link to="/manual" className="px-md py-sm border border-outline-variant text-on-surface rounded-lg font-label-md hover:bg-surface-container-high transition-colors whitespace-nowrap">Manual Entry</Link>
            <Link to="/scan" className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:opacity-80 transition-opacity whitespace-nowrap">Scan Bill</Link>
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer p-xs hover:bg-surface-container rounded-full" title="Logout" onClick={onLogout}>logout</span>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer p-xs hover:bg-surface-container rounded-full">settings</span>
            </div>
          </>
        ) : (
          <Link to="/" className="bg-primary text-on-primary px-md py-sm rounded-lg font-label-md hover:opacity-80 transition-opacity whitespace-nowrap">Sign In</Link>
        )}
      </div>
    </header>
  );
}

export default Header;
