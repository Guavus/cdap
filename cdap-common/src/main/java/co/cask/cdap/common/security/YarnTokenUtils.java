/*
 * Copyright © 2015 Cask Data, Inc.
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

package co.cask.cdap.common.security;

import co.cask.cdap.common.conf.Constants;
import com.google.common.base.Joiner;
import com.google.common.base.Throwables;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.security.Credentials;
import org.apache.hadoop.security.SecurityUtil;
import org.apache.hadoop.security.UserGroupInformation;
import org.apache.hadoop.security.token.Token;
import org.apache.hadoop.security.token.TokenIdentifier;
import org.apache.hadoop.yarn.client.api.YarnClient;
import org.apache.hadoop.yarn.conf.HAUtil;
import org.apache.hadoop.yarn.conf.YarnConfiguration;
import org.apache.hadoop.yarn.util.ConverterUtils;
import org.apache.twill.internal.yarn.YarnUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Method;
import java.net.InetSocketAddress;
import java.security.PrivilegedExceptionAction;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Helper class for getting Yarn security delegation token.
 */
public final class YarnTokenUtils {
  private static final Logger LOG = LoggerFactory.getLogger(YarnTokenUtils.class);

  /**
   * Gets a Yarn delegation token and stores it in the given Credentials.
   * Also gets Yarn App Timeline Server, if it is enabled.
   *
   * @return the same Credentials instance as the one given in parameter.
   */
  
  private static final String proxiedUser = "usr01";

  public static Credentials obtainToken(YarnConfiguration configuration, Credentials credentials) {
    if (!UserGroupInformation.isSecurityEnabled()) {
      return credentials;
    }

    try {
      YarnClient yarnClient = YarnClient.createYarnClient();
      yarnClient.init(configuration);
      yarnClient.start();
      
      UserGroupInformation ugi = UserGroupInformation.getCurrentUser();
      
      LOG.info("Rajat ... ugi {} , realUser {}, userShortName {} , userName {} , loginUser {}", 
              ugi, ugi.getRealUser(), ugi.getShortUserName(), ugi.getUserName() , ugi.getLoginUser());
      

      //String ugiUser = ugi.getShortUserName();
      UserGroupInformation proxyUgi = ugi;
      /*
      if (!(ugiUser.equalsIgnoreCase("cdap"))) {
          proxyUgi = ugi.createProxyUser(proxiedUser, ugi);
          LOG.info("Rajat ... After proxying ... ugi {} , realUser {}, userShortName {} , userName {} , loginUser {}", 
                  proxyUgi, proxyUgi.getRealUser(), proxyUgi.getShortUserName(), proxyUgi.getUserName() , proxyUgi.getLoginUser());

      }*/


      try {
        if (configuration.getBoolean(Constants.Explore.TIMELINE_SERVICE_ENABLED, false)) {
          // yarnClient.getTimelineDelegationToken() is only accessible in Hadoop 2.6.0+, and only on those versions
          // would/should user enable Yarn ATS
          Method method = yarnClient.getClass().getDeclaredMethod("getTimelineDelegationToken");
          method.setAccessible(true);
          Token<? extends TokenIdentifier> atsToken = (Token<? extends TokenIdentifier>) method.invoke(yarnClient);
          
          /*
          Token<? extends TokenIdentifier> atsToken; 
          atsToken = proxyUgi.doAs(new PrivilegedExceptionAction<Token<? extends TokenIdentifier>>() {
              public Token<? extends TokenIdentifier> run() throws Exception {
                  Token<? extends TokenIdentifier> token = (Token<? extends TokenIdentifier>) method.invoke(yarnClient);;
                  return token;
              }
          });*/
          
          
          if (atsToken != null) {
            credentials.addToken(atsToken.getService(), atsToken);
            LOG.debug("Added Yarn Timeline Server delegation token: {}", atsToken);
          }
        }

        /*
        org.apache.hadoop.yarn.api.records.Token rmDelegationToken = proxyUgi.doAs(
                new PrivilegedExceptionAction<org.apache.hadoop.yarn.api.records.Token>() {
                    public org.apache.hadoop.yarn.api.records.Token run() throws Exception {
                        Text renewer = new Text(UserGroupInformation.getCurrentUser().getShortUserName());
                        org.apache.hadoop.yarn.api.records.Token rmDelegationToken = yarnClient.getRMDelegationToken(renewer);
                        return rmDelegationToken;
                    }
                });*/
        
        Text renewer = new Text(UserGroupInformation.getCurrentUser().getShortUserName());
        org.apache.hadoop.yarn.api.records.Token rmDelegationToken = yarnClient.getRMDelegationToken(renewer);

        // TODO: The following logic should be replaced with call to ClientRMProxy.getRMDelegationTokenService after
        // CDAP-4825 is resolved
        List<String> services = new ArrayList<>();
        if (HAUtil.isHAEnabled(configuration)) {
          // If HA is enabled, we need to enumerate all RM hosts
          // and add the corresponding service name to the token service
          // Copy the yarn conf since we need to modify it to get the RM addresses
          YarnConfiguration yarnConf = new YarnConfiguration(configuration);
          for (String rmId : HAUtil.getRMHAIds(configuration)) {
            yarnConf.set(YarnConfiguration.RM_HA_ID, rmId);
            InetSocketAddress address = yarnConf.getSocketAddr(YarnConfiguration.RM_ADDRESS,
                                                               YarnConfiguration.DEFAULT_RM_ADDRESS,
                                                               YarnConfiguration.DEFAULT_RM_PORT);
            services.add(SecurityUtil.buildTokenService(address).toString());
          }
        } else {
          services.add(SecurityUtil.buildTokenService(YarnUtils.getRMAddress(configuration)).toString());
        }

        Token<TokenIdentifier> token = ConverterUtils.convertFromYarn(rmDelegationToken, (InetSocketAddress) null);
        token.setService(new Text(Joiner.on(',').join(services)));
        credentials.addToken(new Text(token.getService()), token);

        // OK to log, it won't log the credential, only information about the token.
        LOG.debug("Added RM delegation token: {}", token);

      } finally {
        yarnClient.stop();
      }

      return credentials;
    } catch (Exception e) {
      throw Throwables.propagate(e);
    }
  }

  private YarnTokenUtils() {
  }
}
