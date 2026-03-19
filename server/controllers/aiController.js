import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient, getAuth } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const generateArticle = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { prompt, length } = req.body;

    // plan and free_usage should come from Clerk metadata or your DB
    const user = await clerkClient.users.getUser(userId);
    const plan = user.privateMetadata.plan || "free";
    const free_usage = user.privateMetadata.free_usage || 0;

    if (plan !== "premium" && free_usage > 10) {
      return res.json({
        success: false,
        message:
          "You have reached the free usage limit. Please upgrade to premium.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: length,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, ${"article"} )`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { prompt } = req.body;

    // plan and free_usage should come from Clerk metadata or your DB
    const user = await clerkClient.users.getUser(userId);
    const plan = user.privateMetadata.plan || "free";
    const free_usage = user.privateMetadata.free_usage || 0;

    if (plan !== "premium" && free_usage > 10) {
      return res.json({
        success: false,
        message:
          "You have reached the free usage limit. Please upgrade to premium.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000, // increase from 100 to 1000
    });
    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, ${"blog-title"} )`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateImage = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const { prompt, publish } = req.body;

    const user = await clerkClient.users.getUser(userId);
    const plan = user.privateMetadata.plan || "free";

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available to premium subscribers.",
      });
    }

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "image/png",
        },
        body: JSON.stringify({ inputs: prompt }),
      },
    );

    const arrayBuffer = await response.arrayBuffer();
    const data = Buffer.from(arrayBuffer);

    // Check if HuggingFace returned an error instead of an image
    const responseText = data.toString("utf-8");
    if (responseText.includes("error")) {
      return res.json({ success: false, message: responseText });
    }

    const base64Image = `data:image/png;base64,${data.toString("base64")}`;
    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, ${"image"}, ${publish ?? false})`;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const image = req.file;

    const user = await clerkClient.users.getUser(userId);
    const plan = user.privateMetadata.plan || "free";

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available to premium subscribers.",
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          transformation: [{ effect: "e_background_removal" }],
        },
      ],
    });

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${"Remove background from image"}, ${secure_url}, ${"image"})`;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const image = req.file;
    const { object } = req.body;

    const user = await clerkClient.users.getUser(userId);
    const plan = user.privateMetadata.plan || "free";

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available to premium subscribers.",
      });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const ImageUrl = cloudinary.url(public_id, {
      transformation: [
        { effect: `gen_remove:${object}`, resource_type: "image" },
      ],
    });

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Remove ${object} from image`}, ${ImageUrl}, ${"image"})`;

    res.json({ success: true, content: ImageUrl });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const reviewResume = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const resume = req.file;

    const user = await clerkClient.users.getUser(userId);
    const plan = user.privateMetadata.plan || "free";

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available to premium subscribers.",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size should be less than 5MB.",
      });
    }

    const dataBuffer = fs.readFileSync(resume.path);

    const pdfText = await new Promise((resolve, reject) => {
      const PDFParser = require("pdf2json");
      const pdfParser = new PDFParser();
      pdfParser.on("pdfParser_dataReady", (pdfData) => {
        const text = pdfData.Pages.map((page) =>
          page.Texts.map((t) => decodeURIComponent(t.R[0].T)).join(" "),
        ).join("\n");
        resolve(text);
      });
      pdfParser.on("pdfParser_dataError", reject);
      pdfParser.parseBuffer(dataBuffer);
    });

    const prompt = `Review the following resume and provide detailed feedback on its quality, writing style, and overall effectiveness. Resume Content:\n\n${pdfText}`;
    const response = await AI.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4000, // fixed: length -> 4000
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${"Review the uploaded resume"}, ${content}, ${"resume-review"})`;

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
