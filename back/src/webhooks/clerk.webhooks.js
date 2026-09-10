import express from "express";
import User from "../models/User.js";
import { verifyWebhook } from "@clerk/backend/webhooks";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // const signinSecret = process.env.CLERK_WEBHOOKS_SIGNIN_SECRET;
    const signingSecret = process.env.CLERK_WEBHOOKS_SIGNIN_SECRET;
    if (!signingSecret) {
      res.send(503).json({ message: "webhook secret is not provided" });
      return;
    }

    const payload = Buffer.isBuffer(req.body)
      ? req.body.toString("utf-8")
      : String(req.body);
    const request = new Request("http://internal/webhooks/clerk", {
      method: "POST",
      headers: new Headers(req.headers),
      body: payload,
    });

    const evt = await verifyWebhook(request, { signingSecret });

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const u = evt.data;

      const email =
        u.email_addresses?.find((e) => e.id === u.primary_email_address_id)
          ?.email_address ?? u.email_addresses?.[0]?.email_address;

      const fullName =
        [u.first_name, u.last_name].filter(Boolean).join(" ") ||
        u.username ||
        email?.split("@")[0];

      await User.findOneAndUpdate(
        { clerkId: u.id },
        { clerkId: u.id, email, fullName, profilePic: u.image_url },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
    }

    if (evt.type === "user.deleted") {
      if (evt.data.id) await User.findOneAndDelete({ clerkId: evt.data.id });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("error in clerk webhoook:", error);
    res.status(400).json({ message: "Webhook verification failed" });
  }
});

export default router;
