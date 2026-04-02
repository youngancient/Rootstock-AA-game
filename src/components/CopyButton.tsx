import { useState } from "react";

interface CopyButtonProps {
    textToCopy: string;
    className?: string;
}

export const CopyButton = ({ textToCopy, className = "" }: CopyButtonProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000); // revert after 2 seconds
    };

    return (
        <button
            className={`copy-btn ${className}`}
            onClick={handleCopy}
            title="Copy Address"
        >
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={copied ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
        </button>
    );
};