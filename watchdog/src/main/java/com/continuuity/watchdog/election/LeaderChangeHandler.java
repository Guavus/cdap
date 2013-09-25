package com.continuuity.watchdog.election;

import java.util.Set;

/**
 * Encapsulates logic to handle leader partition changes.
 */
public interface LeaderChangeHandler {
  /**
   * Called when the leader partitions change.
   * If this method throws exception, it will be retried until the next leader change happens.
   * @param partitions new leader partitions.
   */
  void leaderChanged(Set<Integer> partitions) throws Exception;
}
