import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import HomeSkeleton from '@/components/home/HomeSkeleton';

export default function Loading() {
    return (
        <MainLayout>
            <HomeSkeleton />
        </MainLayout>
    );
}
