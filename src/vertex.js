/*
Copyright 2024 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const GEMINI_MODEL = 'gemini-2.0-flash';
const GCP_PROJECT = getConfigVariable('GCP_ID');

const addVertexAuth = (params) =>
  Object.assign(
    { payload: JSON.stringify(params) },
    {
      method: 'POST',
      contentType: 'application/json',
      muteHttpExceptions: true,
      headers: {
        Authorization: `Bearer ${ScriptApp.getOAuthToken()}`,
      },
    }
  );

const createTextPart = (text) => ({ text });

const createImagePartFromBase64 = (base64Image) => ({
  inlineData: {
    mimeType: 'image/png',
    data: base64Image,
  },
});

const createImagePartFromUrl = (url) => {
  const imageData = UrlFetchApp.fetch(url).getBlob().getBytes();
  const base64Image = Utilities.base64Encode(imageData);
  return createImageContentPart(base64Image);
};

const geminiRequestText = (model, text, responseSchema = undefined) =>
  geminiRequestParts(model, [{ text }], responseSchema);

const geminiRequestParts = (model, userParts, responseSchema = undefined) => {
  const serviceUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT}/locations/us-central1/publishers/google/models/${model}:generateContent`;
  const responseSchemaSupported = model.startsWith('gemini-1.5-pro');
  const parts = responseSchemaSupported
    ? userParts
    : [
        ...userParts,
        createTextPart(
          `Output in the following JSON Format:\n${JSON.stringify(
            responseSchema,
            null,
            2
          )}`
        ),
      ];
  const res = fetchJson(
    serviceUrl,
    addVertexAuth({
      contents: [
        {
          role: 'user',
          parts,
        },
      ],

      safetySettings: [
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE',
        },
      ],

      // see https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference#generationconfig
      generation_config: {
        temperature: 1.0, // Range for gemini-1.5-pro: 0.0 - 2.0 (default: 1.0)
        top_p: 0.95, // Default for gemini-1.5-pro: 0.95
        max_output_tokens: 8192,
        responseMimeType: 'application/json',
        response_schema: responseSchemaSupported ? responseSchema : undefined,
      },
    })
  );
  const jsonString = res.candidates?.[0].content?.parts?.[0].text;
  return jsonString ? JSON.parse(jsonString) : undefined;
};
