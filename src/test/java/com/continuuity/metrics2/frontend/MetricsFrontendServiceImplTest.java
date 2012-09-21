package com.continuuity.metrics2.frontend;

import akka.dispatch.Await;
import akka.util.Duration;
import com.continuuity.common.conf.CConfiguration;
import com.continuuity.common.conf.Constants;
import com.continuuity.metrics2.collector.MetricResponse;
import com.continuuity.metrics2.collector.server.plugins.FlowMetricsProcessor;
import com.continuuity.metrics2.collector.server.plugins.MetricsProcessor;
import com.continuuity.metrics2.stubs.*;
import com.google.common.collect.Lists;
import org.apache.thrift.TException;
import org.hamcrest.CoreMatchers;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;

/**
 * Tests the metrics service.
 */
public class MetricsFrontendServiceImplTest {
  private static String connectionUrl;
  private static CConfiguration configuration;
  private static MetricsProcessor processor = null;
  private static MetricsFrontendService.Iface client = null;
  private static long timestamp = System.currentTimeMillis()/1000;
  private static long counter = 0;
  private static int POINTS = 1000;


  @BeforeClass
  public static void beforeClass() throws Exception  {
    connectionUrl = "jdbc:hsqldb:mem:metrictest?user=sa";
    configuration = CConfiguration.create();
    configuration.set(Constants.CFG_METRICS_CONNECTION_URL, connectionUrl);
    configuration.set(Constants.CFG_METRICS_COLLECTION_ALLOWED_TIMESERIES_METRICS,
                      "processed,acks");
    processor = new FlowMetricsProcessor(configuration);
    Assert.assertNotNull(processor);
    client = new MetricsFrontendServiceImpl(configuration);
    Assert.assertNotNull(client);
    createDataSet();
  }

