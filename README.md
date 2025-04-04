<!--
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
-->

# BrandAlign

Check compliance against guidelines with Gemini at scale

## Get Started

To get started with BrandAlign:

1. Make a copy of the Google Sheets
   [spreadsheet template]https://docs.google.com/spreadsheets/d/14omIL2VXX9P59RSsHraJ33FhOuR83rcIZoqXGJlOchM/copy)
1. Follow the instructions detailed in the `Getting Started` sheet

## Overview

BrandAlign uses the power of Gemini to make sure that Google search ads are not violating brand policies and guidelines. It can verify headlines and descriptions in bulk and suggest an improved, rewritten ad copy that aligns with the specified rules, saving the customer time and keeping their brand message consistent. Additionally, image assets can be analysed to ensure they also match the brand's identity.

## Challenge Addressed

Large advertisers face a critical challenge: ensuring brand consistency across all their text ads, especially with content generated from diverse sources like AI, agencies, and partners. Manual review processes are not only inefficient and resource-intensive but also fail to guarantee compliance with complex brand guidelines. This leaves brands vulnerable to inconsistent messaging and reputational damage, highlighting the urgent need for a scalable and reliable solution that can automate ad verification and enforce brand standards across all advertising efforts.

## Outcome & Impact

With the power of Gemini BrandAlign checks all guidelines against the clients text ads. For each validation a reasoning why an ad might not adhere to a guideline will be created. Additionally BrandAlign will provide a new improved ad which is valid to all guidelines. BrandAlign works across many languages due to Gemini’s multilinguality understanding in over 100 languages like Korean, French, German, Spanish, French, Japanese, Korean, Russian, and Chinese.

## Client Prerequisites

- Google Cloud Project with Vertex AI enabled
- Google Workspace access (to run Google Apps Script from a Google Spreadsheet)
- Optional: Google Ads Account with a Developer Token (for fetching Google Ads)

**Disclaimer: This is not an official Google product.**
