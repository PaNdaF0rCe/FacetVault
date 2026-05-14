// Kling AI — video generation provider
// Plug in credentials when ready: https://klingai.com/dev/apidocs

export const KLING_CONFIG = {
  name: "Kling AI",
  type: "video",
  modes: ["std", "pro"],
  durations: [5, 10],
};

export async function generateVideo({ prompt, mode = "std", duration = 5 }) {
  // const apiKey = import.meta.env.VITE_KLING_API_KEY;
  // ... Kling REST API call

  return { status: "mock", message: "Kling not yet connected. Copy the prompt into Kling AI." };
}
