"use client";

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { colors } from "@/components/Global/colors";
import notfound from "@/assets/Lottie/404.json";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import "./globals.css";

// Correct dynamic import with default export handling
const DisplayLottie = dynamic(
    () => import("@/components/Global/Displaylottie").then((mod) => mod.DisplayLottie),
    {
        ssr: false,
        loading: () => (
            <div className="relative z-10 w-full max-w-[400px] h-[300px] bg-gray-100 rounded-lg" />
        )
    }
);

const NotFoundPage = () => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#F5F5F5] to-[#D4ECDD]">
                <div className="w-16 h-16 border-4 border-[#152D35] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center relative p-4 overflow-hidden"
            style={{
                background: `linear-gradient(to bottom right, ${colors.secondaryLight}, ${colors.secondary})`
            }}
        >
            {/* Background decorative elements */}
            <div
                className="absolute top-[-10%] left-[-5%] w-[30%] h-[60%] rounded-[40%] opacity-[0.03] rotate-[-15deg]"
                style={{ background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.primaryLight})` }}
            />
            <div
                className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[70%] rounded-[30%] opacity-[0.05] rotate-[20deg]"
                style={{ background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.primaryLight})` }}
            />

            {/* Small decorative dots */}
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full animate-float"
                    style={{
                        backgroundColor: colors.primary,
                        width: `${Math.random() * 8 + 4}px`,
                        height: `${Math.random() * 8 + 4}px`,
                        opacity: Math.random() * 0.15 + 0.05,
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDuration: `${Math.random() * 10 + 20}s`,
                    }}
                />
            ))}

            <Card className="w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-lg animate-fadeIn">
                {/* Top accent bar with pattern */}
                <div
                    className="h-3 w-full relative overflow-hidden"
                    style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.primaryLight})` }}
                >
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-5 h-5 bg-white/10 rotate-45 -top-[10px]"
                            style={{ left: `${i * 50}px` }}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                    {/* Left side: Content */}
                    <div className="flex flex-col justify-center p-4 animate-slideUp">
                        <div className="flex items-center mb-3">
                            <div
                                className="w-1.5 h-7 rounded mr-3"
                                style={{ backgroundColor: colors.primary }}
                            />
                            <span
                                className="text-sm font-semibold uppercase tracking-wider"
                                style={{ color: colors.primary }}
                            >
                                Error
                            </span>
                        </div>

                        <h1
                            className="text-[5rem] font-extrabold leading-none relative mb-4"
                            style={{ color: colors.primaryDark }}
                        >
                            404
                            <span
                                className="absolute w-3 h-3 rounded-full -right-3 top-8"
                                style={{ backgroundColor: colors.primary }}
                            />
                        </h1>

                        <h2
                            className="text-3xl font-semibold mb-6 relative"
                            style={{ color: colors.tertiaryLight }}
                        >
                            Page Not Found
                            <span
                                className="block w-14 h-1 rounded mt-3"
                                style={{ background: `linear-gradient(to right, ${colors.primary}, ${colors.primaryLight})` }}
                            />
                        </h2>

                        <p
                            className="text-lg leading-relaxed mb-8 max-w-lg"
                            style={{ color: colors.tertiary }}
                        >
                            We're sorry, but the page you requested cannot be found.
                            It might have been removed, had its name changed, or is temporarily unavailable.
                        </p>

                        <div className="flex flex-wrap gap-4 mt-2">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => router.back()}
                                className={`border-2 bg-transparent hover:text-white min-w-[160px] rounded-xl uppercase font-semibold tracking-wide text-sm transition-all duration-300 hover:bg-[${colors.primary}]`}
                                style={{
                                    borderColor: colors.primary,
                                    color: colors.primary
                                }}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                            </Button>

                            <Button
                                size="lg"
                                className="text-white hover:shadow-lg hover:-translate-y-1 min-w-[160px] rounded-xl uppercase font-semibold tracking-wide text-sm transition-all duration-300"
                                style={{
                                    background: colors.primaryGradient
                                }}
                                asChild
                            >
                                <Link href="/">
                                    Home Page <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Right side: Animation */}
                    <div className="flex justify-center items-center relative p-4 animate-fadeIn">
                        {/* Circle background for animation */}
                        <div
                            className="absolute w-[280px] h-[280px] rounded-full z-0"
                            style={{ background: `linear-gradient(to right, ${colors.secondaryLight}, ${colors.secondaryDark})` }}
                        />

                        {/* Decorative rings */}
                        <div
                            className="absolute w-[350px] h-[350px] rounded-full border-2 border-dashed opacity-60"
                            style={{ borderColor: colors.secondaryDark }}
                        />
                        <div
                            className="absolute w-[400px] h-[400px] rounded-full border opacity-30"
                            style={{ borderColor: colors.secondaryDark }}
                        />

                        {/* Animation container */}
                        <div className="relative z-10 w-full max-w-[400px]">
                            <DisplayLottie animationData={notfound} />
                        </div>
                    </div>
                </div>

                <CardFooter
                    className="p-6 border-t flex flex-wrap justify-between items-center gap-4"
                    style={{
                        backgroundColor: colors.secondaryLight,
                        borderColor: colors.secondaryDark
                    }}
                >
                    <Alert className="border-none shadow-none bg-transparent p-0 flex items-center">
                        <Info
                            className="h-4 w-4 mr-2"
                            style={{ color: colors.primary }}
                        />
                        <AlertDescription
                            className="text-sm"
                            style={{ color: colors.tertiaryLight }}
                        >
                            Need assistance finding what you're looking for?
                        </AlertDescription>
                    </Alert>

                    <Button
                        variant="outline"
                        size="sm"
                        className={`bg-white font-medium transition-all duration-200 hover:border-[${colors.primary}]`}
                        style={{
                            borderColor: colors.secondaryDark,
                            color: colors.primary
                        }}
                        asChild
                    >
                        <Link href="/contact">
                            Contact Support
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>

            {/* Global styles for animations */}
            <style jsx global>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-float {
                    animation: float linear infinite;
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.8s ease-in-out forwards;
                }
                
                .animate-slideUp {
                    animation: slideUp 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default NotFoundPage;