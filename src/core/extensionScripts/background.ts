import ConfigureFeatures from '../../config';

ConfigureFeatures();

chrome.runtime.onInstalled?.addListener(() => {
  const url = chrome.runtime.getURL('installed.html');
  chrome.tabs.create({ url: url });
});
