/// <reference path="../pb_data/types.d.ts" />

// Netzon 3D Print Queue - PocketBase Hooks
// Place this file in your PocketBase pb_hooks directory

// Calculate priority score when job status changes to 'queued'
onRecordBeforeUpdateRequest((e) => {
    const job = e.record;
    const oldJob = e.originalCopy;

    // Only trigger when status changes to 'queued'
    if (job.get("status") === "queued" && oldJob.get("status") !== "queued") {
        try {
            // 1. Fetch User's history
            const userId = job.get("user");
            const user = $app.dao().findRecordById("users", userId);
            const totalPrintTime = user.getFloat("total_print_time") || 0; // hours

            // 2. Calculate Karma Score
            // Formula: Higher usage = Lower score
            // Adding +1 to avoid division by zero
            let score = 100 / (totalPrintTime + 1);

            // 3. Gap Filler Logic
            // Small jobs (< 45 minutes) get a priority boost
            const estimatedDuration = job.getInt("estimated_duration_min") || 0;
            if (estimatedDuration > 0 && estimatedDuration < 45) {
                score = score + 50;
            }

            // 4. Save the calculated priority score
            job.set("priority_score", Math.round(score * 100) / 100);

            console.log(`Priority calculated for job ${job.getId()}: ${score} (user print time: ${totalPrintTime}h)`);
        } catch (err) {
            console.error("Error calculating priority:", err);
        }
    }
}, "jobs");

// Clean up STL file after job completion (optional - can be done in frontend too)
onRecordAfterUpdateRequest((e) => {
    const job = e.record;
    const oldJob = e.originalCopy;

    // Trigger when job moves to completed or failed
    const finalStatuses = ["completed", "failed"];
    if (finalStatuses.includes(job.get("status")) && !finalStatuses.includes(oldJob.get("status"))) {
        // Log completion
        console.log(`Job ${job.getId()} marked as ${job.get("status")}`);
    }
}, "jobs");

// Validate job submission - ensure user doesn't have active job
onRecordBeforeCreateRequest((e) => {
    const job = e.record;
    const userId = job.get("user");

    if (!userId) {
        throw new BadRequestError("User is required");
    }

    // Check for existing active jobs
    const activeStatuses = ["pending_review", "queued", "printing"];
    
    try {
        const existingJobs = $app.dao().findRecordsByFilter(
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
}, "jobs");
