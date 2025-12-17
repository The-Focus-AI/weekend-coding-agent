# Generate Video

Generate videos using Google Veo models via `@the-focus-ai/nano-banana`.

## Requirements
- `npx` must be installed.
- `GEMINI_API_KEY` environment variable must be set.

## Usage

```bash
npx @the-focus-ai/nano-banana --video "prompt" --output "output_path" [options]
```

## Prompting Best Practices (Google Veo)

Treat the prompt like a **screenplay** or **shot list**. Act as a Director of Photography.

**Structure:**
**Shot Composition/Camera Movement** → **Subject** → **Action** → **Setting** → **Aesthetics** → **Audio**

**Key Elements:**
- **Camera Movement:** Use specific terms like `dolly in`, `tracking shot`, `pan right`, `truck left`, `handheld`, `locked-off`.
- **Subject & Action:** Describe what the subject is doing clearly.
- **Aesthetics:** "Cinematic", "35mm film", "grainy", "vibrant colors".
- **Audio:** Veo generates audio by default. You can prompt for specific sounds or dialogue (e.g., `Sound of rain`, `Character says: "Hello world"`).

**Workflow:**
- Use **Fast Mode** (`--video-fast`) for testing movements and composition (cheaper).
- Use **Standard Mode** for final high-quality renders.
- Provide a **Reference Image** (`--reference`) ensuring character consistency.
- Provide an **Input Image** (`--file`) to animate a static image (Image-to-Video).

## Parameters

- `prompt` (string, required): The description of the video.
- `output_path` (string, required): File path to save the generated video. Use `--output "path/to/video.mp4"`.
- `input_image` (string, optional): Path to a static image to animate (Image-to-Video). Use `--file "path/to/image.png"`.
- `reference_image` (string, optional): Path to a reference image for character consistency (max 3). Use `--reference "path/to/ref.png"`.
- `duration` (integer, optional): Duration in seconds (4, 6, or 8). Default: 8. Use `--duration 8`.
- `resolution` (string, optional): "1080p" or "720p". Default: "1080p". Use `--resolution 720p`.
    - Note: 1080p requires 8s duration. 720p allows 4, 6, or 8s.
- `aspect` (string, optional): "16:9" (landscape) or "9:16" (portrait). Default: "16:9". Use `--aspect 16:9`.
- `video-fast` (boolean, optional): Use the faster, cheaper Veo model. Use `--video-fast`.
- `no_audio` (boolean, optional): Disable audio generation (saves cost). Use `--no-audio`.

## Examples

### Image-to-Video (Animate an image)
Use the `--file` flag to take a start image and animate it based on the prompt.
```bash
npx @the-focus-ai/nano-banana --video "The character turns and smiles" --file "images/character.jpg" --output "videos/smile.mp4"
```

### Basic Video Generation
```bash
npx @the-focus-ai/nano-banana --video "Cinematic drone shot flying over a lush tropical island, golden hour lighting" --output "videos/island.mp4"
```

### Fast Mode with Specific Settings
Use `--video-fast` for cheaper iterations.
```bash
npx @the-focus-ai/nano-banana --video "A robot dancing in a neon room" --video-fast --duration 4 --resolution 720p --output "videos/robot_dance.mp4"
```

### Using a Reference Image
Use `--reference` to guide the style or character while generating a new scene.
```bash
npx @the-focus-ai/nano-banana --video "The character turns and smiles at the camera" --reference "images/character.jpg" --output "videos/smile.mp4"
```

### Specific Camera Movement and Audio
```bash
npx @the-focus-ai/nano-banana --video "Close up, dolly in on a ticking antique clock. Sound of loud ticking." --output "videos/clock.mp4"
```
