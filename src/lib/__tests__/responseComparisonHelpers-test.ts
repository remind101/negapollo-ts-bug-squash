import fixtures from 'lib/testFixtures';
import logGraphqlResHitMissMismatch from 'lib/responseComparisonHelpers';
import statsd from 'lib/statsd';

const TEST_QUERY = { testQuery: {} };
const TEST_DD_KEY = 'dd.key';

jest.unmock('lib/statsd');

describe('the chat response comparison mismatch helper', () => {
  xit('match two responses with ignored fields in them', () => {
    statsd.increment = jest.fn();
    const newResult = fixtures.getJSON('query.class_stream_sections.new_result.1.json');
    const oldResult = fixtures.getJSON('query.class_stream_sections.old_result.1.json');
    logGraphqlResHitMissMismatch(newResult, oldResult, TEST_QUERY, TEST_DD_KEY, {});
    expect(statsd.increment).toHaveBeenCalledTimes(1);
    expect(statsd.increment).toHaveBeenCalledWith(`${TEST_DD_KEY}.match`);
  });

  describe("when there's a small mismatch in lastReadSequence", () => {
    xit('considers the two responses to match', () => {
      statsd.increment = jest.fn();
      const newResult = fixtures.getJSON('query.class_stream_sections.new_result.2.json');
      const oldResult = fixtures.getJSON('query.class_stream_sections.old_result.2.json');
      logGraphqlResHitMissMismatch(newResult, oldResult, TEST_QUERY, TEST_DD_KEY, {});
      expect(statsd.increment).toHaveBeenCalledTimes(1);
      expect(statsd.increment).toHaveBeenCalledWith(`${TEST_DD_KEY}.match`);
    });
  });

  describe("when there's a large mismatch in lastReadSequence", () => {
    xit('considers the two responses to match', () => {
      statsd.increment = jest.fn();
      const newResult = fixtures.getJSON('query.class_stream_sections.new_result.3.json');
      const oldResult = fixtures.getJSON('query.class_stream_sections.old_result.3.json');
      logGraphqlResHitMissMismatch(newResult, oldResult, TEST_QUERY, TEST_DD_KEY, {});
      expect(statsd.increment).toHaveBeenCalledTimes(1);
      expect(statsd.increment).toHaveBeenCalledWith(`${TEST_DD_KEY}.match`);
    });
  });

  describe("when there's a mismatch in queryKey", () => {
    xit('considers the two responses to match', () => {
      statsd.increment = jest.fn();
      const newResult = fixtures.getJSON('query.class_stream_sections.new_result.4.json');
      const oldResult = fixtures.getJSON('query.class_stream_sections.old_result.4.json');
      logGraphqlResHitMissMismatch(newResult, oldResult, TEST_QUERY, TEST_DD_KEY, {});
      expect(statsd.increment).toHaveBeenCalledTimes(1);
      expect(statsd.increment).toHaveBeenCalledWith(`${TEST_DD_KEY}.match`);
    });
  });

  describe("when there's a mismatch in the order of membership nodes", () => {
    xit('considers the two response to match anyway', () => {
      statsd.increment = jest.fn();
      const newResult = fixtures.getJSON('query.load_chats.new_result.1.json');
      const oldResult = fixtures.getJSON('query.load_chats.old_result.1.json');
      logGraphqlResHitMissMismatch(newResult, oldResult, TEST_QUERY, TEST_DD_KEY, {});
      expect(statsd.increment).toHaveBeenCalledTimes(1);
      expect(statsd.increment).toHaveBeenCalledWith(`${TEST_DD_KEY}.match`);
    });
  });
});
