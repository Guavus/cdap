package co.cask.cdap.etl.spark.plugin;

import co.cask.cdap.etl.api.MultiInputPipelineConfigurer;
import co.cask.cdap.etl.api.batch.BatchContext;
import co.cask.cdap.etl.api.batch.BatchJoinerContext;
import co.cask.cdap.etl.api.batch.SparkExecutionPluginContext;
import co.cask.cdap.etl.api.batch.SparkJoiner;
import co.cask.cdap.etl.common.plugin.Caller;
import org.apache.spark.api.java.JavaRDD;

import java.util.Map;
import java.util.concurrent.Callable;

public class WrappedSparkJoiner<OUT> extends SparkJoiner<OUT> {

  private final SparkJoiner joiner;
  private final Caller caller;

  public WrappedSparkJoiner(SparkJoiner joiner, Caller caller) {
    this.joiner = joiner;
    this.caller = caller;
  }

  @Override
  public void configurePipeline(MultiInputPipelineConfigurer multiInputPipelineConfigurer) throws IllegalArgumentException {
    caller.callUnchecked(new Callable<Object>() {
      @Override
      public Object call() throws IllegalArgumentException {
        joiner.configurePipeline(multiInputPipelineConfigurer);
        return null;
      }
    });
  }

  @Override
  public void initialize(SparkExecutionPluginContext context) throws Exception {
    caller.call(new Callable<Object>() {
      @Override
      public Object call() throws Exception {
        joiner.initialize(context);
        return null;
      }
    });
  }

  @Override
  public JavaRDD<OUT> join(SparkExecutionPluginContext context, Map<String, JavaRDD<?>> inputs) throws Exception {
    return caller.call(new Callable<JavaRDD<OUT>>() {
      @Override
      public JavaRDD<OUT> call() throws Exception {
        return joiner.join(context, inputs);
      }
    });
  }

  @Override
  public void prepareRun(BatchJoinerContext context) throws Exception {
    caller.call(new Callable<Object>() {
      @Override
      public Object call() throws Exception {
        joiner.prepareRun(context);
        return null;
      }
    });
  }

  @Override
  public void onRunFinish(boolean succeeded, BatchJoinerContext context) {
    caller.callUnchecked(new Callable<Object>() {
      @Override
      public Object call() throws Exception {
        joiner.onRunFinish(succeeded, context);
        return null;
      }
    });

  }
}
