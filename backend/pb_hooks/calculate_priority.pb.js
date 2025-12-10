/// <reference path="../pb_data/types.d.ts" />

// Netzon 3D Print Queue - PocketBase Hooks
// Place this file in your PocketBase pb_hooks directory
// Compatible with PocketBase v0.23+

// Calculate priority score when job status changes to 'queued'
onRecordUpdateRequest((e) => {
    const job = e.record;
    const newStatus = job.get("status");
    const oldStatus = job.original().get("status");

    // Trigger when status is 'queued'
    // We run this whenever it's queued to ensure priority is always set/updated
    if (newStatus === "queued") {
        try {
            console.log(`[Priority Hook] Processing Job ${job.getId()}...`);

            // 1. Fetch User's history
            const userId = job.get("user");
            if (!userId) {
                console.log(`[Priority Hook] No user ID found for job ${job.getId()}`);
                return e.next();
            }

            const user = $app.findRecordById("users", userId);
            if (!user) {
                console.log(`[Priority Hook] User record not found: ${userId}`);
                return e.next();
            }

            const totalPrintTime = user.getFloat("total_print_time") || 0; // hours

            // 2. Calculate Karma Score
            // Formula: Higher usage = Lower score
            // Adding +1 to avoid division by zero
            let score = 100 / (totalPrintTime + 1);

            // 3. Gap Filler Logic
            // Small jobs (< 45 minutes) get a priority boost
            // Note: estimated_duration_min comes from the request input effectively if updated
            const estimatedDuration = job.getInt("estimated_duration_min") || 0;

            console.log(`[Priority Hook] Base Score: ${score}, Duration: ${estimatedDuration}, TotalTime: ${totalPrintTime}`);

            if (estimatedDuration > 0 && estimatedDuration < 45) {
                score = score + 50;
                console.log(`[Priority Hook] Applied Gap Filler Bonus (+50)`);
            }

            // 4. Save the calculated priority score
            const finalScore = Math.round(score * 100) / 100;
            job.set("priority_score", finalScore);

            console.log(`[Priority Hook] Final Score set for job ${job.getId()}: ${finalScore}`);
        } catch (err) {
            console.error("[Priority Hook] Error calculating priority:", err);
            // Don't block the update if priority calculation fails, but log it
        }
    }

    return e.next();
}, "jobs");

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
        // If no records found, that's fine - continue
    }

    return e.next();
}, "jobs");
