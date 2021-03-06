/**
 * Stats actions.
 */

import _ from 'lodash';

import * as Filter from 'utils/challenge-listing/filter';
import { createActions } from 'redux-actions';
import { getService as getGroupService } from 'services/groups';

/**
 * Gets statistics related to the specified community. Data will be loaded into
 * stats.communities[communityId] path of the Redux state.
 * @param {Object} community details of the community.
 * @param {Array} challenges challenges from challengeListing to filter and do statistics
 * @param {String} token V3 Topcoder auth token. It is necessary to get data
 *  related to private groups.
 * @return {Promise} Resolves to the loaded data.
 */
/* TODO: This code should be moved to a dedicated service. */
async function getCommunityStats(community, challenges, token) {
  /* TODO: At the moment, this component loads challenge objects to calculate
   * the number of challenges and the total prize. Probably in future, we'll
   * have a special API to get these data. */
  let filtered = challenges.filter(x => x.status === 'ACTIVE');
  if (community.challengeFilter) {
    const filterFunction = Filter.getFilterFunction(community.challengeFilter);
    filtered = filtered.filter(filterFunction);
  }
  const totalPrize = filtered.reduce((total, challenge) => total + (challenge.totalPrize || 0), 0);
  const groupService = getGroupService(token);
  const result = {
    communityId: community.communityId,
    stats: {},
  };
  if (filtered.length) result.stats.numChallenges = filtered.length;
  if (totalPrize) result.stats.openPrizes = `$${totalPrize.toLocaleString()}`;

  const groupId = _.get(community, 'groupIds[0]');
  if (groupId) {
    result.stats.numMembers = await groupService.getMembersCount(groupId, true);
  }
  return result;
}

export default createActions({
  STATS: {
    GET_COMMUNITY_STATS: getCommunityStats,
  },
});
