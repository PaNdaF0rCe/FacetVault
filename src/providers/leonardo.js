// Leonardo AI — image generation provider
// Plug in API key + uncomment when ready: https://docs.leonardo.ai/

export const LEONARDO_CONFIG = {
  name: "Leonardo AI",
  type: "image",
  models: [
    { id: "b24e16ff-06e3-43eb-8d33-4416c2d75876", label: "Leonardo Phoenix" },
    { id: "aa77f04e-3eec-4034-9c07-d0f619684628", label: "Leonardo Kino XL" },
    { id: "5c232a9e-9061-4777-980a-ddc8e65647c6", label: "Leonardo Diffusion XL" },
  ],
  defaultParams: {
    width: 1024,
    height: 1024,
    num_images: 1,
    guidance_scale: 7,
    preset_style: "CINEMATIC",
  },
};

export async function generateImage({ prompt, modelId, params = {} }) {
  // const apiKey = import.meta.env.VITE_LEONARDO_API_KEY;
  // const response = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     prompt,
  //     modelId: modelId || LEONARDO_CONFIG.models[0].id,
  //     ...LEONARDO_CONFIG.defaultParams,
  //     ...params,
  //   }),
  // });
  // return response.json();

  return { status: "mock", message: "Leonardo AI not yet connected. Copy the prompt above into Leonardo AI." };
}
