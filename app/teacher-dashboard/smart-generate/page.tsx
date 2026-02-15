"use client";

import GeneratorPage from "@/app/generate/page";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function EmbeddedGeneratePage() {
    return (
        <>
            <DashboardHeader title="Smart Paper Wizard" />
            <GeneratorPage embedded={true} />
        </>
    );
}
