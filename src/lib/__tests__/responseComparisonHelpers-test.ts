import fixtures from 'lib/testFixtures';
import logGraphqlResHitMissMismatch from 'lib/responseComparisonHelpers';
import statsd from 'lib/statsd';

const TEST_QUERY = { testQuery: {} };
const TEST_DD_KEY = 'dd.key';

jest.unmock('lib/statsd');

describe('the response comparison mismatch helper', () => {
  it('match two responses with ignored fields in them', () => {
    statsd.increment = jest.fn();
    const newResult = fixtures.getJSON('query.class_stream_sections.new_result.1.json');
    const oldResult = fixtures.getJSON('query.class_stream_sections.old_result.1.json');
    logGraphqlResHitMissMismatch(newResult, oldResult, TEST_QUERY, TEST_DD_KEY, {});
    expect(statsd.increment).toHaveBeenCalledTimes(1);
    expect(statsd.increment).toHaveBeenCalledWith(`${TEST_DD_KEY}.match`);
  });
});