  private static void createDataSet() throws Exception {
    Random random = new Random();
    counter = 0; // Initialize time.

    // Add multiple flows, on multiple accounts, with multiple run ids
    // multiple flowlets, with multiple applications and multiple metrics
    for(int i = 0; i < POINTS; ++i )  {
      addMetric("acc0.app1.flow1.runid1.fl1.1.processed", 10);
      addMetric("acc0.app1.flow1.runid1.fl2.1.processed", 11*i);
      addMetric("acc0.app1.flow1.runid1.fl3.1.processed", 12*(i+1));
      addMetric("acc0.app1.flow1.runid1.fl4.1.processed", 13*(i+2));

      // Another metric
      addMetric("acc0.app1.flow1.runid1.fl1.1.acks", 1);
      addMetric("acc0.app1.flow1.runid1.fl2.1.acks", 2*i);
      addMetric("acc0.app1.flow1.runid1.fl3.1.acks", 3*(i+1));
      addMetric("acc0.app1.flow1.runid1.fl4.1.acks", 4*(i+2));

      // Single flow, multiple flowlets
      addMetric("acc1.app1.flow1.runid1.fl1.1.processed", random.nextInt());
      addMetric("acc1.app1.flow1.runid1.fl2.1.processed", random.nextInt());
      addMetric("acc1.app1.flow1.runid1.fl3.1.processed", random.nextInt());
      addMetric("acc1.app1.flow1.runid1.fl4.1.processed", random.nextInt());

      // Another app within the same account.
      addMetric("acc1.app2.flow1.runid1.fl11.1.processed", random.nextInt());
      addMetric("acc1.app2.flow1.runid1.fl12.1.processed", random.nextInt());
      addMetric("acc1.app2.flow1.runid1.fl13.1.processed", random.nextInt());
      addMetric("acc1.app2.flow1.runid1.fl14.1.processed", random.nextInt());
      addMetric("acc1.app2.flow1.runid1.fl15.1.processed", random.nextInt());
      addMetric("acc1.app2.flow1.runid1.fl16.1.processed", random.nextInt());

      // Another flow within app2
      addMetric("acc1.app2.flow2.runid1.fl11.1.processed", random.nextInt());
      addMetric("acc1.app2.flow2.runid1.fl12.1.processed", random.nextInt());
      addMetric("acc1.app2.flow2.runid1.fl13.1.processed", random.nextInt());
      addMetric("acc1.app2.flow2.runid1.fl14.1.processed", random.nextInt());
      addMetric("acc1.app2.flow2.runid1.fl15.1.processed", random.nextInt());
      addMetric("acc1.app2.flow2.runid1.fl16.1.processed", random.nextInt());

      addMetric("acc1.app2.flow3.runid1.fl11.1.processed", random.nextInt());
      addMetric("acc1.app2.flow3.runid1.fl12.1.processed", random.nextInt());
      addMetric("acc1.app2.flow3.runid1.fl13.1.processed", random.nextInt());
      addMetric("acc1.app2.flow3.runid1.fl14.1.processed", random.nextInt());
      addMetric("acc1.app2.flow3.runid1.fl15.1.processed", random.nextInt());
      addMetric("acc1.app2.flow3.runid1.fl16.1.processed", random.nextInt());

      // Multiple run ids for all flows
      addMetric("acc1.app2.flow1.runid2.fl11.1.processed", random.nextInt());
      addMetric("acc1.app2.flow1.runid2.fl12.1.processed", random.nextInt());
      addMetric("acc1.app2.flow1.runid2.fl13.1.processed", random.nextInt());
      addMetric("acc1.app2.flow1.runid2.fl14.1.processed", random.nextInt());
      addMetric("acc1.app2.flow1.runid2.fl15.1.processed", random.nextInt());
      addMetric("acc1.app2.flow1.runid2.fl16.1.processed", random.nextInt());

      addMetric("acc1.app2.flow1.runid3.fl11.1.processed", random.nextInt());
      addMetric("acc1.app2.flow1.runid3.fl12.1.processed", random.nextInt());
      addMetric("acc1.app2.flow1.runid3.fl13.1.processed", random.nextInt());
      addMetric("acc1.app2.flow1.runid3.fl14.1.processed", random.nextInt());
      addMetric("acc1.app2.flow1.runid3.fl15.1.processed", random.nextInt());
      addMetric("acc1.app2.flow1.runid3.fl16.1.processed", random.nextInt());

      addMetric("acc1.app2.flow2.runid2.fl11.1.processed", random.nextInt());
      addMetric("acc1.app2.flow2.runid2.fl12.1.processed", random.nextInt());
      addMetric("acc1.app2.flow2.runid2.fl13.1.processed", random.nextInt());
      addMetric("acc1.app2.flow2.runid2.fl14.1.processed", random.nextInt());
      addMetric("acc1.app2.flow2.runid2.fl15.1.processed", random.nextInt());
      addMetric("acc1.app2.flow2.runid2.fl16.1.processed", random.nextInt());

      addMetric("acc1.app2.flow3.runid2.fl11.1.processed", random.nextInt());
      addMetric("acc1.app2.flow3.runid2.fl12.1.processed", random.nextInt());
      addMetric("acc1.app2.flow3.runid2.fl13.1.processed", random.nextInt());
      addMetric("acc1.app2.flow3.runid2.fl14.1.processed", random.nextInt());
      addMetric("acc1.app2.flow3.runid2.fl15.1.processed", random.nextInt());
      addMetric("acc1.app2.flow3.runid2.fl16.1.processed", random.nextInt());

      // Flow on different account
      addMetric("acc2.app1.flow1.runid1.fl11.1.processed", random.nextInt());
      addMetric("acc2.app1.flow1.runid1.fl12.1.processed", random.nextInt());
      addMetric("acc2.app1.flow1.runid1.fl13.1.processed", random.nextInt());
      addMetric("acc2.app1.flow1.runid1.fl14.1.processed", random.nextInt());
      addMetric("acc2.app1.flow1.runid1.fl15.1.processed", random.nextInt());
      addMetric("acc2.app1.flow1.runid1.fl16.1.processed", random.nextInt());

      // Another flow
      addMetric("acc2.app1.flow2.runid1.fl11.1.processed", random.nextInt());
      addMetric("acc2.app1.flow2.runid1.fl12.1.processed", random.nextInt());
      addMetric("acc2.app1.flow2.runid1.fl13.1.processed", random.nextInt());
      addMetric("acc2.app1.flow2.runid1.fl14.1.processed", random.nextInt());
      addMetric("acc2.app1.flow2.runid1.fl15.1.processed", random.nextInt());
      addMetric("acc2.app1.flow2.runid1.fl16.1.processed", random.nextInt());

      // Another account
      addMetric("acc3.app1.flow1.runid1.fl11.1.processed", random.nextInt());
      addMetric("acc3.app1.flow1.runid1.fl12.1.processed", random.nextInt());
      addMetric("acc3.app1.flow1.runid1.fl13.1.processed", random.nextInt());
      addMetric("acc3.app1.flow1.runid1.fl14.1.processed", random.nextInt());
      addMetric("acc3.app1.flow1.runid1.fl15.1.processed", random.nextInt());
      addMetric("acc3.app1.flow1.runid1.fl16.1.processed", random.nextInt());

      // Another flow
      addMetric("acc3.app1.flow2.runid1.fl11.1.processed", random.nextInt());
      addMetric("acc3.app1.flow2.runid1.fl12.1.processed", random.nextInt());
      addMetric("acc3.app1.flow2.runid1.fl13.1.processed", random.nextInt());
      addMetric("acc3.app1.flow2.runid1.fl14.1.processed", random.nextInt());
      addMetric("acc3.app1.flow2.runid1.fl15.1.processed", random.nextInt());
      addMetric("acc3.app1.flow2.runid1.fl16.1.processed", random.nextInt());

      // multiple run id on
      addMetric("acc3.app1.flow2.runid2.fl11.1.processed", random.nextInt());
      addMetric("acc3.app1.flow2.runid2.fl12.1.processed", random.nextInt());
      addMetric("acc3.app1.flow2.runid2.fl13.1.processed", random.nextInt());
      addMetric("acc3.app1.flow2.runid2.fl14.1.processed", random.nextInt());
      addMetric("acc3.app1.flow2.runid2.fl15.1.processed", random.nextInt());
      addMetric("acc3.app1.flow2.runid2.fl16.1.processed", random.nextInt());
      counter++; // move the time ahead.
    }
  }

