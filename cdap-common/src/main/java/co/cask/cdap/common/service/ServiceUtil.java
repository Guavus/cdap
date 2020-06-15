package co.cask.cdap.common.service;

import com.google.common.util.concurrent.Service;

import java.util.LinkedList;
import java.util.List;

public class ServiceUtil {


  public static void startAllBlocking(List<Service> serviceList) throws Exception {
    List<Service> triggeredServices = new LinkedList<>();
    for(Service service: serviceList){
      triggeredServices.add(service.startAsync());
    }
    validateAllService(triggeredServices, true);
  }

  public static void stopAllBlocking(List<Service> serviceList)  throws Exception {
    List<Service> triggeredServices = new LinkedList<>();
    // Stops all pipeline
    for(Service service: serviceList){
      triggeredServices.add(service.stopAsync());
    }
    validateAllService(triggeredServices, false);
  }
  
  private static void validateAllService(List<Service> serviceList , boolean isStarting) throws Exception {
    Throwable outException = null;
    for (Service service: serviceList) {
      try{
        if (isStarting) {
          service.awaitRunning();
        } else{
          service.awaitTerminated();
        }
      } catch (Exception e) {
        if (outException == null) {
          outException = e.getCause();
        } else {
          outException.addSuppressed(e.getCause());
        }
      }
    }

    if (outException != null) {
      if (outException instanceof Exception) {
        throw (Exception) outException;
      }
      throw new RuntimeException(outException);
    }
  }

}
