#!/bin/sh -e
sed -i 's|/analytics/assets/fonts|'"$FONTS_URL"'|g' /usr/share/nginx/html/build/app.css && sed -i 's|{{DATA_ANALYTICS_API_URL}}|'"$DATA_ANALYTICS_API_URL"'|g' /usr/share/nginx/html/build/app.js && sed -i 's|{{SEMANTIC_TRANSLATION_API_URL}}|'"$SEMANTIC_TRANSLATION_API_URL"'|g' /usr/share/nginx/html/build/app.js && sed -i 's|{{DATA_LAKE_API_URL}}|'"$DATA_LAKE_API_URL"'|g' /usr/share/nginx/html/build/app.js && sed -i 's|{{TRANSFER_FILES_URL}}|'"$TRANSFER_FILES_URL"'|g' /usr/share/nginx/html/build/app.js && exec nginx -g 'daemon off;'


# && sed -i 's|usr/share/nginx/html|'"$TRANFSER_FILES"'|g' /usr/share/nginx/html/main*.js
