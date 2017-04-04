#!/bin/bash
set -e

# Add kibana as command if needed
if [[ "$1" == -* ]]; then
	set -- kibana "$@"
fi

# Run as user "kibana" if the command is "kibana"
if [ "$1" = 'kibana' ]; then
	if [ "$ELASTICSEARCH_URL" ]; then
		sed -ri "s!^(\#\s*)?(elasticsearch\.url:).*!\2 '$ELASTICSEARCH_URL'!" /opt/kibana/config/kibana.yml
	fi

  #Reomve sense for security reason, only used it in dev
  if [ "$RUN_ENV" != "DEV" ]; then
     kibana plugin --remove sense
  fi

	set -- gosu kibana tini -- "$@"
fi

exec "$@"
