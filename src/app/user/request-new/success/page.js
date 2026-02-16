import { redirect } from 'next/navigation';

export default async function LegacyRequestSuccessPage({ searchParams }) {
    const params = await searchParams;
    const qs = new URLSearchParams(params || {}).toString();
    redirect(`/user/request-new${qs ? `?${qs}` : ''}`);
}
