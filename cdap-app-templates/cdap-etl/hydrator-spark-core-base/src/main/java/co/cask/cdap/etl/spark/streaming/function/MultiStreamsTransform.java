package co.cask.cdap.etl.spark.streaming.function;

import co.cask.cdap.etl.api.batch.SparkJoiner;
import co.cask.cdap.etl.spark.function.PluginFunctionContext;
import co.cask.cdap.etl.spark.streaming.DynamicDriverContext;
import co.cask.cdap.etl.spark.streaming.SparkStreamingExecutionContext;
import co.cask.cdap.etl.spec.StageSpec;
import org.apache.spark.SparkContext;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.api.java.function.Function2;
import org.apache.spark.streaming.Time;

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

/**
 * A transform function that is able to produce a "complex join" between multiple streams by using custom logic as implemented
 * by a SparkJoiner plugin.
 * See
 *
 * @param <T> Type of output RDD produced by calling this transform
 */
public class MultiStreamsTransform<T> implements Function2<List<JavaRDD<?>>, Time, JavaRDD<T>> {

    private final List<String> stageNames;
    private final DynamicDriverContext dynamicDriverContext;


    public MultiStreamsTransform(DynamicDriverContext dynamicDriverContext, List<String> stageNames) {
        this.stageNames = stageNames;
        this.dynamicDriverContext = dynamicDriverContext;
    }

    @Override
    public JavaRDD<T> call(List<JavaRDD<?>> rdds, Time time) {

        try {
            SparkContext sc = getSparkContext(rdds);
            PluginFunctionContext pluginFunctionContext = dynamicDriverContext.getPluginFunctionContext();

            SparkJoiner<T> sparkJoiner = pluginFunctionContext.createPlugin();

            SparkStreamingExecutionContext executionContext = new SparkStreamingExecutionContext(dynamicDriverContext.getSparkExecutionContext(),
                    JavaSparkContext.fromSparkContext(sc), time.milliseconds(), pluginFunctionContext.getStageSpec());
            sparkJoiner.initialize(executionContext);

            Iterator<String> stageNamesIt = stageNames.iterator();
            Iterator<JavaRDD<?>> rddIt = rdds.iterator();
            Map<String, JavaRDD<?>> inputs = new HashMap<>();
            for (;stageNamesIt.hasNext();) {
                String stageName = stageNamesIt.next();
                assert rddIt.hasNext();
                JavaRDD<?> rdd = rddIt.next();
                inputs.put(stageName,rdd);
            }
            assert  !rddIt.hasNext();

            return sparkJoiner.join(executionContext, inputs);
        }
        catch (RuntimeException|Error e) {
            throw e;
        }
        catch (Exception e) {
            throw new RuntimeException(e);
        }

    }

    private SparkContext getSparkContext(List<JavaRDD<?>> rdds) {
        assert !rdds.isEmpty();
        JavaRDD<?> someRdd = rdds.iterator().next();
        return someRdd.context();
    }


}
