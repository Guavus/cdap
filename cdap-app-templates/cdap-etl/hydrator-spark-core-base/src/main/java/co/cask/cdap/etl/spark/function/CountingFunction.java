/*
 * Copyright © 2016 Cask Data, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

package co.cask.cdap.etl.spark.function;

import co.cask.cdap.api.metrics.Metrics;
import co.cask.cdap.api.preview.DataTracer;
import co.cask.cdap.etl.api.StageMetrics;
import co.cask.cdap.etl.common.DefaultStageMetrics;
import org.apache.spark.api.java.function.Function;

import javax.annotation.Nullable;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Function that doesn't transform anything, but just emits counts for the number of records from that stage.
 *
 * @param <T> the type of input object
 */
public class CountingFunction<T> implements Function<T, T> {

  private static final Logger LOG = LoggerFactory.getLogger(CountingFunction.class);

  private final String stageName;
  private final Metrics metrics;
  private final String metricName;
  private final DataTracer dataTracer;
  private transient StageMetrics stageMetrics;

  // DataTracer is null for records.in
  public CountingFunction(String stageName, Metrics metrics, String metricName, @Nullable DataTracer dataTracer) {
    LOG.info("inside CountingFunction, args::: stageName: " + stageName + " ,metrics: " + metrics + " ,metricName: "  + metricName);
    LOG.info("inside CountingFunction, metric class : "  + metrics.getClass());
    this.stageName = stageName;
    this.metrics = metrics;
    this.metricName = metricName;
    this.dataTracer = dataTracer;
  }

  @Override
  public T call(T in) throws Exception {
    if (stageMetrics == null) {
      stageMetrics = new DefaultStageMetrics(metrics, stageName);
      LOG.info("stageMetrics is null, initializing DefaultStageMetrics");
    }
    // we only want to trace the data for records.out
    if (dataTracer != null && dataTracer.isEnabled()) {
      dataTracer.info(metricName, in);
    }
    stageMetrics.count(metricName, 1);
    return in;
  }
}
