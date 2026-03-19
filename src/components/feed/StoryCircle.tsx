'use client';
/** Story circle — individual story avatar in the stories row */
import AvatarWithRing from '@/components/shared/AvatarWithRing';

interface StoryCircleProps {
    name: string;
    avatarUrl: string;
    auraScore: number;
    isOwn?: boolean;
    hasStory?: boolean;
}

export default function StoryCircle({ name, avatarUrl, auraScore, isOwn, hasStory = true }: StoryCircleProps) {
    return (
        <button className="flex flex-col items-center gap-1 min-w-[68px]">
            <AvatarWithRing src={avatarUrl} alt={name} size={52} auraScore={hasStory ? auraScore : 0} isStory={hasStory} />
            <span className="text-[10px] text-text-secondary truncate max-w-[64px]">
                {isOwn ? 'Your Story' : name.split(' ')[0]}
            </span>
        </button>
    );
}
