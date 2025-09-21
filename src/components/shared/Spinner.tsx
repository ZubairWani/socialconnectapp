import { Loader2 } from "lucide-react";

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'h-5 w-5',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    }[size];

    return <Loader2 className={`animate-spin text-primary ${sizeClasses}`} />;
}