  @Test(expected = MetricsServiceException.class)
  public void testBadRequestArguments() throws Exception {
    getMetric(new FlowArgument(), null);
  }

  /**
   * Tests writing and reading a metric.
   */
  @Test(timeout = 2000)
  public void testAddingSingleMetricAndReadingItBack() throws Exception {
    Assert.assertTrue(
      addMetric("accountId.applicationId.flowId.runId.flowletId.1.processed",
                10) == MetricResponse.Status.SUCCESS);
    List<Counter> counters = getMetric(
      new FlowArgument("accountId", "applicationId", "flowId"),
      null
    );
    Assert.assertNotNull(counters);
    Assert.assertThat(counters.size(), CoreMatchers.is(1));
    Assert.assertTrue(counters.get(0).getValue() == 10.0f);
  }

  @Test
  public void testOneAcctOneFlowOneRunId() throws Exception {
    List<String> metrics = Lists.newArrayList();
    metrics.add("processed");
    FlowArgument argument = new FlowArgument("acc0", "app1", "flow1");
    argument.setRunId("runid1");
    argument.setFlowletId("fl1");

    DataPoints dataPointsFlowLevel = getTimeseries(
      argument,
      metrics,
      MetricTimeseriesLevel.FLOW_LEVEL,
      timestamp,
      timestamp + counter + 10
    );

    Assert.assertNotNull(dataPointsFlowLevel);
    Assert.assertTrue(dataPointsFlowLevel.getPoints()
                        .get("processed").size() == POINTS);

    DataPoints dataPointsRunIdLevel = getTimeseries(
      argument,
      metrics,
      MetricTimeseriesLevel.RUNID_LEVEL,
      timestamp,
      timestamp + counter + 10
    );
    Assert.assertNotNull(dataPointsRunIdLevel);
    Assert.assertTrue(dataPointsRunIdLevel.getPoints()
                        .get("processed").size() == POINTS);
    Assert.assertTrue(dataPointsFlowLevel.equals(dataPointsRunIdLevel));
  }

  @Test
  public void testOneAcctOneFlowOneRunIdMultipleMetrics() throws Exception {
    List<String> metrics = Lists.newArrayList();
    metrics.add("processed");
    metrics.add("acks");

    FlowArgument argument = new FlowArgument("acc0", "app1", "flow1");
    argument.setRunId("runid1");
    argument.setFlowletId("fl1");

    DataPoints dataPointsFlowLevel = getTimeseries(
      argument,
      metrics,
      MetricTimeseriesLevel.FLOW_LEVEL,
      timestamp,
      timestamp + counter + 10
    );

    Assert.assertNotNull(dataPointsFlowLevel);
    Assert.assertTrue(dataPointsFlowLevel.getPoints()
                        .get("processed").size() == POINTS);
    Assert.assertTrue(dataPointsFlowLevel.getPoints()
                        .get("acks").size() == POINTS);

    DataPoints dataPointsRunIdLevel = getTimeseries(
      argument,
      metrics,
      MetricTimeseriesLevel.RUNID_LEVEL,
      timestamp,
      timestamp + counter + 10
    );
    Assert.assertNotNull(dataPointsRunIdLevel);
    Assert.assertTrue(dataPointsRunIdLevel.getPoints()
                        .get("processed").size() == POINTS);
    Assert.assertTrue(dataPointsRunIdLevel.getPoints()
                        .get("acks").size() == POINTS);
    Assert.assertTrue(dataPointsFlowLevel.equals(dataPointsRunIdLevel));
  }

