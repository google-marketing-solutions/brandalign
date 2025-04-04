/*
Copyright 2024 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable[] law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const onOpen = () => {
  SpreadsheetApp.getUi()
    .createMenu("🎯 BrandAlign 🎯")
    .addItem("Load ads", loadAds.name)
    .addItem("Validate", validate.name)
    .addItem("Validate Images", validateImages.name)
    .addToUi();
};

const ADS_SHEET_NAME = "Ads";
const GUIDLINES_SHEET_NAME = "Guidelines";
const IMAGE_GUIDLINES_SHEET_NAME = "Image Guidelines";
const VALIDATION_SHEET_NAME = "Validation";
const IMAGE_VALIDATION_SHEET_NAME = "Image Validation";
const getAdsLimit = () => Number(getConfigVariable("ADS_LIMIT"));

const loadAds = () => {
  const ads = fetchAds(getCustomerId(), getCampaignIds(), getAdsLimit());

  // TODO refactor this to be easier to read
  let textAdIdPairs = ads.flatMap((ad) =>
    [...ad.headlines, ...ad.descriptions].map((text) => [ad.id, text])
  );
  const textAdIdsGroups = groupBy(
    textAdIdPairs,
    ([_, text]) => text,
    ([id, _]) => id
  );
  const rows = Object.entries(textAdIdsGroups).map(([text, ids]) => [
    ids.join(", "),
    text,
  ]);

  writeRowsToSheet(getSheet(ADS_SHEET_NAME), rows);
};

const getSheet = (sheetName) =>
  SpreadsheetApp.getActive().getSheetByName(sheetName);

const getSheetContent = (sheetName, skipHeaderRows = 1) =>
  getSheet(sheetName)
    .getDataRange()
    .getValues()
    .filter(isNonEmptyRow)
    .slice(skipHeaderRows);

const getTextAdValidationPromptParts = (guidelineId, guidelineText, text) => [
  createTextPart(
    `Consider a Google Responsive Search Ad with the following text:
  ${text}

  Determine if the ad is compliant with the following guideline
  and provide a suggestion for a new text only if it is not compliant:

  #${guidelineId}
  ${guidelineText}`
  ),
];

const getImageAssetPromptParts = (guidelineId, guidelineText, imageData) => [
  createTextPart(`Determine if the following image is compliant with the following guideline
  and provide a suggestion what needs to be changed in the image in case it is not compliant:

  #${guidelineId}
  ${guidelineText}
  `),
  createImagePartFromBase64(imageData),
];

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid
 * @property {string} reasoning
 * @property {string} suggestion
 */

/**
 * @returns {ValidationResult}
 */
const validateGuideline = (prompt) => {
  // https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/control-generated-output
  // See https://cloud.google.com/vertex-ai/docs/reference/rest/v1/Schema
  const schema = {
    type: "object",
    properties: {
      isValid: { type: "boolean" },
      reasoning: { type: "string" },
      suggestion: { type: "string" },
    },
    required: ["isValid", "reasoning"],
  };

  //return geminiRequestText(GEMINI_MODEL, prompt, schema);
  console.log(prompt);
  return geminiRequestParts(GEMINI_MODEL, prompt, schema);
};

const validateImages = () => {
  const guidelines = getSheetContent(IMAGE_GUIDLINES_SHEET_NAME);
  const validationSheet = truncateRows(getSheet(IMAGE_VALIDATION_SHEET_NAME));

  const images = listFiles(getConfigVariable("DRIVE_FOLDER_ID"));

  for (const image of images) {
    const url = image.getUrl();
    const imageData = Utilities.base64Encode(image.getBlob().getBytes());

    for (const [guidelineId, guidelineText] of guidelines) {
      const promptParts = getImageAssetPromptParts(
        guidelineId,
        guidelineText,
        imageData
      );
      const res = validateGuideline(promptParts);
      console.log(url, "-->", res);

      // validationSheet.appendRow([adIds, adText, guidelineId, res.isValid, res.reasoning, res.suggestion || '']);
      validationSheet.appendRow([
        url,
        `=IMAGE("https://lh6.googleusercontent.com/d/${image.getId()}")`,
        guidelineId,
        res.isValid,
        res.reasoning,
        res.suggestion || "",
      ]);

      validationSheet.setRowHeight(validationSheet.getLastRow(), 120);
      SpreadsheetApp.flush();
    }
  }
};

// TODO retry x times
// TODO after this skip and display error message in that row
const validate = () => {
  const guidelines = getSheetContent(GUIDLINES_SHEET_NAME);
  const ads = getSheetContent(ADS_SHEET_NAME);
  const validationSheet = truncateRows(getSheet(VALIDATION_SHEET_NAME));

  for (const [adIds, adText] of ads) {
    for (const [guidelineId, guidelineText] of guidelines) {
      const promptParts = getTextAdValidationPromptParts(
        guidelineId,
        guidelineText,
        adText
      );
      const res = validateGuideline(promptParts);

      if (res) {
        validationSheet.appendRow([
          adIds,
          adText,
          guidelineId,
          res.isValid,
          res.reasoning,
          res.suggestion || "",
        ]);
      } else {
        // TODO better way to display to the user what happened
        validationSheet.appendRow([
          adIds,
          adText,
          guidelineId,
          "ERROR",
          "ERROR",
        ]);
      }
      SpreadsheetApp.flush();
    }
  }
};

const mergeAdTextParts = (parts) => parts.join(" | ");
