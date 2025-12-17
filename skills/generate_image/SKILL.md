# Generate Image

Generate or edit images using Gemini models via `@the-focus-ai/nano-banana`.

## Requirements
- `npx` must be installed.
- `GEMINI_API_KEY` environment variable must be set.

## Usage

```bash
npx @the-focus-ai/nano-banana "prompt" --output "output_path" [options]
```

## Prompting Best Practices (Imagen 3)

For best results, construct your prompt using this structure:
**Subject** → **Context/Background** → **Style/Medium** → **Technical Specs**

- **Subject:** Clearly define the main subject.
- **Context:** Describe the environment and lighting.
- **Style:** Specify the artistic style (e.g., "oil painting", "cinematic photo", "3d render").
- **Technical Specs:** For photorealism, specify camera parameters (e.g., "85mm lens", "f/1.8 aperture", "4k", "HDR").

**Tips:**
- **Natural Language:** Use natural sentences rather than just keywords. Paint with adjectives.
- **Semantic Negative Prompting:** Instead of saying what *not* to include (flakey in this model), describe the absence positively (e.g., "empty sky", "deserted street").
- **Text:** If you want text, keep it short and enclose it in quotes.

## Parameters

- `prompt` (string, required): The description of the image to generate.
- `output_path` (string, required): File path to save the generated image (e.g., "images/sunset.png").
- `input_image` (string, optional): Path to an existing image to edit.
- `use_flash` (boolean, optional): Set to `true` to use the faster Gemini 2.0 Flash model.

## Examples

### Generate a new image
```bash
npx @the-focus-ai/nano-banana "A futuristic city skyline at sunset, cyberpunk style, neon lights, 8k resolution, cinematic lighting" --output "images/cyberpunk_city.png"
```

### Edit an existing image
```bash
npx @the-focus-ai/nano-banana "Make the sky purple and add a spaceship" --file "images/original.png" --output "images/edited.png"
```

### Fast generation
```bash
npx @the-focus-ai/nano-banana "A cute cartoon cat" --flash --output "images/cat.png"
```
