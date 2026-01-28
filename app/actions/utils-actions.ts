"use server";

export async function downloadImage(url: string) {
  "use server";
  try {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type");
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return { success: true, data: `data:${contentType};base64,${base64}` };
  } catch (error) {
    return { success: false };
  }
}
