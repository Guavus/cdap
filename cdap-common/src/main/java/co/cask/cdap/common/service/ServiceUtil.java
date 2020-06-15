/*
 * Copyright © 2014-2020 Cask Data, Inc.
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

package co.cask.cdap.common.service;

import com.google.common.util.concurrent.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.LinkedList;
import java.util.List;

public class ServiceUtil {

  private static final Logger LOG = LoggerFactory.getLogger(ServiceUtil.class);

  public static void startAllNonBlocking(List<Service> serviceList) throws Exception {
    for(Service service: serviceList){
      service.startAsync();
    }
  }

  public static void stopAllNonBlocking(List<Service> serviceList) throws Exception {
    for(Service service: serviceList){
      service.stopAsync();
    }
  }

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
        LOG.warn("Exception {} occurred while {} service {}", e.getMessage() , (isStarting?"Starting":"Stopping"), service);
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
