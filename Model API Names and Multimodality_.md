# **Integrating Advanced AI Models: A Developer's Guide to API Model Names and Multimodal File Handling**

## **1\. Introduction**

**Purpose:** This report serves as a technical guide for developers, providing an up-to-date overview of the latest API model names for Google Gemini, Anthropic Claude, Mistral AI, and models accessible via OpenRouter.

**Focus:** The core focus is on specific model identifiers required for API integration. As AI capabilities expand, particularly into multimodal interactions, understanding how to effectively use these models with various data types is essential.

**Key Feature:** A significant component of this report is the inclusion of practical TypeScript code examples demonstrating how to attach files for multimodal interactions with models that support such capabilities. These examples aim to provide developers with a starting point for integrating image, document, and other file-based inputs.

**Importance:** The AI landscape is characterized by rapid evolution, with new models and API updates being released frequently. Having access to precise model names and robust integration patterns is crucial for leveraging the full potential of these advanced AI systems. This report aims to consolidate this information from the latest available documentation, enabling developers to build more sophisticated and context-aware applications.

## **2\. Google Gemini: API Model Names and Multimodal Integration**

Overview of Google Gemini Models for API Calls:  
Google offers a diverse suite of Gemini models through its API, catering to various tasks from general text generation to complex multimodal understanding and specialized functions like audio processing and image generation.1 These models are designed to handle a wide array of inputs and produce varied outputs, making them versatile tools for developers. When interacting with the Gemini API, it is crucial to use the exact model ID as specified in the official documentation (e.g., gemini-2.5-pro-preview-06-05) to ensure correct model selection and functionality.  
Latest API Model Names for Google Gemini:  
The following table details some of the latest Gemini models available for API calls, highlighting their multimodal capabilities and optimized use cases. This information is critical for developers selecting the appropriate model for their specific application needs, particularly when dealing with multimodal data.  
**Table: Latest Google Gemini API Model Names**

| Model Variant (User-Friendly Name) | API Model ID | Key Multimodal Inputs Supported | Optimized For / Key Features |
| :---- | :---- | :---- | :---- |
| Gemini 2.5 Pro Preview | gemini-2.5-pro-preview-06-05 | Audio, images, videos, text | Enhanced thinking and reasoning, multimodal understanding, advanced coding.1 |
| Gemini 2.5 Flash Preview 05-20 | gemini-2.5-flash-preview-05-20 | Audio, images, videos, text | Adaptive thinking, cost efficiency.1 |
| Gemini 2.5 Flash Native Audio | gemini-2.5-flash-preview-native-audio-dialog & gemini-2.5-flash-exp-native-audio-thinking-dialog | Audio, videos, text (input); Text, audio (output) | High quality, natural conversational audio outputs, with or without thinking.1 |
| Gemini 2.0 Flash Preview Image Generation | gemini-2.0-flash-preview-image-generation | Audio, images, videos, text (input); Text, images (output) | Conversational image generation and editing.1 |
| Gemini 1.5 Pro | gemini-1.5-pro | Audio, images, videos, text | Complex reasoning tasks requiring more intelligence.1 |
| Gemini 1.5 Flash | gemini-1.5-flash | Audio, images, videos, text | Fast and versatile performance across a diverse variety of tasks.1 |
| Imagen 3 | imagen-3.0-generate-002 | Text (input); Images (output) | Our most advanced image generation model.1 |
| Veo 2 | veo-2.0-generate-001 | Text, images (input); Video (output) | High quality video generation.1 |

The rapid introduction of new models, many of which are in "Preview" or "Experimental" stages 1, signifies a dynamic development environment. For instance, the prevalence of "preview" in model names like gemini-2.5-flash-preview-05-20 and gemini-2.5-pro-preview-06-05 suggests ongoing iteration and refinement by Google. This implies that developers leveraging these cutting-edge models should anticipate potential API modifications, feature adjustments, or changes in pricing structures. Diligent monitoring of Google's official announcements and documentation is essential. For applications requiring high stability, opting for "Stable" versions, such as gemini-2.0-flash-001 (a stable variant of gemini-2.0-flash 1), is generally a more conservative approach, although the current focus is on the latest available models.

Furthermore, Google's strategy appears to involve the release of Gemini variants optimized for highly specific tasks, moving beyond general multimodal capabilities. Models such as gemini-2.5-flash-preview-native-audio-dialog for native audio processing or gemini-2.0-flash-preview-image-generation for image creation 1 illustrate a trend towards providing specialized tools. This modularity can be advantageous, allowing developers to select the most performant and cost-effective model for distinct components of their applications. For example, a dedicated Text-to-Speech (TTS) model might be preferred over a larger, more general multimodal model if only audio generation is required. However, this also introduces a layer of complexity in the model selection process, requiring a clearer understanding of each variant's specific strengths.

It is also important to note that third-party services or aggregators might use their own aliases for Google's models. For example, one source indicated gemini2flash as an API call name for a "Gemini 2.5 Pro / Flash" equivalent on a platform like Perplexity AI.3 This contrasts sharply with Google's official, more descriptive naming conventions (e.g., gemini-2.5-flash-preview-05-20 1). Such discrepancies highlight the critical importance of relying exclusively on the official documentation from the primary provider—Google, in this instance—when making direct API calls. Using aliases from other platforms will not be compatible with Google's direct API endpoints.

