# Visual Analytics platform
The Visual Analytics platform contains several different visual analytics methods:

* Scatter plot
* Bar chart
* Line chart
* Pie chart
* Doughnut chart
* Radar chart
* Graph plot

## Building
The Visual Analytics platform is an NGINX web application. To run the application, copy the source code directory to the public folder of the NGINX server, and start the application.

## Deployment
Before deploying the tool, the file transfer server must be first deployed: https://git.activageproject.eu/Deployment/DT-AIOTES_docker/src/master/Files_Transfer

In order to deploy the Visual Analytics Component using Docker, download the `docker-compose.yml` in a local directory. Modify the environment variables and ports to reflect your configuration. Specifically:
* The ***LOGINPATH*** environment variable defines the login address of the file transfer server—e.g., http://localhost:3000/api/activage/login
* The ***TRANFSER_FILES*** environment variable defines the address of the file transfer server—e.g., http://localhost:3000/api/activage
* The ***DATA_ANALYTICS_API_URL*** environment variable defines the address (host and port) of a running instance of AIOTES data analytics component—e.g., https://iti-263.iti.gr:9081/analytics

Then run the following command from the same directory:

```
docker-compose up -d
```

## Usage

By default, the application will be available from a web browser at the following URL: http://localhost:4651. In case you use a Windows machine, you may have to replace "localhost" with 192.168.99.100.

There are 3 different ways of importing data:
1. Using the clipboard and importing data coming from the Data Manipulator or the Data Analyser (the application needs to be configured properly)
2. Using files
3. Making a query using the Data Lake (the application needs to be configured properly)

For the aforementioned visual analytics methods, there are the following files (in the ***examples*** folder) that can be used as examples:
* Scatter plot: mobility.json
* Bar chart: population_per_area.json
* Line chart: blood_pressure_per_time.json
* Pie chart: indoor_movements.json
* Doughnut chart: indoor_movements.json
* Radar chart: user_profiles.json

## License

Apache 2.0
