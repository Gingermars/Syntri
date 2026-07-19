import { clerkClient } from "@clerk/express";

// Middleware to attach the user's plan and free-usage count to the request.
// Runs once per request so downstream controllers never need to re-fetch it.
export const auth = async (req, res, next) => {
  try {
    const { userId, has } = await req.auth();
    const hasPremiumPlan = await has({ plan: "premium" });

    req.userId = userId;
    req.plan = hasPremiumPlan ? "premium" : "free";

    if (hasPremiumPlan) {
      // Premium users aren't usage-limited, so there's nothing to fetch or write.
      req.free_usage = 0;
      return next();
    }

    const user = await clerkClient.users.getUser(userId);
    const currentUsage = user.privateMetadata.free_usage;

    if (typeof currentUsage === "number") {
      req.free_usage = currentUsage;
    } else {
      // Only true the first time a free user is seen — free_usage is
      // undefined here, not 0, so this no longer misfires on a real 0.
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: 0 },
      });
      req.free_usage = 0;
    }

    next();
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
