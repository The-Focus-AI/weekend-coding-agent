# Best Prompting Practices for Imagen 3 and Google Veo

**Date:** 2024-03-24  
**Topic:** Prompt Engineering Guide for Imagen 3 and Google Veo  
**Research Questions:** How to structure prompts for best results? What are the specific keywords and limitations?

## Abstract

This report details advanced prompt engineering strategies for Google's latest generative media models: **Imagen 3** (image generation) and **Google Veo** (video generation). Research indicates that while both models support natural language, optimal results require distinct structural frameworks. Imagen 3 excels with a **Subject-Context-Style** hierarchy, prioritizing descriptive adjectives and semantic negation over traditional negative prompt lists. Google Veo requires a directorial approach, treating the prompt as a screenplay with specific **Shot Composition, Action, and Audio** cues. This guide provides reusable templates, keyword lists, and technical limitations to maximize output quality.

---

## 1. Introduction

As generative AI moves from experimental to professional workflows, the nuance of prompt engineering has shifted from "cheat codes" to structural direction. Google's Imagen 3 (integrated into Gemini) and Google Veo (available via Vertex AI and limited previews) represent state-of-the-art capabilities in photorealism and temporal consistency. This report synthesizes documentation from Google DeepMind, Google Cloud, and expert user analysis to establish a definitive prompting guide.

---

## 2. Imagen 3: Precision Image Generation

Imagen 3 is designed for high prompt adherence and photorealistic detail. Unlike older models that required "word salad" (e.g., "4k, trending on artstation"), Imagen 3 follows complex natural language instructions.

### 2.1 Optimal Prompt Structure

The most effective prompts follow a hierarchical structure:

1.  **Subject:** Clearly define the main focus immediately.
2.  **Context/Background:** Describe the environment and lighting.
3.  **Style/Medium:** Specify the artistic medium (e.g., "oil painting", "35mm photograph").
4.  **Technical Specs:** Add camera or render details if photorealism is the goal.

> **Template:**
> `[Subject Description] in a [Context/Setting] with [Lighting Conditions]. The image should be a [Style/Medium] captured with [Camera/Lens Specs].`

### 2.2 Key Techniques

*   **Descriptive Density:** Use rich adjectives and adverbs. Instead of "a cat," use "a fluffy, calico cat with piercing green eyes."
*   **Semantic Negative Prompting:** Imagen 3 responds better to positive descriptions of absence than negative constraints.
    *   *Bad:* "No cars."
    *   *Good:* "An empty, deserted street."
*   **Aspect Ratio Management:** Be explicit within the prompt if the interface doesn't offer controls (e.g., "Wide angle landscape view," though widely handled by UI controls in Gemini).
*   **Text Rendering:** Imagen 3 allows for accurate text rendering. Keep text strings under 25 characters and enclose them in quotes.
    *   *Example:* `A neon sign reading "Open Late" glowed in the window.`

### 2.3 Essential Keywords

| Category | Keywords |
| :--- | :--- |
| **Photography** | `35mm`, `macro lens`, `bokeh`, `wide angle`, `long exposure`, `polaroid` |
| **Lighting** | `Golden hour`, `studio lighting`, `volumetric fog`, `hard shadows`, `cinematic lighting` |
| **Styles** | `Minimalist`, `surrealist`, `oil impasto`, `pencil sketch`, `isometric 3D render` |

---

## 3. Google Veo: Directorial Video Generation

Google Veo operates like a virtual film crew. Prompts must account not just for what is seen, but how the camera moves and how time passes.

### 3.1 Optimal Prompt Structure

Veo prompts should read like a screenplay, roughly 100-180 words in length.

**The "S.S.A.S.A." Framework:**
1.  **Shot Composition:** Camera angle and movement.
2.  **Subject:** Who or what is the focus.
3.  **Action:** What is happening (movement, emotion).
4.  **Setting:** The environment.
5.  **Aesthetics:** Lighting and film stock.
6.  **Audio:** (For Veo 3+) Dialogue and sound design.

