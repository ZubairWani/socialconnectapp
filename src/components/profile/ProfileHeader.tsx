//src/components/profile/
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, Link as LinkIcon, MapPin } from "lucide-react";

import { FollowButton } from "./FollowButton";
import { EditProfileModal } from "./EditProfileModel";


export type ProfileUser = {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    joined: string;
    followingCount: number;
    followersCount: number;
};

interface ProfileHeaderProps {
    user: ProfileUser;
    isOwnProfile: boolean;
    isFollowing?: boolean;
}

export function ProfileHeader({ user, isOwnProfile, isFollowing = false }: ProfileHeaderProps) {
    
    return (
        <div className="border-b">
            <div className="relative h-40 bg-muted" />
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <Avatar className="-mt-16 h-28 w-28 border-4 border-background">
                        <AvatarImage src={user.avatarUrl || undefined} />
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>

                    {isOwnProfile ? (
                        <EditProfileModal user={user} />
                    ) : (
                        <FollowButton userIdToFollow={user.id} initialIsFollowing={isFollowing} />
                    )}
                </div>

                <div className="mt-4">
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-muted-foreground">@{user.username}</p>
                </div>
                <p className="mt-4">{user.bio}</p>
                <div className="flex flex-wrap gap-4 text-muted-foreground mt-4 text-sm">
                    {user.location && <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {user.location}</div>}
                    {user.website && <div className="flex items-center gap-1"><LinkIcon className="h-4 w-4" /> <a href={user.website || '#'} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{user.website}</a></div>}
                    <div className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Joined {user.joined}</div>
                </div>
                <div className="flex gap-4 mt-4">
                    <p><span className="font-bold">{user.followingCount}</span> <span className="text-muted-foreground">Following</span></p>
                    <p><span className="font-bold">{user.followersCount}</span> <span className="text-muted-foreground">Followers</span></p>
                </div>
            </div>
        </div>
    );
}

