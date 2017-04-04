# Kibana 4.6.5

TEKStack secure Kibana impl for prod and dev.
Kibana is packaged with plugins.
We use search guard plugin in ES for TLS communication.
Kibana has been updated to secury connected to ES using TLS.

## Requirements

- Elasticsearch version 2.4.0 or later
- ES Search guard plugin
- Kibana binary package

## Installation

Build the container 

```
docker build -t gcr.io/tcinc-dev/kibana:4.6.5-auth-ssl .
```

Push to repo

```
gcloud docker -- push gcr.io/tcinc-dev/kibana:4.6.5-auth-ssl
```

Setting RUN_ENV=DEV for the docker run command will remove the Sense plugin.

Sense plugin is only to be used for dev and not for staging or production.

| platform |  |
| --- | --- |
| Linux x64 | [tar](http://download.elastic.co/kibana/kibana-snapshot/kibana-4.6.5-SNAPSHOT-linux-x86_64.tar.gz) [deb](https://download.elastic.co/kibana/kibana-snapshot/kibana-4.6.5-SNAPSHOT-amd64.deb) [rpm](https://download.elastic.co/kibana/kibana-snapshot/kibana-4.6.5-SNAPSHOT-x86_64.rpm) |
