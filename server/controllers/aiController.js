import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";
import { createRequire } from "module";
import { InferenceClient } from "@huggingface/inference";

const require = createRequire(import.meta.url);

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const hf = new InferenceClient(process.env.HUGGING_FACE_API_KEY);

const uploadToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(buffer);
  });

// The openai SDK sets a real .status on API errors (429, 400, etc.) —
// more reliable than matching on error.message text.
const isRateLimitError = (error) => error?.status === 429;

const handleAIError = (res, error, context) => {
  console.log(`[${context}]`, error.message);

  if (isRateLimitError(error)) {
    return res.status(429).json({
      success: false,
      message:
        "You're generating content a little too quickly — please wait a moment and try again.",
    });
  }

  res.json({ success: false, message: error.message });
};

export const generateArticle = async (req, res) => {
  try {
    const { prompt, length } = req.body;
    const { userId, plan, free_usage } = req;

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
      max_tokens: length,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, ${"article"})`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    handleAIError(res, error, "generateArticle");
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { prompt } = req.body;
    const { userId, plan, free_usage } = req;

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
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, ${"blog-title"})`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    handleAIError(res, error, "generateBlogTitle");
  }
};

export const generateImage = async (req, res) => {
  try {
    const { prompt, publish } = req.body;
    const { userId, plan } = req;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available to premium subscribers.",
      });
    }

    const imageBlob = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: prompt,
      // No provider specified on purpose — Hugging Face auto-selects
      // whichever backend currently serves this model, so a single
      // provider going away (like hf-inference just did) won't break this.
    });

    const arrayBuffer = await imageBlob.arrayBuffer();
    const data = Buffer.from(arrayBuffer);
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
    const { userId, plan } = req;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available to premium subscribers.",
      });
    }

    const FormData = require("form-data");
    const axios = require("axios");

    const formData = new FormData();
    formData.append("image_file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    formData.append("size", "auto");

    const response = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      formData,
      {
        headers: {
          "X-Api-Key": process.env.REMOVE_BG_API_KEY,
          ...formData.getHeaders(),
        },
        responseType: "arraybuffer",
      },
    );

    const base64 = `data:image/png;base64,${Buffer.from(response.data).toString("base64")}`;
    const { secure_url } = await cloudinary.uploader.upload(base64);

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${"Remove background from image"}, ${secure_url}, ${"image"})`;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const { object } = req.body;
    const { userId, plan } = req;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available to premium subscribers.",
      });
    }

    const { public_id } = await uploadToCloudinary(req.file.buffer);

    const ImageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
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
    const { userId, plan } = req;
    const resume = req.file;

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

    const dataBuffer = req.file.buffer;

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
      max_tokens: 4000,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${"Review the uploaded resume"}, ${content}, ${"resume-review"})`;

    res.json({ success: true, content });
  } catch (error) {
    handleAIError(res, error, "reviewResume");
  }
};
