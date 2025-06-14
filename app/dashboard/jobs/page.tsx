"use client"

import { useState } from "react"
import { JobOffersList } from "@/components/job-offers-list"
import { JobOfferDetails } from "@/components/job-offer-details"
import type { JobOffer } from "@/lib/job-offers-data"

export default function JobsPage() {
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null)

  return (
    <div className="space-y-6 p-6">
      {selectedJob ? (
        <div className="space-y-4">
          <button onClick={() => setSelectedJob(null)} className="text-sm text-muted-foreground hover:text-foreground">
            ← Retour à la liste des offres
          </button>
          <JobOfferDetails job={selectedJob} />
        </div>
      ) : (
        <JobOffersList onSelectJob={setSelectedJob} selectedJobId={selectedJob?.id} />
      )}
    </div>
  )
}
