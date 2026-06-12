package com.gabrielvictorweb.users.infra.config;

import java.util.Map;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.LazyConnectionDataSourceProxy;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Configuration
public class DataSourceConfig {

    private enum RouteKey {
        MASTER,
        REPLICA,
    }

    @Bean
    public DataSource masterDataSource(
            @Value("${spring.datasource.url}") String url,
            @Value("${spring.datasource.username}") String username,
            @Value("${spring.datasource.password}") String password) {
        return DataSourceBuilder.create().url(url).username(username).password(password).build();
    }

    @Bean
    public DataSource replicaDataSource(
            @Value("${spring.datasource.replica.url}") String url,
            @Value("${spring.datasource.replica.username}") String username,
            @Value("${spring.datasource.replica.password}") String password) {
        return DataSourceBuilder.create().url(url).username(username).password(password).build();
    }

    @Bean
    @Primary
    public DataSource dataSource(DataSource masterDataSource, DataSource replicaDataSource) {
        RoutingDataSource routing = new RoutingDataSource();
        routing.setTargetDataSources(Map.of(RouteKey.MASTER, masterDataSource, RouteKey.REPLICA, replicaDataSource));
        routing.setDefaultTargetDataSource(masterDataSource);
        routing.afterPropertiesSet();

        // O LazyConnectionDataSourceProxy adia a obtenção da Connection até que o Spring
        // tenha resolvido o readOnly da transação — sem ele, o pool entrega uma conexão
        // antes da decisão e o roteamento cai sempre no default.
        return new LazyConnectionDataSourceProxy(routing);
    }

    private static class RoutingDataSource extends AbstractRoutingDataSource {

        @Override
        protected Object determineCurrentLookupKey() {
            return TransactionSynchronizationManager.isCurrentTransactionReadOnly()
                    ? RouteKey.REPLICA
                    : RouteKey.MASTER;
        }
    }
}
