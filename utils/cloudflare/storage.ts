import sdk, { S3Client } from "@aws-sdk/client-s3";
import { Buffer } from "buffer";

const s3 = new S3Client({
  region: "auto", // Required by AWS SDK, not used by R2
  // Provide your R2 endpoint: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
  endpoint: process.env.S3_URL!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const folders = [
  "avatars",
  "banners",
  "posts",
  "replies",
  "community_icons",
  "community_banners",
  "custom_css",
];

function initFolders() {
  folders.forEach((folder) => {
    s3.send(new sdk.GetObjectCommand({ Key: `${folder}`, Bucket: "diversy" }))
      .then(() => {
        console.log(`Folder ${folder} already exists.`);
      })
      .catch(() => {
        createFolder(folder);
      });
  });
}

function createFolder(folder: string) {
  s3.send(new sdk.PutObjectCommand({ Key: `${folder}`, Bucket: "diversy" }))
    .then((data) => {
      console.log(`Successfully created folder ${folder}: `, data);
    })
    .catch((err) => {
      console.error(`Error creating folder ${folder}: `, err);
    });
}

/**
 *
 * @param data base64 image data
 * @param userId
 * @returns
 */

export function uploadAvatar(data: string, userId: string) {
  return s3.send(
    new sdk.PutObjectCommand({
      Bucket: "diversy",
      Key: `avatars/${userId}.png`,
      Body: Buffer.from(data, "base64"),
      ContentType: "image/png",
      ACL: "public-read",
    }),
  );
}

/**
 *
 * @param data base64 image data
 * @param userId
 * @returns
 */
export function uploadBanner(data: string, userId: string) {
  return s3.send(
    new sdk.PutObjectCommand({
      Bucket: "diversy",
      Key: `banners/${userId}.png`,
      Body: Buffer.from(data, "base64"),
      ContentType: "image/png",
      ACL: "public-read",
    }),
  );
}

export function uploadCommunityIcon(data: string, communityId: string) {
  return s3.send(
    new sdk.PutObjectCommand({
      Bucket: "diversy",
      Key: `community_icons/${communityId}.png`,
      Body: Buffer.from(data, "base64"),
      ContentType: "image/png",
      ACL: "public-read",
    }),
  );
}

export function uploadCssFile(data: string, communityId: string) {
  return s3.send(
    new sdk.PutObjectCommand({
      Bucket: "diversy",
      Key: `custom_css/${communityId}.css`,
      Body: data,
      ContentType: "text/css",
      ACL: "public-read",
    }),
  );
}

type FileType = "avatar" | "banner" | "community_icon" | "css";

export async function getFile(key: string, type: FileType) {
  let folder = "";
  let isImage = false;

  switch (type) {
    case "avatar":
      folder = "avatars";
      isImage = true;
      break;
    case "banner":
      folder = "banners";
      isImage = true;
      break;
    case "community_icon":
      folder = "community_icons";
      isImage = true;
      break;
    case "css":
      folder = "custom_css";
      isImage = false;
      break;
  }

  let res = await s3.send(
    new sdk.GetObjectCommand({
      Bucket: "diversy",
      Key: `${folder}/${key}.png`,
    }),
  );

  if (isImage) {
    const arrayBuffer = await res.Body?.transformToByteArray();
    if (!arrayBuffer) return null;
    return Buffer.from(arrayBuffer).toString("base64url");
  }

  return await res.Body?.transformToString("utf-8");
}

initFolders();