Identifying Multimodal Gemini Models:  
Many Gemini models are inherently designed for multimodal inputs. Documentation snippets 1 clearly list "Input(s)" such as "Audio, images, videos, and text" for prominent models like gemini-2.5-pro-preview-06-05 and gemini-1.5-flash. Specialized models like gemini-2.0-flash-preview-image-generation are explicitly tailored for tasks involving particular modalities, such as image generation from text or other inputs. To confirm a model's multimodal capabilities, developers should consult the "Supported data types" or "Input(s)" section within the official model documentation.1  
TypeScript Example: Attaching Files to a Gemini Model  
Google's Generative AI SDK for TypeScript (@google/genai) facilitates multimodal input, including the uploading of files or the direct embedding of file data within API requests.4 The following example demonstrates initializing the GoogleGenAI client and preparing image data by reading a local file into a Buffer and converting it to a base64 string for inlineData. The SDK also supports file uploads through methods like ai.files.upload(), which can be useful for managing larger files or when a file URI is preferred.4 This latter approach often integrates with Google Cloud Storage, a common pattern for cloud-based AI services handling substantial or persistent file data. Developers need to choose the file handling method that best suits their application's context, considering factors like file size, whether the application is server-side or client-side, and if the files are temporary or need to be persisted.

TypeScript

import { GoogleGenAI } from "@google/genai";  
import \* as fs from "fs";  
import { Buffer } from "buffer"; // Ensure Buffer is correctly imported for Node.js environments

// Ensure your API key is set as an environment variable or replace "YOUR\_API\_KEY"  
const GEMINI\_API\_KEY \= process.env.GEMINI\_API\_KEY |  
| "YOUR\_API\_KEY";  
const genAI \= new GoogleGenAI({ apiKey: GEMINI\_API\_KEY });