  @Test
  public void testWhatHappensWhenMetricNotFound() throws Exception {
    List<String> metrics = Lists.newArrayList();
    metrics.add("p1");

    FlowArgument argument = new FlowArgument("acc0", "app1", "flow1");
    argument.setRunId("runid1");
    argument.setFlowletId("fl1");

    DataPoints dataPointsFlowLevel = getTimeseries(
      argument,
      metrics,
      MetricTimeseriesLevel.FLOW_LEVEL,
      timestamp,
      timestamp + counter + 10
    );

    Assert.assertNotNull(dataPointsFlowLevel);
    Assert.assertNull(dataPointsFlowLevel.getPoints().get("p1"));
  }

  /**
   * For a single account the values at different levels should be the same.
   * Account Level, Application Level, Flow Level, Run Id Level.
   */
  @Test
  public void testOneAcctOneFlowOneRunIdMultipleMetricsAppAccount()
    throws Exception {
    List<String> metrics = Lists.newArrayList();
    metrics.add("processed");
    metrics.add("acks");

    FlowArgument argument = new FlowArgument("acc0", "app1", "flow1");
    argument.setRunId("runid1");
    argument.setFlowletId("fl1");

    DataPoints dataPointsFlowLevel = getTimeseries(
      argument,
      metrics,
      MetricTimeseriesLevel.FLOW_LEVEL,
      timestamp,
      timestamp + counter + 10
    );

    Assert.assertNotNull(dataPointsFlowLevel);
    Assert.assertTrue(dataPointsFlowLevel.getPoints()
                        .get("processed").size() == POINTS);
    Assert.assertTrue(dataPointsFlowLevel.getPoints()
                        .get("acks").size() == POINTS);

    DataPoints dataPointsRunIdLevel = getTimeseries(
      argument,
      metrics,
      MetricTimeseriesLevel.RUNID_LEVEL,
      timestamp,
      timestamp + counter + 10
    );
    Assert.assertNotNull(dataPointsRunIdLevel);
    Assert.assertTrue(dataPointsRunIdLevel.getPoints()
                        .get("processed").size() == POINTS);
    Assert.assertTrue(dataPointsRunIdLevel.getPoints()
                        .get("acks").size() == POINTS);
    Assert.assertTrue(dataPointsFlowLevel.equals(dataPointsRunIdLevel));

    DataPoints dataPointsAppLevel = getTimeseries(
      argument,
      metrics,
      MetricTimeseriesLevel.APPLICATION_LEVEL,
      timestamp,
      timestamp + counter + 10
    );
    Assert.assertNotNull(dataPointsAppLevel);
    Assert.assertTrue(dataPointsAppLevel.getPoints()
                        .get("processed").size() == POINTS);
    Assert.assertTrue(dataPointsAppLevel.getPoints()
                        .get("acks").size() == POINTS);
    Assert.assertTrue(dataPointsAppLevel.equals(dataPointsRunIdLevel));
    Assert.assertTrue(dataPointsAppLevel.equals(dataPointsFlowLevel));

    DataPoints dataPointsAccountLevel = getTimeseries(
      argument,
      metrics,
      MetricTimeseriesLevel.ACCOUNT_LEVEL,
      timestamp,
      timestamp + counter + 10
    );
    Assert.assertNotNull(dataPointsAppLevel);
    Assert.assertTrue(dataPointsAccountLevel.getPoints()
                        .get("processed").size() == POINTS);
    Assert.assertTrue(dataPointsAccountLevel.getPoints()
                        .get("acks").size() == POINTS);
    Assert.assertTrue(dataPointsAccountLevel.equals(dataPointsRunIdLevel));
    Assert.assertTrue(dataPointsAccountLevel.equals(dataPointsFlowLevel));
    Assert.assertTrue(dataPointsAccountLevel.equals(dataPointsAppLevel));

    DataPoints dataPointsFlowletLevel = getTimeseries(
      argument,
      metrics,
      MetricTimeseriesLevel.FLOWLET_LEVEL,
      timestamp,
      timestamp + counter + 10
    );
    Assert.assertNotNull(dataPointsFlowletLevel);
    Assert.assertTrue(dataPointsFlowletLevel.getPoints()
                        .get("processed").size() == POINTS);
    Assert.assertTrue(dataPointsFlowletLevel.getPoints()
                        .get("acks").size() == POINTS);
  }