> **Template:**
> `[Shot Type/Movement] of [Subject] [Action] in [Setting]. The lighting is [Aesthetic]. Audio includes [Sound Effects/Dialogue].`

### 3.2 Advanced Video Controls

#### Camera Movement (Cinematography)
Veo understands professional film terminology. Using these terms significantly improves stability and intent:
*   **Dolly In/Out:** Physical movement of the camera toward/away from the subject.
*   **Tracking Shot:** Following a moving subject.
*   **Truck Left/Right:** Moving the camera laterally.
*   **Pan/Tilt:** Rotating the camera on a fixed axis.
*   **Locked-off:** A completely static camera (useful for subtle motion like rain or conversation).

#### Audio Prompting
Veo 3 can generate synchronized audio.
*   **Dialogue:** Use the format `Character says: "[Line of dialogue]"`.
*   **Ambient:** "Sound of rain on pavement," "bustling city noise."
*   **Constraint:** Add `(no subtitles)` to prevent the model from burning text onto the video.

### 3.3 Consistency Workflows
*   **Ingredients to Video:** To keep characters consistent, generate a reference image in Imagen 3 first, then use it as an input "ingredient" for Veo.
*   **Fast vs. Full:** Use "Veo 3 Fast" for rapid iteration of movement and composition, then switch to the full model for final rendering.

---

## 4. Limitations and Safety

Both models operate under Google's strict safety guidelines.

*   **Duration:** Veo generates short clips (typically ~6 seconds), though "extend" features allow for lengthening.
*   **Safety Filters:**
    *   **Restricted:** Sexual content, real violence, derogatory stereotypes, identifiable PII (Personally Identifiable Information).
    *   **Famous People:** Prompts asking for specific real-world celebrities are often blocked or replaced with generic lookalikes.
*   **Watermarking:** All outputs are embedded with **SynthID**, an imperceptible watermark to identify AI-generated content.
*   **Resolution:** While high definition (1080p) is standard, 4K generation is computationally intensive and not always the default.

---

## 5. Reusable Prompt Templates

### Imagen 3: Photorealistic Portrait
> "A close-up portrait of an elderly watchmaker fixing a complex gear mechanism. The workspace is dimly lit with a warm desk lamp creating strong chiaroscuro contrast. Shot on 85mm portrait lens, f/1.8 aperture, highly detailed skin texture, sharp focus on the hands."

### Google Veo: Cinematic Action Shot
> "A low-angle tracking shot following a futuristic red sports car speeding down a wet neon-lit cyberpunk highway at night. Reflections of neon signs zip across the windshield. The car drifts around a corner with smoke rising from tires. Cinematic lighting, high contrast, 24fps film grain. Audio: Roaring engine noise and screeching tires."

### Google Veo: Dialogue Scene
> "Medium shot of two astronauts inside a spaceship cockpit. The astronaut on the left turns to the other and nods. Character says: 'Systems are fully operational.' (no subtitles). Soft cool LED lighting, 4k resolution. Audio: Low hum of spaceship engine and clear dialogue."

---

## 6. Conclusion

Mastering Imagen 3 and Google Veo requires a shift in mindset. For **Imagen 3**, success lies in "painting with adjectives"—providing rich, descriptive context rather than technical keyword hacking. For **Google Veo**, the user must act as a Director of Photography, explicitly commanding camera movement and temporal action. As these models evolve, the best results will come from cross-pollination: using Imagen to generate style references that anchor Veo's video generation.

## 7. References

1. Google DeepMind. (2025). *Veo: Our most capable video generation model*.  
   [https://deepmind.google/models/veo/](https://deepmind.google/models/veo/)
2. Google Cloud. (2025). *Generate images using Imagen*. Gemini API Docs.  
   [https://ai.google.dev/gemini-api/docs/imagen](https://ai.google.dev/gemini-api/docs/imagen)
3. Google Cloud. (2025). *Veo on Vertex AI video generation prompt guide*.  
   [https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/video-gen-prompt-guide](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/video-gen-prompt-guide)
4. Google Blog. (2025). *Ultimate prompting guide for Veo 3.1*.  
   [https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1)
