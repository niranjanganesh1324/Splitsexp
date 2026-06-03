import React from 'react';

function Footer() {
  return (
    <footer className="w-full py-lg px-margin-desktop bg-surface-container-low dark:bg-surface-container-lowest border-t border-outline-variant mt-auto">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-lg">
        <div className="flex flex-col items-center md:items-start gap-xs">
          <span className="font-headline-md text-headline-md font-bold text-primary dark:text-inverse-primary">Splitsexp</span>
          <p className="font-body-sm text-body-sm text-on-surface-variant">©Splitsexp Financial. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-md">
          <a className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant hover:underline hover:text-primary transition-all duration-200" href="#">Privacy Policy</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant hover:underline hover:text-primary transition-all duration-200" href="#">Terms of Service</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant hover:underline hover:text-primary transition-all duration-200" href="#">Help Center</a>
          <a className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant hover:underline hover:text-primary transition-all duration-200" href="#">Contact Us</a>
        </div>
        <div className="flex gap-md">
          <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary transition-colors">language</span>
          <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary transition-colors">share</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