// Function to convert a local file to a generative part for inline data  
function fileToGenerativePart(path: string, mimeType: string) {  
  if (\!fs.existsSync(path)) {  
    throw new Error(\`File not found: ${path}\`);  
  }  
  return {  
    inlineData: {  
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),  
      mimeType  
    },  
  };  
}

async function runGeminiMultimodal() {  
  // For multimodal models. \`gemini-1.5-pro\` is a strong multimodal model.  
  // Other options include \`gemini-1.5-flash\` or the latest preview versions like \`gemini-2.5-pro-preview-06-05\`.  
  // Always check the official documentation for the latest model capabilities.  
  const model \= genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt \= "Describe this image and speculate on what might be happening within the scene.";  
  const imagePath \= "path/to/your/image.jpg"; // \<\<\<\<\<\<\<\<\<\< REPLACE WITH YOUR ACTUAL IMAGE PATH  
  const imageMimeType \= "image/jpeg"; // Adjust based on your image type (e.g., "image/png")

  try {  
    const imagePart \= fileToGenerativePart(imagePath, imageMimeType);

    // Constructing the request with both text and image parts  
    const contents \= \[{ role: "user", parts: \[{text: prompt}, imagePart\] }\];

    console.log("Sending request to Gemini with image...");  
    const result \= await model.generateContent({contents});  
    const response \= result.response;  
    console.log("Response from Gemini:");  
    console.log(response.text());

  } catch (error) {  
    // Log the error object itself for more details  
    console.error("Error generating content from Gemini:", error);  
    if (error instanceof Error && error.message.includes("File not found")) {  
        console.error("Please ensure the imagePath variable in the script points to an existing image file.");  
    }  
  }  
}

runGeminiMultimodal();

This example illustrates how to construct a request incorporating both textual prompts and image data. It leverages the inlineData structure, which involves providing the image as a base64 encoded string along with its MIME type.4 The fileToGenerativePart utility function, adapted from documentation examples 5, handles the conversion of a local file into the required format. Installation and basic initialization of the SDK are prerequisites.6

## **3\. Anthropic Claude: API Model Names and Multimodal Integration**

Overview of Anthropic Claude Models for API Calls:  
Anthropic's Claude models are recognized for their robust performance in complex reasoning, nuanced dialogue, and creative text generation. The models are typically offered in different tiers—Opus, Sonnet, and Haiku—which provide a balance between advanced capability, speed, and operational cost.7 A significant feature across recent Claude models is their consistent support for vision capabilities, allowing them to process and understand image inputs alongside text.7  
Latest API Model Names for Anthropic Claude:  
The table below outlines the latest Claude models available for direct API integration, specifying their API names and key characteristics. This aids developers in selecting the most suitable Claude model based on their application's multimodal and performance requirements.  
**Table: Latest Anthropic Claude API Model Names**

| Model Family | Anthropic API Model Name (and latest alias if applicable) | Vision Support | Key Strengths |
| :---- | :---- | :---- | :---- |
| Claude Opus 4 | claude-opus-4-20250514 | Yes | Highest intelligence and capability.7 |
| Claude Sonnet 4 | claude-sonnet-4-20250514 | Yes | High intelligence and balanced performance.7 |
| Claude Sonnet 3.7 | claude-3-7-sonnet-20250219 (claude-3-7-sonnet-latest) | Yes | High intelligence with toggleable extended thinking.7 |
| Claude Haiku 3.5 | claude-3-5-haiku-20241022 (claude-3-5-haiku-latest) | Yes | Fastest model, intelligence at blazing speeds.7 |
| Claude Sonnet 3.5 (upgraded) | claude-3-5-sonnet-20241022 (claude-3-5-sonnet-latest) | Yes | Upgraded version of previous intelligent model.7 |
| Claude Opus 3 | claude-3-opus-20240229 (claude-3-opus-latest) | Yes | Powerful model for complex tasks.7 |

A notable characteristic of Anthropic's recent model releases is the consistent inclusion of vision capabilities across all major families (Opus, Sonnet, Haiku, spanning versions 3.x and 4).7 This consistency simplifies the selection process for developers requiring image understanding; the primary decision factors become the desired trade-offs between intelligence, speed, and cost, rather than searching for a specific vision-enabled variant.

Anthropic is also developing a dedicated "Files API," currently in beta, designed to manage and reuse uploaded files such as images, PDFs, and other documents.8 This API aims for a "create-once, use-many-times" approach, which is particularly beneficial for efficiency when dealing with large or frequently accessed files, as it obviates the need for repeated uploads. The API supports operations like upload, download (for files created by the code execution tool only, not user-uploaded files), list, retrieve, and delete. To use this beta feature, requests must include the anthropic-beta: files-api-2025-04-14 header. Given its beta status, developers should be prepared for potential changes and are encouraged to provide feedback. The current limitation that user-uploaded files cannot be downloaded via this API is an important consideration.8

The versioning (e.g., Claude 3.5, 3.7, 4\) and tiering (Opus, Sonnet, Haiku) system employed by Anthropic is clear and informative.7 This structured approach, which outlines model strengths (e.g., Opus for "Highest level of intelligence," Haiku for "Intelligence at blazing speeds"), assists developers in making well-informed decisions aligned with their specific requirements for performance, cost, and task complexity. The provision of "latest" aliases (e.g., claude-3-7-sonnet-latest) offers a convenient method for developers to stay current with the most recent sub-version of a particular model tier.

Interaction with the Anthropic API for messages is standardized, typically involving JSON request and response bodies and requiring an x-api-key and an anthropic-version header for authentication and versioning.9 While the official SDKs, such as @anthropic-ai/sdk for TypeScript, abstract these low-level details, an understanding of the underlying mechanism is beneficial for troubleshooting and advanced configurations. This standardization simplifies the integration process once the basic authentication and request structures are comprehended.

Identifying Multimodal Claude Models:  
All major recent Claude models, including Opus 4, Sonnet 4, Sonnet 3.7, Haiku 3.5, Sonnet 3.5, Opus 3, Sonnet 3, and Haiku 3, are documented as supporting vision ("Vision: Yes").7 Anthropic's documentation further details how to use files, including images and PDFs, with these models. This is primarily achieved either through their beta Files API or by directly embedding image data (e.g., base64 encoded) within the messages array sent to the API.8  
TypeScript Example: Attaching Files using Anthropic's SDK (Inline Images)  
Anthropic provides the @anthropic-ai/sdk for TypeScript integrations.9 The following example demonstrates sending image data directly (base64 encoded) within the messages array, a common pattern for interacting with vision-capable models. While the Files API offers advantages for reusable files, its beta status and the additional step of file uploading make the inline method more straightforward for a direct demonstration of multimodal input.

TypeScript

import Anthropic from "@anthropic-ai/sdk";  
import \* as fs from "fs";  
import { Buffer } from "buffer"; // Ensure Buffer is correctly imported for Node.js

// Ensure your API key is set as an environment variable or replace "YOUR\_ANTHROPIC\_API\_KEY"  
const anthropic \= new Anthropic({  
  apiKey: process.env.ANTHROPIC\_API\_KEY |  
| "YOUR\_ANTHROPIC\_API\_KEY",  
});

async function runClaudeMultimodalInline() {  
  const imagePath \= "path/to/your/image.png"; // \<\<\<\<\<\<\<\<\<\< REPLACE WITH YOUR ACTUAL IMAGE PATH  
  // Supported MIME types include image/jpeg, image/png, image/gif, image/webp \[8\]  
  const imageMimeType \= "image/png"; 

  if (\!fs.existsSync(imagePath)) {  
    console.error(\`File not found: ${imagePath}. Please update the path.\`);  
    return;  
  }

  const imageDataBuffer \= fs.readFileSync(imagePath);  
  const imageBase64 \= imageDataBuffer.toString('base64');

  // Using a model known for vision capabilities, e.g., claude-3-5-sonnet-latest or a specific version.  
  // \[7\] and S3 confirm vision support for models like claude-3-5-sonnet-20241022.  
  const modelName \= "claude-3-5-sonnet-20241022"; // Or use a 'latest' alias like "claude-3-5-sonnet-latest"

  console.log(\`Sending request to Claude (${modelName}) with inline image...\`);  
  try {  
    const message \= await anthropic.messages.create({  
      model: modelName,  
      max\_tokens: 1024,  
      messages:,  
        },  
      \],  
    });  
    console.log("Response from Claude:");  
    // The response content is an array of blocks. We expect a text block.  
    if (Array.isArray(message.content) && message.content.length \> 0) {  
        message.content.forEach(block \=\> {  
            if (block.type \=== 'text') {  
                console.log(block.text);  
            }  
        });  
    } else {  
      // Fallback if the structure is unexpected  
      console.log(JSON.stringify(message.content, null, 2));  
    }  
  } catch (error) {  
    console.error("Error sending message to Claude:", error);  
  }  
}

runClaudeMultimodalInline();

Conceptual Use of Files API:  
For the Files API (currently in beta 8), the process would involve two main steps:

1. **Upload File:** Use an SDK method 8 to upload the file (e.g., a PDF or image). This action would return a unique file\_id. This step requires the anthropic-beta: files-api-2025-04-14 header, which the SDK should handle if properly configured or allow for custom header injection.  
2. **Reference File in Message:** In a subsequent anthropic.messages.create call, reference the uploaded file using its file\_id within the content array. For an image, this would look like: {"type": "image", "source": {"type": "file", "file\_id": "YOUR\_FILE\_ID"}}. For a document like a PDF, it would be: {"type": "document", "source": {"type": "file", "file\_id": "YOUR\_FILE\_ID"}, "title": "Optional Document Title", "context": "Optional context about the document"}.8

This approach is beneficial for reusing files across multiple API calls without re-uploading the content each time.

## **4\. Mistral AI: API Model Names and Multimodal Integration**

Overview of Mistral AI Models for API Calls:  
Mistral AI provides a portfolio of models that includes both open-weight versions and proprietary "Premier models" accessible through their official API.12 These models cater to a range of applications, including general text generation, specialized coding tasks, and multimodal functions such as Optical Character Recognition (OCR). For direct API integration, relying on Mistral AI's official documentation is key to identifying the correct API endpoint names and understanding model capabilities.  
Latest API Model Names for Mistral AI (Official API):  
The following table details Mistral's premier models and other relevant offerings available via their direct API, focusing on their API endpoint names and multimodal features. This is crucial for developers seeking to integrate these models directly.  
**Table: Latest Mistral AI API Model Names (Official API)**

| Model Category | Model Name (User-Friendly) | API Endpoint Name | Key Multimodal Capabilities / Description | Max Tokens |
| :---- | :---- | :---- | :---- | :---- |
| Premier | Magistral Medium | magistral-medium-2506 | Frontier-class reasoning model.12 | 40k |
| Premier | Mistral Medium | mistral-medium-2505 | Frontier-class multimodal model.12 | 128k |
| Premier | Codestral | codestral-2501 | Cutting-edge language model for coding.12 | 256k |
| Premier | Mistral OCR | mistral-ocr-2505 | OCR service for extracting interleaved text and images.12 | N/A |
| Premier | Mistral Large | mistral-large-2411 | Top-tier reasoning model for high-complexity tasks.12 | 128k |
| Premier | Pixtral Large | pixtral-large-2411 | Frontier-class multimodal model.12 | 128k |
| Premier | Mistral Embed | mistral-embed | State-of-the-art semantic for extracting representation of text extracts.12 | 8k |
| Legacy | Mistral 7B | open-mistral-7b | First dense model (legacy, alternative: ministral-8b-latest).12 | 32k |
| Legacy | Mixtral 8x7B | open-mixtral-8x7b | First sparse mixture-of-experts (legacy, alt: mistral-small-latest).12 | 32k |

Mistral AI's strategy involves a diversified model portfolio, encompassing both open-weight models (though some are now legacy) and "Premier" proprietary models accessible via their API.12 This dual approach caters to different segments of the developer community and various use cases. The Premier models are likely to offer enhanced performance or unique features through a paid API service, while open models historically have fostered broader community engagement and accessibility. Furthermore, the availability of specialized models like Mistral OCR for document understanding 12 and Codestral for code-related tasks 12 indicates a focus on providing optimized solutions for specific problem domains.

Mistral AI is actively developing and releasing models with multimodal capabilities. mistral-medium-2505 and pixtral-large-2411 are explicitly identified as "multimodal model" in their official documentation.12 The Mistral OCR service is specifically designed to handle documents with interleaved text and images.12 Other reports also mention "Mistral Medium 3" as possessing multimodal understanding capabilities.14 This evolution allows developers to leverage Mistral models for tasks involving image and document analysis. The precise method for providing file input can vary, for example, using a URL for a document\_url type content part 15, or potentially through a direct file upload mechanism within their SDK if available for broader multimodal tasks.

Developers can access Mistral models through several channels: their direct API 12, cloud platforms such as Google Vertex AI 13, and wrapper libraries like LiteLLM.16 It is important to recognize that model names and API interaction specifics might differ depending on the chosen access point. For instance, Mistral models on Vertex AI have specific identifiers like mistral-small-2503 13, while LiteLLM often uses a mistral/ prefix for its model names.16 For direct API integration, Mistral's official documentation, particularly the API Endpoints column 12, serves as the definitive source for model names.

Regarding file handling, documentation examples show the use of a document\_url to pass multimodal input, particularly for document analysis tasks.15 The same source also contains commented-out code for client.files.upload, suggesting that the SDK may include or is developing a mechanism for direct file uploads from local storage. For publicly accessible files, providing a URL is a straightforward method. However, for local files or private data, a robust client.files.upload feature, if fully supported and documented by Mistral for general multimodal use cases, would be essential. Developers should consult the latest official Mistral SDK documentation for the current status, capabilities, and recommended usage patterns for this feature.

Identifying Multimodal Mistral AI Models:  
Mistral explicitly offers models with multimodal capabilities. As listed in their official documentation 12, mistral-medium-2505 and pixtral-large-2411 are designated as "multimodal model." The Mistral OCR service (mistral-ocr-2505) is specifically designed for document understanding tasks involving interleaved text and images.12 Additionally, documentation for Mistral models on Vertex AI mentions Mistral Small 3.1 (25.03) (API name mistral-small-2503) as having "multimodal capabilities" and the ability to process "visual inputs" 13, indicating that multimodal features are present within this model family.  
TypeScript Example: Attaching Files to a Mistral AI Model (e.g., for Document Understanding via URL)  
Mistral AI provides the @mistralai/mistralai SDK for JavaScript and TypeScript development. The following example adapts a documented approach 15 to demonstrate how to pass a publicly accessible document URL to a Mistral model for tasks like document understanding. The original source also hints at a client.files.upload method for local files, which would be the preferred approach if available and suitable for the specific file type and use case beyond just URLs.

TypeScript

import { Mistral } from "@mistralai/mistralai";  
// import \* as fs from 'fs'; // Uncomment if using local file upload

// Ensure your API key is set as an environment variable or replace "YOUR\_MISTRAL\_API\_KEY"  
const apiKey \= process.env.MISTRAL\_API\_KEY |  
| "YOUR\_MISTRAL\_API\_KEY";  
const client \= new Mistral({ apiKey: apiKey });

async function runMistralDocumentUnderstanding() {  
  // \[15\] uses mistral-small-latest with document\_url.  
  // For dedicated OCR, mistral-ocr-2505 is listed in.\[12\]  
  // For general multimodal tasks, mistral-medium-2505 is a frontier multimodal model.\[12\]  
  // We will use mistral-medium-2505 as it's a strong multimodal model.  
  const modelName \= "mistral-medium-2505"; 

  // Using a publicly accessible document URL as shown in \[15\]  
  const documentUrl \= "https://arxiv.org/pdf/1805.04770.pdf"; // \<\<\<\<\<\<\<\<\<\< REPLACE WITH YOUR PUBLIC DOCUMENT URL

  // Conceptual local file upload \[15\]  
  // if (process.env.USE\_LOCAL\_FILE \=== "true") {  
  //   const localFilePath \= 'path/to/your/document.pdf'; // \<\<\<\<\<\<\<\<\<\< REPLACE  
  //   if (\!fs.existsSync(localFilePath)) {  
  //     console.error(\`Local file not found: ${localFilePath}\`);  
  //     return;  
  //   }  
  //   try {  
  //     console.log("Uploading local file to Mistral...");  
  //     const uploadedFile \= await client.files.upload({  
  //       file: { fileName: "uploaded\_document.pdf", content: fs.readFileSync(localFilePath) },  
  //       purpose: "ocr" // Or another purpose like "multimodal\_input" if supported  
  //     });  
  //     console.log("File uploaded, ID:", uploadedFile.id);  
  //     const signedUrlResponse \= await client.files.getSignedUrl({ fileId: uploadedFile.id });  
  //     documentUrlToUse \= signedUrlResponse.url; // This might be a temporary signed URL  
  //     console.log("Using signed URL for uploaded file:", documentUrlToUse);  
  //   } catch (uploadError) {  
  //     console.error("Error uploading local file to Mistral:", uploadError);  
  //     return;  
  //   }  
  // }  
  // let documentUrlToUse \= documentUrl; // Default to public URL

  console.log(\`Sending request to Mistral (${modelName}) with document URL: ${documentUrl}\`);  
  try {  
    // The Mistral Node SDK uses client.chat() for chat completions.  
    // \[15\] uses client.complete() which might be from an older SDK version or Python SDK.  
    const chatResponse \= await client.chat({  
      model: modelName,  
      messages: \[  
        {  
          role: "user",  
          content: \[15\],  
        },  
      \],  
    });

    console.log("Response from Mistral:");  
    if (chatResponse.choices && chatResponse.choices.length \> 0 && chatResponse.choices.message) {  
      console.log(chatResponse.choices.message.content);  
    } else {  
      console.log("Unexpected response structure:", JSON.stringify(chatResponse, null, 2));  
    }  
  } catch (error) {  
    console.error("Error sending request to Mistral:", error);  
  }  
}

runMistralDocumentUnderstanding();

This TypeScript example primarily follows the pattern of using a document\_url as seen in available documentation.15 It also includes commented-out conceptual code for local file uploads using client.files.upload, advising developers to consult the latest official Mistral SDK documentation for the maturity, exact usage, and supported file types for this feature, especially for general multimodal inputs beyond specific OCR workflows. The document\_url type within the content array needs to be a supported feature of the model and SDK version being used.

## **5\. OpenRouter: Accessing Models via Aggregated API**

Overview of OpenRouter:  
OpenRouter serves as an aggregated API, providing a unified interface to access a wide variety of Large Language Models (LLMs) from numerous providers, including Google, Anthropic, and Mistral AI.17 This platform aims to simplify the process of experimenting with and integrating different models by offering a single point of access, potentially reducing the overhead of managing multiple API keys and SDKs. The platform lists a broad selection of models.17  
Latest API Model Names for Google, Anthropic, and Mistral available through OpenRouter:  
The following table lists selected models from Google, Anthropic, and Mistral that are accessible via OpenRouter. Model names on OpenRouter often incorporate a provider prefix or a distinct naming convention. This helps developers identify models on the platform and, where possible, map them back to their original provider's specifications.  
**Table: Selected Google, Anthropic, and Mistral Models via OpenRouter**

| Provider (Original) | Model Name (on OpenRouter) | Underlying Model Identifier (Likely) |
| :---- | :---- | :---- |
| Google | google/gemini-2.5-pro-preview-06-05 (or similar format like Google: Gemini 2.5 Pro Preview 06-05 17) | gemini-2.5-pro-preview-06-05 |
| Anthropic | anthropic/claude-3.7-sonnet 17 (or Anthropic: Claude 3.7 Sonnet (self-moderated) 19) | claude-3-7-sonnet-20250219 |
| Anthropic | anthropic/claude-3.5-sonnet (common alias on aggregators) | claude-3-5-sonnet-20241022 |
| Mistral AI | mistralai/mistral-nemo (or Mistral: Mistral Nemo 20) | open-mistral-nemo (Mistral's base) |
| Mistral AI | mistralai/mixtral-8x7b-instruct (or Mistral: Mixtral 8x7B Instruct 20) | open-mixtral-8x7b (Instruct version) |
| Mistral AI | mistralai/mistral-medium (common alias on aggregators) | mistral-medium-2505 (latest multimodal medium) |

The primary value proposition of OpenRouter is the aggregation of a multitude of models from diverse providers under a single API interface.16 This can significantly lower the barrier to entry for developers wishing to experiment with or switch between different models without the complexity of managing separate API keys, SDKs, and integration patterns for each individual provider.

OpenRouter typically employs a naming convention such as provider/model-name or Provider: Model Name (e.g., anthropic/claude-3.7-sonnet 17, Google: Gemini 2.5 Pro Preview 06-05 17). While these names are useful for identification within the OpenRouter ecosystem, they are specific to OpenRouter's API and may not be identical to the model names used in the original provider's direct API.

It is also observed that OpenRouter may list models with specific qualifiers, such as "(self-moderated)" (e.g., Anthropic: Claude 3.7 Sonnet (self-moderated) 19). This suggests that OpenRouter might offer versions of models with different moderation policies or configurations compared to the standard offerings from the original providers. Developers should be aware of these distinctions, as they could affect model behavior, content policies, or suitability for particular use cases. Consulting OpenRouter's specific documentation for such variants is crucial.

Guidance on File Attachment for Models Accessed via OpenRouter:  
The available documentation snippets for OpenRouter 17 do not provide details on a specific, unified OpenRouter API or SDK method for file uploads that would abstract the underlying provider's mechanism. These materials primarily focus on listing available models, their text-based capabilities, and associated metadata like context windows and pricing, rather than detailing multimodal file handling procedures.  
Consequently, it is presumed that attaching files for multimodal models accessed via OpenRouter would likely necessitate formatting the API request in a manner consistent with how OpenRouter passes data to the *original provider's API*. This could involve:

* Sending image data as a base64 encoded string within the JSON payload if the underlying model (e.g., certain Gemini or Claude versions) supports this format directly in its prompt structure.  
* Passing a publicly accessible URL to a file if the underlying model (e.g., Mistral for document\_url type inputs) supports that method.

**Recommendation:** Developers intending to use OpenRouter for multimodal tasks must consult OpenRouter's *own official and detailed documentation* for the correct procedures for making multimodal API calls. This includes understanding how to structure requests with file data for specific models available on their platform. Without such specific guidance from OpenRouter within the provided materials, offering a generic TypeScript example for file uploads via OpenRouter that would work universally is not feasible. An understanding of the native API's multimodal conventions for the target model remains important, as OpenRouter may expect data in a format compatible with the underlying provider.

## **6\. Key Considerations for API Integration and File Handling**

Integrating with advanced AI models, especially those with multimodal capabilities, requires attention to several critical aspects beyond simply calling an endpoint.

API Key Management:  
The secure management of API keys is fundamental. API keys grant access to potentially costly resources and sensitive functionalities. Best practices dictate that keys should never be embedded directly in client-side code (e.g., frontend JavaScript) or committed to version control systems like Git. Instead, they should be managed using environment variables 4 or dedicated secure secret management services provided by cloud platforms or third-party tools. All providers covered—Google 4, Anthropic 9, and Mistral AI 15—rely on API keys for authenticating requests.  
Understanding Model-Specific File Type Support and Size Limits:  
Different AI models and their respective providers support varying file types (e.g., JPEG, PNG, GIF, WebP for images; PDF, TXT for documents; MP3, WAV for audio; MP4 for video) and impose different size limitations on these files. For instance, Google Gemini models have detailed specifications for the maximum number and size of input PDFs, images, video, and audio files per request, which can vary between models like Gemini 2.5 Pro and Gemini 2.0 Flash.2 Anthropic's Files API documentation lists supported MIME types for uploads, such as application/pdf and various image/\* types, and their corresponding content block interpretations.8 It is imperative for developers to consult the specific documentation for the chosen model to understand these constraints thoroughly before attempting integration, as exceeding these limits or using unsupported file types will typically result in API errors.  
Error Handling Strategies for API Calls Involving File Uploads:  
API calls that include file uploads or references introduce additional points of potential failure compared to text-only requests. Errors can arise from network issues during upload, incorrect file formatting, exceeding size or type limitations, invalid API keys, rate limiting by the provider, or server-side processing errors after the file is received. A robust error handling strategy should include:

* Using try-catch blocks in code to gracefully manage exceptions.  
* Checking HTTP status codes returned by the API to identify the nature of the error (e.g., 4xx for client-side errors, 5xx for server-side errors).  
* Parsing error messages or codes provided in the API response body, as these often contain specific details about the failure.  
* Implementing retry mechanisms, potentially with exponential backoff and jitter, for transient errors like temporary network glitches or rate limit exceeded responses (where appropriate and recommended by the API provider).

Choosing the Right Model Based on Multimodal Needs and API Features:  
Selecting the optimal model for a project involves considering several factors:

* **Specific Modalities Required:** Does the application need to process images, audio, video, text documents, or a combination of these?  
* **Task Complexity:** Is the goal simple classification of an image, or does it require detailed reasoning about complex multimodal content and interrelationships?  
* **Performance and Cost:** Different models offer varying levels of latency, throughput, and pricing. These factors must be aligned with the application's performance requirements and budget.  
* **API Features and Ecosystem:** The availability of specific API features, such as Anthropic's beta Files API for persistent file storage and reuse 8, or Google's specialized models for audio processing or image generation 1, can significantly influence the development process and overall system architecture. Developers should refer to the comparative tables and detailed descriptions in the preceding sections of this report to help match model capabilities with their project's unique requirements.

The broader landscape of AI API integration reveals several important characteristics. There is a notable **fragmentation**, where each major AI provider (Google, Anthropic, Mistral AI) maintains its own distinct Software Development Kit (SDK), API endpoint structure, authentication methods, and conventions for handling multimodal inputs. A comparison of SDK initializations and API call structures for Google (4 using GoogleGenAI), Anthropic (8 using Anthropic), and Mistral AI (15 using Mistral) clearly demonstrates these differences. File handling also varies: Google supports inline data and an ai.files.upload mechanism; Anthropic offers its Files API alongside inline data; and Mistral AI examples show document URLs with potential for client.files.upload. This diversity means developers cannot assume a uniform API experience across providers. Integrating with multiple providers necessitates learning and managing separate sets of tools and conventions, a challenge that API aggregators like OpenRouter aim to mitigate, although their abstraction for complex features like file uploads may not always be complete or universally standardized.

Furthermore, successful API interaction often hinges on **criticality of specific headers and SDK configurations**. Overlooking details such as custom HTTP headers (e.g., the anthropic-beta: files-api-2025-04-14 header required for Anthropic's Files API 8) or specific SDK initialization parameters (like selecting API versions—v1 for stable, v1alpha for preview—in Google's SDK 4) can lead to API errors or unexpected behavior. Close attention to the "getting started" guides and API reference sections of official documentation is therefore essential.

A common theme is that many of the **"latest" models are often in "preview," "experimental," or "beta" stages**. Google Gemini models frequently feature "preview" in their names 1, Anthropic's Files API is explicitly designated as "beta" 8, and Mistral AI's model overview includes release dates that imply recent availability, with some models potentially being newer but not yet formally designated as "stable".12 While these non-stable versions offer access to cutting-edge capabilities, they also carry a higher risk of API changes, bugs, or future deprecation. Developers must carefully weigh the benefits of using the absolute latest features against the need for stability, particularly for applications intended for production environments.

Given this rapid evolution, the potential for third-party aliasing of model names 3, and provider-specific nuances in API design, the **importance of relying on official documentation** cannot be overstated. For direct API integration, the official, most recent documentation from the primary AI provider (e.g., ai.google.dev 1, docs.anthropic.com 7, docs.mistral.ai 12) provides the most accurate and authoritative information on API model IDs, request/response structures, authentication requirements, and feature availability. While community forums, blog posts, tutorials, or aggregator documentation can offer helpful context and examples, they should always be cross-referenced with official sources for critical integration details.

## **7\. Conclusion**

The landscape of AI models accessible via API is dynamic and rapidly expanding, offering developers unprecedented capabilities, particularly in multimodal interactions. This report has provided an overview of the latest API model names for Google Gemini, Anthropic Claude, and Mistral AI, along with those accessible through OpenRouter, focusing on identifiers crucial for direct API integration.

Key takeaways for developers include:

* **Model Naming Precision:** Always use the exact API model names as specified in the official documentation of the respective provider (Google, Anthropic, Mistral AI) or aggregator (OpenRouter). Discrepancies exist, and third-party aliases will not work with direct provider APIs.  
* **Multimodal Capabilities Vary:** While many new models support multimodal inputs (images, documents, audio, video), the specific supported file types, size limits, and methods of attachment (inline data, file URIs, dedicated file APIs) differ significantly between providers and even between models from the same provider. Diligent review of model-specific documentation is essential.  
* **SDKs are Essential Tools:** Official SDKs (e.g., @google/genai, @anthropic-ai/sdk, @mistralai/mistralai) greatly simplify API interaction by handling authentication, request formatting, and often providing utilities for common tasks like file preparation.  
* **"Latest" Often Means "Preview/Beta":** Many cutting-edge models are released in preview or beta stages. While offering advanced features, they may come with API instability or future changes. Production systems may require more conservative choices or careful monitoring.  
* **OpenRouter as an Aggregation Layer:** OpenRouter simplifies access to a wide array of models but developers must consult OpenRouter's own documentation for its specific API conventions, especially concerning multimodal inputs, as these may require adherence to the underlying provider's data formatting.  
* **Security and Error Handling are Paramount:** Secure API key management and robust error handling are non-negotiable aspects of building reliable applications that consume these AI services.

The provided TypeScript examples offer a starting point for integrating file attachments. However, developers must adapt these examples based on the specific model chosen, the exact requirements of their application, and the latest updates from the AI providers, as SDKs and API features continue to evolve. Continuous learning and reference to official documentation will be key to successfully leveraging the power of these advanced AI models.

#### **Karya yang dikutip**

1. Gemini models | Gemini API | Google AI for Developers, diakses Juni 11, 2025, [https://ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models)  
2. Learn about supported models | Firebase AI Logic \- Google, diakses Juni 11, 2025, [https://firebase.google.com/docs/ai-logic/models](https://firebase.google.com/docs/ai-logic/models)  
3. What's up with Gemini 2.5 Pro being named gemini2flash in the API call and not tagged as reasoning the reasoning models, even o4-mini which also doesn't give back any thinking outputs? It's at least clear it's NOT Gemini 2.5 Pro it does NOT reply so fast. : r/perplexity\_ai \- Reddit, diakses Juni 11, 2025, [https://www.reddit.com/r/perplexity\_ai/comments/1kcdlr3/whats\_up\_with\_gemini\_25\_pro\_being\_named/](https://www.reddit.com/r/perplexity_ai/comments/1kcdlr3/whats_up_with_gemini_25_pro_being_named/)  
4. How to Use the Google Gen AI TypeScript/JavaScript SDK to Build Powerful Generative AI Applications \- Apidog, diakses Juni 11, 2025, [https://apidog.com/blog/how-to-use-the-google-gen-ai/](https://apidog.com/blog/how-to-use-the-google-gen-ai/)  
5. Upgrade to the Google Gen AI SDK \- Gemini API, diakses Juni 11, 2025, [https://ai.google.dev/gemini-api/docs/migrate](https://ai.google.dev/gemini-api/docs/migrate)  
6. googleapis/js-genai: TypeScript/JavaScript SDK for Gemini and Vertex AI. \- GitHub, diakses Juni 11, 2025, [https://github.com/googleapis/js-genai](https://github.com/googleapis/js-genai)  
7. Models overview \- Anthropic, diakses Juni 11, 2025, [https://docs.anthropic.com/en/docs/about-claude/models/overview](https://docs.anthropic.com/en/docs/about-claude/models/overview)  
8. Files API \- Anthropic, diakses Juni 11, 2025, [https://docs.anthropic.com/en/docs/build-with-claude/files](https://docs.anthropic.com/en/docs/build-with-claude/files)  
9. Overview \- Anthropic API, diakses Juni 11, 2025, [https://docs.anthropic.com/en/api/overview](https://docs.anthropic.com/en/api/overview)  
10. anthropics/anthropic-sdk-typescript: Access to Anthropic's safety-first language model APIs \- GitHub, diakses Juni 11, 2025, [https://github.com/anthropics/anthropic-sdk-typescript](https://github.com/anthropics/anthropic-sdk-typescript)  
11. Get started with Claude \- Anthropic API, diakses Juni 11, 2025, [https://docs.anthropic.com/en/docs/get-started](https://docs.anthropic.com/en/docs/get-started)  
12. Models Overview | Mistral AI Large Language Models, diakses Juni 11, 2025, [https://docs.mistral.ai/getting-started/models/models\_overview/](https://docs.mistral.ai/getting-started/models/models_overview/)  
13. Mistral AI models | Generative AI on Vertex AI \- Google Cloud, diakses Juni 11, 2025, [https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/mistral](https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/mistral)  
14. Mistral Drops Mistral Medium 3: A Game-Changing Multimodal AI Model for Enterprises, diakses Juni 11, 2025, [https://apidog.com/blog/mistral-medium-3/](https://apidog.com/blog/mistral-medium-3/)  
15. Document Understanding | Mistral AI Large Language Models, diakses Juni 11, 2025, [https://docs.mistral.ai/capabilities/OCR/document\_understanding/](https://docs.mistral.ai/capabilities/OCR/document_understanding/)  
16. Mistral AI API \- LiteLLM, diakses Juni 11, 2025, [https://docs.litellm.ai/docs/providers/mistral](https://docs.litellm.ai/docs/providers/mistral)  
17. Models \- OpenRouter, diakses Juni 11, 2025, [https://openrouter.ai/models](https://openrouter.ai/models)  
18. Models: 'meta' \- OpenRouter, diakses Juni 11, 2025, [https://openrouter.ai/meta](https://openrouter.ai/meta)  
19. Models: '$' | OpenRouter, diakses Juni 11, 2025, [https://openrouter.ai/se](https://openrouter.ai/se)  
20. Models: ')' | OpenRouter, diakses Juni 11, 2025, [https://openrouter.ai/mistr](https://openrouter.ai/mistr)  
21. How to Use Mistral AI API (Step by Step Guide) \- Apidog, diakses Juni 11, 2025, [https://apidog.com/blog/mistra-ai-api/](https://apidog.com/blog/mistra-ai-api/)