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

Supercharge Brand Compliance with Gemini

## Overview

BrandAlign uses Gemini to check ads in bulk against human-readable policy description texts. Customers will be able to fetch Ads from Google Ads, provide their policy texts in raw format and generate a report highlighting policy issues.

## Challenge Addressed

Large advertisers face a critical challenge: ensuring brand consistency across all their text ads, especially with content generated from diverse sources like AI, agencies, and partners. Manual review processes are not only inefficient and resource-intensive but also fail to guarantee compliance with complex brand guidelines. This leaves brands vulnerable to inconsistent messaging and reputational damage, highlighting the urgent need for a scalable and reliable solution that can automate ad verification and enforce brand standards across all advertising efforts.

## Outcome & Impact

With the power of Gemini BandAlign checks all guidelines against the clients text ads. For each validation a reasoning why an ad might not adhere to a guideline will be created. Additionally BrandAlign will provide a new improved ad which is valid to all guidelines.

## Client Prerequisites

- Google Cloud Project with Vertex AI enabled
- Google Workspace access (to run Google Apps Script from a Google Spreadsheet)
- Optional: Google Ads Account with a Developer Token (for fetching Google Ads)

**Disclaimer: This is not an official Google product.**
