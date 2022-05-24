import ConfigureFeatures from '../../config';
// import { GetFeatureApplicator } from '../FeatureService/FeatureService';

ConfigureFeatures();

chrome.runtime.onInstalled?.addListener(() => {
  const url = chrome.runtime.getURL('installed.html');
  chrome.tabs.create({ url: url });
});

// const applyFeatures = () => GetFeatureApplicator().applyFeatures();
