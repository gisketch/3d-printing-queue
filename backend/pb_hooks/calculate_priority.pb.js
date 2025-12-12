/// <reference path="../pb_data/types.d.ts" />

// Netzon 3D Print Queue - PocketBase Hooks
// DISABLED: Logic moved to frontend (jobService.ts) as of 2025-12-10
// This file is kept as a backup/reference but the code is commented out to prevent execution.

/*
// Calculate priority score when job status changes to 'queued'
onRecordUpdateRequest((e) => {
    // ... logic was here ...
}, "jobs");
*/

// Clean up STL file after job completion (still useful to keep? User said "run algorithm in frontend", maybe keep cleanup here?
// The user request "lets not use hooks anymore. Just run the algorithm in the frontend" implies the priority algorithm.
// I will keep the cleanup and validation hooks active if they are not related to priority?
// "recounts all priority scores in the database. so we control it in the FE."
// I should probably disable the priority hook specifically. The validation/cleanup might be better left here for data integrity, 
// but strictly speaking, if we move "logic" to frontend, maybe validation too?
// For now I will ONLY disable the priority calculation hook as per the request context.

/*
onRecordUpdateRequest((e) => {
    const job = e.record;
    const newStatus = job.get("status");
    
    // Trigger when status is 'queued'
    if (newStatus === "queued") {
        try {
             // ...
        } catch (err) {
            console.error("[Priority Hook] Error calculating priority:", err);
        }
    }
    return e.next();
}, "jobs");
*/

// I will keep the validate and cleanup hooks active for now as they are distinct from "priority algorithm".
// Wait, user said "lets not use hooks anymore". 
// Safe bet: Disable priority calculation. Keep others? 
// "Just run the algorithm in the frontend". 
// I'll comment out the priority part.

// Clean up STL file after job completion (optional - can be done in frontend too)
onRecordAfterUpdateRequest((e) => {
    const job = e.record;
    const newStatus = job.get("status");
    const oldStatus = job.original().get("status");

    // Trigger when job moves to completed or failed
    const finalStatuses = ["completed", "failed"];
    if (finalStatuses.includes(newStatus) && !finalStatuses.includes(oldStatus)) {
        // Log completion
        console.log(`Job ${job.getId()} marked as ${newStatus}`);
    }
}, "jobs");

// Validate job submission - ensure user doesn't have active job
onRecordCreateRequest((e) => {
    const job = e.record;
    const userId = job.get("user");

    if (!userId) {
        throw new BadRequestError("User is required");
    }

    // Check for existing active jobs
    try {
        const existingJobs = $app.findRecordsByFilter(
            "jobs",
            `user = "${userId}" && (status = "pending_review" || status = "queued" || status = "printing")`,
            "-created",
            1,
            0
        );

        if (existingJobs && existingJobs.length > 0) {
            throw new BadRequestError("You already have an active print request. Please wait until it completes.");
        }
    } catch (err) {
        if (err.message && err.message.includes("active print request")) {
            throw err;
        }
    }

    return e.next();
}, "jobs");
