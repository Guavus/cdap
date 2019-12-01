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

package io.cdap.cdap.etl.spark.streaming.function;


import io.cdap.cdap.api.Transactionals;
import io.cdap.cdap.api.TxRunnable;
import io.cdap.cdap.api.data.DatasetContext;
import io.cdap.cdap.api.spark.JavaSparkExecutionContext;
import io.cdap.cdap.etl.api.batch.SparkExecutionPluginContext;
import io.cdap.cdap.etl.api.batch.SparkJoiner;
import io.cdap.cdap.etl.common.PipelineRuntime;
import io.cdap.cdap.etl.proto.v2.spec.StageSpec;
import io.cdap.cdap.etl.spark.SparkPipelineRuntime;
import io.cdap.cdap.etl.spark.batch.BasicSparkExecutionPluginContext;
import io.cdap.cdap.etl.spark.function.PluginFunctionContext;
import io.cdap.cdap.etl.spark.streaming.DynamicDriverContext;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;

import java.util.Map;

/**
 * This class is required to make sure that macro substitution occurs each time a pipeline is run instead of just
 * the first time the pipeline is run. Without this, the SparkJoiner plugin gets serialized into the checkpoint and
 * re-loaded every subsequent time with the properties from the first run.
 *
 * @param <U> type of object in the output collection
 */
public class DynamicSparkJoiner< U> extends SparkJoiner<U> {
  private final DynamicDriverContext dynamicDriverContext;
  private transient SparkJoiner<U> delegate;

  public DynamicSparkJoiner(DynamicDriverContext dynamicDriverContext, SparkJoiner<U> compute) {
    this.dynamicDriverContext = dynamicDriverContext;
    this.delegate = compute;
  }

  @Override
  public void initialize(SparkExecutionPluginContext context) throws Exception {
    delegate.initialize(context);
  }

  @Override
  public JavaRDD<U> join(SparkExecutionPluginContext context, Map<String, JavaRDD<?>> inputs) throws Exception {
    // get the context from some input
    JavaRDD<?> input = inputs.values().iterator().next();
    lazyInit(JavaSparkContext.fromSparkContext(input.context()));
    return delegate.join(context, inputs);
  }

  // when checkpointing is enabled, and Spark is loading DStream operations from an existing checkpoint,
  // delegate will be null and the initialize() method won't have been called. So we need to instantiate
  // the delegate and initialize it.
  private void lazyInit(final JavaSparkContext jsc) throws Exception {
    if (delegate == null) {
      PluginFunctionContext pluginFunctionContext = dynamicDriverContext.getPluginFunctionContext();
      delegate = pluginFunctionContext.createPlugin();
      final StageSpec stageSpec = pluginFunctionContext.getStageSpec();
      final JavaSparkExecutionContext sec = dynamicDriverContext.getSparkExecutionContext();
      Transactionals.execute(sec, new TxRunnable() {
        @Override
        public void run(DatasetContext datasetContext) throws Exception {
          PipelineRuntime pipelineRuntime = new SparkPipelineRuntime(sec);
          SparkExecutionPluginContext sparkPluginContext =
            new BasicSparkExecutionPluginContext(sec, jsc, datasetContext, pipelineRuntime, stageSpec);
          delegate.initialize(sparkPluginContext);
        }
      }, Exception.class);
    }
  }
}
