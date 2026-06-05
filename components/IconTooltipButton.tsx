import React from 'react';
import { iconTooltipLabel } from '@/src/lib/ui-classes';

export type IconTooltipButtonProps =
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
        tooltip: string;
    };

/**
 * Icon action with a styled hover tooltip and matching aria-label.
 *
 * Example:
 *   <IconTooltipButton tooltip="Copy" className={btnIcon} onClick={copy}>
 *     <CopyIcon className="w-5 h-5" />
 *   </IconTooltipButton>
 */
export const IconTooltipButton = React.forwardRef<
    HTMLButtonElement,
    IconTooltipButtonProps
>(({ tooltip, children, className = '', type = 'button', ...props }, ref) => (
    <button
        ref={ref}
        type={type}
        aria-label={tooltip}
        className={`group relative ${className}`.trim()}
        {...props}
    >
        {children}
        <span role="tooltip" className={iconTooltipLabel}>
            {tooltip}
        </span>
    </button>
));

IconTooltipButton.displayName = 'IconTooltipButton';
