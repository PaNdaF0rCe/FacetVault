// Luma Dream Machine — video generation provider
// Plug in API key when ready: https://lumalabs.ai/dream-machine/api

export const LUMA_CONFIG = {
  name: "Luma Dream Machine",
  type: "video",
  aspectRatios: ["16:9", "9:16", "1:1"],
  durations: [5, 10],
};

export async function generateVideo({ prompt, aspectRatio = "9:16", duration = 5 }) {
  // const apiKey = import.meta.env.VITE_LUMA_API_KEY;
  // const response = await fetch("https://api.lumalabs.ai/dream-machine/v1/generations", {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  //   body: JSON.stringify({ prompt, aspect_ratio: aspectRatio, duration }),
  // });
  // return response.json();

  return { status: "mock", message: "Luma not yet connected. Copy the prompt into Luma Dream Machine." };
}
