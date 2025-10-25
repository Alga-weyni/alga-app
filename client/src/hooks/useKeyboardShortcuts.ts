import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description: string;
}

export function useKeyboardShortcuts(enabled: boolean = true) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) return;

    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'h',
        alt: true,
        handler: () => navigate('/'),
        description: 'Go to home page'
      },
      {
        key: 'p',
        alt: true,
        handler: () => navigate('/properties'),
        description: 'Browse properties'
      },
      {
        key: 's',
        alt: true,
        handler: () => navigate('/services'),
        description: 'Browse services'
      },
      {
        key: 'f',
        alt: true,
        handler: () => navigate('/favorites'),
        description: 'View favorites'
      },
      {
        key: 'b',
        alt: true,
        handler: () => navigate('/bookings'),
        description: 'View bookings'
      },
      {
        key: '/',
        ctrl: true,
        handler: () => {
          const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
        },
        description: 'Focus search'
      }
    ];

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Allow Ctrl+/ even in input fields
        if (!(event.ctrlKey && event.key === '/')) {
          return;
        }
      }

      shortcuts.forEach(shortcut => {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (
          event.key === shortcut.key &&
          ctrlMatch &&
          shiftMatch &&
          altMatch
        ) {
          event.preventDefault();
          shortcut.handler();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, navigate]);
}

// Export shortcuts for help documentation
export const KEYBOARD_SHORTCUTS = [
  { keys: 'Alt + H', description: 'Go to home page' },
  { keys: 'Alt + P', description: 'Browse properties' },
  { keys: 'Alt + S', description: 'Browse services' },
  { keys: 'Alt + F', description: 'View favorites' },
  { keys: 'Alt + B', description: 'View bookings' },
  { keys: 'Ctrl + /', description: 'Focus search' },
  { keys: 'Esc', description: 'Close dialogs' },
  { keys: 'Tab', description: 'Navigate between elements' },
];
