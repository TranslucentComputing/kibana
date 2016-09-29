#!/bin/bash
set -e

# Add kibana as command if needed
if [[ "$1" == -* ]]; then
	set -- kibana "$@"
fi

# Run as user "kibana" if the command is "kibana"
if [ "$1" = 'kibana' ]; then

  # update kibana yml set ES URL and auth URL and User identity URL
	if [ "$ELASTICSEARCH_URL" ]; then
	  echo "Running sed on $ELASTICSEARCH_URL"
		sed -i -e "s|<ES_URL>|$ELASTICSEARCH_URL|g" /opt/kibana/config/kibana.yml
	fi

	if [ "$AUTH_URL" ]; then
	  echo "Running sed on $AUTH_URL"
	  sed -i -e "s|<AUTH_URL>|$AUTH_URL|g" /opt/kibana/config/kibana.yml
	fi

	if [ "$IDENTITY_URL" ]; then
	  echo "Running sed on $IDENTITY_URL"
		sed -i -e "s|<IDENTITY_URL>|$IDENTITY_URL|g" /opt/kibana/config/kibana.yml
	fi

	set -- gosu kibana tini -- "$@"
fi

exec "$@"
