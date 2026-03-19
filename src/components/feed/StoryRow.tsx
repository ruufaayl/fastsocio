'use client';
/** Horizontal scrollable stories row */
import StoryCircle from './StoryCircle';
import { FAKE_USERS, CURRENT_USER } from '@/lib/fake-data';

export default function StoryRow() {
    return (
        <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto no-scrollbar">
            {/* Own story (add new) */}
            <StoryCircle name="Your Story" avatarUrl={CURRENT_USER.avatarUrl} auraScore={CURRENT_USER.totalAura} isOwn />
            {/* Other users' stories */}
            {FAKE_USERS.slice(1, 8).map(u => (
                <StoryCircle key={u.id} name={u.displayName} avatarUrl={u.avatarUrl} auraScore={u.totalAura} />
            ))}
        </div>
    );
}
