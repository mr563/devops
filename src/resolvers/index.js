import Resolver  from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();

// Function to collect data for "Change Rolled Back"
const getChangeRolledBackData = async (projectKey) => {
    const jql = `project = ${projectKey} AND status NOT IN ("Done","Completed","Resolved", "Closed") AND "Change Type" = "Rollback"`;
    const response = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql}`);
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }
    const jsonResponse = await response.json();
    return jsonResponse.total;
};

// Function to collect data for "Change Type Equals Emergency or Hotfix"
const getEmergencyOrHotfixData = async (projectKey) => {
    const jql = `project = ${projectKey} AND status NOT IN ("Done","Completed","Resolved", "Closed") AND "Change Type" in ("Emergency", "Hotfix")`;
    const response = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql}`);
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }
    const jsonResponse = await response.json();
    return jsonResponse.total;
};

// Function to collect data for "Unreviewed PR"
const getUnreviewedPRData = async (projectKey) => {
    const jql = `project = ${projectKey} AND status NOT IN ("Done","Completed","Resolved", "Closed") AND "Change Type" = "Unreviewed PR"`;
    const response = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql}`);
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }
    const jsonResponse = await response.json();
    return jsonResponse.total;
};

// Function to collect total number of changes for a specified time period
const getTotalChanges = async (projectKey, startDate, endDate) => {
    const jql = `project = ${projectKey} AND status NOT IN ("Done","Completed","Resolved", "Closed") AND created >= ${startDate} AND created <= ${endDate}`;
    const response = await api.asApp().requestJira(route `/rest/api/3/search?jql=${jql}`);
    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
    }
    const jsonResponse = await response.json();
    return jsonResponse.total;
};

// Function to calculate CFR
const calculateCFR = (failedChanges, totalChanges) => {
    if (totalChanges === 0) {
        return 0;
    }
    return (failedChanges / totalChanges) * 100;
};

resolver.define('getChangeFailureRate', async (req) => {
    const projectKey = req.context.extension.project.key;
    const currentDate = new Date();
    let startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 12, 1).toISOString().split('T')[0];
    let endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const data = {
        weeks: [],
        months: [],
        cfr: []
    };

    while (startDate <= endDate) {
        const totalChanges = await getTotalChanges(projectKey, startDate, endDate);
        const changeRolledBackData = await getChangeRolledBackData(projectKey);
        const emergencyOrHotfixData = await getEmergencyOrHotfixData(projectKey);
        const unreviewedPRData = await getUnreviewedPRData(projectKey);
        
        const failedChanges = changeRolledBackData + emergencyOrHotfixData + unreviewedPRData;
        const cfr = calculateCFR(failedChanges, totalChanges);
        
        data.weeks.push(`Week of ${startDate}`);
        data.months.push(startDate.substring(0, 7));
        data.cfr.push(cfr.toFixed(2));

        startDate = new Date(new Date(startDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    return data;
});

export const handler = resolver.getDefinitions();
