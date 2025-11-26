import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface NavigationItem {
    label: string;
    href: string;
}

interface NavigationSection {
    title?: string;
    items: NavigationItem[];
}

interface NavigationMenuProps {
    title: string;
    sections: NavigationSection[];
    active?: boolean;
}

export function NavigationMenu({ title, sections, active }: NavigationMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150); // Small delay to prevent flickering when moving mouse to dropdown
    };

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                className={`flex items-center text-sm font-medium transition-colors py-2 ${active || isOpen ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                    }`}
            >
                {title}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-lg border border-gray-100 py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {sections.map((section, idx) => (
                        <div key={idx} className={`${idx > 0 ? 'mt-4 pt-4 border-t border-gray-100' : ''} px-4`}>
                            {section.title && (
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    {section.title}
                                </h3>
                            )}
                            <ul className="space-y-2">
                                {section.items.map((item, itemIdx) => (
                                    <li key={itemIdx}>
                                        <Link
                                            to={item.href}
                                            className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded transition-colors"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