  @Test
  public void testWithMultipleAccounts() throws Exception {
    List<String> metrics = Lists.newArrayList();
    metrics.add("processed");
    metrics.add("acks");

    FlowArgument argument = new FlowArgument("acc0", "app1", "flow1");
    argument.setRunId("runid1");
    argument.setFlowletId("fl1");

    DataPoints dataPointsFlowLevel = getTimeseries(
      argument,
      metrics,
      MetricTimeseriesLevel.FLOW_LEVEL,
      timestamp,
      timestamp + counter + 10
    );

    Assert.assertNotNull(dataPointsFlowLevel);
    Assert.assertTrue(dataPointsFlowLevel.getPoints()
                        .get("processed").size() == POINTS);
    Assert.assertTrue(dataPointsFlowLevel.getPoints()
                        .get("acks").size() == POINTS);

    DataPoints dataPointsRunIdLevel = getTimeseries(
      argument,
      metrics,
      MetricTimeseriesLevel.RUNID_LEVEL,
      timestamp,
      timestamp + counter + 10
    );
    Assert.assertNotNull(dataPointsRunIdLevel);
    Assert.assertTrue(dataPointsRunIdLevel.getPoints()
                        .get("processed").size() == POINTS);
    Assert.assertTrue(dataPointsRunIdLevel.getPoints()
                        .get("acks").size() == POINTS);
    Assert.assertTrue(dataPointsFlowLevel.equals(dataPointsRunIdLevel));
  }


  @Test(timeout = 2000)
  public void testAddingMultipleFlowletsForSingleMetric() throws Exception {
    addMetric("demo.myapp.myflow.myfun.source.1.processed", 10);
    addMetric("demo.myapp.myflow.myfun.compute.1.processed", 11);
    addMetric("demo.myapp.myflow.myfun.sink.1.processed", 12);
    List<Counter> counters = getMetric(
      new FlowArgument("demo", "myapp", "myflow"),
      null
    );
    Assert.assertNotNull(counters);
    Assert.assertThat(counters.size(), CoreMatchers.is(3));
  }


  @Test(timeout = 2000)
  public void testMultipleFlowletsAndMultipleInstancePerFlowlet() throws
    Exception {
    // Three sources
    addMetric("demo.myapp.myflow.myfun.source.1.processed", 10);
    addMetric("demo.myapp.myflow.myfun.source.2.processed", 10);
    addMetric("demo.myapp.myflow.myfun.source.3.processed", 10);

    // Four computes
    addMetric("demo.myapp.myflow.myfun.compute.1.processed", 11);
    addMetric("demo.myapp.myflow.myfun.compute.2.processed", 11);
    addMetric("demo.myapp.myflow.myfun.compute.3.processed", 11);
    addMetric("demo.myapp.myflow.myfun.compute.4.processed", 11);

    // Three sinks
    addMetric("demo.myapp.myflow.myfun.sink.1.processed", 12);
    addMetric("demo.myapp.myflow.myfun.sink.2.processed", 12);
    addMetric("demo.myapp.myflow.myfun.sink.3.processed", 12);

    // Expectation is that all instance counts are aggregated into
    // the flowlet.
    List<Counter> counters = getMetric(
      new FlowArgument("demo", "myapp", "myflow"),
      null
    );
    Assert.assertNotNull(counters);
    Assert.assertThat(counters.size(), CoreMatchers.is(3));
  }

  /**
   * @return Status of adding a metric.
   */
  private static MetricResponse.Status addMetric(String name, float value)
      throws Exception {

    com.continuuity.metrics2.collector.MetricRequest
      request =
      new com.continuuity.metrics2.collector.MetricRequest.Builder(true)
      .setRequestType("put")
      .setMetricName(name)
      .setTimestamp(timestamp + counter)
      .setValue(value)
      .setMetricType("FlowSystem")
      .create();

    // Blocks till we get the response back.
    return Await.result(processor.process(request),
                        Duration.create(2, TimeUnit.SECONDS));
  }

  private List<Counter> getMetric(FlowArgument argument, List<String> names)
    throws TException, MetricsServiceException {
    CounterRequest request = new CounterRequest(argument);
    if(names != null) {
      request.setName(names);
    }
    return client.getCounters(request);
  }

  private DataPoints getTimeseries(FlowArgument argument,
                                   List<String> metrics,
                                   MetricTimeseriesLevel level,
                                   long start,
                                   long end)
    throws TException, MetricsServiceException {
    TimeseriesRequest request = new TimeseriesRequest();
    request.setArgument(argument);
    request.setMetrics(metrics);
    request.setStartts(start);
    request.setLevel(level);
    request.setEndts(end);
    request.setSummary(true);
    return client.getTimeSeries(request);
  }

}
