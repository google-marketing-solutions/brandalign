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

const getDeveloperToken = () =>
  String(getConfigVariable('DEVELOPER_TOKEN')).trim();

const getCustomerId = () =>
  String(getConfigVariable('ADS_ACCOUNT_ID')).replaceAll('-', '').trim();

const getCampaignIds = () =>
  String(getConfigVariable('CAMPAIGN_IDS'))
    .split(',')
    .map((id) => id.trim())
    .filter((cell) => cell !== '');

const ADS_ENPOINT = 'https://googleads.googleapis.com/v17/';

const addGoogleAdsAuth = (params) =>
  Object.assign(
    { payload: JSON.stringify(params) },
    {
      method: 'POST',
      contentType: 'application/json',
      muteHttpExceptions: true,
      headers: {
        'developer-token': getDeveloperToken(),
        Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
        'login-customer-id': getCustomerId(),
      },
    }
  );

const runQuery = (query, customerId) => {
  const results = [];
  const request = { pageToken: undefined, customerId, query };
  const requestor = (req) =>
    fetchJson(
      `https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:search`,
      addGoogleAdsAuth(req)
    );

  do {
    const response = requestor(request);
    const error = response.error || response.errors;
    if (error) {
      const message = JSON.stringify(error, null, 2);
      throw new Error(message);
    }
    request.pageToken = response.nextPageToken;
    results.push(...(response.results || []));
  } while (request.pageToken);
  return results;
};

const getHeadlineTexts = (ad) => ad?.headlines?.map((h) => h.text);
const getDescriptionTexts = (ad) => ad?.descriptions?.map((d) => d.text);
// const extractResponsiveSerachAdFromItem = item =>  item.adGroupAd.ad.responsiveSearchAd;

/**
 * @typedef {Object} TextAd
 * @property {string[]} headlines
 * @property {string[]} descriptions
 * @property {number} id
 */

/**
 * @returns {TextAd}
 */
const getTextAdFromResponsiveSearchAd = (item) => {
  const ad = item.adGroupAd.ad.responsiveSearchAd;
  return {
    id: item.adGroupAd.ad.id,
    headlines: getHeadlineTexts(ad),
    descriptions: getDescriptionTexts(ad),
  };
};

/**
 * @returns {TextAd[]}
 */
const fetchAds = (cid, campaigns, limit) => {
  const campaignCondition =
    campaigns.length > 0 ? `AND campaign.id IN (${campaigns.join(',')})` : '';
  const limitClause = limit ? `LIMIT ${limit}` : '';
  const gql = `
    SELECT
      ad_group_ad.ad.id,
      ad_group_ad.ad.responsive_search_ad.headlines,
      ad_group_ad.ad.responsive_search_ad.descriptions,
      ad_group_ad.status,
      ad_group_ad.policy_summary.review_status,
      ad_group_ad.policy_summary.approval_status,
      ad_group_ad.policy_summary.policy_topic_entries
    FROM
      ad_group_ad
    WHERE
      ad_group_ad.status IN ('ENABLED', 'PAUSED', 'REMOVED', 'UNKNOWN') AND
      ad_group_ad.ad.type = RESPONSIVE_SEARCH_AD
      ${campaignCondition}
    ${limitClause}
    PARAMETERS include_drafts=true
    `;
  console.log(gql);
  const results = runQuery(gql, cid);

  return results.map(getTextAdFromResponsiveSearchAd);
};

const fetchAdsTest = () => {
  const campaigns = [];
  const cid = getCustomerId();
  console.log({ campaigns, cid });

  const res = fetchAds(cid, campaigns, 100);
  console.log(res);
};
